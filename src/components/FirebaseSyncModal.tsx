import React, { useState } from 'react';
import { X, Cloud, RefreshCw, CheckCircle2, AlertCircle, Database, Server } from 'lucide-react';
import { uploadAllDataToFirestore, testFirestoreConnection, SyncAllDataPayload, SyncStatsResult } from '../lib/firebase';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncPayload: SyncAllDataPayload;
  onSyncCompleted?: (stats: SyncStatsResult) => void;
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({
  isOpen,
  onClose,
  syncPayload,
  onSyncCompleted
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentCollection, setCurrentCollection] = useState('');
  const [syncStats, setSyncStats] = useState<SyncStatsResult | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleRunPingTest = async () => {
    const res = await testFirestoreConnection();
    setTestResult(res);
  };

  const handleStartManualSync = async () => {
    setIsSyncing(true);
    setProgressPercent(0);
    setSyncStats(null);

    try {
      const stats = await uploadAllDataToFirestore(syncPayload, (percent, colName) => {
        setProgressPercent(percent);
        setCurrentCollection(colName);
      });
      setSyncStats(stats);
      if (onSyncCompleted) onSyncCompleted(stats);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Firebase Cloud Sync Portal</h2>
              <p className="text-xs text-amber-100 font-medium">
                Live Real-Time Firestore Synchronization & Diagnostics
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Connection Test Box */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 border border-slate-200 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold">Cloud Firestore Health Check</span>
              </div>
              <button
                onClick={handleRunPingTest}
                className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 px-3 py-1 rounded-xl transition-all cursor-pointer"
              >
                Test Connection
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                testResult.success 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Sync Progress Bar */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Syncing: {currentCollection}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats Results */}
          {syncStats && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Full Database Upload Completed!</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400 pt-1">
                <div>Total Documents Uploaded: <b className="text-slate-900 dark:text-white">{syncStats.totalUploaded}</b></div>
                <div>Failed Uploads: <b className="text-slate-900 dark:text-white">{syncStats.totalFailed}</b></div>
                <div>Target Database: <b className="text-slate-900 dark:text-white">{syncStats.databaseId}</b></div>
                <div>Completed At: <b className="text-slate-900 dark:text-white">{syncStats.timestamp}</b></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleStartManualSync}
              disabled={isSyncing}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Uploading All Collections...' : 'Upload All Collections Now'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
