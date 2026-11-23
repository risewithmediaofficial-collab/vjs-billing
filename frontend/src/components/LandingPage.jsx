import React, { useState, useEffect } from 'react';
import {
  Sparkles, ShieldCheck, Truck, RotateCcw, Award, ChevronRight,
  TrendingUp, TrendingDown, Clock, Phone, MapPin, Search, Heart,
  ShoppingBag, ArrowRight, Star, Calculator, Coins, CheckCircle2,
  Calendar, Layers, User, ExternalLink, HelpCircle, X, Menu, Gem
} from 'lucide-react';
import { bullionApi } from '../api.js';
import { formatCurrency, SHOP_INFO } from '../data.js';

export default function LandingPage({
  onOpenStaffLogin,
  onOpenBullionModal,
  currentStaff = null,
  goldRate: currentGoldRate = 7500,
  silverRate: currentSilverRate = 85
}) {
  const [ratesData, setRatesData] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);
  const [calcGrams, setCalcGrams] = useState(8);
  const [calcPurity, setCalcPurity] = useState('22K');
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Fetch live bullion rates on mount
  useEffect(() => {
    let isMounted = true;
    async function loadRates() {
      try {
        setLoadingRates(true);
        const res = await bullionApi.getLatest();
        if (isMounted && res && res.success) {
          setRatesData(res);
        }
      } catch (err) {
        console.warn('Failed to fetch live bullion rates for landing page:', err);
      } finally {
        if (isMounted) setLoadingRates(false);
      }
    }
    loadRates();
    return () => { isMounted = false; };
  }, []);

  // Smooth scroll support for hash changes (e.g. #jewel-loans, #rates-section, etc.)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const raw = decodeURIComponent(window.location.hash.replace('#', '').trim().toLowerCase());
        let targetId = raw;
        if (raw === 'jewel loans' || raw === 'jewelloans' || raw === 'loans') {
          targetId = 'jewel-loans';
        } else if (raw === 'rates' || raw === 'bullion' || raw === 'gold-rates') {
          targetId = 'rates-section';
        } else if (raw === 'schemes' || raw === 'savings') {
          targetId = 'savings-schemes';
        } else if (raw === 'categories' || raw === 'rings') {
          targetId = 'categories';
        }
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Rates fallback / live mapping
  const ratesList = ratesData?.data || [];
  const gold24kObj = ratesList.find(r => r.karat === '24K') || { perGram: 12512.3, rupees: 125123, change: 1230 };
  const gold22kObj = ratesList.find(r => r.karat === '22K') || { perGram: currentGoldRate || 11461.3, rupees: 114613, change: 1127 };
  const gold18kObj = ratesList.find(r => r.karat === '18K') || { perGram: 9384.2, rupees: 93842, change: 922 };
  const silverObj = ratesList.find(r => r.metal === 'silver') || { perGram: currentSilverRate || 98.0, rupees: 98000, change: -200 };

  // Calculate live gold rate value in calculator
  const selectedRatePerGram =
    calcPurity === '24K' ? (gold24kObj.perGram || 12512) :
    calcPurity === '22K' ? (gold22kObj.perGram || currentGoldRate || 11461) :
    calcPurity === '18K' ? (gold18kObj.perGram || 9384) :
    (silverObj.perGram || currentSilverRate || 98);

  const rawMetalCost = Number(calcGrams) * selectedRatePerGram;
  const estMakingGst = rawMetalCost * 0.08; // ~5% VA + 3% GST
  const estimatedTotal = Math.round(rawMetalCost + estMakingGst);

  // Categories matching Image 2
  const categories = [
    {
      title: 'Cluster Rings',
      count: '32 Items',
      tag: 'Trending',
      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Bands',
      count: '48 Items',
      tag: 'Classic',
      img: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Engagement Rings',
      count: '54 Items',
      tag: 'Solitaire',
      img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Necklace',
      count: '60 Items',
      tag: 'Bridal & Daily',
      img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Best Sellers matching Image 2
  const bestSellers = [
    {
      id: 'bs-1',
      name: 'Phoenix Wedding Ring Set',
      category: 'Rings',
      price: Math.round((gold22kObj.perGram || 11460) * 4.8 + 3200),
      weight: '4.8g',
      purity: '22K 916',
      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'bs-2',
      name: 'Princess Diamond Ring Set',
      category: 'Rings',
      price: Math.round((gold18kObj.perGram || 9380) * 3.5 + 18500),
      weight: '3.5g',
      purity: '18K Diamond',
      img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'bs-3',
      name: 'Royal Gold Bracelet 22K',
      category: 'Bangles',
      price: Math.round((gold22kObj.perGram || 11460) * 12.2 + 6500),
      weight: '12.2g',
      purity: '22K 916',
      img: 'https://images.unsplash.com/photo-1611591475879-1100f7236535?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'bs-4',
      name: 'Fancy Solitaire Ring',
      category: 'Rings',
      price: Math.round((gold18kObj.perGram || 9380) * 2.8 + 14200),
      weight: '2.8g',
      purity: '18K Gold',
      img: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 'bs-5',
      name: 'Heritage Temple Haram',
      category: 'Necklace',
      price: Math.round((gold22kObj.perGram || 11460) * 32.0 + 16000),
      weight: '32.0g',
      purity: '22K Antique',
      img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80',
    },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-[#fefefe] text-gray-900 selection:bg-[#dccd88] selection:text-[#551f1f] w-full max-w-full overflow-x-hidden pb-16 lg:pb-0">

      {/* ── 1. Top Announcement Bar (Royal Maroon #551f1f with Champagne Gold #dccd88) ── */}
      <div className="bg-[#551f1f] text-[#ffffd6] border-b border-[#dccd88]/30 px-3 sm:px-6 py-2 text-[10.5px] sm:text-xs tracking-wider w-full max-w-full overflow-hidden">
        {/* Desktop Multi-item Banner */}
        <div className="hidden sm:flex max-w-7xl mx-auto items-center justify-between gap-4">
          <div className="flex items-center gap-5 overflow-hidden">
            <span className="flex items-center gap-1.5 whitespace-nowrap font-medium">
              <Truck size={13} className="text-[#dccd88] shrink-0" /> Free domestic insured delivery
            </span>
            <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap font-medium">
              <Calendar size={13} className="text-[#dccd88] shrink-0" /> Book a virtual appointment
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap font-medium">
              <ShieldCheck size={13} className="text-[#dccd88] shrink-0" /> 100% BIS Hallmarked HUID Gold
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto text-[#dccd88] font-serif text-xs shrink-0">
            <span>Ph: {SHOP_INFO.phone || '+91 98765 43210'}</span>
            <span className="text-[#cbadab]">•</span>
            <span>Krishnagiri &amp; Chennai</span>
          </div>
        </div>

        {/* Mobile Single Clean Announcement */}
        <div className="sm:hidden flex items-center justify-center text-center font-medium truncate gap-2 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#dccd88] shrink-0" />
          <span className="truncate">100% BIS Hallmarked Gold • Insured Delivery</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#dccd88] shrink-0" />
        </div>
      </div>

      {/* ── 2. Main Luxury Header & Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-[#fefefe]/95 backdrop-blur-md border-b border-[#cbadab]/40 shadow-xs w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-1 sm:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#551f1f] border border-[#dccd88] flex items-center justify-center shrink-0 shadow-sm">
              <Gem size={15} className="text-[#ffffd6] sm:hidden" />
              <Gem size={22} className="text-[#ffffd6] hidden sm:block" />
            </div>
            <a href="#" className="flex flex-col justify-center">
              <span className="font-cinzel text-xs xs:text-sm sm:text-xl lg:text-2xl font-black tracking-wider text-[#551f1f] uppercase whitespace-nowrap leading-none">
                VJS JEWELLERY
              </span>
              <span className="hidden md:block text-[8px] sm:text-[9.5px] font-bold tracking-[0.18em] text-[#a49141] uppercase whitespace-nowrap leading-none mt-0.5">
                Fine Jewellery &amp; Bullion
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-xs xl:text-[13px] font-semibold tracking-wide text-gray-700 shrink-0">
            <a href="#rates-section" className="text-[#551f1f] hover:text-[#551f1f] font-bold flex items-center gap-1.5 shrink-0 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Today's Rates</span>
            </a>
            <a href="#categories" className="hover:text-[#551f1f] transition-colors shrink-0 py-1">Categories</a>
            <a href="#savings-schemes" className="hover:text-[#551f1f] transition-colors shrink-0 flex items-center py-1">
              <span className="bg-[#ffffd6] text-[#551f1f] border border-[#dccd88] text-[9.5px] px-1.5 py-0.2 rounded font-bold mr-1">11+1</span>
              <span>Savings Scheme</span>
            </a>
            <a href="#jewel-loans" className="hover:text-[#551f1f] transition-colors shrink-0 py-1">Jewel Loans</a>
            <a href="#about-us" className="hover:text-[#551f1f] transition-colors shrink-0 py-1">About</a>
          </nav>

          {/* Action CTAs: Live Bullion Pill + Search + Wishlist + Hamburger */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Live Rate Pill Trigger */}
            <button
              onClick={onOpenBullionModal}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#ffffd6] hover:bg-[#dccd88]/40 border border-[#dccd88] text-[#551f1f] px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer group shrink-0"
              title="Click to view live India Bullion (IBJA) rates"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-serif font-black whitespace-nowrap">
                <span className="sm:hidden">₹{Math.round(gold22kObj.perGram || 11461).toLocaleString('en-IN')}</span>
                <span className="hidden sm:inline">22K: ₹{Math.round(gold22kObj.perGram || 11461).toLocaleString('en-IN')}</span>
              </span>
              <span className="hidden md:inline text-[11px] text-[#551f1f]/70">| Silver ₹{Math.round(silverObj.perGram || 98)}</span>
              <TrendingUp size={11} className="text-emerald-700 sm:ml-0.5 group-hover:scale-110 transition-transform shrink-0 hidden sm:inline" />
            </button>

            {/* Quick Search */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-[#cbadab]/30 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Search jewellery"
            >
              <Search size={14} className="sm:hidden" />
              <Search size={15} className="hidden sm:block" />
            </button>

            {/* Wishlist Icon matching Image 2 */}
            <a
              href="#categories"
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-[#cbadab]/30 text-gray-700 items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Saved Collections"
            >
              <Heart size={15} />
            </a>

            {/* Mobile Menu Hamburger Button - ALWAYS visible on mobile & tablet */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#551f1f] text-[#ffffd6] hover:bg-[#421616] active:scale-95 flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ml-0.5"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu size={16} className="sm:hidden" />
              <Menu size={17} className="hidden sm:block" />
            </button>
          </div>

        </div>
      </header>

      {/* ── Mobile Navigation Drawer (Sidebar) ── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
          <div 
            className="fixed inset-0"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-[85vw] max-w-[320px] bg-white h-full shadow-2xl flex flex-col border-l border-[#cbadab] p-4 sm:p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#551f1f] border border-[#dccd88] flex items-center justify-center shadow-xs">
                  <Gem size={15} className="text-[#ffffd6]" />
                </div>
                <div>
                  <span className="font-cinzel text-base font-black text-[#551f1f] block leading-tight">VJS JEWELLERY</span>
                  <span className="text-[8.5px] text-[#a49141] font-bold tracking-widest uppercase">Fine Jewellery &amp; Bullion</span>
                </div>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Live Bullion Rates Card in Sidebar */}
            <div 
              onClick={() => { setMobileNavOpen(false); onOpenBullionModal(); }}
              className="p-3 rounded-xl bg-gradient-to-r from-[#ffffd6] to-[#fefefe] border border-[#dccd88] shadow-xs cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#551f1f]">
                  <Coins size={14} className="text-[#a49141]" />
                  <span>Live IBJA Gold Rate</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Live Market</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 font-medium">22K (916) / Gram:</span>
                  <p className="text-base font-serif font-black text-[#551f1f]">₹{Math.round(gold22kObj.perGram || 11461).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 font-medium">Silver 999:</span>
                  <p className="text-xs font-serif font-bold text-gray-700">₹{Math.round(silverObj.perGram || 98)}/g</p>
                </div>
              </div>
              <p className="text-[10px] text-[#551f1f]/80 mt-1.5 flex items-center gap-1 font-medium">
                <span>Tap to open full rate card &amp; purity chart</span>
                <ArrowRight size={10} />
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-gray-800">
              <a 
                href="#rates-section" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#ffffd6]/60 text-gray-800 transition-colors"
              >
                <TrendingUp size={16} className="text-[#551f1f]" />
                <span>Today's Bullion Rates</span>
              </a>
              <a 
                href="#categories" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#ffffd6]/60 text-gray-800 transition-colors"
              >
                <Sparkles size={16} className="text-[#551f1f]" />
                <span>Shop by Category &amp; Rings</span>
              </a>
              <a 
                href="#best-sellers" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#ffffd6]/60 text-gray-800 transition-colors"
              >
                <Award size={16} className="text-[#551f1f]" />
                <span>Best Sellers Collection</span>
              </a>
              <a 
                href="#custom-jewel" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#ffffd6]/60 text-gray-800 transition-colors"
              >
                <Gem size={16} className="text-[#551f1f]" />
                <span>Custom Jewellery &amp; Bridal</span>
              </a>
              <a 
                href="#savings-schemes" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#ffffd6]/60 text-gray-800 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-[#551f1f]" />
                  <span>11+1 Savings Scheme</span>
                </span>
                <span className="bg-[#551f1f] text-[#ffffd6] text-[9.5px] px-2 py-0.5 rounded font-bold">0% Wastage</span>
              </a>
              <a 
                href="#jewel-loans" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#ffffd6]/60 text-gray-800 transition-colors"
              >
                <Layers size={16} className="text-[#551f1f]" />
                <span>Jewel Loans &amp; Pledges</span>
              </a>
              <a 
                href="#about-us" 
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#ffffd6]/60 text-gray-800 transition-colors"
              >
                <MapPin size={16} className="text-[#551f1f]" />
                <span>About Us &amp; Branch Locations</span>
              </a>
            </nav>

            {/* Store Contact CTA Button */}
            <div className="pt-2 border-t border-gray-100">
              <a
                href={`tel:${SHOP_INFO.phone || '+919876543210'}`}
                className="w-full py-2.5 rounded-full bg-[#551f1f] text-[#ffffd6] border border-[#dccd88] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#421616] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Phone size={13} className="text-[#dccd88]" />
                <span>Call Store: {SHOP_INFO.phone || '+91 98765 43210'}</span>
              </a>
            </div>

            <div className="text-[10px] text-gray-500 bg-stone-50 p-2.5 rounded-xl border border-gray-200 text-center space-y-0.5">
              <p className="font-bold text-gray-700">Open 9:00 AM – 9:00 PM All Days</p>
              <p className="text-[#a49141] font-semibold">Weekly Holiday: Monday</p>
              <p className="text-gray-400 text-[9px] pt-1">Krishnagiri Main &amp; Chennai Branch</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Sticky Bottom Action Bar (Thumb-friendly Navigation & Sidebar Trigger) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fefefe]/95 backdrop-blur-md border-t border-[#dccd88]/60 shadow-[0_-4px_20px_rgba(85,31,31,0.08)] px-2 py-1 flex items-center justify-around">
        <button
          onClick={onOpenBullionModal}
          className="flex flex-col items-center justify-center text-[#551f1f] hover:text-[#421616] py-1 px-2 cursor-pointer transition-colors"
          title="Live Gold & Silver Rates"
        >
          <Coins size={17} className="text-[#a49141]" />
          <span className="text-[9.5px] font-bold mt-0.5">Live Rates</span>
        </button>

        <a
          href="#categories"
          className="flex flex-col items-center justify-center text-gray-700 hover:text-[#551f1f] py-1 px-2 cursor-pointer transition-colors"
          title="Browse Jewellery Categories"
        >
          <Sparkles size={17} />
          <span className="text-[9.5px] font-medium mt-0.5">Categories</span>
        </a>

        <a
          href="#savings-schemes"
          className="flex flex-col items-center justify-center text-gray-700 hover:text-[#551f1f] py-1 px-2 cursor-pointer transition-colors"
          title="11+1 Monthly Gold Scheme"
        >
          <span className="w-4 h-4 rounded-full bg-[#551f1f] text-[#ffffd6] text-[8.5px] font-black flex items-center justify-center leading-none">
            11+1
          </span>
          <span className="text-[9.5px] font-medium mt-0.5">Scheme</span>
        </a>

        <a
          href={`tel:${SHOP_INFO.phone || '+919876543210'}`}
          className="flex flex-col items-center justify-center text-gray-700 hover:text-[#551f1f] py-1 px-2 cursor-pointer transition-colors"
          title="Call Showroom"
        >
          <Phone size={17} className="text-emerald-700" />
          <span className="text-[9.5px] font-medium mt-0.5">Call Store</span>
        </a>

        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex flex-col items-center justify-center text-[#551f1f] hover:text-[#421616] py-1 px-2 cursor-pointer transition-colors"
          title="Open Menu Sidebar"
        >
          <div className="w-5 h-5 rounded bg-[#551f1f] text-[#ffffd6] flex items-center justify-center">
            <Menu size={13} />
          </div>
          <span className="text-[9.5px] font-bold text-[#551f1f] mt-0.5">Menu</span>
        </button>
      </div>

      {/* ── 3. Hero Section (Exact 2-Column Split matching Image 2) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fefefe] via-[#ffffd6]/20 to-[#fefefe] py-10 sm:py-16 border-b border-[#cbadab]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column: Headline, subtext and CTAs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#ffffd6] border border-[#dccd88] text-[#551f1f] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider">
                <Sparkles size={14} className="text-[#dccd88]" />
                <span>2026 FESTIVE & BRIDAL COLLECTIONS</span>
              </div>

              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl text-[#551f1f] font-normal leading-[1.1] tracking-tight">
                It's All About <br />
                <span className="italic font-semibold text-[#551f1f]">Timeless Elegance</span>
              </h1>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md">
                Discover your iconic style. Ethically sourced, certified 916 BIS Hallmarked gold and sparkling diamond jewellery consciously crafted to celebrate life's greatest chapters.
              </p>

              {/* Action Buttons matching Image 2 */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#best-sellers"
                  className="px-7 py-3 rounded-full bg-[#551f1f] hover:bg-[#421616] text-[#ffffd6] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={15} className="text-[#dccd88]" />
                </a>
                <a
                  href="#rates-section"
                  className="px-6 py-3 rounded-full bg-[#ffffd6] hover:bg-[#dccd88]/30 text-[#551f1f] font-bold text-xs sm:text-sm tracking-wider border border-[#dccd88] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Coins size={15} />
                  <span>Today's Bullion Rates</span>
                </a>
              </div>

              {/* Quick Trust Pillars */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-6 border-t border-[#cbadab]/50 text-center">
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#ffffd6]/40 border border-[#dccd88]/40 shadow-xs">
                  <div className="font-cinzel font-black text-lg sm:text-2xl text-[#551f1f]">30+</div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-gray-600 uppercase tracking-wider font-bold">Years Legacy</div>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#ffffd6]/40 border border-[#dccd88]/40 shadow-xs">
                  <div className="font-cinzel font-black text-lg sm:text-2xl text-[#551f1f]">100%</div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-gray-600 uppercase tracking-wider font-bold">BIS Hallmark</div>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#ffffd6]/40 border border-[#dccd88]/40 shadow-xs">
                  <div className="font-cinzel font-black text-lg sm:text-2xl text-[#551f1f]">50K+</div>
                  <div className="text-[9.5px] sm:text-[10.5px] text-gray-600 uppercase tracking-wider font-bold">Happy Clients</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3-Panel Editorial Showcase matching Image 2 */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-center">
                {/* Panel 1: Traditional Gold Necklace (Dark luxury background) */}
                <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-[#cbadab]/50 bg-black/90 aspect-[3/5] transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
                    alt="Gold Bridal Necklace"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95"
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="text-[7.5px] sm:text-[9.5px] font-bold uppercase tracking-widest bg-[#551f1f] text-[#ffffd6] px-2 py-0.5 rounded shadow-sm border border-[#dccd88]/30">
                      Bridal Haram
                    </span>
                  </div>
                  <div className="absolute bottom-2 sm:bottom-2.5 left-2 right-2 bg-black/60 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/20 text-white shadow-lg">
                    <div className="font-serif text-[11px] sm:text-sm font-bold leading-tight truncate">Imperial Gold</div>
                    <div className="text-[#dccd88] text-[8.5px] sm:text-[10px] font-mono">22K 916 Hallmark</div>
                  </div>
                </div>

                {/* Panel 2: Center Elevated Ring (Prominent elevated center) */}
                <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-[#dccd88] bg-[#ffffd6] aspect-[3/5] -translate-y-2 sm:-translate-y-5 transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
                    alt="Diamond Halo Solitaire Ring"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="text-[7.5px] sm:text-[9.5px] font-bold uppercase tracking-widest bg-[#dccd88] text-[#551f1f] px-2 py-0.5 rounded shadow-sm font-black">
                      Signature
                    </span>
                  </div>
                  <div className="absolute bottom-2 sm:bottom-2.5 left-2 right-2 bg-black/65 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-[#dccd88]/50 text-white shadow-lg">
                    <div className="font-serif text-[11px] sm:text-sm font-bold leading-tight truncate">Diamond Solitaire</div>
                    <div className="text-[#ffffd6] text-[8.5px] sm:text-[10px] font-mono mt-0.5">18K Certified Halo</div>
                  </div>
                </div>

                {/* Panel 3: Pear Cut Solitaire / Gemstone Ring */}
                <div className="group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-[#cbadab]/50 bg-stone-900 aspect-[3/5] transition-all duration-300 hover:scale-[1.02]">
                  <img
                    src="https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80"
                    alt="Precious Gemstone Ring"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95"
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="text-[7.5px] sm:text-[9.5px] font-bold uppercase tracking-widest bg-[#cbadab] text-[#551f1f] px-2 py-0.5 rounded shadow-sm font-bold">
                      Precious Gem
                    </span>
                  </div>
                  <div className="absolute bottom-2 sm:bottom-2.5 left-2 right-2 bg-black/60 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/20 text-white shadow-lg">
                    <div className="font-serif text-[11px] sm:text-sm font-bold leading-tight truncate">Rose Gemstone</div>
                    <div className="text-[#dccd88] text-[8.5px] sm:text-[10px] font-mono">18K Rose Gold</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Today's Gold & Silver Rates Highlight Section (User Focus Requirement) ── */}
      <section id="rates-section" className="py-12 bg-gradient-to-b from-[#ffffd6]/40 via-[#fefefe] to-[#ffffd6]/30 border-b border-[#cbadab]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#551f1f] bg-[#dccd88]/30 px-3 py-1 rounded-full mb-2">
                <Coins size={14} className="text-[#551f1f]" />
                <span>OFFICIAL IBJA BENCHMARK & STORE RATES</span>
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl text-[#551f1f] font-normal">
                Today's Gold &amp; Silver Rates
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Transparent live market benchmarks, updated daily. No hidden markups on base purity.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-[#cbadab] px-3 py-1.5 rounded-xl shadow-2xs">
                <Clock size={13} className="text-[#551f1f]" />
                <span>Updated: {ratesData?.date || 'Today'} • {gold22kObj.session || 'AM'} Session</span>
              </div>
              <button
                onClick={onOpenBullionModal}
                className="px-3.5 py-1.5 bg-[#551f1f] hover:bg-[#421616] text-[#ffffd6] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Full Chart</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* 4 Rate Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">

            {/* 1. Gold 24K (Pure Gold 999) */}
            <div className="bg-white rounded-2xl p-5 border border-[#cbadab] shadow-sm hover:shadow-md transition-all hover:border-[#dccd88] relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">99.9% Purity</span>
                  <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight">Gold 24 Karat</h3>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase">
                  Fine Gold
                </span>
              </div>
              <div className="space-y-1 my-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500">Per Gram:</span>
                  <span className="text-xl font-bold font-mono text-[#551f1f]">
                    ₹{Math.round(gold24kObj.perGram || 12512).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-600 border-t border-gray-100 pt-1.5">
                  <span>Per 10 Grams:</span>
                  <span className="font-bold font-mono">₹{Number(gold24kObj.rupees || 125123).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50/70 px-2.5 py-1 rounded-lg mt-3">
                <span className="flex items-center gap-1">
                  <TrendingUp size={12} /> +₹{gold24kObj.change || 1230} (Day Change)
                </span>
                <span className="text-[10px] text-gray-500 font-mono">IBJA AM</span>
              </div>
            </div>

            {/* 2. Gold 22K (916 Hallmark) - FEATURED / MOST POPULAR IN JEWELLERY */}
            <div className="bg-[#ffffd6]/60 rounded-2xl p-5 border-2 border-[#551f1f] shadow-md hover:shadow-lg transition-all relative overflow-hidden ring-2 ring-[#dccd88]/50">
              <div className="absolute top-0 right-0 bg-[#551f1f] text-[#ffffd6] text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-lg">
                Most Popular
              </div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#551f1f]">91.6% BIS HUID</span>
                  <h3 className="font-serif font-black text-xl text-[#551f1f] leading-tight">Gold 22 Karat (916)</h3>
                </div>
              </div>
              <div className="space-y-1.5 my-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-700 font-semibold">1 Gram Rate:</span>
                  <span className="text-2xl font-black font-mono text-[#551f1f]">
                    ₹{Math.round(gold22kObj.perGram || 11461).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-800 border-t border-[#dccd88] pt-1.5 font-medium">
                  <span>1 Sovereign (8g / பவுன்):</span>
                  <span className="font-black font-mono text-[#551f1f]">
                    ₹{Math.round((gold22kObj.perGram || 11461) * 8).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-600">
                  <span>10 Grams:</span>
                  <span className="font-bold font-mono">₹{Number(gold22kObj.rupees || 114613).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-lg mt-3 font-semibold">
                <span className="flex items-center gap-1">
                  <TrendingUp size={12} /> +₹{gold22kObj.change || 1127} (Today)
                </span>
                <span className="text-[10px] text-gray-600 font-mono">BIS Standard</span>
              </div>
            </div>

            {/* 3. Gold 18K (750 Purity) */}
            <div className="bg-white rounded-2xl p-5 border border-[#cbadab] shadow-sm hover:shadow-md transition-all hover:border-[#dccd88] relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">75.0% Diamond Purity</span>
                  <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight">Gold 18 Karat</h3>
                </div>
                <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold uppercase">
                  Diamond Base
                </span>
              </div>
              <div className="space-y-1 my-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500">Per Gram:</span>
                  <span className="text-xl font-bold font-mono text-[#551f1f]">
                    ₹{Math.round(gold18kObj.perGram || 9384).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-600 border-t border-gray-100 pt-1.5">
                  <span>Per 10 Grams:</span>
                  <span className="font-bold font-mono">₹{Number(gold18kObj.rupees || 93842).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50/70 px-2.5 py-1 rounded-lg mt-3">
                <span className="flex items-center gap-1">
                  <TrendingUp size={12} /> +₹{gold18kObj.change || 922}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">750 Hallmark</span>
              </div>
            </div>

            {/* 4. Silver 999 (Fine Silver) */}
            <div className="bg-white rounded-2xl p-5 border border-[#cbadab] shadow-sm hover:shadow-md transition-all hover:border-[#dccd88] relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">99.9% Pure Silver</span>
                  <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight">Silver 999 (Fine)</h3>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded font-bold uppercase">
                  Pure Silver
                </span>
              </div>
              <div className="space-y-1 my-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500">Per Gram:</span>
                  <span className="text-xl font-bold font-mono text-slate-800">
                    ₹{Number(silverObj.perGram || 98).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-600 border-t border-gray-100 pt-1.5">
                  <span>1 Kilogram (1000g):</span>
                  <span className="font-bold font-mono">₹{Number(silverObj.rupees || 98000).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-blue-700 bg-blue-50/70 px-2.5 py-1 rounded-lg mt-3">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} /> 0% Wastage in 11+1 Scheme
                </span>
                <span className="text-[10px] text-gray-500 font-mono">Purity 999</span>
              </div>
            </div>

          </div>

          {/* Quick Gold Value Estimator Tool */}
          <div className="bg-white rounded-2xl p-6 border border-[#cbadab] shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#551f1f]">
                  <Calculator size={15} />
                  <span>Gold Value Estimator</span>
                </div>
                <h4 className="font-serif font-bold text-lg text-gray-900">
                  Instant Jewellery Price Calculator
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter your desired weight in grams to estimate pure gold value with approximate making and GST.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-4 flex-1">
                {/* Purity selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Select Purity</label>
                  <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                    {['24K', '22K', '18K', 'Silver'].map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCalcPurity(k)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          calcPurity === k ? 'bg-[#551f1f] text-[#ffffd6] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grams Input */}
                <div className="w-32">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Weight (Grams)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.5"
                      max="500"
                      step="0.5"
                      value={calcGrams}
                      onChange={(e) => setCalcGrams(Math.max(0.1, Number(e.target.value) || 0))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#551f1f]"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-gray-400 font-bold">g</span>
                  </div>
                </div>

                {/* Sovereign helper pill */}
                <div className="hidden sm:flex items-center gap-1.5 pt-4">
                  {[8, 16, 24, 40].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCalcGrams(s)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                        calcGrams === s ? 'bg-[#dccd88] text-[#551f1f] border-[#a49141]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {s / 8} Pavan ({s}g)
                    </button>
                  ))}
                </div>
              </div>

              {/* Computed Value Display */}
              <div className="bg-[#ffffd6]/60 border border-[#dccd88] rounded-xl p-4 text-right min-w-[200px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Estimated Total</div>
                <div className="font-serif font-black text-2xl text-[#551f1f]">
                  ₹{estimatedTotal.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Base: ₹{Math.round(rawMetalCost).toLocaleString('en-IN')} + Est. VA &amp; GST
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 5. Category Highlights Strip (Matching Image 2) ── */}
      <section id="categories" className="py-14 bg-white border-b border-[#cbadab]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a49141]">Curated Collections</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#551f1f] font-normal mt-1">
              Shop by Category
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              From delicate everyday bands to regal bridal necklaces, each piece is hallmarked with BIS HUID certification.
            </p>
          </div>

          {/* 4 Cards Grid matching Image 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat, idx) => (
              <a
                key={idx}
                href="#best-sellers"
                className="group flex flex-col items-center bg-[#fefefe] border border-[#cbadab]/50 rounded-2xl p-4 sm:p-5 hover:border-[#551f1f] transition-all hover:shadow-lg text-center"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#ffffd6]/30 mb-4 border border-[#cbadab]/30 flex items-center justify-center relative">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <span className="absolute top-2 right-2 text-[9px] font-bold bg-[#551f1f] text-[#ffffd6] px-2 py-0.5 rounded-full shadow-xs">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#551f1f] transition-colors">
                  {cat.title}
                </h3>
                <span className="text-xs text-gray-500 mt-0.5 font-medium">{cat.count}</span>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. Dual Visual Editorial Feature Banners (Exact Layout from Image 2) ── */}
      <section className="py-12 bg-stone-50 border-b border-[#cbadab]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

            {/* Left Banner: Unveil the Essence of Exploration */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#cbadab] min-h-[340px] sm:min-h-[380px] flex items-end p-6 sm:p-8 group">
              <img
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80"
                alt="Exquisite Diamond Jewelry"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              
              <div className="relative z-10 space-y-4 max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#dccd88] bg-[#551f1f]/80 px-3 py-1 rounded-full border border-[#dccd88]/30">
                  Signature Diamond Sets
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-snug">
                  Unveil the Essence of Exploration Through Exquisite Jewelry
                </h3>
                <div>
                  <a
                    href="#best-sellers"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#551f1f] hover:bg-[#ffffd6] font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
                  >
                    <span>Discover our Popular Jewelry</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Banner: Revel in Love's Splendor */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#cbadab] min-h-[340px] sm:min-h-[380px] flex items-end p-6 sm:p-8 group">
              <img
                src="https://images.unsplash.com/photo-1611591475879-1100f7236535?auto=format&fit=crop&w=1000&q=80"
                alt="Gold Wedding Bangles"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#551f1f]/90 via-black/40 to-transparent" />
              
              <div className="relative z-10 space-y-4 max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffffd6] bg-[#551f1f]/80 px-3 py-1 rounded-full border border-[#dccd88]/30">
                  Heritage Wedding Gold
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-snug">
                  Revel in Love's Splendor with Timeless Elegance
                </h3>
                <div>
                  <a
                    href="#best-sellers"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#dccd88] text-[#551f1f] hover:bg-[#ffffd6] font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
                  >
                    <span>Discover our Wedding Jewelry</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. Best Sellers Section (Matching top right of Image 2) ── */}
      <section id="best-sellers" className="py-14 bg-white border-b border-[#cbadab]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#a49141]">Customer Favorites</span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#551f1f] font-normal mt-1">
                Best Sellers
              </h2>
            </div>
            <a href="#best-sellers" className="text-xs font-bold text-[#551f1f] hover:underline flex items-center gap-1">
              <span>All Products</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Product Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {bestSellers.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col bg-[#fefefe] border border-[#cbadab]/60 rounded-2xl p-3 sm:p-4 hover:border-[#551f1f] hover:shadow-lg transition-all"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 relative">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono font-bold bg-white/90 text-[#551f1f] px-1.5 py-0.5 rounded shadow-2xs">
                    {item.weight}
                  </span>
                  <span className="absolute top-2 right-2 text-[8px] font-bold uppercase bg-[#551f1f] text-[#ffffd6] px-1.5 py-0.5 rounded">
                    {item.purity}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{item.category}</span>
                    <h4 className="font-serif font-bold text-sm text-gray-900 group-hover:text-[#551f1f] transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-gray-400">Live Price</div>
                      <div className="font-mono font-bold text-sm text-[#551f1f]">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button
                      onClick={onOpenBullionModal}
                      className="w-7 h-7 rounded-full bg-[#ffffd6] border border-[#dccd88] text-[#551f1f] flex items-center justify-center hover:bg-[#551f1f] hover:text-[#ffffd6] transition-colors cursor-pointer"
                      title="View rate breakdown"
                    >
                      <Sparkles size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 8. "Custom Your Jewelry Now" & Bridal Engagement Banners (Matching Image 2) ── */}
      <section id="custom-jewel" className="py-14 bg-gradient-to-b from-stone-50 to-white border-b border-[#cbadab]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Master Banner: Custom Your Jewelry Now */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-[#dccd88] bg-[#551f1f] p-8 sm:p-12 text-center text-white">
            <div className="max-w-2xl mx-auto space-y-4">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#dccd88] border border-[#dccd88] px-3 py-1 rounded-full">
                Bespoke Artisanal Craftsmanship
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                Custom Your Jewelry Now
              </h2>
              <p className="text-[#ffffd6]/90 text-xs sm:text-sm leading-relaxed">
                Embrace the beauty of individuality and create jewelry as unique as you are with VJS Jewellery. Let your imagination soar, and let our master goldsmiths craft your dreams into stunning reality.
              </p>
              <div className="pt-2">
                <a
                  href="#savings-schemes"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#dccd88] text-[#551f1f] hover:bg-[#ffffd6] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <span>Start Custom Consultation</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>

          {/* Dual Split Cards: Engagement & Wedding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Engagement Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#cbadab] aspect-[16/9] flex items-end p-6 group">
              <img
                src="https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80"
                alt="Engagement Rings"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between w-full">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#dccd88] tracking-widest">Solitaires &amp; Bands</span>
                  <h3 className="font-serif text-2xl text-white font-bold">Engagement</h3>
                </div>
                <a
                  href="#best-sellers"
                  className="px-4 py-2 rounded-full bg-white text-[#551f1f] text-xs font-bold hover:bg-[#ffffd6] transition-colors"
                >
                  View Products
                </a>
              </div>
            </div>

            {/* Wedding Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#cbadab] aspect-[16/9] flex items-end p-6 group">
              <img
                src="https://images.unsplash.com/photo-1611591475879-1100f7236535?auto=format&fit=crop&w=800&q=80"
                alt="Bridal Wedding Sets"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#551f1f]/85 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between w-full">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#dccd88] tracking-widest">Heritage Bridal Sets</span>
                  <h3 className="font-serif text-2xl text-white font-bold">Wedding</h3>
                </div>
                <a
                  href="#best-sellers"
                  className="px-4 py-2 rounded-full bg-[#dccd88] text-[#551f1f] text-xs font-bold hover:bg-[#ffffd6] transition-colors"
                >
                  View Products
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 9. Gold Savings Schemes & Jewel Loans Showcase ── */}
      <section id="savings-schemes" className="py-14 bg-white border-b border-[#cbadab]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a49141]">Financial Privileges</span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#551f1f] font-normal mt-1">
              Smart Savings &amp; Instant Jewel Loans
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Maximize your wealth with our popular 11+1 Bonus gold plan and lowest interest jewel pledge schemes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Scheme Card: 11+1 Bonus Plan */}
            <div className="bg-[#ffffd6]/40 border-2 border-[#dccd88] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-[#551f1f] text-[#ffffd6] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <Award size={13} className="text-[#dccd88]" />
                  <span>11+1 Free Bonus Scheme</span>
                </div>
                <h3 className="font-serif text-2xl text-[#551f1f] font-bold">
                  Gold &amp; Silver Savings Plan
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Pay 11 monthly installments promptly and get the 12th installment completely FREE as our bonus. Redeem 100% BIS Hallmarked jewellery with 0% Wastage on Silver ornaments!
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-[#cbadab]/60">
                    <span className="text-gray-400 block text-[10px]">Monthly Deposit</span>
                    <span className="font-mono font-bold text-gray-900">₹1,000 to ₹50,000</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#cbadab]/60">
                    <span className="text-gray-400 block text-[10px]">Silver Wastage</span>
                    <span className="font-bold text-emerald-700">0% Wastage (Free)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-[#dccd88]/40 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Digital passbook &amp; instant SMS alert</span>
                <a
                  href={`tel:${SHOP_INFO.phone || '+919876543210'}`}
                  className="px-4 py-2 bg-[#551f1f] text-[#ffffd6] rounded-xl text-xs font-bold hover:bg-[#421616] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Phone size={12} className="text-[#dccd88]" />
                  <span>Enroll at Branch</span>
                </a>
              </div>
            </div>

            {/* Jewel Loan Card: Low Interest Instant Cash */}
            <div id="jewel-loans" className="bg-white border-2 border-[#cbadab] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-[#dccd88] text-[#551f1f] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <ShieldCheck size={13} className="text-[#551f1f]" />
                  <span>Instant Jewel Loan</span>
                </div>
                <h3 className="font-serif text-2xl text-[#551f1f] font-bold">
                  Safe Custody &amp; Low Interest Pledges
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Get high valuation for your gold with safe locker security and transparent 1.5% monthly interest. Prompt renewal and 30-day minimum interest guarantee.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px]">Interest Rate</span>
                    <span className="font-mono font-bold text-gray-900">1.5% / month</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px]">Security</span>
                    <span className="font-bold text-blue-800">Bank Grade Vault</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Instant disbursal against gold</span>
                <a
                  href={`tel:${SHOP_INFO.phone || '+919876543210'}`}
                  className="px-4 py-2 bg-[#551f1f] text-[#ffffd6] rounded-xl text-xs font-bold hover:bg-[#421616] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Phone size={12} className="text-[#dccd88]" />
                  <span>Loan Enquiry</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 10. Value Propositions Strip (Matching Image 2) ── */}
      <section className="py-12 bg-stone-50 border-b border-[#cbadab]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Safe Return */}
            <div className="flex items-start gap-4 p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffffd6] border border-[#dccd88] text-[#551f1f] flex items-center justify-center shrink-0">
                <RotateCcw size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-gray-900">Safe Return Process</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Secure and hassle-free return or exchange policy within 3 business days.
                </p>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="flex items-start gap-4 p-4 border-y sm:border-y-0 sm:border-x border-gray-200">
              <div className="w-12 h-12 rounded-2xl bg-[#ffffd6] border border-[#dccd88] text-[#551f1f] flex items-center justify-center shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-gray-900">Fast Insured Delivery</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Receive your jewellery faster than ever with 100% insured courier transport.
                </p>
              </div>
            </div>

            {/* Quality Products */}
            <div className="flex items-start gap-4 p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffffd6] border border-[#dccd88] text-[#551f1f] flex items-center justify-center shrink-0">
                <Award size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-gray-900">Quality Products</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Presented in an elegant luxury gift box, 100% BIS Hallmarked with HUID certification.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 11. Customer Reviews / Testimonials ("From our Customers" matching Image 2) ── */}
      <section className="py-14 bg-white border-b border-[#cbadab]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a49141]">Testimonials</span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#551f1f] font-normal">
                From our Customers
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Explore firsthand accounts of satisfaction, inspiration, and the impact of our offerings straight from the voices of those we serve across Tamil Nadu &amp; South India.
              </p>
            </div>

            {/* Testimonial Quote & Photo matching Image 2 */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-[#ffffd6]/20 border border-[#cbadab] rounded-3xl p-6 sm:p-8">
              
              {/* Photo */}
              <div className="sm:col-span-5 rounded-2xl overflow-hidden aspect-[4/5] shadow-md border border-[#cbadab]">
                <img
                  src="https://images.unsplash.com/photo-1611591475879-1100f7236535?auto=format&fit=crop&w=600&q=80"
                  alt="Customer Review"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Quote */}
              <div className="sm:col-span-7 space-y-4">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="text-xs sm:text-sm text-gray-800 leading-relaxed italic">
                  "Outstanding customer support! They went above and beyond to help me customize my bridal necklace set and guided me on today's gold rate. I felt valued as a customer, and their commitment to genuine hallmark purity left a lasting impression."
                </blockquote>
                <div>
                  <div className="font-serif font-bold text-base text-[#551f1f]">Sumaiya Mita</div>
                  <div className="text-xs text-gray-400">Happy Bridal Customer • Krishnagiri</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 12. Newsletter & Office Hours Footer (Matching Image 2) ── */}
      <footer id="about-us" className="bg-[#551f1f] text-[#ffffd6] pt-14 pb-8 border-t-2 border-[#dccd88]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Newsletter Box matching Image 2 */}
          <div className="max-w-xl mx-auto text-center space-y-4">
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
              Subscribe to our Newsletter
            </h3>
            <p className="text-xs text-[#cbadab] leading-relaxed">
              Be the first to know about new collection launches, festive gold offers &amp; daily bullion rate notifications.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-[#421616] border border-[#dccd88]/50 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#dccd88]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#dccd88] hover:bg-[#ffffd6] text-[#551f1f] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-[#dccd88] font-bold animate-fade-in">
                ✓ Thank you for subscribing! We'll keep you updated on gold rates.
              </p>
            )}
          </div>

          {/* Main Footer Links & Office Hours */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-[#dccd88]/20 text-xs text-[#cbadab]">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-3">
              <span className="font-cinzel text-xl font-bold text-white tracking-wider">VJS JEWELLERY</span>
              <p className="text-[11.5px] leading-relaxed">
                Purveyors of pure 916 BIS Hallmark jewellery, bridal collections, low-interest jewel loans, and transparent bullion trading since 1994.
              </p>
              <div className="text-white font-serif text-[11px] font-bold">
                CIN: SMSO Nidhi Ltd. TN1881PLC002799
              </div>
            </div>

            {/* Col 2: Store Timings (User specification from photo) */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-[#dccd88]/30 pb-1">
                அலுவலக நேரம் (Office Hours)
              </h4>
              <p className="text-white font-medium">
                வாரம் முழுவதும் அனைத்து நாட்களும்:
              </p>
              <p className="text-[#ffffd6] font-mono text-[11px]">
                காலை 9:00 மணி முதல் இரவு 9:00 மணி வரை <br />
                (Week full 9:00 AM to 9:00 PM All Days)
              </p>
              <div className="mt-2 pt-2 border-t border-[#dccd88]/20">
                <span className="text-[#dccd88] font-bold">வார விடுமுறை: Monday (திங்கட்கிழமை)</span>
              </div>
            </div>

            {/* Col 3: Branches */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-[#dccd88]/30 pb-1">
                Our Branches
              </h4>
              <div className="space-y-1.5 text-[11.5px]">
                <p>
                  <strong className="text-white">Krishnagiri Main Branch:</strong><br />
                  Chelva Towers, No.189, PTV Colony, Krishnagiri - 635001.<br />
                  Ph: 04343-234114
                </p>
                <p className="pt-1">
                  <strong className="text-white">Chennai Branch:</strong><br />
                  New No.37, Car Street, Triplicane, Chennai - 600005.
                </p>
              </div>
            </div>

            {/* Col 4: Quick Portals */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-[#dccd88]/30 pb-1">
                Quick Access
              </h4>
              <ul className="space-y-1.5 text-[11.5px]">
                <li><a href="#rates-section" className="hover:text-white transition-colors">Today's Gold Rates</a></li>
                <li><a href="#savings-schemes" className="hover:text-white transition-colors">11+1 Savings Scheme</a></li>
                <li><a href="#jewel-loans" className="hover:text-white transition-colors">Jewel Loan Details</a></li>
                <li><a href="#about-us" className="hover:text-white transition-colors">Store Locations</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 border-t border-[#dccd88]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#cbadab]">
            <div>
              © 2026 VJS Jewellery. All Rights Reserved. 100% BIS HUID Hallmark Certified.
            </div>
            <div className="flex gap-4 items-center">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms &amp; Conditions</a>
              <a href="#" className="hover:text-white">IBJA Compliance</a>
              <a href="/login" className="text-gray-500 hover:text-gray-400 text-[10px] ml-2">Staff</a>
            </div>
          </div>

        </div>
      </footer>

      {/* ── Search Modal ── */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearchModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <Search size={16} className="text-[#551f1f]" />
                <span>Search Jewellery Collections</span>
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search rings, necklaces, haram, diamond, silver..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#551f1f]"
              />
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <span className="font-bold text-gray-700 block">Popular Searches:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['22K Gold Ring', 'Temple Haram', 'Solitaire Band', 'Diamond Pendant', 'Silver 999 Coin', '11+1 Scheme'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setQuickSearch(t); setShowSearchModal(false); }}
                    className="bg-gray-100 hover:bg-[#ffffd6] hover:text-[#551f1f] px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
