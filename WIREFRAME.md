# AETHERIS - Interface Wireframes & UI Layout

This document provides ASCII wireframes for all main screens, HUD components, overlay menus, and touch control systems across Desktop and Mobile viewports.

---

## 1. Desktop Interface Layout

On desktop displays, the interface uses a floating top HUD bar over a full-screen WebGL 3D canvas viewport.

```text
+-----------------------------------------------------------------------+
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | LEVEL: 1  | LINES: 0  | NEXT [■] | SCORE: 002400 | RECORD |  ☰  |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|                                                                       |
|                           .-----------------.                         |
|                          /   3D GAME BOARD   \                        |
|                         |                     |                       |
|                         |     [ TETROMINO ]   |                       |
|                         |                     |                       |
|                         |                     |                       |
|                         |   + + + + + + + +   |                       |
|                         |   + + + + + + + +   |                       |
|                          \                   /                        |
|                           '-----------------'                         |
|                                                                       |
|                                                                       |
+-----------------------------------------------------------------------+

Desktop Layout Components
Top Floating HUD: Houses real-time game statistics (Level, Lines Cleared, Next Piece Preview, Score, High Score) and the hamburger menu trigger (☰).

3D Game Board Viewport: Positioned centrally, occupying ~80% of visual focal area with 360° orbit camera capabilities.

Auto-Dimming: The HUD smoothly fades to 45% opacity during active gameplay after 3 seconds of mouse/keyboard inactivity.

2. Mobile Portrait Layout
The mobile layout prioritizes the 3D board vertical space (~70% screen height) while keeping controls isolated at the bottom to avoid blocking gameplay.

+---------------------------------------+
|  +---------------------------------+  |
|  | LVL: 1 | LNS: 0 | NEXT [■] | ☰  |  |
|  +---------------------------------+  |
|  | SCORE: 002400   RECORD: 015000  |  |
|  +---------------------------------+  |
|                                       |
|          .-----------------.          |
|         /   3D GAME BOARD   \         |
|        |                     |        |
|        |    [ TETROMINO ]    |        |
|        |                     |        |
|        |                     |        |
|         \                   /         |
|          '-----------------'          |
|                                       |
|  +-------------------+   +---------+  |
|  |    DPAD TOUCH     |   |  DROP   |  |
|  |    [◄] [↻] [►]    |   | ACTION  |  |
|  |        [▼]        |   | BUTTON  |  |
|  +-------------------+   +---------+  |
+---------------------------------------+

Mobile Layout Components
Compact Header Bar: Displays Level, Lines, Next 2D preview, and Menu trigger in a single clean row.

Sub-Bar: Displays current Score and High Score with high contrast legibility.

On-Screen D-Pad (Bottom Left): Dedicated touch buttons for Move Left (◄), Rotate (↻), Move Right (►), and Soft Drop (▼).

Hard Drop Button (Bottom Right): Prominent action button for instantaneous piece drop.

Touch Gesture Isolation: Touching control buttons does not trigger camera orbit rotations.

3. Overlay Screens & Menus
A. Start Screen Overlay

+-----------------------------------------------------------------------+
|                        [ DARK BACKDROP BLUR ]                         |
|                                                                       |
|                     +---------------------------+                     |
|                     |         AETHERIS          |                     |
|                     |   CRYSTAL NEON MATRIX     |                     |
|                     |                           |                     |
|                     |     [  START GAME  ]      |                     |
|                     |                           |                     |
|                     |  CONTROLS:                |                     |
|                     |  A / D / ◄ ►  : MOVE      |                     |
|                     |  W / ▲        : ROTATE    |                     |
|                     |  SPACE        : HARD DROP |                     |
|                     +---------------------------+                     |
|                                                                       |
+-----------------------------------------------------------------------+

B. Pause / Settings Menu Overlay

+-----------------------------------------------------------------------+
|                        [ DARK BACKDROP BLUR ]                         |
|                                                                       |
|                     +---------------------------+                     |
|                     |          PAUSED           |                     |
|                     |                           |                     |
|                     |  [   RESUME GAME    ]     |                     |
|                     |  [   RESTART GAME   ]     |                     |
|                     |  [   RESET CAMERA   ]     |                     |
|                     |  [ AUDIO: ON / OFF  ]     |                     |
|                     |  [ MUSIC: ON / OFF  ]     |                     |
|                     |  [ MAIN MENU        ]     |                     |
|                     +---------------------------+                     |
|                                                                       |
+-----------------------------------------------------------------------+

Game Over Screen Overlay

+-----------------------------------------------------------------------+
|                        [ DARK BACKDROP BLUR ]                         |
|                                                                       |
|                     +---------------------------+                     |
|                     |        GAME OVER          |                     |
|                     |                           |                     |
|                     |  FINAL SCORE: 014,850     |                     |
|                     |  ★ NEW HIGH SCORE ★       |                     |
|                     |                           |                     |
|                     |     [  PLAY AGAIN  ]      |                     |
|                     +---------------------------+                     |
|                                                                       |
+-----------------------------------------------------------------------+
