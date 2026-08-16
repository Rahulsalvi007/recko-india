import React, { useState } from 'react';
import {
  KeyRound,
  PhoneCall,
  Mail,
  HelpCircle,
  FileText,
  Lock,
  Info,
  Send,
  CheckCircle2,
  PlusCircle,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { MainCategory } from '../types';

interface FooterProps {
  setActiveCategory: (cat: MainCategory) => void;
  onOpenLandlordAuthModal: () => void;
  onOpenLandlordModal: () => void;
}

type FooterPageType = 'about' | 'contact' | 'privacy' | 'terms' | 'faqs' | null;

export const Footer: React.FC<FooterProps> = ({
  setActiveCategory,
  onOpenLandlordAuthModal,
  onOpenLandlordModal
}) => {
  const [activeModalPage, setActiveModalPage] = useState<FooterPageType>(null);

  // Contact Form State inside Contact Modal
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // FAQ Active Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setActiveModalPage(null);
    }, 2800);
  };

  const FAQS_DATA = [
    {
      q: 'How does RentHub promise 100% Zero Brokerage?',
      a: 'RentHub directly connects tenants with verified property owners with zero middleman commission or agent fees.'
    },
    {
      q: 'How can owners list a property on RentHub?',
      a: 'Click "List Your Property" to complete quick owner verification and publish your listing for free.'
    },
    {
      q: 'How does Free Email OTP Verification work?',
      a: 'During login or registration, a free 6-digit OTP code is sent to your email to verify your identity securely.'
    }
  ];

  return (
    <>
      <footer
        className="bg-zinc-950 text-zinc-300 border-t border-zinc-800/80 pt-8 pb-6 px-4 sm:px-6 lg:px-8 mt-12 transition-all"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Row: Brand & Essential Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 text-xs">
            
            {/* Brand Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveCategory('residential')}
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  RentHub India
                </h3>
                <p className="text-[10px] font-bold text-indigo-400">
                  Your Perfect Rental Partner • Zero Brokerage
                </p>
              </div>
            </div>

            {/* Quick Essential Contact Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 font-medium">
              <a href="tel:18004198080" className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                <span>+91 1800-419-8080</span>
              </a>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <a href="mailto:support@renthub.in" className="flex items-center space-x-1.5 hover:text-amber-400 transition-colors">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                <span>support@renthub.in</span>
              </a>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={onOpenLandlordModal}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold px-3 py-1 rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>List Property Free</span>
              </button>
            </div>

          </div>

          {/* Middle Row: Minimal Important Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-zinc-400">
            <button
              type="button"
              onClick={() => setActiveModalPage('about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => setActiveModalPage('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact Support
            </button>
            <button
              type="button"
              onClick={() => setActiveModalPage('faqs')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQs
            </button>
            <button
              type="button"
              onClick={() => setActiveModalPage('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveModalPage('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              type="button"
              onClick={onOpenLandlordAuthModal}
              className="hover:text-indigo-400 transition-colors cursor-pointer text-indigo-300 font-bold"
            >
              Owner Login
            </button>
          </div>

          {/* Bottom Bar: Clean Copyright */}
          <div className="pt-2 text-center text-[11px] text-zinc-500 font-medium">
            © {new Date().getFullYear()} RentHub India. All rights reserved.
          </div>

        </div>
      </footer>

      {/* POPUP MODAL FOR ESSENTIAL LINKS */}
      {activeModalPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  {activeModalPage === 'about' && <Info className="h-5 w-5" />}
                  {activeModalPage === 'contact' && <PhoneCall className="h-5 w-5" />}
                  {activeModalPage === 'privacy' && <Lock className="h-5 w-5" />}
                  {activeModalPage === 'terms' && <FileText className="h-5 w-5" />}
                  {activeModalPage === 'faqs' && <HelpCircle className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white">
                    {activeModalPage === 'about' && 'About RentHub'}
                    {activeModalPage === 'contact' && 'Contact Support'}
                    {activeModalPage === 'privacy' && 'Privacy Policy'}
                    {activeModalPage === 'terms' && 'Terms & Conditions'}
                    {activeModalPage === 'faqs' && 'Frequently Asked Questions'}
                  </h2>
                  <p className="text-[10px] text-amber-400 font-bold">RentHub India</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalPage(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
              
              {/* ABOUT */}
              {activeModalPage === 'about' && (
                <div className="space-y-3">
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <h3 className="font-bold text-white flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>RentHub India</span>
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      RentHub is a unified rental platform connecting tenants directly with verified property owners for flats, student PGs, hotels, commercial spaces, and vehicles with 100% zero brokerage.
                    </p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                    <h4 className="font-extrabold text-emerald-400 text-xs">🛡 Direct Owner Contact</h4>
                    <p className="text-zinc-400 text-[11px]">
                      Connect directly with owners without middlemen or hidden fees.
                    </p>
                  </div>
                </div>
              )}

              {/* CONTACT */}
              {activeModalPage === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <PhoneCall className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-[10px] text-zinc-400">Toll-Free</p>
                      <p className="font-bold text-white text-xs">+91 1800-419-8080</p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <Mail className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                      <p className="text-[10px] text-zinc-400">Email</p>
                      <p className="font-bold text-white text-xs">support@renthub.in</p>
                    </div>
                  </div>

                  {contactSubmitted ? (
                    <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-center space-y-1">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                      <p className="font-bold text-white text-xs">Message Sent!</p>
                      <p className="text-[11px]">Our team will get back to you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                      <div>
                        <label className="block text-zinc-400 font-bold mb-1 text-[11px]">Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-bold mb-1 text-[11px]">Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-bold mb-1 text-[11px]">Message *</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="How can we help you?"
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send Message</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* PRIVACY */}
              {activeModalPage === 'privacy' && (
                <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-300">
                  <h4 className="font-extrabold text-white text-xs">Privacy Commitment</h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    At RentHub India, user privacy and data security are strictly maintained. We do not sell user information to third parties. All personal contact details remain encrypted.
                  </p>
                </div>
              )}

              {/* TERMS */}
              {activeModalPage === 'terms' && (
                <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-300">
                  <h4 className="font-extrabold text-white text-xs">Terms & Conditions</h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    RentHub provides a direct owner-tenant rental discovery service. Property owners are responsible for posting accurate details. Zero brokerage policy applies to direct listings.
                  </p>
                </div>
              )}

              {/* FAQS */}
              {activeModalPage === 'faqs' && (
                <div className="space-y-2">
                  {FAQS_DATA.map((faq, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full p-3 text-left font-bold text-white text-xs flex items-center justify-between cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className="text-zinc-400">{openFaqIndex === idx ? '−' : '+'}</span>
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-3 pb-3 text-zinc-400 text-[11px] border-t border-zinc-800/80 pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-950 p-3 border-t border-zinc-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalPage(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
