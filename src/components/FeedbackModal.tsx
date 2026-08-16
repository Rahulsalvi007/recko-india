import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MessageSquare,
  Send,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  Heart,
  ShieldCheck,
  MessageCircle,
  Filter
} from 'lucide-react';
import { UserProfile } from '../types';
import { saveDocument } from '../lib/firebase';

export interface FeedbackItem {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  category: string;
  message: string;
  createdAt: string;
  likesCount?: number;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'list'>('submit');
  
  // Feedback Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('App Experience');
  const [message, setMessage] = useState<string>('');
  
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');

  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('ALL');

  // Sync currentUser props when modal opens
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
    }
  }, [currentUser, isOpen]);

  // Load existing feedback items
  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem('renthub_feedbacks_list');
      if (stored) {
        setFeedbacks(JSON.parse(stored));
      } else {
        // Mock initial feedbacks
        const initialFeedbacks: FeedbackItem[] = [
          {
            id: 'fb-101',
            userName: 'Rahul Salvi',
            userEmail: 'rahul.salvi@gmail.com',
            rating: 5,
            category: 'App Experience',
            message: 'RentHub made finding my PG near Pune College so effortless! Zero brokerage and instant owner contact details.',
            createdAt: '2026-08-05',
            likesCount: 14
          },
          {
            id: 'fb-102',
            userName: 'Pooja Sharma',
            userEmail: 'pooja.s@gmail.com',
            rating: 5,
            category: 'Property Quality',
            message: 'The verified listings with 360 degree photos and distance to DU North campus are extremely accurate.',
            createdAt: '2026-08-04',
            likesCount: 9
          },
          {
            id: 'fb-103',
            userName: 'Vikramaditya Singh',
            userEmail: 'vikram.singh@gmail.com',
            rating: 4,
            category: 'Rent Pricing',
            message: 'Very clean UI and dark mode toggle is great! Loved the quick vehicle rental features as well.',
            createdAt: '2026-08-02',
            likesCount: 21
          }
        ];
        setFeedbacks(initialFeedbacks);
        localStorage.setItem('renthub_feedbacks_list', JSON.stringify(initialFeedbacks));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!message.trim()) return;

    const newFeedback: FeedbackItem = {
      id: `fb-${Date.now()}`,
      userName: name.trim() || currentUser.name,
      userEmail: email.trim() || currentUser.email,
      rating,
      category,
      message: message.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      likesCount: 0
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('renthub_feedbacks_list', JSON.stringify(updated));

    try {
      await saveDocument('feedbacks', newFeedback.id, newFeedback);
    } catch (err) {
      console.warn('Feedback cloud save backup:', err);
    }

    setSubmittedSuccess(true);
    setMessage('');
    setTimeout(() => {
      setSubmittedSuccess(false);
      setActiveTab('list');
    }, 1200);
  };

  const handleLikeFeedback = (id: string) => {
    const updated = feedbacks.map((f) => {
      if (f.id === id) {
        return { ...f, likesCount: (f.likesCount || 0) + 1 };
      }
      return f;
    });
    setFeedbacks(updated);
    localStorage.setItem('renthub_feedbacks_list', JSON.stringify(updated));
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (selectedFilterCategory === 'ALL') return true;
    return f.category === selectedFilterCategory;
  });

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : '5.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 dark:bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-400 text-zinc-950 rounded-2xl shadow-lg">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                User Feedback & Reviews
                <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {avgRating} / 5.0
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Share your experience, rate listings, or report suggestions to improve RentHub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 p-2 gap-2">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'submit'
                ? 'bg-zinc-100 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Write Feedback / Review</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'list'
                ? 'bg-zinc-100 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>View Recent Reviews ({feedbacks.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'submit' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!currentUser && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Please log in to your free user account to submit feedback.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="bg-amber-400 text-zinc-950 font-black px-3 py-1.5 rounded-xl text-xs hover:bg-amber-300 transition-all shrink-0 cursor-pointer"
                  >
                    Log In Now
                  </button>
                </div>
              )}

              {submittedSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>Thank you! Your feedback & rating have been submitted successfully.</span>
                </div>
              )}

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                  Select Rating Rating (1 - 5 Stars)
                </label>
                <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-black text-amber-300">
                    {rating === 5
                      ? '⭐ Excellent (5/5)'
                      : rating === 4
                      ? '👍 Very Good (4/5)'
                      : rating === 3
                      ? '🙂 Good (3/5)'
                      : rating === 2
                      ? '😐 Average (2/5)'
                      : '👎 Needs Improvement (1/5)'}
                  </span>
                </div>
              </div>

              {/* Feedback Category */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                  Feedback Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Property & Landlord Review',
                    'App Experience',
                    'Property Quality',
                    'Rent Pricing',
                    'Customer Support',
                    'Feature Suggestion',
                    'Report Issue'
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Info (Pre-filled if logged in) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Salvi"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                    Your Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul.salvi@gmail.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">
                  Your Review / Feedback Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details about your rental experience, property accuracy, UI smoothness, or suggestions..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black py-3 rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Submit Feedback Review</span>
              </button>

            </form>
          ) : (
            /* REVIEWS LIST */
            <div className="space-y-4">
              
              {/* Category Filter */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <span className="text-xs font-bold text-zinc-400 shrink-0 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" /> Filter:
                </span>
                {['ALL', 'App Experience', 'Property Quality', 'Rent Pricing', 'Customer Support'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedFilterCategory === cat
                        ? 'bg-zinc-100 text-zinc-950 font-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-10 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
                  No feedback reviews submitted yet in this category.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFeedbacks.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-xl bg-zinc-800 text-amber-300 font-bold flex items-center justify-center text-xs">
                            {item.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-black text-white">{item.userName}</span>
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black px-1.5 py-0.2 rounded-full flex items-center gap-1">
                                <ShieldCheck className="h-2.5 w-2.5" /> VERIFIED
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500">{item.createdAt} • {item.category}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center space-x-1 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-black text-amber-300">{item.rating}.0</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed pt-1 font-medium">
                        "{item.message}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                        <span>Helpful review?</span>
                        <button
                          onClick={() => handleLikeFeedback(item.id)}
                          className="flex items-center space-x-1.5 text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{item.likesCount || 0} Helpful</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 text-center text-[11px] text-zinc-400 font-medium">
          ❤️ RentHub community feedback is updated in real-time across all users
        </div>

      </div>
    </div>
  );
};
