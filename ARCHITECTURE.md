# AETHERIS - System Architecture & Module Design

This document details the software architecture, module breakdown, data flow, and separation of concerns for **AETHERIS**.

---

## 📐 System Architecture Diagram

```text
                           ┌──────────────┐
                           │   main.js    │ (App Entry & Event Router)
                           └──────┬───────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│    game.js     │◄─────►│  graphics.js   │       │    audio.js    │
│ (Tetris Logic) │       │ (Three.js 3D)  │       │(Web Audio Synth│
└───────┬────────┘       └───────┬────────┘       └────────────────┘
        │                        │
        └───────────┬────────────┘
                    ▼
           ┌────────────────┐
           │     ui.js      │
           │ (DOM & Overlay)│
           └────────────────┘


Module Breakdown & Responsibilities
1. main.js — Application Entry Point
Role: Orchestrates the lifecycle of the application, bootstraps sub-systems, binds global event listeners (keyboard, window resize, touch handlers), and runs the master requestAnimationFrame loop.

Dependencies: Imports game.js, graphics.js, ui.js, and audio.js.

Key Responsibilities:

Instantiates core managers (GameEngine, GraphicsEngine, UIManager, SoundEngine).

Routes user inputs (Keyboard / Touch / UI clicks) to the appropriate methods in game.js or graphics.js.

Manages state transitions (Start, Pause, Game Over, Reset).

Coordinates frame updates across game state, particle simulation, and Three.js rendering.

2. game.js — Core Gameplay State & Logic
Role: Pure game state container and rules engine. Completely decoupled from Three.js DOM rendering or Web Audio playback.

Key Responsibilities:

Matrix representation of the 10x20 grid state.

Tetromino piece generation, collision detection (isValid), rotation algorithms with wall kicks, soft drops, and hard drops.

Score tracking, level progression calculation, line clear detection, and combo counter.

Next piece queue generation.

3. graphics.js — Three.js 3D Rendering & Camera System
Role: Manages the WebGL viewport, 3D meshes, materials, lighting, particle systems, and camera controls.

Key Responsibilities:

Initializing Three.js Scene, PerspectiveCamera, WebGLRenderer, and OrbitControls.

Constructing the 360° spherical starfield, sci-fi metallic board frame, floor grid, and lights.

Creating and updating block geometries with custom physical materials and distinct color palettes.

Handling camera interaction modes (1-finger orbit, 2-finger pinch/zoom, double-tap reset).

Particle effects (line clear explosions, hard drop impact shockwaves) and camera shake interpolation.

4. ui.js — DOM UI, HUD, and Interaction Layer
Role: Manages all HTML overlay elements, HUD displays, modals, on-screen controls, and visual accessibility features.

Key Responsibilities:

Updating text elements (Score, High Score, Level, Lines).

Rendering 2D preview canvas for the NEXT piece.

Managing active screen overlays (Start Screen, Pause Screen, Game Over Screen).

Auto-dimming logic: Fades UI elements to 45% opacity after 3 seconds of inactivity and restores 100% on interaction.

Handling mobile D-pad touch button events with event propagation stopping to avoid camera conflicts.

5. audio.js — Web Audio API Procedural Synthesizer
Role: Synthesizes real-time sound effects and background ambient pad music without external audio asset files.

Key Responsibilities:

AudioContext initialization and master dynamic compression (DynamicsCompressorNode).

Procedural SFX generation using layered oscillators, filtered noise generators, and precise gain envelopes for:

Move, Rotate, Soft Drop, Hard Drop impact, Line Clear chords, Combo fanfares, Level Up, and Game Over notes.

Generative ambient space music generator using low-frequency detuned pad chords and filter sweeps.

🔄 Data & Communication Flow
User Input: Player presses a key or taps a touch button. main.js catches the event and invokes a state update method in game.js (e.g., game.moveLeft()).

State & Rules Processing: game.js validates grid boundaries. If valid, updates position coordinates.

Visual & Audio Triggers: main.js checks the output of the game operation.

If a piece moves/rotates: Calls graphics.updateActivePiecePosition() and audio.playRotate().

If a hard drop occurs: Triggers graphics.triggerHardDropImpact() (camera shake + particle burst) and audio.playHardDrop().

If lines clear: Calls game.clearRows(), updates score, invokes ui.updateHUD(), spawns floating 3D text in graphics.js, and plays audio.playLineClear().

Render Loop: On every tick, main.js updates game, updates graphics particles, updates ui auto-dimming timers, and renders the Three.js scene via graphics.render().
