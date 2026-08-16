import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  User,
  ShieldCheck,
  MapPin,
  Trash2,
  Sparkles,
  Zap,
  CheckCheck,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { RoommateProfile, UserProfile } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'roommate';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface RoommateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommate: RoommateProfile | null;
  currentUser?: UserProfile | null;
}

export const RoommateChatModal: React.FC<RoommateChatModalProps> = ({
  isOpen,
  onClose,
  roommate,
  currentUser
}) => {
  if (!isOpen || !roommate) return null;

  const senderName = currentUser?.name || 'You';
  const senderAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  // Active Role Switcher for Dual-View Live Simulation
  const [activeRole, setActiveRole] = useState<'user' | 'roommate'>('user');
  const [inputText, setInputText] = useState('');
  
  // Transient live chat session state (NO history saved to DB as explicitly requested)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init-1',
      sender: 'roommate',
      text: `Hey! Thanks for connecting. I'm looking for a flatmate around ${roommate.preferredLocation} with budget ~₹${roommate.budgetPerMonth.toLocaleString('en-IN')}/mo. Are you looking to move in soon?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message sending
  const handleSendMessage = (textToSend?: string) => {
    const finalMsg = textToSend || inputText;
    if (!finalMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: activeRole,
      text: finalMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');

    // If sender was 'user', trigger realistic auto-response after 1.2 seconds if user doesn't switch roles
    if (activeRole === 'user' && !textToSend) {
      setTimeout(() => {
        const autoReplies = [
          `Sounds great! I'm ${roommate.diet} and prefer a ${roommate.sleepSchedule.toLowerCase()} schedule. Does that align with your lifestyle?`,
          `Awesome! My target area is ${roommate.preferredLocation}. Have you checked out any 2BHK/3BHK flats nearby yet?`,
          `Cool! Feel free to call me at ${roommate.phone || '+91 98765 43210'} or we can arrange a visit this weekend!`
        ];
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-auto-${Date.now()}`,
            sender: 'roommate',
            text: randomReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read'
          }
        ]);
      }, 1200);
    }
  };

  // Clear live chat session
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col h-[85vh] sm:h-[750px] animate-in zoom-in-95 duration-200">
        {/* Top Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={roommate.avatar}
                  alt={roommate.name}
                  className="h-11 w-11 rounded-2xl object-cover border-2 border-indigo-500/50"
                />
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-white">{roommate.name}</h3>
                  {roommate.studentVerified && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>VERIFIED</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mt-0.5">
                  <span className="flex items-center space-x-1 text-indigo-300 font-bold">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="truncate max-w-[160px] sm:max-w-[220px]">{roommate.college}</span>
                  </span>
                  {roommate.distanceKm !== undefined && (
                    <span className="bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 text-[10px] px-1.5 py-0.2 rounded font-extrabold flex items-center space-x-0.5">
                      <MapPin className="h-3 w-3 text-indigo-400" />
                      <span>{roommate.distanceKm} km away</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Clear Ephemeral Chat (No history saved)"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Role Switcher & No-History Notice Bar */}
          <div className="bg-indigo-950 text-indigo-100 border-b border-indigo-900/60 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
            <div className="flex items-center space-x-2 text-[11px] font-medium text-indigo-200">
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Transient Live Chat:</strong> Messages are live in memory only. History is not stored in database logs.
              </span>
            </div>

            {/* Sender / Receiver Toggle for Dual View */}
            <div className="flex items-center bg-indigo-900/80 p-0.5 rounded-lg border border-indigo-700/60 text-[10px] font-bold">
              <span className="text-indigo-300 px-2">Role:</span>
              <button
                onClick={() => setActiveRole('user')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  activeRole === 'user' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-300 hover:text-white'
                }`}
              >
                Sender ({senderName.split(' ')[0]})
              </button>
              <button
                onClick={() => setActiveRole('roommate')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  activeRole === 'roommate' ? 'bg-emerald-600 text-white shadow-xs' : 'text-indigo-300 hover:text-white'
                }`}
              >
                Receiver ({roommate.name.split(' ')[0]})
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 dark:bg-zinc-950/60">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 dark:text-zinc-200 text-sm">Chat session cleared</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                  Send a message below to start a brand new live conversation with {roommate.name.split(' ')[0]}.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end space-x-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <img
                        src={roommate.avatar}
                        alt={roommate.name}
                        className="h-7 w-7 rounded-full object-cover shrink-0 mb-1 border border-slate-300 dark:border-zinc-700"
                      />
                    )}

                    <div
                      className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs font-medium leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700/80 rounded-bl-none'
                      }`}
                    >
                      <div className="text-[10px] font-black opacity-80 mb-0.5 flex items-center justify-between gap-2">
                        <span>{isUser ? senderName : roommate.name}</span>
                        <span className="font-normal opacity-70 text-[9px]">{msg.time}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {isUser && (
                      <img
                        src={senderAvatar}
                        alt={senderName}
                        className="h-7 w-7 rounded-full object-cover shrink-0 mb-1 border border-indigo-400"
                      />
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Icebreakers / Prompts */}
          <div className="p-2.5 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
            <span className="text-slate-400 font-bold px-1 shrink-0">Quick Icebreakers:</span>
            <button
              onClick={() => handleSendMessage(`Hi ${roommate.name.split(' ')[0]}! What is your planned move-in date?`)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-zinc-300 font-bold transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-zinc-700"
            >
              📅 Move-in Date?
            </button>
            <button
              onClick={() => handleSendMessage(`Is the monthly budget of ₹${roommate.budgetPerMonth} negotiable?`)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-zinc-300 font-bold transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-zinc-700"
            >
              💰 Budget Negotiable?
            </button>
            <button
              onClick={() => handleSendMessage(`Hey! Are you looking for a 2BHK or a 3BHK flat near ${roommate.preferredLocation}?`)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-zinc-300 font-bold transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-zinc-700"
            >
              🏠 Flat Type?
            </button>
            <button
              onClick={() => handleSendMessage(`Let's exchange phone numbers to discuss flat hunting!`)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-zinc-300 font-bold transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-zinc-700"
            >
              📱 Share Phone Number
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center space-x-2 shrink-0"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type message as ${activeRole === 'user' ? senderName : roommate.name}...`}
                className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs text-white transition-all cursor-pointer flex items-center space-x-1.5 shadow-md ${
                activeRole === 'user'
                  ? 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50'
                  : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
  );
};
