/* ==========================================================================
   AETHERIS - Application Entry Point & Lifecycle Manager
   ========================================================================== */

import { GameEngine } from './game.js';
import { GraphicsEngine } from './graphics.js';
import { UIManager } from './ui.js';
import { SoundEngine } from './audio.js';

class App {
    constructor() {
        this.audio = new SoundEngine();
        this.game = new GameEngine();
        this.graphics = new GraphicsEngine();
        this.ui = new UIManager(this);

        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsTimer = 0;

        this.init();
    }

    init() {
        // Link Game events / callbacks to Audio and Graphics
        this.game.onPieceMove = () => this.audio.playMove();
        this.game.onPieceRotate = () => this.audio.playRotate();
        this.game.onSoftDrop = () => this.audio.playSoftDrop();
        this.game.onHardDrop = () => {
            this.audio.playHardDrop();
            this.graphics.triggerImpact();
        };
        this.game.onLineClear = (lines, combo) => {
            this.audio.playLineClear(lines, combo);
            this.graphics.triggerLineClearFX(lines);
        };
        this.game.onLevelUp = () => this.audio.playLevelUp();
        this.game.onGameOver = () => {
            this.audio.playGameOver();
            this.ui.showGameOverScreen(this.game.score, this.game.highScore);
        };

        // Attach DOM & Keyboard Listeners
        this.bindEvents();

        // Render initial preview
        this.ui.updateNextPreview(this.game.getNextPieceKey());
        this.ui.updateHUD(this.game.score, this.game.level, this.game.lines, this.game.highScore);

        // Start animation loop
        requestAnimationFrame((now) => this.loop(now));
    }

    bindEvents() {
        // Window Resize
        window.addEventListener('resize', () => {
            this.graphics.handleResize();
        });

        // Keyboard Inputs
        window.addEventListener('keydown', (e) => {
            this.audio.initContext();
            this.ui.resetAutoDim();

            if (!this.game.isPlaying || this.game.isPaused || this.game.isGameOver) {
                if (e.code === 'KeyP' || e.code === 'Escape') {
                    this.togglePause();
                }
                return;
            }

            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.game.moveLeft();
                    this.graphics.syncActivePiece(this.game.activePiece, this.game.board);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.game.moveRight();
                    this.graphics.syncActivePiece(this.game.activePiece, this.game.board);
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.game.rotate();
                    this.graphics.syncActivePiece(this.game.activePiece, this.game.board);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.game.softDrop();
                    this.graphics.syncActivePiece(this.game.activePiece, this.game.board);
                    this.ui.updateHUD(this.game.score, this.game.level, this.game.lines, this.game.highScore);
                    break;
                case 'Space':
                    e.preventDefault();
                    this.game.hardDrop();
                    this.graphics.syncBoardState(this.game.board);
                    this.graphics.syncActivePiece(this.game.activePiece, this.game.board);
                    this.ui.updateHUD(this.game.score, this.game.level, this.game.lines, this.game.highScore);
                    this.ui.updateNextPreview(this.game.getNextPieceKey());
                    break;
                case 'KeyP':
                case 'Escape':
                    this.togglePause();
                    break;
            }
        });

        // Touch & Pointer interaction resets auto-dimming HUD
        window.addEventListener('pointerdown', () => this.ui.resetAutoDim());
        window.addEventListener('touchstart', () => this.ui.resetAutoDim(), { passive: true });
    }

    startGame() {
        this.audio.initContext();
        this.audio.startMusic();
        this.game.start();
        this.graphics.resetBoardState();
        this.graphics.syncActivePiece(this.game.activePiece, this.game.board);
        this.ui.updateHUD(this.game.score, this.game.level, this.game.lines, this.game.highScore);
        this.ui.updateNextPreview(this.game.getNextPieceKey());
        this.ui.showGameUI();
    }

    togglePause() {
        if (!this.game.isPlaying || this.game.isGameOver) return;
        this.game.isPaused = !this.game.isPaused;
        if (this.game.isPaused) {
            this.audio.playPause();
            this.ui.showPauseScreen();
        } else {
            this.audio.playResume();
            this.ui.hideOverlayScreens();
        }
    }

    loop(now) {
        requestAnimationFrame((n) => this.loop(n));

        const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = now;

        // Calculate FPS
        this.frameCount++;
        this.fpsTimer += delta;
        if (this.fpsTimer >= 1.0) {
            this.ui.updateFPS(this.frameCount);
            this.frameCount = 0;
            this.fpsTimer = 0;
        }

        // Auto-Dim Timer Update
        this.ui.updateAutoDim(delta);

        // Update Game Engine Logic
        if (this.game.isPlaying && !this.game.isPaused && !this.game.isGameOver) {
            const dropped = this.game.update(now);
            if (dropped) {
                this.graphics.syncBoardState(this.game.board);
                this.graphics.syncActivePiece(this.game.activePiece, this.game.board);
                this.ui.updateHUD(this.game.score, this.game.level, this.game.lines, this.game.highScore);
                this.ui.updateNextPreview(this.game.getNextPieceKey());
            }
        }

        // Render 3D Graphics
        this.graphics.update(delta);
        this.graphics.render();
    }
}

// Initialize application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
