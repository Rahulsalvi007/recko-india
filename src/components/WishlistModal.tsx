import React from 'react';
import { WishlistItem } from '../types';
import { X, Heart, Trash2, MapPin, Star, ExternalLink, Bookmark } from 'lucide-react';

interface WishlistModalProps {
  wishlist: WishlistItem[];
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onViewItem: (item: WishlistItem) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  wishlist,
  onClose,
  onRemoveItem,
  onViewItem,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] dark:bg-zinc-950 text-slate-900 dark:text-white overflow-y-auto w-full h-full min-h-screen">
      <div className="w-full min-h-screen flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0C1017] text-[#FAF7F2] p-5 sm:p-6 flex justify-between items-center border-b border-slate-800 sticky top-0 z-40 shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700"
            >
              <X className="h-4 w-4" />
              <span>← Back to Explore</span>
            </button>
            <div className="h-10 w-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-black">My Saved Wishlist</h2>
              <p className="text-xs text-slate-300 font-semibold">{wishlist.length} saved places & listings</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 space-y-6 max-w-7xl w-full mx-auto flex-1">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Bookmark className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-800">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                Explore properties, hotels, restaurants, libraries, or vehicles and click the heart icon to save them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] flex gap-3.5 items-center relative group hover:shadow-md transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-20 rounded-xl object-cover bg-slate-900 shrink-0"
                  />

                  <div className="flex-1 min-w-0 pr-6">
                    <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block mb-1">
                      {item.category}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mt-0.5 truncate">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{item.location}, {item.city}</span>
                    </p>
                    <p className="text-xs font-black text-slate-950 mt-1">{item.priceDisplay}</p>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onViewItem(item)}
                      className="p-1.5 text-slate-700 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
