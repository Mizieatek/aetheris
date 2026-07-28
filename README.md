# AETHERIS

> **AETHERIS** is a high-performance, cinematic 3D arcade puzzle experience built with Three.js and the Web Audio API. Combining the classic block-stacking mechanics of Tetris with a futuristic *Crystal Neon Universe* visual aesthetic, AETHERIS offers high-framerate gameplay, custom lighting effects, layered procedural audio, and adaptive responsive controls for both desktop and mobile devices.

---

## 🌟 Key Features

* **Cinematic 3D Presentation:** Built on Three.js with full 360° spherical starfield, realistic lighting, and solid metallic sci-fi scaffolding.
* **Pure Procedural Audio:** Layered Web Audio synthesis for tactical sound effects (move, rotate, hard drop impact, line clear fanfare) alongside a generative ambient space pad soundtrack. Zero external `.mp3` or `.wav` dependencies.
* **Vivid Tetromino Personalities:** 100% solid, high-contrast, vibrantly colored pieces with custom material properties and subtle emissive glows.
* **Responsive Layouts:** Dedicated UX and control schemes tailored for Desktop, Tablet, Mobile Portrait, and Mobile Landscape interfaces.
* **Smart Touch Gestures:** Independent gesture routing allowing 1-finger orbit rotation, 2-finger pinch zoom, and isolated touch D-Pad controls.
* **Auto-Dimming HUD:** Interface elements smoothly fade to 45% opacity after 3 seconds of inactivity to keep visual focus on the 3D board.
* **Zero Asset Overhead:** Pure web technology utilizing lightweight scripts and WebGL shaders without heavy external bundle requirements.

---

## 🛠️ Technology Stack

* **Language:** JavaScript (ES6 Modules)
* **Graphics Library:** Three.js (r128) with `OrbitControls`
* **Audio Engine:** HTML5 Web Audio API (Multi-layered Oscillator Synthesis & Dynamic Compression)
* **Styling & Layout:** CSS3 (Flexbox, Grid, CSS Variables, Hardware-Accelerated Animations)
* **Markup:** HTML5

---

## 📁 Project Structure

```text
AETHERIS/
├── README.md           # Project documentation and setup guide
├── ARCHITECTURE.md     # Software architecture, data flow, and module responsibilities
├── WIREFRAME.md        # ASCII wireframes for Desktop, Mobile, and Menu UI
├── index.html          # Application entry point and structural DOM
├── css/
│   └── style.css       # Global styles, HUD, responsive breakpoints, and animations
└── js/
    ├── main.js         # Bootstrap script, event binding, and loop initialization
    ├── game.js         # Core Tetris logic, board grid state, and score calculation
    ├── graphics.js     # Three.js scene creation, camera setup, lights, and rendering
    ├── ui.js           # DOM UI bindings, HUD updates, modal handling, and auto-dimming
    └── audio.js        # Web Audio API engine, procedural sound FX, and music generator
