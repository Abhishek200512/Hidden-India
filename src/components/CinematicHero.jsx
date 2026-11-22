import React, { useRef, useState, useEffect } from 'react';
import { Compass, MapPin, Sparkles, ChevronDown } from 'lucide-react';

export default function CinematicHero({ onExploreClick, onDiscoverClick }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Time-slice loop for clean footage:
  // Hidden_India_30sec_Promo.mp4 has the pure cinematic 3D India relief terrain & golden flight arcs
  // between 2.0s and 11.4s, completely free of the mid-video holographic smartphone UI & passport.
  const handleVideoTimeUpdate = (e) => {
    const v = e.currentTarget;
    if (v.currentTime >= 11.4 || v.currentTime < 2.0) {
      v.currentTime = 2.0;
    }
  };

  const handleLoadedMetadata = (e) => {
    const v = e.currentTarget;
    if (v.currentTime < 2.0) {
      v.currentTime = 2.0;
    }
  };

  // Floating Golden Stardust Particles on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 65;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedY: -(Math.random() * 0.4 + 0.2),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.02;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#05070a]">
      {/* 1. Cinematic Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1920&q=80"
          onLoadedData={() => setVideoLoaded(true)}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleVideoTimeUpdate}
          onError={() => setVideoError(true)}
          className={`w-full h-full object-cover object-center scale-[1.5] origin-[center_8%] transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-60'
          }`}
        >
          <source src="/Hidden_India_30sec_Promo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Fallback image background if video fails */}
        {videoError && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
        )}

        {/* Subtle Black Gradient Overlay (approx. 25-35%) for cinematic clarity without darkening */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-[#05070a]/75 pointer-events-none" />
      </div>

      {/* 2. Floating Golden Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* 3. Hero Content Container */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center text-center">
        {/* Curated Sanctuary Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)] animate-float backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>India’s Uncharted Sanctuaries</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span className="text-slate-300 font-normal">Living Heritage</span>
        </div>

        {/* Main Cinematic Title */}
        <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-wider text-white uppercase mb-4 drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)]">
          <span className="gold-gradient-text block">HIDDEN INDIA</span>
        </h1>

        {/* Tagline */}
        <p className="font-serif-luxury italic text-lg sm:text-2xl md:text-3xl text-slate-100 font-light tracking-wide max-w-3xl mb-8 leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          Beyond the Ordinary. Into the Extraordinary.
        </p>

        {/* Sub-description */}
        <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed mb-10 text-balance drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Leave the crowded tourist trails behind. Journey into sacred high-altitude valleys, living botanical architecture, 500-year-old river kingdoms, and the untold stories of indigenous guardians.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
          <button
            onClick={onExploreClick}
            className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.65)] hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
            <span>Explore 3D India Map</span>
          </button>

          <button
            onClick={onDiscoverClick}
            className="group w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel-gold hover:bg-amber-500/15 text-amber-200 hover:text-white font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 border border-amber-500/40 hover:border-amber-400 hover:-translate-y-1 flex items-center justify-center gap-3 backdrop-blur-xl"
          >
            <MapPin className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Discover Hidden Places</span>
          </button>
        </div>

        {/* Floating Quick Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-amber-300">28 States & UTs</span>
            <span className="text-slate-400 text-xs mt-0.5">Subcontinent Coverage</span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-emerald-400">95%+ Secluded</span>
            <span className="text-slate-400 text-xs mt-0.5">Zero Mass Crowds</span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-sky-400">100% Verified</span>
            <span className="text-slate-400 text-xs mt-0.5">Indigenous Guided</span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-amber-400">5,000+ Years</span>
            <span className="text-slate-400 text-xs mt-0.5">Living Heritage Lore</span>
          </div>
        </div>
      </div>

      {/* Bouncing Scroll Down Indicator */}
      <div className="absolute bottom-6 right-6 z-30 hidden sm:flex flex-col items-center gap-1.5 text-slate-400 text-xs pointer-events-none">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/80">Scroll to Explore</span>
        <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
      </div>
    </section>
  );
}
