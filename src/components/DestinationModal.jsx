import React, { useState, useEffect } from 'react';
import { X, MapPin, ShieldAlert, Heart, Navigation, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, Share2, ArrowRight, CloudSun, Wind, Droplets, RefreshCw, Clock } from 'lucide-react';
import { fetchLiveDestinationWeather } from '../services/weatherService';

export default function DestinationModal({ destination, onClose, onToggleWishlist, isSaved, onOpenPlanner, onBookDestination }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      if (!destination) return;
      setIsLoadingWeather(true);
      try {
        const data = await fetchLiveDestinationWeather(
          destination.coordinates.lat,
          destination.coordinates.lng
        );
        if (isMounted) {
          setWeatherData(data);
          setIsLoadingWeather(false);
        }
      } catch {
        if (isMounted) setIsLoadingWeather(false);
      }
    };
    loadWeather();
    return () => { isMounted = false; };
  }, [destination]);

  const handleManualWeatherRefresh = async () => {
    if (!destination || isLoadingWeather) return;
    setIsLoadingWeather(true);
    const data = await fetchLiveDestinationWeather(
      destination.coordinates.lat,
      destination.coordinates.lng,
      true
    );
    setWeatherData(data);
    setIsLoadingWeather(false);
  };

  if (!destination) return null;

  const photos = destination.gallery && destination.gallery.length > 0
    ? destination.gallery
    : [destination.image];

  const handleShare = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // fallback
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto glass-panel-gold rounded-3xl border border-amber-500/30 shadow-2xl flex flex-col my-auto">
        {/* Floating Top Controls */}
        <div className="sticky top-0 z-30 p-4 sm:p-6 bg-[#0c1017]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Sanctuary Dossier</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-normal">{destination.state}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 transition-colors border border-white/10"
              title="Copy link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleWishlist(destination.id)}
              className={`p-2 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-rose-400'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Sanctuary'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Main Title & Hero Heading */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {destination.state}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                {destination.altitude}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                {destination.seclusionIndex}% Unexplored
              </span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-wide">
              {destination.name}
            </h2>
            <p className="font-serif-luxury italic text-amber-300 text-sm sm:text-lg mt-1">
              "{destination.tagline}"
            </p>
          </div>

          {/* Photo Gallery Carousel */}
          <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 w-full group">
            <img
              src={photos[activePhotoIndex]}
              alt={destination.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80';
              }}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activePhotoIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5">
              <span className="text-slate-400 block text-[11px] mb-0.5">Best Window</span>
              <span className="font-semibold text-amber-300 block leading-tight">{destination.bestTime.split('(')[0]}</span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5">
              <span className="text-slate-400 block text-[11px] mb-0.5">Coordinates</span>
              <span className="font-mono font-semibold text-slate-200 block">
                {destination.coordinates.lat}° N, {destination.coordinates.lng}° E
              </span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5">
              <span className="text-slate-400 block text-[11px] mb-0.5">Weather Range</span>
              <span className="font-semibold text-slate-200 block truncate">{destination.weather.split(';')[0]}</span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5">
              <span className="text-slate-400 block text-[11px] mb-0.5">Category</span>
              <span className="font-semibold text-amber-400 block">{destination.category}</span>
            </div>
          </div>

          {/* Live Meteorological & Ground Telemetry Panel */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-black/80 border border-amber-500/30 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                  Live Ground Telemetry & Weather
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                  Open-Meteo Verified
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-slate-300 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {weatherData?.localTime ? `${weatherData.localTime} IST` : 'India Standard Time'}
                </span>
                <button
                  onClick={handleManualWeatherRefresh}
                  disabled={isLoadingWeather}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-amber-300 transition-all flex items-center gap-1 text-[11px] border border-white/10"
                  title="Refresh live telemetry"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingWeather ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isLoadingWeather ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {isLoadingWeather ? (
              <div className="py-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Synchronizing live weather coordinates ({destination.coordinates.lat}° N, {destination.coordinates.lng}° E)...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
                    <span className="text-base sm:text-lg font-bold text-white">{weatherData?.temp ?? '--'}°C</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">{weatherData?.condition}</span>
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Humidity</span>
                    <span className="text-base sm:text-lg font-bold text-white">{weatherData?.humidity ?? '--'}%</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Atmospheric moisture</span>
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Wind Velocity</span>
                    <span className="text-base sm:text-lg font-bold text-white">{weatherData?.windSpeed ?? '--'} km/h</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">Surface breeze</span>
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Feels Like</span>
                    <span className="text-base sm:text-lg font-bold text-white">{weatherData?.feelsLike ?? weatherData?.temp ?? '--'}°C</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">{weatherData?.lastUpdated ? `Updated ${weatherData.lastUpdated}` : 'Live'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Narrative */}
          <div className="space-y-4">
            <h3 className="font-serif-luxury text-xl font-bold text-white border-b border-white/10 pb-2">
              Historical & Ecological Lore
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* Signature Experience Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent border border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-black shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif-luxury text-base font-bold text-amber-300 mb-1">
                  Signature Bucket-List Experience
                </h4>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  {destination.uniqueExperience}
                </p>
              </div>
            </div>
          </div>

          {/* Key Sanctuary Highlights */}
          {destination.highlights && (
            <div>
              <h4 className="font-serif-luxury text-lg font-bold text-white mb-3">
                Key Sanctuary Landmarks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {destination.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Reach & Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-amber-300 block mb-1.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" /> How to Reach
              </span>
              <p className="text-slate-300 leading-relaxed">{destination.howToReach}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="font-bold text-amber-300 block mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Permits & Compliance
              </span>
              <p className="text-slate-300 leading-relaxed">{destination.permits}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onToggleWishlist(destination.id);
                }}
                className={`py-3 px-5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                  isSaved
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-amber-400/40 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
                <span>{isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onBookDestination) onBookDestination(destination);
                }}
                className="py-3 px-5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none shadow-md hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Book Sanctuary</span>
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onOpenPlanner) onOpenPlanner(destination.id);
              }}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
            >
              <span>Build Custom Itinerary For This Place</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
