import React from 'react';
import { Home, Sparkles, Navigation, Heart, PlusCircle } from 'lucide-react';

interface BottomNavDockProps {
  onOpenAIModal: () => void;
  onOpenRadar: () => void;
  onOpenWishlist: () => void;
  onOpenListProperty: () => void;
  wishlistCount: number;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  onOpenAIModal,
  onOpenRadar,
  onOpenWishlist,
  onOpenListProperty,
  wishlistCount
}) => {
  return (
    <div className="fixed bottom-3 inset-x-3 z-40 md:hidden animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-none">
      <div className="max-w-md mx-auto bg-slate-950/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-zinc-700/60 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around text-white pointer-events-auto">
        
        {/* 1. Home Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-black mt-0.5">Explore</span>
        </button>

        {/* 2. AI Help Quick Button */}
        <button
          onClick={onOpenAIModal}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="text-[10px] font-black mt-0.5">AI Help</span>
        </button>

        {/* 3. Central Floating List Asset Button */}
        <button
          onClick={onOpenListProperty}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-black shadow-lg shadow-blue-500/40 -translate-y-2 scale-105 transition-transform cursor-pointer border border-blue-400"
        >
          <PlusCircle className="h-5 w-5 stroke-[2.5]" />
          <span className="text-[10px] font-black mt-0.5">List Property</span>
        </button>

        {/* 4. Radar Map Button */}
        <button
          onClick={onOpenRadar}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <Navigation className="h-5 w-5" />
          <span className="text-[10px] font-black mt-0.5">Radar</span>
        </button>

        {/* 5. Wishlist Button */}
        <button
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center justify-center p-2 rounded-2xl text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <span className="absolute top-1 right-2.5 bg-rose-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-slate-950">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] font-black mt-0.5">Saved</span>
        </button>

      </div>
    </div>
  );
};
