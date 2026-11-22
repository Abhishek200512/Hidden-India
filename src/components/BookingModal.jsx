// src/components/BookingModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Calendar,
  Users,
  CreditCard,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Car,
  Home,
  Compass,
  ArrowRight,
  Clock,
  Tag,
  Info,
  Loader2,
  FileText
} from 'lucide-react';
import {
  calculateServerQuote,
  createBooking,
  createPaymentOrder,
  verifyPaymentSignature,
  loadRazorpayScript,
  getInvoiceDownloadUrl,
} from '../services/bookingApi';

export default function BookingModal({
  destination,
  isOpen,
  onClose,
  initialPreferences = {},
  onOpenMyBookings,
}) {
  const [bookingMode, setBookingMode] = useState('demo'); // 'demo' | 'real'
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Default date: 14 days from now
  const defaultStartDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [durationDays, setDurationDays] = useState(initialPreferences.durationDays || 5);
  const [guests, setGuests] = useState(initialPreferences.guests || 2);
  const [travelStyle, setTravelStyle] = useState(initialPreferences.travelStyle || 'cultural');
  const [budgetTier, setBudgetTier] = useState(initialPreferences.budgetTier || 'boutique');
  const [transportMode, setTransportMode] = useState('standard');
  const [specialRequests, setSpecialRequests] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  const [pricingQuote, setPricingQuote] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedBooking, setCompletedBooking] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Recalculate server-authoritative quote whenever parameters change
  useEffect(() => {
    if (!isOpen || !destination) return;
    let isCurrent = true;
    setIsCalculating(true);
    setErrorMessage('');

    const fetchQuote = async () => {
      try {
        const quote = await calculateServerQuote({
          durationDays,
          guests,
          travelStyle,
          budgetTier,
          transportMode,
          promoCode: appliedPromo,
        });
        if (isCurrent) {
          setPricingQuote(quote);
          setIsCalculating(false);
        }
      } catch (err) {
        if (isCurrent) {
          console.warn('Error fetching server quote:', err);
          setIsCalculating(false);
        }
      }
    };

    fetchQuote();
    return () => {
      isCurrent = false;
    };
  }, [isOpen, destination, durationDays, guests, travelStyle, budgetTier, transportMode, appliedPromo]);

  if (!isOpen || !destination) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setAppliedPromo(promoCodeInput.trim().toUpperCase());
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // 1. Create booking on server with server-authoritative calculation
      const response = await createBooking({
        bookingMode,
        destinationId: destination.id,
        destinationName: destination.name,
        customerName,
        customerEmail,
        customerPhone,
        startDate,
        durationDays,
        travelStyle,
        budgetTier,
        guests,
        transportMode,
        specialRequests,
        promoCode: appliedPromo,
      });

      const booking = response.booking;

      // 2. Branch: DEMO Mode
      if (bookingMode === 'demo') {
        setCompletedBooking({
          ...booking,
          isDemo: true,
          notice: 'DEMO BOOKING — NOT A REAL RESERVATION',
        });
        setIsSubmitting(false);
        return;
      }

      // 3. Branch: REAL Mode with Razorpay Integration
      if (bookingMode === 'real') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Unable to load Razorpay Checkout script. Check your internet connection.');
        }

        // Create server order
        let order;
        try {
          order = await createPaymentOrder(booking.id);
        } catch (orderErr) {
          throw new Error(orderErr.message || 'Payment gateway order initialization failed.');
        }

        // Launch Razorpay standard checkout popup
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Hidden India Expeditions',
          description: `Expedition Reservation for ${destination.name}`,
          order_id: order.orderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#d4af37', // Hidden India Gold
          },
          handler: async (response) => {
            try {
              // Server-side cryptographic signature verification
              const verifyRes = await verifyPaymentSignature({
                bookingId: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              setCompletedBooking({
                ...verifyRes.booking,
                isDemo: false,
                supplierNotice: verifyRes.supplierNotice,
              });
              setIsSubmitting(false);
            } catch (verifyErr) {
              setErrorMessage(`Verification Failed: ${verifyErr.message}`);
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              setErrorMessage('Payment window dismissed by user. The booking remains in pending status.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failResponse) => {
          setIsSubmitting(false);
          setErrorMessage(`Payment Failed: ${failResponse.error.description}`);
        });
        rzp.open();
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setErrorMessage(err.message || 'Failed to process booking request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl text-slate-100 flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-950/95 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-mono block">
                Sanctuary Expedition Reservation
              </span>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white leading-tight">
                {destination.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* If Booking is Completed: Show Confirmation View */}
          {completedBooking ? (
            <div className="space-y-6 py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono block mb-1">
                  {completedBooking.isDemo ? 'Demonstration Completed' : 'Payment Successfully Captured'}
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
                  Reservation Reference: {completedBooking.id}
                </h3>
              </div>

              {/* Mode Alert Banner */}
              {completedBooking.isDemo ? (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-left flex items-start gap-3 max-w-xl mx-auto">
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                      DEMO BOOKING — NOT A REAL RESERVATION
                    </h4>
                    <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                      This is an illustrative preview generated by the Hidden India demonstration engine. No real payment was charged and no hotel or transport rooms were allocated.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-left flex items-start gap-3 max-w-xl mx-auto">
                  <Info className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-sky-300 uppercase tracking-wide">
                      Real Booking Status: Payment Verified
                    </h4>
                    <p className="text-xs text-sky-200/90 mt-1 leading-relaxed">
                      {completedBooking.supplierNotice || 'Payment may be processed, but travel reservation is not confirmed.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Summary Card */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left max-w-xl mx-auto space-y-3">
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Guest Name:</span>
                  <span className="text-white font-medium">{completedBooking.customer_name}</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Destination:</span>
                  <span className="text-white font-medium">{completedBooking.destination_name}</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Departure & Duration:</span>
                  <span className="text-white font-medium">{completedBooking.start_date} ({completedBooking.duration_days} Days)</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-slate-400">Travel Style & Tier:</span>
                  <span className="text-white font-medium capitalize">{completedBooking.travel_style} • {completedBooking.budget_tier}</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-amber-400 font-semibold">Total Price:</span>
                  <span className="text-amber-300 font-bold text-base">₹{Number(completedBooking.total_price).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <a
                  href={getInvoiceDownloadUrl(completedBooking.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF Invoice (A4)</span>
                </a>

                {onOpenMyBookings && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMyBookings();
                    }}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-2 transition-colors text-sm border border-white/15"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View in My Bookings</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Booking Configuration Form */
            <form onSubmit={handleFormSubmit} className="space-y-6">

              {/* 1. Mode Selector */}
              <div>
                <label className="text-xs uppercase font-mono text-slate-400 block mb-2 tracking-wider">
                  Select Booking Operating Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingMode('demo')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      bookingMode === 'demo'
                        ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        1. DEMO BOOKING
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Zero Credentials
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Instant simulated booking ID and server-authoritative PDF invoice. No payment required.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingMode('real')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      bookingMode === 'real'
                        ? 'bg-sky-500/15 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-sky-400" />
                        2. REAL BOOKING
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 border border-sky-400/30">
                        Razorpay TEST
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Real Razorpay order, verified signature, and supplier confirmation check.
                    </p>
                  </button>
                </div>

                {/* Mode Notice Banner */}
                {bookingMode === 'demo' ? (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Notice:</strong> DEMO BOOKING — NOT A REAL RESERVATION. Generates authentic PDF invoice without financial settlement.
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center gap-2.5 text-xs text-sky-200">
                    <Info className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>
                      <strong>Supplier Policy:</strong> Payment may be processed, but travel reservation is not confirmed without upstream supplier allocation.
                    </span>
                  </div>
                )}
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 2. Guest Information */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-mono text-slate-400 tracking-wider">
                  Guest Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="aarav@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Expedition Parameters */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-mono text-slate-400 tracking-wider">
                  Expedition Parameters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Departure Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Duration: {durationDays} Days</label>
                    <input
                      type="range"
                      min="2"
                      max="21"
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Travellers: {guests} Guest(s)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Travel Style</label>
                    <select
                      value={travelStyle}
                      onChange={(e) => setTravelStyle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="cultural">Cultural Lore & Artisans</option>
                      <option value="trekking">Alpine Trekking & Peaks</option>
                      <option value="photography">Blue Hour Photography</option>
                      <option value="culinary">Wild Foraging & Feasts</option>
                      <option value="eco-luxe">Conservationist Naturalist</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Accommodation Tier</label>
                    <select
                      value={budgetTier}
                      onChange={(e) => setBudgetTier(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="homestay">Eco-Homestay (₹2,200/d)</option>
                      <option value="boutique">Heritage Haveli / Lodge (₹5,500/d)</option>
                      <option value="luxury">Royal Sanctuary Glamping (₹12,000/d)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Transport Mode</label>
                    <select
                      value={transportMode}
                      onChange={(e) => setTransportMode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                    >
                      <option value="standard">Shared Scenic Transit (₹800/d)</option>
                      <option value="private_suv">Private 4x4 Mountain SUV (₹3,500/d flat)</option>
                      <option value="heritage_rail">Heritage Rail & Link (₹1,800/d)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Special Requests / Dietary Restrictions</label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetarian diet, photography permits, early sunrise transfer"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Promo Code & Live Server-Authoritative Quote */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Promotional Grant</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Try 'HIDDEN10'"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white text-xs uppercase font-mono w-28 sm:w-32 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-amber-300 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {appliedPromo && pricingQuote?.promoApplied && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied: {pricingQuote.promoApplied.description}</span>
                  </div>
                )}

                {/* Server-Authoritative Itemized Price Summary */}
                <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Expedition Package ({durationDays}d × {guests}p):</span>
                    <span className="text-white">₹{pricingQuote?.itemized?.packagePrice?.toLocaleString('en-IN') ?? '--'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Accommodation ({budgetTier}):</span>
                    <span className="text-white">₹{pricingQuote?.itemized?.accommodationPrice?.toLocaleString('en-IN') ?? '--'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Regional Transit ({transportMode}):</span>
                    <span className="text-white">₹{pricingQuote?.itemized?.transportPrice?.toLocaleString('en-IN') ?? '--'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Custom Activities & Guides ({travelStyle}):</span>
                    <span className="text-white">₹{pricingQuote?.itemized?.activitiesPrice?.toLocaleString('en-IN') ?? '--'}</span>
                  </div>

                  {pricingQuote?.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount ({appliedPromo}):</span>
                      <span>- ₹{pricingQuote.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Applicable GST (18%):</span>
                    <span className="text-white">₹{pricingQuote?.taxAmount?.toLocaleString('en-IN') ?? '--'}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Final Payable Amount:</span>
                      {isCalculating && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                    </div>
                    <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                      {pricingQuote?.formattedTotal || 'Calculating...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCalculating}
                  className={`px-7 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg text-xs sm:text-sm ${
                    bookingMode === 'demo'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-[1.02]'
                      : 'bg-sky-500 hover:bg-sky-400 text-white hover:scale-[1.02]'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Expedition Request...</span>
                    </>
                  ) : bookingMode === 'demo' ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Instant Demo Booking</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Razorpay Payment</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
