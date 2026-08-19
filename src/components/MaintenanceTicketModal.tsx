import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertTriangle, CheckCircle2, Plus, Clock, ShieldAlert, Building2 } from 'lucide-react';
import { saveDocument, subscribeCollection } from '../lib/firebase';
import { RentalBooking, LandlordUser, AppNotification } from '../types';

interface MaintenanceTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBookings: RentalBooking[];
  currentUserEmail?: string;
  currentUserName?: string;
  loggedInLandlord?: LandlordUser | null;
}

export interface MaintenanceTicket {
  id: string;
  bookingId: string;
  itemId?: string;
  propertyTitle: string;
  ownerId?: string;
  ownerName?: string;
  category: 'Plumbing' | 'Electrical' | 'AC & Appliance' | 'Leakage & Seepage' | 'Painting & Repairs' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export const MaintenanceTicketModal: React.FC<MaintenanceTicketModalProps> = ({
  isOpen,
  onClose,
  userBookings,
  currentUserEmail,
  currentUserName,
  loggedInLandlord
}) => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [category, setCategory] = useState<MaintenanceTicket['category']>('Plumbing');
  const [priority, setPriority] = useState<MaintenanceTicket['priority']>('High');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  // Filter valid user bookings
  const activeBookings = userBookings.filter(b => b.status !== 'Cancelled');

  useEffect(() => {
    if (activeBookings.length > 0 && !selectedBookingId) {
      setSelectedBookingId(activeBookings[0].id);
    }
  }, [activeBookings, selectedBookingId]);

  useEffect(() => {
    const unsub = subscribeCollection<MaintenanceTicket>('maintenance_tickets', (docs) => {
      setTickets(docs);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  // Filter tickets for current view (Tenant sees their tickets, Host sees tickets for their properties)
  const displayTickets = tickets.filter(t => {
    if (loggedInLandlord) {
      return t.ownerId === loggedInLandlord.id || t.ownerId === 'owner-verified' || t.ownerName?.toLowerCase().includes(loggedInLandlord.name.toLowerCase());
    }
    if (currentUserEmail) {
      return t.tenantEmail?.toLowerCase().trim() === currentUserEmail.toLowerCase().trim();
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const selectedBooking = activeBookings.find(b => b.id === selectedBookingId) || activeBookings[0];
    if (!selectedBooking) {
      setMsg('⚠️ Please select a booked property to log a repair request.');
      return;
    }

    const newTicket: MaintenanceTicket = {
      id: `TICK-${Date.now().toString(36).toUpperCase()}`,
      bookingId: selectedBooking.id,
      itemId: selectedBooking.itemId,
      propertyTitle: selectedBooking.itemTitle,
      ownerId: selectedBooking.ownerId || 'owner-verified',
      ownerName: selectedBooking.ownerName || 'Property Owner',
      category,
      priority,
      description: description.trim(),
      tenantName: currentUserName || selectedBooking.userName || 'Tenant User',
      tenantEmail: currentUserEmail || selectedBooking.userEmail || 'tenant@renthub.in',
      tenantPhone: selectedBooking.userPhone || '+91 98765 43210',
      status: 'Open',
      createdAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setTickets(prev => [newTicket, ...prev]);
    await saveDocument('maintenance_tickets', newTicket.id, newTicket);

    // Dispatch real-time Notification to the specific Property Owner
    const ownerNotif: AppNotification = {
      id: `notif-ticket-${Date.now()}`,
      title: `🛠️ New Repair Ticket: ${category}`,
      message: `Tenant ${newTicket.tenantName} logged a ${priority} priority repair request for "${selectedBooking.itemTitle}": ${description.trim()}`,
      type: 'system',
      timestamp: 'Just now',
      read: false,
      ownerId: selectedBooking.ownerId,
      userEmail: currentUserEmail
    };
    await saveDocument('notifications', ownerNotif.id, ownerNotif);

    setMsg(`✅ Repair request ticket dispatched directly to Owner (${newTicket.ownerName})!`);
    setDescription('');
    setTimeout(() => setMsg(''), 5000);
  };

  const handleResolveTicket = async (ticketId: string) => {
    const updatedTickets = tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' as const } : t);
    setTickets(updatedTickets);
    const target = updatedTickets.find(t => t.id === ticketId);
    if (target) {
      await saveDocument('maintenance_tickets', ticketId, target);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#0C1017] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Maintenance & Repair Ticket Portal</h2>
              <p className="text-xs text-slate-400 font-semibold">Log repair requests for your booked properties directly to the Owner</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {msg && (
            <div className="bg-emerald-950/90 border border-emerald-800 text-emerald-300 p-3 rounded-2xl font-bold flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* New Ticket Form (Only if User has Booked Properties) */}
          {activeBookings.length === 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-6 rounded-2xl text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto animate-bounce" />
              <h4 className="font-extrabold text-sm text-white">No Active Booked Properties Found</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Repair tickets can only be submitted for properties or vehicles that you have booked. Please explore listings and confirm a booking first!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-zinc-800/50 p-4.5 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2.5">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-amber-500" />
                  <span>Submit Repair Request to Property Owner</span>
                </h3>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {activeBookings.length} Booked Rentals Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Booked Property Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Select Booked Property</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {activeBookings.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.itemTitle} (Host: {b.ownerName || 'Verified Owner'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Plumbing">Plumbing / Tap / Pipe Leakage</option>
                    <option value="Electrical">Electrical / Wiring / Switch Board</option>
                    <option value="AC & Appliance">AC & Home Appliance Repair</option>
                    <option value="Leakage & Seepage">Roof / Wall Seepage</option>
                    <option value="Painting & Repairs">Door / Lock / Wood Furniture Repair</option>
                    <option value="Other">Other Repairs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Urgency / Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="High">🔴 High (Urgent Repair Needed)</option>
                    <option value="Medium">🟡 Medium (Fix within 48 Hours)</option>
                    <option value="Low">🟢 Low (Routine Repair)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Issue Description & Details</label>
                <textarea
                  required
                  rows={2.5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue clearly (e.g. Master bathroom tap leaking continuously, AC cooling issue)..."
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-all border border-amber-300"
              >
                🚀 Dispatch Repair Ticket to Owner
              </button>
            </form>
          )}

          {/* Active Maintenance Tickets List */}
          <div className="space-y-3 pt-2">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Logged Repair Tickets ({displayTickets.length})</span>
            </h3>

            {displayTickets.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No repair tickets logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {displayTickets.map(t => (
                  <div key={t.id} className="bg-slate-50 dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          t.priority === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {t.priority} Risk
                        </span>
                        <strong className="text-slate-950 dark:text-white font-bold text-sm">{t.category} - {t.propertyTitle}</strong>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300">{t.description}</p>
                      <div className="text-[10px] text-slate-400 font-mono space-x-3">
                        <span>Ticket ID: <strong className="text-amber-400">{t.id}</strong></span>
                        <span>Tenant: {t.tenantName} ({t.tenantEmail})</span>
                        <span>Host: <strong className="text-slate-200">{t.ownerName || 'Property Owner'}</strong></span>
                        <span>{t.createdAt}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-xl border ${
                        t.status === 'Resolved' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {t.status === 'Resolved' ? '✓ Resolved' : '⏳ Open / Sent to Host'}
                      </span>

                      {loggedInLandlord && t.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveTicket(t.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
};
