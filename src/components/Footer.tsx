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
  ShieldCheck,
  Phone,
  MessageCircle,
  ChevronDown,
  Award,
  Users,
  Check,
  Building2,
  Car,
  Shirt,
  Wrench,
  ExternalLink,
  ShieldAlert,
  Heart,
  Calendar
} from 'lucide-react';
import { MainCategory } from '../types';
import { makePhoneCall } from '../utils/phoneCall';
import { openWhatsAppChat } from '../utils/whatsapp';

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
  const [contactCategory, setContactCategory] = useState('General Support');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // FAQ Active Accordion & Filter
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<'all' | 'tenants' | 'owners' | 'payments'>('all');

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
      category: 'tenants',
      q: 'How does Recko India promise 100% Zero Brokerage?',
      a: 'Recko India directly connects tenants with verified property & asset owners without any brokers, middlemen, or agent commissions. You communicate directly with owners!'
    },
    {
      category: 'tenants',
      q: 'Is my ₹99 booking token 100% refundable?',
      a: 'Yes! The ₹99 token reserves your slot and initiates owner contact. If an owner declines your booking request or if you cancel before final confirmation, 100% of your ₹99 is instantly refunded to your original payment method.'
    },
    {
      category: 'owners',
      q: 'How can owners list properties, vehicles, or commercial items?',
      a: 'Click "Owner Portal" or "List Property" to register your account via Email OTP. Once logged in, click "Add New Listing" to upload up to 4 photos (max 500 KB each) and set your rental rates.'
    },
    {
      category: 'payments',
      q: 'How does Free Email OTP Verification work?',
      a: 'During login or password reset, a secure 6-digit OTP code is dispatched directly to your registered email address. This ensures zero unauthorized logins and 100% account protection.'
    },
    {
      category: 'tenants',
      q: 'What types of assets can I rent on Recko India?',
      a: 'You can rent Residential Properties (Flats/PGs), Stays & Hotels, Vehicles (Cars/Bikes), Commercial Appliances (TVs, Fridges, ACs), Sports Turfs, Libraries, and Wedding Outfits!'
    },
    {
      category: 'owners',
      q: 'How are listings and property owners verified on Recko India?',
      a: 'Our AI Security Auditor automatically checks listing photos, pricing benchmarks, and government ID documents to maintain a 100% scam-free platform.'
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
                  Recko-India
                </h3>
                <p className="text-[10px] font-bold text-indigo-400">
                  Your Perfect Rental Partner • Zero Brokerage
                </p>
              </div>
            </div>

            {/* Quick Essential Contact Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 font-medium">
              <a href="tel:+916367959137" className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                <span>+91 6367959137</span>
              </a>
              <span className="text-zinc-700 hidden sm:inline">•</span>
              <a href="mailto:support@Recko-India.in" className="flex items-center space-x-1.5 hover:text-amber-400 transition-colors">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                <span>infotechjahvi@gmail.com</span>
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
            © {new Date().getFullYear()} Recko-India. All rights reserved.
          </div>

        </div>
      </footer>

      {/* POPUP MODAL FOR ESSENTIAL LINKS */}
      {activeModalPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 border border-amber-500/30 text-slate-100 w-full max-w-2xl rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden my-auto flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950/90 p-5 border-b border-amber-500/20 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20 font-black">
                  {activeModalPage === 'about' && <Info className="h-5 w-5" />}
                  {activeModalPage === 'contact' && <PhoneCall className="h-5 w-5" />}
                  {activeModalPage === 'privacy' && <Lock className="h-5 w-5" />}
                  {activeModalPage === 'terms' && <FileText className="h-5 w-5" />}
                  {activeModalPage === 'faqs' && <HelpCircle className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                    {activeModalPage === 'about' && 'About Recko India'}
                    {activeModalPage === 'contact' && 'Contact Support & Helpdesk'}
                    {activeModalPage === 'privacy' && 'Privacy & Data Security Policy'}
                    {activeModalPage === 'terms' && 'Terms of Service & Conditions'}
                    {activeModalPage === 'faqs' && 'Frequently Asked Questions (FAQ)'}
                  </h2>
                  <p className="text-[11px] text-amber-400/90 font-mono font-bold flex items-center space-x-1 mt-0.5">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Recko India • Official Verified System Portal</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalPage(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-amber-500/30">
              
              {/* 🌟 1. ABOUT US */}
              {activeModalPage === 'about' && (
                <div className="space-y-4">
                  {/* Hero Banner */}
                  <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border border-amber-500/40 p-5 rounded-2xl space-y-2 shadow-inner">
                    <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                      <span>India's #1 Multi-Asset Zero Brokerage Rental Platform</span>
                    </div>
                    <h3 className="text-base font-black text-white">Connecting Tenants & Verified Owners Directly</h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Recko India eliminates heavy broker commissions by enabling direct owner-tenant communication for flats, student PGs, hotels, commercial spaces, vehicles, wedding outfits, turfs, and appliances.
                    </p>
                  </div>

                  {/* 4 Key Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-xs">
                        <Building2 className="h-4 w-4 text-amber-400" />
                        <span>Direct Owner Contact</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        No brokers, zero middleman fees. Connect directly via WhatsApp or Phone dialer.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-xs">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Verified & AI Audited</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        24/7 AI Listing Security Auditor monitors owner IDs, photos, and fair rental pricing.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center space-x-2 text-blue-400 font-extrabold text-xs">
                        <Car className="h-4 w-4 text-blue-400" />
                        <span>Multi-Category Rentals</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Rent homes, cars, bikes, hotel stays, commercial electronics, sports turfs, and outfits.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center space-x-2 text-purple-400 font-extrabold text-xs">
                        <KeyRound className="h-4 w-4 text-purple-400" />
                        <span>Refundable ₹99 Escrow Token</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Reserve listings with a 100% refundable ₹99 token deposit if rejected by owner.
                      </p>
                    </div>
                  </div>

                  {/* Trust Stats Bar */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between text-center gap-2">
                    <div>
                      <span className="text-sm font-black text-amber-400 block">10,000+</span>
                      <span className="text-[10px] text-slate-400 font-bold">Verified Homes</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                    <div>
                      <span className="text-sm font-black text-emerald-400 block">5,000+</span>
                      <span className="text-[10px] text-slate-400 font-bold">Vehicles & Stays</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                    <div>
                      <span className="text-sm font-black text-blue-400 block">₹0</span>
                      <span className="text-[10px] text-slate-400 font-bold">Broker Commission</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                    <div>
                      <span className="text-sm font-black text-yellow-300 block">4.9 ★</span>
                      <span className="text-[10px] text-slate-400 font-bold">User Satisfaction</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 📞 2. CONTACT SUPPORT */}
              {activeModalPage === 'contact' && (
                <div className="space-y-4">
                  {/* Quick Action Channels */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => makePhoneCall('+916367959137', 'Recko Support')}
                      className="bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 p-3.5 rounded-2xl text-left transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-300 font-bold uppercase">Direct Phone Call</p>
                          <p className="font-mono font-black text-xs text-white">+91 6367959137</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => openWhatsAppChat({ phoneNumber: '+916367959137', customMessage: 'Hello Recko India Support, I need assistance with...' })}
                      className="bg-green-950/60 hover:bg-green-900/80 border border-green-500/40 p-3.5 rounded-2xl text-left transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-green-500/20 rounded-xl text-green-400 group-hover:scale-110 transition-transform">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-green-300 font-bold uppercase">WhatsApp 24/7</p>
                          <p className="font-mono font-black text-xs text-white">Click to Chat</p>
                        </div>
                      </div>
                    </button>

                    <a
                      href="mailto:infotechjahvi@gmail.com"
                      className="bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 p-3.5 rounded-2xl text-left transition-all cursor-pointer group shadow-sm block"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-amber-300 font-bold uppercase">Official Email</p>
                          <p className="font-mono font-black text-[11px] text-white truncate">infotechjahvi@gmail.com</p>
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Form or Submitted Notice */}
                  {contactSubmitted ? (
                    <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-200 p-6 rounded-2xl text-center space-y-2 shadow-lg animate-in zoom-in-95">
                      <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                      <h4 className="font-black text-base text-white">Support Ticket Submitted Successfully!</h4>
                      <p className="text-xs text-emerald-300 max-w-sm mx-auto">
                        Thank you for reaching out, <strong className="text-white">{contactName}</strong>. Our dedicated customer success team will contact you at <strong className="text-white">{contactEmail}</strong> shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
                      <h4 className="font-bold text-xs text-amber-300 flex items-center space-x-1.5">
                        <Send className="h-3.5 w-3.5 text-amber-400" />
                        <span>Send Us an Inquiry / Support Message</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1 text-[11px]">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter your name"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 font-bold mb-1 text-[11px]">Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="your.email@gmail.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1 text-[11px]">Help Topic / Category *</label>
                        <select
                          value={contactCategory}
                          onChange={(e) => setContactCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold"
                        >
                          <option value="General Support">General Inquiry / Feedback</option>
                          <option value="Booking Assistance">Tenant Booking & Token Refund</option>
                          <option value="Owner Listing Help">Owner Listing & Registration</option>
                          <option value="Security Issue">Report Scam or Suspicious Listing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1 text-[11px]">Detailed Message *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Please describe how we can assist you..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2 border border-amber-300"
                      >
                        <Send className="h-4 w-4 text-slate-950" />
                        <span>Submit Support Ticket</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* 🔒 3. PRIVACY POLICY */}
              {activeModalPage === 'privacy' && (
                <div className="space-y-3.5">
                  <div className="bg-indigo-950/60 border border-indigo-500/40 p-4 rounded-2xl text-indigo-200 space-y-1">
                    <div className="flex items-center space-x-2 font-bold text-xs text-white">
                      <Lock className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>Bank-Grade Data Protection & End-to-End Encryption</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      At Recko India, your privacy is our highest priority. We safeguard all personal data using SSL 256-bit encryption.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <h4 className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-400" />
                        <span>1. Zero Spam & Data Selling Protection</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        We strictly promise never to sell, trade, or share your phone number, email address, or government ID details with third-party telemarketers or marketing agencies.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <h4 className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-400" />
                        <span>2. Controlled Contact Sharing</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Owner phone numbers and tenant contact details are exchanged ONLY when a genuine booking request with a refundable ₹99 token is initiated.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <h4 className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-400" />
                        <span>3. Secure Payment & UPI Credentials</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Recko India does not store your credit card, debit card, or UPI PIN data. Payments are processed securely via RBI-compliant gateway partners.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 📜 4. TERMS & CONDITIONS */}
              {activeModalPage === 'terms' && (
                <div className="space-y-3.5">
                  <div className="bg-amber-950/50 border border-amber-500/40 p-4 rounded-2xl text-amber-200 space-y-1">
                    <div className="flex items-center space-x-2 font-bold text-xs text-white">
                      <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Official Rental Discovery Terms of Service (Updated 2026)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      By accessing Recko India, users agree to follow our community trust protocols for direct rental transactions.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <h4 className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-400" />
                        <span>1. 100% Zero Brokerage Policy</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Recko India acts solely as a direct discovery platform connecting tenants with asset owners. No user shall demand or pay broker commissions.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <h4 className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-400" />
                        <span>2. Listing Authenticity & Image Limits</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Property and asset owners are responsible for uploading real photos (up to 4 images, max 500 KB each) and accurate monthly rent and deposit terms.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <h4 className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-amber-400" />
                        <span>3. Token Refund Guarantee</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        The ₹99 booking token is 100% refundable if the owner rejects the booking or fails to confirm within the stipulated period.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ❓ 5. FAQS */}
              {activeModalPage === 'faqs' && (
                <div className="space-y-3">
                  {/* Category Pills */}
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setFaqCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
                        faqCategoryFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      All Questions
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqCategoryFilter('tenants')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
                        faqCategoryFilter === 'tenants'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      For Tenants
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqCategoryFilter('owners')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-all ${
                        faqCategoryFilter === 'owners'
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      For Owners
                    </button>
                  </div>

                  {/* Accordion list */}
                  <div className="space-y-2">
                    {FAQS_DATA.filter((f) => faqCategoryFilter === 'all' || f.category === faqCategoryFilter).map((faq, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          openFaqIndex === idx
                            ? 'bg-slate-950 border-amber-500/50 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                          className="w-full p-3.5 text-left font-bold text-white text-xs flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center space-x-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>{faq.q}</span>
                          </span>
                          <span className={`text-amber-400 transition-transform font-mono text-sm ${openFaqIndex === idx ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        {openFaqIndex === idx && (
                          <div className="px-4 pb-4 text-slate-300 text-[11px] border-t border-slate-800/80 pt-2.5 leading-relaxed bg-slate-900/50">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">Recko India • 100% Verified Platform</span>
              <button
                type="button"
                onClick={() => setActiveModalPage(null)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Done / Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
