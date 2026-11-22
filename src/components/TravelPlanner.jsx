import React, { useState, useEffect } from 'react';
import { DESTINATIONS } from '../data/destinations';
import { fetchLiveDestinationWeather } from '../services/weatherService';
import { Sparkles, Calendar, MapPin, Compass, Check, Copy, Printer, BookmarkCheck, ShieldAlert, DollarSign, Backpack, CloudSun, Clock, RefreshCw } from 'lucide-react';

export default function TravelPlanner({ onFocusMapDestination, initialDestinationId, onBookExpedition }) {
  const [selectedDestId, setSelectedDestId] = useState(initialDestinationId || DESTINATIONS[0].id);
  const [durationDays, setDurationDays] = useState(7);
  const [travelStyle, setTravelStyle] = useState('cultural'); // 'cultural' | 'trekking' | 'photography' | 'culinary' | 'eco-luxe'
  const [budgetTier, setBudgetTier] = useState('boutique'); // 'backpacker' | 'boutique' | 'luxury'
  const [copied, setCopied] = useState(false);
  const [savedToJourneys, setSavedToJourneys] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Sync selected destination if initialDestinationId changes (e.g. from modal or wishlist)
  useEffect(() => {
    if (initialDestinationId) {
      setSelectedDestId(initialDestinationId);
    }
  }, [initialDestinationId]);

  const destination = DESTINATIONS.find(d => d.id === selectedDestId) || DESTINATIONS[0];

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      if (!destination) return;
      setIsLoadingWeather(true);
      try {
        const data = await fetchLiveDestinationWeather(destination.coordinates.lat, destination.coordinates.lng);
        if (isMounted) {
          setLiveWeather(data);
          setIsLoadingWeather(false);
        }
      } catch {
        if (isMounted) setIsLoadingWeather(false);
      }
    };
    fetchWeather();
    return () => { isMounted = false; };
  }, [destination]);

  // Dynamic day-by-day schedule generator tailored to chosen options
  const generateItinerary = () => {
    const days = [];
    const destName = destination.name;
    const highlights = destination.highlights || ['Historic Sanctum', 'Sacred Water Stream', 'Sunset Lookout', 'Local Bazaars'];

    for (let dayNum = 1; dayNum <= durationDays; dayNum++) {
      if (dayNum === 1) {
        days.push({
          day: 1,
          theme: `Arrival & Acclimatization in the Foothills of ${destName}`,
          morning: `Scenic transit through virgin pine forests; arrival at indigenous eco-homestay. Welcome sip of herbal mountain tea.`,
          afternoon: `Gentle orientation walk through ${highlights[0] || 'local bamboo hamlet'}; respect traditional village gates and shrines.`,
          evening: `Traditional welcome hearth feast with the village host elders; storytelling around woodfire.`,
          night: `First night of stargazing under crystal-clear pollution-free celestial sky.`
        });
      } else if (dayNum === durationDays) {
        days.push({
          day: dayNum,
          theme: `Dawn Reflections & Mindful Farewell`,
          morning: `Early morning sunrise viewing at the eastern ridge; photographing golden mist lifting over valleys.`,
          afternoon: `Artisan workshop visit: purchasing zero-middleman handwoven crafts, organic spices, or pottery.`,
          evening: `Warm send-off ceremony by the host community; depart with memories of the sacred hinterlands.`,
          night: `Homeward transfer toward nearest rail/air junction.`
        });
      } else {
        const highlightIndex = (dayNum - 2) % highlights.length;
        const currentHighlight = highlights[highlightIndex];

        if (travelStyle === 'trekking') {
          days.push({
            day: dayNum,
            theme: `High Alpine Trail to ${currentHighlight}`,
            morning: `Early alpine start; trek through mossy oak canopies and cross glacial streams using natural stepping stones.`,
            afternoon: `Summit crest picnic overlooking panoramic mountain ranges; flora identification with local guide.`,
            evening: `Descent to riverside meadow; setting up high-altitude camp or returning to cozy timber lodge.`,
            night: `Acoustic folk songs around log fire; reviewing trail telemetry.`
          });
        } else if (travelStyle === 'photography') {
          days.push({
            day: dayNum,
            theme: `Blue Hour Expedition & Tribal Portraiture at ${currentHighlight}`,
            morning: `Golden hour landscape shoot as morning thermals roll across ancient stepped terraces.`,
            afternoon: `Cultural portraiture session with indigenous elders (after seeking heartfelt permission and showing prints).`,
            evening: `Sunset long-exposure capture of stone structures and reflective river bends.`,
            night: `Astro-photography workshop: capturing the core of the Milky Way arching over pristine ridges.`
          });
        } else if (travelStyle === 'culinary') {
          days.push({
            day: dayNum,
            theme: `Foraging & Hearth Alchemy around ${currentHighlight}`,
            morning: `Wild forest foraging walk with local herbalist: identifying edible ferns, bamboo shoots, and wild peppercorns.`,
            afternoon: `Hands-on clay pot masterclass: preparing slow-cooked traditional dishes using bell-metal vessels.`,
            evening: `Community feast featuring fermented specialties, heritage rice varieties, and fresh honeycomb.`,
            night: `Sipping spiced nighttime infusions under lantern-lit verandas.`
          });
        } else {
          // Cultural immersion
          days.push({
            day: dayNum,
            theme: `Deep Lore & Living Architecture at ${currentHighlight}`,
            morning: `Guided exploration of 15th-century shrines and ancestral meeting halls (Morungs or Chhatris).`,
            afternoon: `Participate in traditional tile pouring, loom weaving, or mask-making alongside master guilds.`,
            evening: `Attend evening temple prayers or twilight river flute recitals along the embankment.`,
            night: `Quiet contemplative journal writing and dinner with village headman.`
          });
        }
      }
    }
    return days;
  };

  const itineraryDays = generateItinerary();

  // Estimated budget calculator
  const calculateBudget = () => {
    let dailyRate = 2200; // backpacker in INR
    if (budgetTier === 'boutique') dailyRate = 5500;
    if (budgetTier === 'luxury') dailyRate = 12000;

    const totalInr = dailyRate * durationDays;
    const estLodging = Math.round(totalInr * 0.45);
    const estFood = Math.round(totalInr * 0.25);
    const estGuideTrans = Math.round(totalInr * 0.30);

    return { totalInr, estLodging, estFood, estGuideTrans };
  };

  const budget = calculateBudget();

  const handleCopyItinerary = () => {
    const text = `HIDDEN INDIA — TAILORED ITINERARY
Destination: ${destination.name}, ${destination.state} (${destination.altitude})
Duration: ${durationDays} Days | Style: ${travelStyle.toUpperCase()} | Tier: ${budgetTier.toUpperCase()}
Permits: ${destination.permits}

DAY-BY-DAY SCHEDULE:
${itineraryDays.map(d => `Day ${d.day}: ${d.theme}\n- Morning: ${d.morning}\n- Afternoon: ${d.afternoon}\n- Evening: ${d.evening}\n- Night: ${d.night}`).join('\n\n')}

PACKING CHECKLIST:
- Valid Government ID & Permit copies (${destination.permits})
- Modest cultural attire covering shoulders and knees
- High-traction waterproof hiking boots & thermal base layers
- Offline maps & cash reserves (ATMs are sparse in remote areas)
- Eco-friendly biodegradable toiletries (Zero chemical runoff)

Estimated Budget: ₹${budget.totalInr.toLocaleString()} (Lodging: ₹${budget.estLodging.toLocaleString()}, Food: ₹${budget.estFood.toLocaleString()}, Local Guides & Transit: ₹${budget.estGuideTrans.toLocaleString()})

Curated by Hidden India (https://hiddenindia.org)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToJourneys = () => {
    const existingJourneys = JSON.parse(localStorage.getItem('hidden_india_saved_journeys') || '[]');
    const newJourney = {
      id: Date.now(),
      destId: destination.id,
      destName: destination.name,
      state: destination.state,
      durationDays,
      travelStyle,
      createdAt: new Date().toLocaleDateString()
    };
    localStorage.setItem('hidden_india_saved_journeys', JSON.stringify([newJourney, ...existingJourneys]));
    setSavedToJourneys(true);
    setTimeout(() => setSavedToJourneys(false), 2500);
  };

  return (
    <section id="planner" className="relative py-24 sm:py-32 bg-[#05070a] border-t border-white/5 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Subcontinent Concierge</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-wide">
            Interactive <span className="gold-gradient-text">Travel Planner</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Configure your dream voyage. We craft an authentic, day-by-day expedition honoring local carrying capacities, sacred festivals, and tribal protocols.
          </p>
        </div>

        {/* Planner Configuration Form */}
        <div className="glass-panel-gold p-6 sm:p-8 rounded-3xl border border-amber-500/25 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Target Destination */}
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 1. Destination
              </label>
              <select
                value={selectedDestId}
                onChange={(e) => setSelectedDestId(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.name} ({d.state})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Duration */}
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 2. Trip Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { days: 3, label: '3 Days' },
                  { days: 7, label: '7 Days' },
                  { days: 12, label: '12 Days' }
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setDurationDays(item.days)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      durationDays === item.days
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-black/40 text-slate-300 border-white/10 hover:border-amber-400/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Travel Style */}
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> 3. Focus Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                <option value="cultural" className="bg-slate-900 text-white">Cultural & Lore Immersion</option>
                <option value="trekking" className="bg-slate-900 text-white">Alpine Treks & Wildlife</option>
                <option value="photography" className="bg-slate-900 text-white">Golden Hour Photography & Cosmos</option>
                <option value="culinary" className="bg-slate-900 text-white">Secret Slow Hearth Feasts</option>
                <option value="eco-luxe" className="bg-slate-900 text-white">Eco-Sanctuary Seclusion</option>
              </select>
            </div>

            {/* 4. Budget Preference */}
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> 4. Budget Class
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'backpacker', label: 'Homestay' },
                  { id: 'boutique', label: 'Boutique' },
                  { id: 'luxury', label: 'Heritage' }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setBudgetTier(tier.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      budgetTier === tier.id
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-black/40 text-slate-300 border-white/10 hover:border-amber-400/40'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Itinerary Display Document */}
        <div className="glass-panel rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
          {/* Header Bar */}
          <div className="p-6 sm:p-8 bg-black/60 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                <span>Verified Sample Expedition Plan</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-white">
                {destination.name} <span className="text-amber-400/90 font-light">— {durationDays} Days</span>
              </h3>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs sm:text-sm text-slate-400">
                  {destination.state} · Altitude {destination.altitude} · Best Window: {destination.bestTime.split('(')[0]}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-amber-500/30 text-xs text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isLoadingWeather ? 'Connecting...' : `${liveWeather?.temp ?? '--'}°C (${liveWeather?.condition || 'Analyzing...'})`}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-mono">{liveWeather?.localTime ? `${liveWeather.localTime} IST` : 'IST'}</span>
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleCopyItinerary}
                className="px-4 py-2.5 rounded-xl glass-panel-gold hover:bg-amber-500 hover:text-black text-amber-200 text-xs font-bold transition-all flex items-center gap-2"
                title="Copy entire plan to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Itinerary'}</span>
              </button>

              <button
                onClick={handleSaveToJourneys}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all border border-white/10 flex items-center gap-2"
                title="Save into browser journey drawer"
              >
                <BookmarkCheck className={`w-4 h-4 ${savedToJourneys ? 'text-amber-400' : ''}`} />
                <span>{savedToJourneys ? 'Saved!' : 'Save Journey'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
                title="Print or save as PDF"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Quick Notice Banner: Permits & Regulations */}
          <div className="bg-amber-950/40 border-b border-amber-500/20 px-6 sm:px-8 py-3.5 flex items-center gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Permit Notice:</strong> {destination.permits}. Please prepare government ID copies in advance.
            </span>
          </div>

          {/* Day by Day Cards */}
          <div className="p-6 sm:p-8 space-y-6">
            {itineraryDays.map((item) => (
              <div
                key={item.day}
                className="rounded-2xl bg-black/40 border border-white/5 hover:border-amber-500/30 p-5 sm:p-6 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-black font-extrabold text-sm flex items-center justify-center">
                      0{item.day}
                    </span>
                    <h4 className="font-serif-luxury text-lg font-bold text-white">
                      {item.theme}
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-400/80 bg-white/5 px-2.5 py-1 rounded-lg w-fit">
                    Full Day Schedule
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-amber-400 font-bold block mb-1">🌅 Morning (07:00 - 11:30)</span>
                    <p className="text-slate-300 leading-relaxed">{item.morning}</p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-amber-400 font-bold block mb-1">☀️ Afternoon (12:00 - 16:30)</span>
                    <p className="text-slate-300 leading-relaxed">{item.afternoon}</p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-amber-400 font-bold block mb-1">🌇 Sunset & Twilight</span>
                    <p className="text-slate-300 leading-relaxed">{item.evening}</p>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-amber-400 font-bold block mb-1">✨ Celestial Night</span>
                    <p className="text-slate-300 leading-relaxed">{item.night}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Grid: Packing Checklist & Cost Estimation */}
          <div className="p-6 sm:p-8 bg-black/60 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Essential Packing List */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <h5 className="font-serif-luxury text-base font-bold text-white mb-3 flex items-center gap-2">
                <Backpack className="w-4 h-4 text-amber-400" />
                <span>Expedition Packing Checklist</span>
              </h5>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Physical photo IDs & printed copies of {destination.permits.split(';')[0]}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sub-zero thermal base layers and windproof alpine shell</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>High-capacity power bank & offline maps (signal drops frequently)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Biodegradable organic soap (zero river water contamination)</span>
                </li>
              </ul>
            </div>

            {/* Estimated Budget Breakdown */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <h5 className="font-serif-luxury text-base font-bold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Estimated Budget ({durationDays} Days / Person)</span>
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Authentic Lodging & Homestays:</span>
                  <span className="font-mono font-semibold text-white">₹{budget.estLodging.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Traditional Meals & Foraged Feasts:</span>
                  <span className="font-mono font-semibold text-white">₹{budget.estFood.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Indigenous Village Guides & 4WD Transit:</span>
                  <span className="font-mono font-semibold text-white">₹{budget.estGuideTrans.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold border-t border-white/10 pt-2 text-sm">
                  <span>Total Estimated Outlay:</span>
                  <span className="font-mono">₹{budget.totalInr.toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  *Excludes interstate flights/train tickets. 100% of village fees directly support local homestay families.
                </span>
              </div>
            </div>
          </div>

          {/* Action Row: Book This Expedition */}
          <div className="p-6 bg-slate-950/90 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block font-semibold">
                Ready to Experience {destination.name}?
              </span>
              <p className="text-xs text-slate-300">
                Book this custom {durationDays}-day itinerary in Demo or Real mode with instant PDF invoice.
              </p>
            </div>
            <button
              onClick={() => {
                if (onBookExpedition) {
                  onBookExpedition({
                    destination,
                    durationDays,
                    travelStyle,
                    budgetTier,
                    guests: 2
                  });
                }
              }}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform text-sm"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Book This Custom Expedition</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
