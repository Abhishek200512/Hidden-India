import React, { useState, useEffect } from 'react';
import { Compass, Heart, Menu, X, FileText } from 'lucide-react';
import AudioAtmosphere from './AudioAtmosphere';

export default function Navbar({ wishlistCount, onOpenWishlist, onNavigate, onOpenMyBookings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: '3D India Map', target: 'map' },
    { label: 'Destinations', target: 'destinations' },
    { label: 'Cultural Lore', target: 'culture' },
    { label: 'Discovery', target: 'discovery' },
    { label: 'Expedition Planner', target: 'planner' },
    { label: 'About', target: 'about' }
  ];

  const handleLinkClick = (target) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(target);
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#05070a]/85 backdrop-blur-md border-b border-amber-500/20 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 group text-left"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[1px] shadow-lg shadow-amber-500/25">
            <div className="w-full h-full bg-[#080c12] rounded-[11px] flex items-center justify-center text-amber-300 group-hover:text-white transition-colors">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <span className="font-serif-luxury font-black text-lg sm:text-xl tracking-wider text-white block group-hover:text-amber-300 transition-colors">
              HIDDEN INDIA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-amber-400/80 block font-semibold -mt-0.5">
              Beyond the Ordinary
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 glass-panel px-4 py-1.5 rounded-full border border-white/10">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => handleLinkClick(link.target)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-white/5 transition-all"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action Icons: Audio Toggle + Wishlist Counter + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Ambient Procedural Soundscape */}
          <AudioAtmosphere />

          {/* My Bookings & Invoices Button */}
          <button
            onClick={onOpenMyBookings}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="My Bookings & Invoices"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">My Bookings</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-rose-400 transition-colors"
            title="Open Saved Sanctuaries & Itineraries"
          >
            <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0e16]/95 backdrop-blur-xl border-b border-amber-500/20 px-6 py-6 animate-fadeIn">
          <nav className="flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenMyBookings) onOpenMyBookings();
              }}
              className="text-left text-sm font-semibold text-amber-300 py-2 border-b border-white/5 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                My Bookings & Invoices
              </span>
              <span className="text-amber-400/60 text-xs">→</span>
            </button>
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => handleLinkClick(link.target)}
                className="text-left text-sm font-semibold text-slate-200 hover:text-amber-300 py-2 border-b border-white/5 transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-amber-400/60 text-xs">→</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
