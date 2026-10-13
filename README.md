# 🏎️ Lotus Élise: Interactive 3D Telemetry & Workshop Rig

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-black?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![R3F](https://img.shields.io/badge/@react--three/fiber-v9-black?style=for-the-badge)](https://r3f.docs.pmnd.rs/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A high-performance, moody dark industrial 3D Web application presenting the iconic **Lotus Élise Series II (1.8L 2ZZ-GE)** driving atop its massive raw stone-cast monolith pedestal, rendered in authentic Sketchfab monochrome atmosphere with modern frosted pastel glassmorphism telemetry overlays and procedural Web Audio synthesis.

---

## ✨ Features

- **Raw GLB Monolith Architecture**: Directly renders the authored `/lotus_elise.glb` asset—including the full cylindrical monolith base, textured platform, annotations, and vehicle—without artificial geometry replacements.
- **Embedded Animation Sync ("Base Stack")**: Hooks natively into the baked animation tracks to drive the car running smoothly around its circular track, with dynamic time-scaling (0.5× Slow-Mo, 1× Real-Time, 2× High Speed).
- **Full 360° Manual OrbitControls**: Unrestricted camera rotation, tilt, and scroll-wheel zoom bounded between 20 and 250 units, with polar limits preventing flipping beneath the ground.
- **Cinematic Camera Presets**: Seamless, lerped camera transitions between `ORBIT`, `INSPECT ENGINE`, `COCKPIT`, and `TOP VIEW`.
- **Procedural Web Audio Engine**: Zero external MP3/WAV files required. Employs dual sub-bass oscillators (triangle wave + detuned sine) routed through a tight 160–380 Hz Biquad lowpass filter for a smooth, non-harsh mechanical purr with 0.4s fade-in and 0.5s fade-out transitions.
- **Modern Pastel Glassmorphism HUD**:
  - Warm apricot / peach (`#FDBA74` / `#FB923C`) primary action accents and live status indicators.
  - Pastel cyan and soft mint (`#67E8F9` / `#5EEAD4`) telemetry gauges and velocity readouts.
  - Frosted glass cards (`bg-slate-950/60 backdrop-blur-xl border border-white/10`) with hover lighting.
  - Tactile START / STOP ENGINE button with glowing active states and audible click feedback.
- **Atmospheric Studio Grading**: Deep obsidian/charcoal backdrop (`#090B0E`) with distance fog floor (`near: 100`, `far: 240`) dissolving the lower base into an infinite void, highlighted by crisp cool directional and rim lighting.
- **Strict Pointer Events Layering**: The entire canvas receives 100% of mouse and touch gestures with zero overlay blocking.

---

## 🛠️ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/lotus-elise-spec-rig.git
cd lotus-elise-spec-rig
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Build for Production
```bash
npm run build
```
Preview the compiled bundle:
```bash
npm run preview
```

---

## 📂 Project Architecture

```
LOTUS ÉLISE/
├── public/
│   └── lotus_elise.glb         # 3D Model asset (monolith pedestal + car + animations)
├── src/
│   ├── components/
│   │   ├── CanvasScene.tsx     # Three.js Canvas, studio lighting rig, camera controls & fog
│   │   ├── LotusModel.tsx      # GLB loader, material color grading, and "Base Stack" animation sync
│   │   └── TelemetryHUD.tsx    # Frosted pastel HUD overlay, tachometer gauge, controls
│   ├── hooks/
│   │   └── useEngineAudio.ts   # Web Audio API procedural synthesizer (exhaust purr & clicks)
│   ├── App.tsx                 # Central state coordinator (engine, throttle, presets, audio)
│   ├── main.tsx                # React DOM entry point
│   └── index.css               # Design system tokens, glassmorphism, fonts & animations
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore rules (explicitly tracking public/lotus_elise.glb)
├── index.html                  # HTML template with typography preconnects
├── package.json                # Project dependencies and build scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite bundling configuration
└── tailwind.config.js          # Tailwind CSS theme extensions
```

---

## 🚀 Deployment (Vercel / Netlify / Cloudflare Pages)

The project is pre-configured for one-click deployment:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- The `public/lotus_elise.glb` asset is included in version control and served statically.

---

## 📄 License & Attribution

- **Lotus Élise 3D Model**: Created by [Stéphane Agullo](https://sketchfab.com/stefagullo) and shared under the [Creative Commons Attribution](https://creativecommons.org/licenses/by/4.0/) license.
- **Application Code**: Released under the MIT License.
# lotus-elise-3d-telemetry
