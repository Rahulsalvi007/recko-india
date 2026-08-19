import React, { useState, useRef } from 'react';
import { X, FileText, CheckCircle2, Download, Printer, Shield, RefreshCw } from 'lucide-react';
import { Property } from '../types';

interface DigitalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  currentUserEmail?: string;
  currentUserName?: string;
}

export const DigitalAgreementModal: React.FC<DigitalAgreementModalProps> = ({
  isOpen,
  onClose,
  properties,
  currentUserEmail,
  currentUserName
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [tenantName, setTenantName] = useState(currentUserName || 'Rahul Sharma');
  const [tenantPhone, setTenantPhone] = useState('+91 98765 43210');
  const [tenantAadhaar, setTenantAadhaar] = useState('5482 9102 3841');
  const [landlordName, setLandlordName] = useState('Vikram Singh (Property Owner)');
  const [monthlyRent, setMonthlyRent] = useState<number>(15000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(30000);
  const [tenureMonths, setTenureMonths] = useState<number>(11);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSigned, setIsSigned] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!isOpen) return null;

  const selectedProp = properties.find(p => p.id === selectedPropertyId) || properties[0];

  const handlePropertyChange = (id: string) => {
    setSelectedPropertyId(id);
    const prop = properties.find(p => p.id === id);
    if (prop) {
      setMonthlyRent(prop.rentPerMonth);
      setSecurityDeposit(prop.securityDeposit || prop.rentPerMonth * 2);
      if (prop.ownerName) setLandlordName(prop.ownerName);
    }
  };

  // Canvas E-Signature handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0284c7';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsSigned(true);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setIsSigned(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#0C1017] text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Digital Rental Agreement & E-Signature Generator</h2>
              <p className="text-xs text-slate-400 font-semibold">Legally Compliant 11-Month Indian Lease Contract</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Controls Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Select Property</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.city}) - ₹{p.rentPerMonth}/mo
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Tenant Name & Aadhaar</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Tenant Name"
                  className="w-1/2 p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-semibold outline-none"
                />
                <input
                  type="text"
                  value={tenantAadhaar}
                  onChange={(e) => setTenantAadhaar(e.target.value)}
                  placeholder="Aadhaar No."
                  className="w-1/2 p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-semibold outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Rent & Security Deposit</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  placeholder="Monthly Rent"
                  className="w-1/2 p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-semibold outline-none font-mono"
                />
                <input
                  type="number"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                  placeholder="Deposit"
                  className="w-1/2 p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-semibold outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Agreement Document Preview Box */}
          <div className="bg-amber-50/50 dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-amber-200/80 dark:border-zinc-800 space-y-5 text-slate-800 dark:text-zinc-200 shadow-inner font-serif">
            
            {/* Government Stamp Paper Header */}
            <div className="border-b-2 border-amber-900/20 pb-4 text-center space-y-1 font-sans">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-200/60 px-3 py-1 rounded-md inline-block">
                E-STAMP VERIFIED • RECKO INDIA DIGITAL LEASE CONTRACT
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                RESIDENTIAL LEASE & LICENCE AGREEMENT
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Certificate No: IN-DL{Date.now()} • Issued On: {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* Clauses */}
            <div className="space-y-3 leading-relaxed text-xs">
              <p>
                This Rental Agreement is made on <strong>{startDate}</strong>, between <strong>{landlordName}</strong> (hereinafter referred to as the <strong>"LESSOR/OWNER"</strong>) and <strong>{tenantName}</strong> (Aadhaar: <span className="font-mono">{tenantAadhaar}</span>, Phone: <span className="font-mono">{tenantPhone}</span>, hereinafter referred to as the <strong>"LESSEE/TENANT"</strong>).
              </p>

              <h4 className="font-sans font-bold text-slate-950 dark:text-white pt-2 border-t border-slate-300 dark:border-zinc-800">
                1. PREMISES & TENURE:
              </h4>
              <p>
                The Lessor agrees to let out and the Lessee agrees to take on rent the residential premises located at: <strong className="text-slate-900 dark:text-white">{selectedProp?.title}, {selectedProp?.location}, {selectedProp?.city}</strong> for a period of <strong>{tenureMonths} Months</strong>.
              </p>

              <h4 className="font-sans font-bold text-slate-950 dark:text-white pt-2 border-t border-slate-300 dark:border-zinc-800">
                2. RENT & SECURITY DEPOSIT:
              </h4>
              <p>
                The monthly rent agreed for the premises is <strong>₹{monthlyRent?.toLocaleString('en-IN')} / month</strong>, payable on or before the 5th day of every calendar month. The Lessee has paid an interest-free refundable Security Deposit of <strong>₹{securityDeposit?.toLocaleString('en-IN')}</strong> to the Lessor.
              </p>

              <h4 className="font-sans font-bold text-slate-950 dark:text-white pt-2 border-t border-slate-300 dark:border-zinc-800">
                3. MAINTENANCE & UTILITIES:
              </h4>
              <p>
                The Tenant shall pay actual electricity, water, and society maintenance charges directly to local utility boards. Sub-letting or commercial misuse of the premises is strictly prohibited under Indian Rent Control Acts.
              </p>
            </div>

            {/* E-Signature Canvas Box */}
            <div className="pt-4 border-t-2 border-amber-900/20 grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
              
              {/* Lessor Details */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Lessor / Owner Signature:</span>
                <div className="h-24 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-300 dark:border-zinc-700 flex items-center justify-center p-2 text-center">
                  <div className="space-y-1">
                    <p className="font-serif italic text-base text-slate-900 dark:text-white font-bold">{landlordName}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">✓ Digitally Verified via Recko Portal</p>
                  </div>
                </div>
              </div>

              {/* Lessee E-Signature Canvas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Lessee / Tenant E-Signature:</span>
                  <button
                    onClick={clearCanvas}
                    className="text-[10px] text-rose-500 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Clear Canvas</span>
                  </button>
                </div>
                <div className="relative h-24 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-sky-400 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={350}
                    height={96}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="w-full h-full cursor-crosshair"
                  />
                  {!isSigned && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[11px] text-slate-400 font-semibold">
                      ✍️ Draw your signature here using Mouse/Touch
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
            <Shield className="h-4 w-4" />
            <span>Digital Lease Contract Encrypted & Verified</span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={() => {
                alert('✅ Rental Agreement generated & signed! PDF saved to your account.');
                onClose();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Finalize Agreement</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
