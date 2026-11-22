import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CinematicHero from './components/CinematicHero';
import DestinationsSection from './components/DestinationsSection';
import CulturalSection from './components/CulturalSection';
import DiscoverySection from './components/DiscoverySection';
import TravelPlanner from './components/TravelPlanner';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import DestinationModal from './components/DestinationModal';
import WishlistDrawer from './components/WishlistDrawer';
import BookingModal from './components/BookingModal';
import MyBookingsDrawer from './components/MyBookingsDrawer';
import { DESTINATIONS } from './data/destinations';
import { Sparkles, Compass } from 'lucide-react';

// Safe code-splitting: Lazy-load heavy 3D WebGL engine
const IndiaMap3D = React.lazy(() => import('./components/3d/IndiaMap3D'));

export default function App() {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [plannerDestinationId, setPlannerDestinationId] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('hidden_india_wishlist');
      return saved ? JSON.parse(saved) : ['ziro-valley', 'gurez-valley', 'chettinad'];
    } catch {
      return ['ziro-valley', 'gurez-valley', 'chettinad'];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDestination, setBookingDestination] = useState(null);
  const [bookingPreferences, setBookingPreferences] = useState({});
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync wishlist with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hidden_india_wishlist', JSON.stringify(wishlist));
    } catch {
      // LocalStorage error handled
    }
  }, [wishlist]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleWishlist = (id) => {
    const dest = DESTINATIONS.find(d => d.id === id);
    const destName = dest ? dest.name : 'Destination';

    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
      showToast(`Removed ${destName} from your saved sanctuaries.`);
    } else {
      setWishlist([...wishlist, id]);
      showToast(`Added ${destName} to your saved sanctuaries.`);
    }
  };

  const handleNavigate = (targetId) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenPlannerWithDest = (destId) => {
    if (destId) {
      setPlannerDestinationId(destId);
    }
    const el = document.getElementById('planner');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBooking = (dest, preferences = {}) => {
    setBookingDestination(dest || DESTINATIONS[0]);
    setBookingPreferences(preferences);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Glass Navigation Bar */}
      <Navbar
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* 2. Main Content */}
      <main className="flex-1">
        {/* A. Cinematic Hero Section */}
        <CinematicHero
          onExploreClick={() => handleNavigate('map')}
          onDiscoverClick={() => handleNavigate('destinations')}
        />

        {/* B. Interactive 3D India Map Section */}
        <section id="map" className="relative py-20 sm:py-28 bg-[#05070a] overflow-hidden border-t border-white/5">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-4">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Real-Time Geospatial Visualizer</span>
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-wide">
                Interactive <span className="gold-gradient-text">3D Subcontinent Map</span>
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Rotate, tilt, zoom, and traverse India’s high alpine ridges, forgotten river islands, and canyon fortresses. Click on any glowing beacon to inspect coordinates and telemetry.
              </p>
            </div>

            {/* 3D Map Component with Graceful Loading Suspense */}
            <React.Suspense fallback={
              <div className="w-full h-[680px] sm:h-[740px] lg:h-[820px] rounded-3xl glass-panel border border-amber-500/20 flex flex-col items-center justify-center gap-4 text-amber-300">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-spin">
                  <Compass className="w-6 h-6 text-amber-400" />
                </div>
                <span className="font-serif-luxury text-sm font-semibold tracking-wider uppercase text-slate-300">
                  Initializing 3D Geospatial Engine...
                </span>
              </div>
            }>
              <IndiaMap3D
                onSelectDestination={(dest) => setSelectedDestination(dest)}
                onToggleWishlist={toggleWishlist}
                wishlist={wishlist}
              />
            </React.Suspense>
          </div>
        </section>

        {/* C. Curated Hidden Destinations Section */}
        <DestinationsSection
          onSelectDestination={(dest) => setSelectedDestination(dest)}
          onToggleWishlist={toggleWishlist}
          wishlist={wishlist}
        />

        {/* D. Cultural Experiences Section */}
        <CulturalSection />

        {/* E. Travel Discovery Portal */}
        <DiscoverySection
          onSelectDestination={(dest) => setSelectedDestination(dest)}
          onToggleWishlist={toggleWishlist}
          wishlist={wishlist}
        />

        {/* F. Smart Travel Planner */}
        <TravelPlanner
          initialDestinationId={plannerDestinationId}
          onFocusMapDestination={(id) => {
            const dest = DESTINATIONS.find(d => d.id === id);
            if (dest) setSelectedDestination(dest);
          }}
          onBookExpedition={({ destination, durationDays, travelStyle, budgetTier, guests }) => {
            handleOpenBooking(destination, { durationDays, travelStyle, budgetTier, guests });
          }}
        />

        {/* G. About Hidden India & Sustainable Travel Manifesto */}
        <AboutSection />
      </main>

      {/* 3. Footer */}
      <Footer
        onSelectDestination={(dest) => setSelectedDestination(dest)}
        onNavigate={handleNavigate}
      />

      {/* 4. Full Destination Detail Modal */}
      {selectedDestination && (
        <DestinationModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onToggleWishlist={toggleWishlist}
          isSaved={wishlist.includes(selectedDestination.id)}
          onOpenPlanner={handleOpenPlannerWithDest}
          onBookDestination={(dest) => handleOpenBooking(dest)}
        />
      )}

      {/* 5. Hybrid Booking Modal (Demo & Real Modes) */}
      {isBookingModalOpen && bookingDestination && (
        <BookingModal
          destination={bookingDestination}
          isOpen={isBookingModalOpen}
          initialPreferences={bookingPreferences}
          onClose={() => setIsBookingModalOpen(false)}
          onOpenMyBookings={() => {
            setIsBookingModalOpen(false);
            setIsMyBookingsOpen(true);
          }}
        />
      )}

      {/* 6. My Bookings & Invoices Drawer */}
      <MyBookingsDrawer
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        onSelectDestination={(dest) => setSelectedDestination(dest)}
      />

      {/* 7. Wishlist & Saved Journeys Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onToggleWishlist={toggleWishlist}
        onSelectDestination={(dest) => setSelectedDestination(dest)}
        onOpenPlanner={handleOpenPlannerWithDest}
      />

      {/* 6. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel-gold px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/40 text-xs sm:text-sm text-amber-200 flex items-center gap-2.5 animate-slideUp">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
