import React, { useState, useEffect } from 'react';
import { X, Heart, Trash2, MapPin, ArrowRight, Compass } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';

export default function WishlistDrawer({ isOpen, onClose, wishlist, onToggleWishlist, onSelectDestination, onOpenPlanner }) {
  const [savedJourneys, setSavedJourneys] = useState([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const journeys = JSON.parse(localStorage.getItem('hidden_india_saved_journeys') || '[]');
        setSavedJourneys(journeys);
      } catch {
        setSavedJourneys([]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const savedDestinations = DESTINATIONS.filter(d => wishlist.includes(d.id));

  const removeJourney = (id) => {
    const updated = savedJourneys.filter(j => j.id !== id);
    setSavedJourneys(updated);
    localStorage.setItem('hidden_india_saved_journeys', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel-gold border-l border-amber-500/30 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                </span>
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-white">
                    Saved Sanctuaries
                  </h3>
                  <p className="text-xs text-slate-400">
                    {savedDestinations.length} places · {savedJourneys.length} itineraries
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Saved Destinations List */}
            <div className="space-y-4 mb-8">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 block">
                Bookmarked Places ({savedDestinations.length})
              </span>

              {savedDestinations.length === 0 ? (
                <div className="text-center py-8 bg-black/40 rounded-2xl border border-white/5 p-4 text-xs text-slate-400">
                  <Compass className="w-8 h-8 text-amber-400/40 mx-auto mb-2" />
                  <p>You haven't bookmarked any sanctuaries yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click the heart icon on any destination card or 3D map marker to save it.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {savedDestinations.map(dest => (
                    <div
                      key={dest.id}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-400/40 transition-all"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          onSelectDestination(dest);
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={dest.image}
                          alt={dest.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80';
                          }}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="font-serif-luxury text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                            {dest.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            {dest.state}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleWishlist(dest.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Custom Generated Itineraries */}
            {savedJourneys.length > 0 && (
              <div className="space-y-3 mb-6">
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 block">
                  Saved Expedition Itineraries ({savedJourneys.length})
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {savedJourneys.map(j => (
                    <div
                      key={j.id}
                      className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <h5 className="font-bold text-white">{j.destName}</h5>
                        <p className="text-slate-400 text-[11px]">
                          {j.durationDays} Days · {j.travelStyle} · {j.createdAt}
                        </p>
                      </div>
                      <button
                        onClick={() => removeJourney(j.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-white/10">
            {savedDestinations.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPlanner(savedDestinations[0].id);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
              >
                <span>Plan Expedition with Saved Places</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
