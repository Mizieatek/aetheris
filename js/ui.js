/* ==========================================================================
   AETHERIS - UI, HUD, and Interaction Layer
   ========================================================================== */

import { SHAPES } from './game.js';

export class UIManager {
    constructor(app) {
        this.app = app;

        // DOM Elements
        this.hudContainer = document.getElementById('hud');
        this.mobileControls = document.getElementById('mobile-controls');
        this.levelVal = document.getElementById('level-val');
        this.linesVal = document.getElementById('lines-val');
        this.scoreVal = document.getElementById('score-val');
        this.highScoreVal = document.getElementById('highscore-val');
        this.nextPreviewBox = document.getElementById('next-preview');

        // Overlays
        this.startScreen = document.getElementById('start-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');

        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.resumeBtn = document.getElementById('resume-btn');
        this.restartPauseBtn = document.getElementById('restart-pause-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.camResetBtn = document.getElementById('cam-reset-btn');
        this.sfxToggleBtn = document.getElementById('sfx-toggle-btn');
        this.musicToggleBtn = document.getElementById('music-toggle-btn');
        this.homeBtn = document.getElementById('home-btn');
        this.menuBtn = document.getElementById('menu-btn');

        this.fpsDisplay = document.getElementById('fps-display');
        this.finalScore = document.getElementById('final-score');
        this.newHighLabel = document.getElementById('new-high-label');

        // Auto-dimming state
        this.inactivityTimer = 0;
        this.dimTimeoutSeconds = 3.0;
        this.isDimmed = false;

        this.bindEvents();
    }

    bindEvents() {
        // Main Screen Buttons
        this.startBtn.addEventListener('click', () => this.app.startGame());
        this.resumeBtn.addEventListener('click', () => this.app.togglePause());
        this.restartPauseBtn.addEventListener('click', () => this.app.startGame());
        this.restartBtn.addEventListener('click', () => this.app.startGame());
        this.menuBtn.addEventListener('click', () => this.app.togglePause());

        // Camera & Audio Modals
        this.camResetBtn.addEventListener('click', () => {
            this.app.graphics.resetCamera();
            this.app.togglePause();
        });

        this.sfxToggleBtn.addEventListener('click', () => {
            const muted = this.app.audio.toggleSFX();
            this.sfxToggleBtn.textContent = `SFX: ${muted ? 'OFF' : 'ON'}`;
        });

        this.musicToggleBtn.addEventListener('click', () => {
            const muted = this.app.audio.toggleMusic();
            this.musicToggleBtn.textContent = `MUSIC: ${muted ? 'OFF' : 'ON'}`;
        });

        this.homeBtn.addEventListener('click', () => {
            this.app.game.isPlaying = false;
            this.app.game.isPaused = false;
            this.showStartScreen();
        });

        // Mobile Touch Controls
        this.setupMobileControls();
    }

    setupMobileControls() {
        const bindTouch = (id, action) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            const handlePress = (e) => {
                e.stopPropagation();
                if (e.cancelable) e.preventDefault();
                this.resetAutoDim();
                action();
            };

            btn.addEventListener('touchstart', handlePress, { passive: false });
            btn.addEventListener('click', (e) => e.stopPropagation());
        };

        bindTouch('btn-left', () => {
            this.app.game.moveLeft();
            this.app.graphics.syncActivePiece(this.app.game.activePiece, this.app.game.board);
        });

        bindTouch('btn-right', () => {
            this.app.game.moveRight();
            this.app.graphics.syncActivePiece(this.app.game.activePiece, this.app.game.board);
        });

        bindTouch('btn-up', () => {
            this.app.game.rotate();
            this.app.graphics.syncActivePiece(this.app.game.activePiece, this.app.game.board);
        });

        bindTouch('btn-down', () => {
            this.app.game.softDrop();
            this.app.graphics.syncActivePiece(this.app.game.activePiece, this.app.game.board);
            this.updateHUD(this.app.game.score, this.app.game.level, this.app.game.lines, this.app.game.highScore);
        });

        bindTouch('btn-drop', () => {
            this.app.game.hardDrop();
            this.app.graphics.syncBoardState(this.app.game.board);
            this.app.graphics.syncActivePiece(this.app.game.activePiece, this.app.game.board);
            this.updateHUD(this.app.game.score, this.app.game.level, this.app.game.lines, this.app.game.highScore);
            this.updateNextPreview(this.app.game.getNextPieceKey());
        });
    }

    updateHUD(score, level, lines, highScore) {
        this.scoreVal.textContent = score;
        this.levelVal.textContent = level;
        this.linesVal.textContent = lines;
        this.highScoreVal.textContent = highScore;
    }

    updateNextPreview(pieceKey) {
        this.nextPreviewBox.innerHTML = '';
        if (!pieceKey || !SHAPES[pieceKey]) return;

        const shape = SHAPES[pieceKey].shape;
        const colorHex = '#' + SHAPES[pieceKey].color.toString(16).padStart(6, '0');

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;
        grid.style.gap = '2px';
        grid.style.width = '100%';
        grid.style.height = '100%';
        grid.style.alignItems = 'center';
        grid.style.justifyItems = 'center';

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                const cell = document.createElement('div');
                cell.style.width = '100%';
                cell.style.height = '100%';
                cell.style.borderRadius = '2px';
                if (shape[r][c]) {
                    cell.style.backgroundColor = colorHex;
                    cell.style.boxShadow = `0 0 6px ${colorHex}`;
                }
                grid.appendChild(cell);
            }
        }
        this.nextPreviewBox.appendChild(grid);
    }

    showStartScreen() {
        this.hideOverlayScreens();
        this.startScreen.classList.add('active');
    }

    showGameUI() {
        this.hideOverlayScreens();
        this.resetAutoDim();
    }

    showPauseScreen() {
        this.hideOverlayScreens();
        this.pauseScreen.classList.add('active');
    }

    showGameOverScreen(score, highScore) {
        this.hideOverlayScreens();
        this.finalScore.textContent = score;
        this.newHighLabel.style.display = (score === highScore && score > 0) ? 'block' : 'none';
        this.gameoverScreen.classList.add('active');
    }

    hideOverlayScreens() {
        this.startScreen.classList.remove('active');
        this.pauseScreen.classList.remove('active');
        this.gameoverScreen.classList.remove('active');
    }

    updateFPS(fps) {
        this.fpsDisplay.textContent = `FPS: ${fps}`;
    }

    resetAutoDim() {
        this.inactivityTimer = 0;
        if (this.isDimmed) {
            this.isDimmed = false;
            this.hudContainer.classList.remove('dimmed');
            this.mobileControls.classList.remove('dimmed');
        }
    }

    updateAutoDim(delta) {
        if (!this.app.game.isPlaying || this.app.game.isPaused || this.app.game.isGameOver) {
            this.resetAutoDim();
            return;
        }

        this.inactivityTimer += delta;
        if (this.inactivityTimer >= this.dimTimeoutSeconds && !this.isDimmed) {
            this.isDimmed = true;
            this.hudContainer.classList.add('dimmed');
            this.mobileControls.classList.add('dimmed');
        }
    }
}
