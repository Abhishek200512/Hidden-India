// src/components/MyBookingsDrawer.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  Calendar,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  DollarSign
} from 'lucide-react';
import {
  getSavedBookingIds,
  getBookingDetails,
  listBookings,
  getInvoiceDownloadUrl,
} from '../services/bookingApi';

export default function MyBookingsDrawer({ isOpen, onClose, onSelectDestination }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load saved bookings from local IDs or fetch recent
  const loadBookings = async (emailFilter = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (emailFilter.trim()) {
        const results = await listBookings(emailFilter.trim());
        setBookings(results);
      } else {
        // Load locally bookmarked booking IDs
        const localIds = getSavedBookingIds();
        if (localIds.length > 0) {
          const fetched = await Promise.all(
            localIds.map(id => getBookingDetails(id).catch(() => null))
          );
          setBookings(fetched.filter(Boolean));
        } else {
          // If no local IDs, fetch recent public demo bookings
          const recent = await listBookings();
          setBookings(recent);
        }
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setErrorMessage('Failed to load bookings from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBookings(searchEmail);
    }
  }, [isOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBookings(searchEmail);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-xl bg-slate-950 border-l border-white/10 h-full flex flex-col shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-900/90 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block">
                Expedition Ledger
              </span>
              <h2 className="font-serif-luxury text-xl font-bold text-white">
                My Bookings & Invoices
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
            aria-label="Close My Bookings Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Lookup Filter */}
        <div className="p-4 bg-black/40 border-b border-white/10">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Find by email (e.g. guest@example.com)"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-amber-300 font-medium transition-colors border border-white/10 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Bookings List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
              <span className="text-xs font-mono uppercase tracking-widest">Accessing Expedition Database...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <Compass className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No reservations found.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Configure your custom itinerary in the Expedition Planner to create your first demo or real booking.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const isDemo = booking.booking_mode === 'demo';
              return (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all space-y-3.5"
                >
                  {/* Top Bar: Mode Badge & Booking ID */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {booking.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
                        isDemo
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {isDemo ? 'DEMO BOOKING' : 'REAL BOOKING'}
                    </span>
                  </div>

                  {/* Destination & Customer */}
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-white">
                      {booking.destination_name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Guest: <strong className="text-slate-200">{booking.customer_name}</strong> ({booking.customer_email})
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{booking.start_date} ({booking.duration_days} Days)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>{booking.guests} Guest(s)</span>
                    </div>
                    <div className="text-slate-400 capitalize">
                      Style: <span className="text-slate-200">{booking.travel_style}</span>
                    </div>
                    <div className="text-slate-400 capitalize">
                      Tier: <span className="text-slate-200">{booking.budget_tier}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Payment Status:</span>
                      <span
                        className={`font-semibold capitalize px-2 py-0.5 rounded-md text-[11px] ${
                          booking.payment_status === 'paid' || booking.payment_status === 'demo_confirmed'
                            ? 'text-emerald-300 bg-emerald-500/15'
                            : 'text-amber-300 bg-amber-500/15'
                        }`}
                      >
                        {booking.payment_status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Supplier Allocation:</span>
                      <span
                        className={`font-semibold capitalize px-2 py-0.5 rounded-md text-[11px] ${
                          booking.supplier_status === 'confirmed'
                            ? 'text-emerald-300 bg-emerald-500/15'
                            : 'text-amber-300 bg-amber-500/15'
                        }`}
                      >
                        {booking.supplier_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Notice if unconfirmed */}
                  {!isDemo && booking.supplier_status !== 'confirmed' && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-tight">
                      <strong>Policy:</strong> Payment may be processed, but travel reservation is not confirmed.
                    </div>
                  )}

                  {isDemo && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-tight">
                      <strong>Demo Notice:</strong> DEMO BOOKING — NOT A REAL RESERVATION.
                    </div>
                  )}

                  {/* Bottom Line: Total & Invoice Download */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Amount</span>
                      <span className="text-base font-bold text-amber-400 font-mono">
                        ₹{Number(booking.total_price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <a
                      href={getInvoiceDownloadUrl(booking.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400">
            Official Hidden India Concierge • 100% Verified Telemetry
          </p>
        </div>

      </div>
    </div>
  );
}
