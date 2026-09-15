import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
  durationMs?: number;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({
  onComplete,
  durationMs = 3000,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        setProgress(100);
        setIsFadingOut(true);
        window.setTimeout(onComplete, 450);
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, onComplete]);

  const handleSkip = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    window.setTimeout(onComplete, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-zinc-950 text-white select-none transition-opacity duration-500 ease-out p-6 sm:p-10 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />

      {/* Top Header with Skip Button */}
      <div className="w-full max-w-5xl flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium tracking-wider">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] uppercase text-zinc-300">Recko-India Verified</span>
        </div>

        <button
          onClick={handleSkip}
          type="button"
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <span>Skip</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Centerpiece: Clean, Luxurious Branding */}
      <div className="flex flex-col items-center text-center relative z-10 max-w-2xl my-auto space-y-5">
        {/* Emblem */}
        <div className="relative flex items-center justify-center mb-1">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-zinc-950 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.35)] border border-amber-300">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.2]" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase">
            RECKO<span className="text-amber-400">-</span>INDIA
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-medium max-w-lg mx-auto">
            India's Unified Rental & Stays Ecosystem
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-semibold text-zinc-300">
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center space-x-1.5">
            <span className="text-amber-400">✓</span>
            <span>Zero Brokerage</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center space-x-1.5">
            <span className="text-amber-400">✓</span>
            <span>Direct Owner Contact</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center space-x-1.5">
            <span className="text-amber-400">✓</span>
            <span>10 Rental Verticals</span>
          </span>
        </div>
      </div>

      {/* Bottom: Clean Linear Progress Bar */}
      <div className="w-full max-w-md relative z-10 space-y-2">
        <div className="flex justify-between text-[11px] text-zinc-500 font-mono font-medium">
          <span>Loading Experience...</span>
          <span className="text-amber-400 font-bold">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
