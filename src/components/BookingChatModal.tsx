import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  User,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  MessageSquare,
  CheckCheck,
  Calendar,
  IndianRupee,
  Clock,
  ExternalLink,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { RentalBooking } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';
import { makePhoneCall } from '../utils/phoneCall';
import { formatISTTimeDisplay } from '../utils/dateTimeUtils';

export interface ChatItemContext {
  id: string;
  title: string;
  image: string;
  priceDisplay?: string;
  ownerName: string;
  ownerContact?: string;
  category: string;
  location?: string;
  city?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'owner' | 'renter';
  senderName: string;
  text: string;
  time: string;
}

interface BookingChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: RentalBooking | null;
  itemContext?: ChatItemContext | null;
  currentRole?: 'owner' | 'renter';
  userName?: string;
}

export const BookingChatModal: React.FC<BookingChatModalProps> = ({
  isOpen,
  onClose,
  booking,
  itemContext,
  currentRole = 'renter',
  userName = 'Renter'
}) => {
  if (!isOpen || (!booking && !itemContext)) return null;

  // Resolve display data whether from booking or direct item context
  const title = booking ? booking.itemTitle : itemContext?.title || 'Rental Asset';
  const image = booking ? booking.itemImage : itemContext?.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80';
  const ownerName = booking?.ownerName || itemContext?.ownerName || 'Verified Host';
  const ownerContact = booking?.ownerContact || itemContext?.ownerContact || '+91 98765 43210';
  const rName = booking?.userName || userName || 'Renter';
  const category = booking ? booking.type : itemContext?.category || 'Rental';
  const priceText = booking
    ? `₹${booking.totalPrice.toLocaleString('en-IN')}`
    : itemContext?.priceDisplay || 'Best Price';
  const idBadge = booking ? `#${booking.id}` : `Listing #${itemContext?.id?.slice(0, 8) || 'RENTHUB'}`;

  const storageKey = `renthub_chat_${booking ? booking.id : itemContext?.id}`;

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((m: ChatMessage) => m.id !== 'msg-1' && m.id !== 'msg-2' && !m.id.startsWith('msg-reply-'));
        }
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentRole === 'owner' ? 'owner' : 'renter',
      senderName: currentRole === 'owner' ? ownerName : rName,
      text: inputText.trim(),
      time: formatISTTimeDisplay(new Date())
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
  };

  const quickReplies = currentRole === 'owner'
    ? [
        'Booking confirmed! When would you like to collect / move in?',
        'Please keep your original Govt ID handy for verification.',
        'Deposit is 100% refundable upon safe return.',
        'Would you like to connect on WhatsApp for live video preview?'
      ]
    : [
        'Is this available for this upcoming week?',
        'Can I schedule a quick physical visit / inspection?',
        'Can you share the exact Google Maps location?',
        'What is the security deposit & payment terms?'
      ];

  const handleWhatsApp = () => {
    openWhatsAppChat({
      phoneNumber: ownerContact,
      itemTitle: title,
      itemCategory: category,
      ownerName: ownerName,
      price: priceText,
      city: itemContext?.city || itemContext?.location
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-auto flex flex-col h-[640px] max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={image}
              alt={title}
              className="h-11 w-11 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm truncate max-w-[200px] sm:max-w-[240px]">{title}</h3>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 shrink-0">
                  {idBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center space-x-1.5">
                <span>Chatting with:</span>
                <span className="text-amber-400 font-extrabold">{currentRole === 'owner' ? rName : ownerName}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Direct WhatsApp Button */}
            <button
              onClick={handleWhatsApp}
              type="button"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline text-[11px] font-black">WhatsApp</span>
            </button>

            {/* Direct Call Button */}
            {ownerContact && (
              <button
                type="button"
                onClick={() => makePhoneCall(ownerContact, ownerName)}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all border border-amber-400 cursor-pointer shadow-md"
                title={`Call ${ownerName}`}
              >
                <PhoneCall className="h-4 w-4" />
              </button>
            )}

            {/* Delete Chat History Button */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Permanently delete chat conversation history?')) {
                    setMessages([]);
                    try {
                      localStorage.removeItem(storageKey);
                    } catch {}
                  }
                }}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Delete Chat History"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Asset / Booking Info Strip */}
        <div className="bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 shrink-0">
          <div className="flex items-center space-x-2 truncate">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Direct Verified Owner Communication • Zero Brokerage</span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 shrink-0 font-black">
            <span>{priceText}</span>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-zinc-900/40">
          {messages.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-zinc-500">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-zinc-700 mb-2 stroke-1" />
              <p className="font-bold text-xs text-slate-700 dark:text-zinc-300">
                Direct Chat with {currentRole === 'owner' ? rName : ownerName}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-xs">
                Send a message to discuss availability, visits, inspection, or pricing directly.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender === currentRole;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 font-bold mb-0.5 px-1">
                    {m.senderName} • {m.time}
                  </span>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 rounded-tl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Replies Bar */}
        <div className="px-3 py-2 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex gap-1.5 overflow-x-auto shrink-0">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(qr)}
              className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer whitespace-nowrap"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center space-x-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Type a message to ${currentRole === 'owner' ? rName : ownerName}...`}
            className="flex-1 p-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
