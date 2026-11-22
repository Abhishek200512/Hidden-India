# 🏔️ HIDDEN INDIA
> **Beyond the Ordinary. Into the Extraordinary.**

A production-quality, immersive 3D interactive web platform showcasing India's unmapped destinations, sacred heritage, living botanical architecture, indigenous traditions, and unexplored landscapes.

---

## ✨ Experience Highlights

### 1. 🎬 Cinematic Hero Section
- **Background Video**: Integrates the original high-definition promotional video (`Hidden_India_30sec_Promo.mp4`) with smooth loop, mute/unmute audio control, play/pause toggles, and fallback high-resolution poster.
- **Cinematic Typography**: Royal gold gradient headers in *Cinzel* & *Playfair Display* fonts with dark atmospheric vignettes.
- **Interactive Stardust**: Real-time canvas particle simulation of golden stardust drifting gently upwards.
- **Subcontinent Metrics**: Badges highlighting 28 States & UTs, 95%+ Secluded, 100% Indigenous Guided, and 5,000+ Years of Lore.
- **Dual CTAs**: Instant smooth-scrolling to the **3D India Map** and **Hidden Destinations**.

### 2. 🗺️ Interactive 3D Subcontinent Map (Three.js WebGL)
- **Topographic 3D India Mesh**: Procedurally extruded landmass plate with accurate geographical contours, elevated Himalayan and Western Ghats relief, and glowing territorial borders.
- **3D Beacons & Pulsing Rings**: Interactive pillars with floating, rotating gem octahedrons and dynamic ground rings at real geographical coordinates (Ziro, Majuli, Tirthan, Gurez, Dzukou, Sandakphu, Gandikota, Chettinad, Mawlynnong, Lonar, Spiti, Orchha).
- **Subcontinent Energy Arcs**: Quadratic bezier flight curves connecting northern passes to southern peninsular sanctuaries with dashed animated illumination.
- **Atmospheric Presets**: Switchable lighting environments:
  - *Midnight Luminescence* (Deep obsidian, cyan rim lighting)
  - *Golden Hour* (Warm amber glow, sunset radiance)
  - *Cyber Emerald* (Bioluminescent forest theme)
- **Camera Controls & Region Jumpers**: Full OrbitControls (damping, orbit limits, auto-rotation) with 1-click camera transitions to *North (Himalayas)*, *Northeast Frontier*, *South Peninsula*, and *Western Ghats*.
- **Interactive Inspector Card**: Clicking or selecting any beacon smoothly pans the camera and reveals an inspector card with photo, altitude, best season, seclusion index, and direct link to the full dossier modal.

### 3. 🏞️ Curated Hidden Destinations
- Comprehensive dossiers for India's genuine hidden gems:
  - **Ziro Valley, Arunachal Pradesh** (Apatani wet-rice pisciculture, sacred groves)
  - **Majuli Island, Assam** (World’s largest river island, 15th-century Neo-Vaishnavite Satras)
  - **Tirthan Valley, Himachal Pradesh** (Crystalline trout streams, Kath-Kuni wooden towers)
  - **Gurez Valley, Jammu & Kashmir** (Habba Khatoon pyramid peak, ancient Silk Road)
  - **Dzukou Valley, Nagaland** (Endemic pink lilies, undulating moss amphitheater)
  - **Sandakphu, West Bengal** (Singalila Ridge, "Sleeping Buddha" view of 4 highest peaks)
  - **Gandikota, Andhra Pradesh** (The Grand Canyon of India carved in red sandstone)
  - **Chettinad, Tamil Nadu** (Palaces of Burmese teak, Athangudi handmade tile guilds)
  - **Mawlynnong & Living Root Bridges, Meghalaya** (Ficus elastica bio-architecture)
  - **Lonar Crater Lake, Maharashtra** (Hyper-velocity celestial basalt impact lake)
  - **Pin Valley & Spiti, Himachal Pradesh** (High cold desert, highest post office, Ki Gompa)
  - **Orchha Hidden Palaces, Madhya Pradesh** (Bundela royal cenotaphs on the Betwa river)
- Each card includes high-resolution imagery, location badges, seclusion score, best season, signature experience, and an interactive Wishlist toggle.

### 4. 🪔 Living Cultural Experiences & Heritage
- **6 Deep Lore Categories**:
  1. *Sacred & Tribal Festivals* (Hornbill Festival, Hemis Tsechu Cham Dance, Rann Utsav, Thrissur Pooram)
  2. *Secret Culinary Traditions* (Kashmiri Wazwan, Naga Smoked Pork with Raja Mirchi, Chettinad 7-Spice Feasts, Himachali Dham)
  3. *Rare Handicrafts & Master Guilds* (Athangudi zero-kiln cement tiles, Pashmina Kani bobbin weaving, 4000-year-old Dhokra lost-wax casting, Thangka gold scrolls)
  4. *Indigenous & Bio-Architecture* (Living Root Bridges, Kath-Kuni seismic timber joinery, Chand Baori subterranean stepwells)
  5. *Folk Music & Trance Rhythms* (Chhau martial mask dance, Baul wandering mystics, Manganiyar desert Kamaicha ballads)
  6. *Indigenous Ecosystem Guardians* (Apatani solar-lunar reverence, Bishnoi blackbuck protectors, Toda Nilgiri dairies)
- Interactive tab navigation and full **Cultural Archive Dossier** modals.

### 5. 🔍 Travel Discovery Engine
- **Full-Text Live Search**: Instant matching across names, states, tribal lore, and tags.
- **Multi-Factor Filters**: Filter by Region, State, Category, and minimum **Seclusion Index** (up to 98% unexplored).
- **Sorting Modes**: Highest seclusion rating, alphabetical, or highest altitude.
- Real-time result counter and instant filter reset.

### 6. 🧭 Interactive Travel Planner
- **Custom Itinerary Generator**: Select destination, duration (3, 7, or 12 days), travel style (Cultural Immersion, Alpine Treks, Photography, Hearth Feasts, Eco-Luxe), and budget class.
- **Dynamic Day-by-Day Schedule**: Generates morning, afternoon, evening, and celestial night activities tailored to the destination's specific topography and lore.
- **Expedition Packing Checklist**: Modest cultural attire, thermal base layers, permit reminders, and eco-friendly toiletries.
- **Cost Estimation Matrix**: Breakdown of lodging, indigenous guided treks, and food.
- **Actionable Tools**:
  - `Copy Itinerary`: Full text clipboard export formatted for travel.
  - `Save Journey`: Persists itinerary to the browser's journey drawer.
  - `Print / PDF`: Clean print-friendly stylesheet trigger.

### 7. 🎵 Ambient Procedural Soundscape (Web Audio API)
- Zero external MP3 dependency! Generates meditative Indian tanpura drone harmonics ($C\sharp$ fundamental), high-altitude alpine wind noise filtering, and randomized temple bell chimes directly in the browser using Web Audio API oscillators and biquad filters.

### 8. 💖 Wishlist & Saved Journeys Drawer
- Side slide-out drawer persisting user-saved sanctuaries and custom itineraries in `localStorage`.
- Direct jump to launch travel planner with saved destinations.

### 9. 📜 Sustainable Travel Manifesto & Governance
- Explains the core ethos: Anti-Mass Tourism, Direct Tribal Economic Revenue, Living Traditions Documentation, and Leave No Trace environmental stewardship.
- Working newsletter subscription and informative modals for Privacy, Terms, and the **Responsible Traveler Charter**.

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/) (WebGL, custom extruded geometry, shaders, OrbitControls, raycasting)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) (custom luxury gold and nocturnal obsidian palette, glassmorphism)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Sound Engine**: Web Audio API (procedural synthesis, pink noise, low-pass/band-pass filters)
- **Local Storage**: Client-side persistence for saved sanctuaries and itineraries

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; tested on Node v22.19.0)
- npm (v9 or higher)

### Installation
From the `d:\Hidden_india` folder:

```bash
# Install dependencies
npm install
```

### Running Development Server
```bash
# Start local development server with hot-reload
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
# Build optimized production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 📂 Project Structure

```
d:\Hidden_india\
├── public\
│   └── Hidden_India_30sec_Promo.mp4    # 4K promotional video
├── src\
│   ├── components\
│   │   ├── 3d\
│   │   │   └── IndiaMap3D.jsx          # Three.js 3D Subcontinent WebGL Map
│   │   ├── AboutSection.jsx            # Manifesto & Sustainable Tourism
│   │   ├── AudioAtmosphere.jsx         # Web Audio procedural soundscape
│   │   ├── CinematicHero.jsx           # Hero video, stardust & metrics
│   │   ├── CulturalSection.jsx         # 6 cultural lore categories & modals
│   │   ├── DestinationModal.jsx        # Deep detail sanctuary dossier
│   │   ├── DestinationsSection.jsx     # Curated hidden gems grid
│   │   ├── DiscoverySection.jsx        # Search, state & seclusion filter
│   │   ├── Footer.jsx                  # Footer, newsletter, legal modals
│   │   ├── Navbar.jsx                  # Glassmorphism header & audio pill
│   │   ├── TravelPlanner.jsx           # Dynamic day-by-day expedition planner
│   │   └── WishlistDrawer.jsx          # Bookmarks & saved journeys drawer
│   ├── data\
│   │   ├── culturalExperiences.js      # Festivals, food, crafts, architecture
│   │   └── destinations.js             # 12+ genuine hidden Indian sanctuaries
│   ├── App.jsx                         # Main application orchestrator
│   ├── index.css                       # Tailwind & glassmorphism styling
│   └── main.jsx                        # React root entry
├── index.html                          # HTML template with Google Fonts
├── package.json                        # Dependencies and scripts
├── tailwind.config.js                  # Custom luxury color palette
├── vite.config.js                      # Vite configuration
└── README.md                           # Documentation
```

---

## 🏛️ Cultural Credit & Respect
Curated with deep reverence for India's indigenous tribes, master artisanal guilds, monastic communities, and biodiversity guardians. All geographic and cultural telemetry is documented to foster respectful, low-impact exploration.
