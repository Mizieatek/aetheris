/* ==========================================================================
   AETHERIS - Core Game Engine & Tetris State Logic
   ========================================================================== */

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const SHAPES = {
    I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: 0x00f0ff, emissive: 0x00a0ff },
    J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: 0x0044ff, emissive: 0x0022cc },
    L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: 0xffaa00, emissive: 0xcc6600 },
    O: { shape: [[1,1],[1,1]], color: 0xffe600, emissive: 0xcca300 },
    S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: 0x00ff66, emissive: 0x00cc44 },
    T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: 0xa000ff, emissive: 0x7000cc },
    Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: 0xff0055, emissive: 0xcc0033 }
};

export const KEYS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export class TetrisBoard {
    constructor() {
        this.grid = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
    }

    isValid(shape, offsetX, offsetY) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = offsetX + c;
                    const newY = offsetY - r;
                    if (newX < 0 || newX >= BOARD_WIDTH || newY < 0) return false;
                    if (newY < BOARD_HEIGHT && this.grid[newY][newX] !== null) return false;
                }
            }
        }
        return true;
    }

    lockPiece(piece) {
        const shape = piece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const x = piece.x + c;
                    const y = piece.y - r;
                    if (y >= 0 && y < BOARD_HEIGHT) {
                        this.grid[y][x] = piece.key;
                    }
                }
            }
        }
    }

    checkLineClears() {
        const fullRows = [];
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            if (this.grid[r].every(cell => cell !== null)) {
                fullRows.push(r);
            }
        }
        return fullRows;
    }

    clearRows(rows) {
        rows.forEach(r => {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                this.grid[r][c] = null;
            }
        });

        let dropDistance = 0;
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            if (rows.includes(r)) {
                dropDistance++;
            } else if (dropDistance > 0) {
                for (let c = 0; c < BOARD_WIDTH; c++) {
                    if (this.grid[r][c] !== null) {
                        this.grid[r - dropDistance][c] = this.grid[r][c];
                        this.grid[r][c] = null;
                    }
                }
            }
        }
    }

    reset() {
        this.grid = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
    }
}

export class ActivePiece {
    constructor(key) {
        this.key = key;
        this.shape = SHAPES[key].shape.map(row => [...row]);
        this.x = Math.floor((BOARD_WIDTH - this.shape[0].length) / 2);
        this.y = BOARD_HEIGHT - 1;
    }

    getGhostY(board) {
        let ghostY = this.y;
        while (board.isValid(this.shape, this.x, ghostY - 1)) {
            ghostY--;
        }
        return ghostY;
    }

    rotate(board) {
        const N = this.shape.length;
        const rotated = Array(N).fill(null).map(() => Array(N).fill(0));
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                rotated[c][N - 1 - r] = this.shape[r][c];
            }
        }

        const kicks = [0, 1, -1, 2, -2];
        for (let k of kicks) {
            if (board.isValid(rotated, this.x + k, this.y)) {
                this.x += k;
                this.shape = rotated;
                return true;
            }
        }
        return false;
    }
}

export class GameEngine {
    constructor() {
        this.board = new TetrisBoard();
        this.activePiece = null;
        this.queue = [];

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('aetheris_highscore') || '0');
        this.level = 1;
        this.lines = 0;
        this.combo = 0;

        this.dropInterval = 800;
        this.lastDropTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.isPlaying = false;

        // Event hooks
        this.onPieceMove = null;
        this.onPieceRotate = null;
        this.onSoftDrop = null;
        this.onHardDrop = null;
        this.onLineClear = null;
        this.onLevelUp = null;
        this.onGameOver = null;

        this.fillQueue();
    }

    fillQueue() {
        while (this.queue.length < 5) {
            const randKey = KEYS[Math.floor(Math.random() * KEYS.length)];
            this.queue.push(randKey);
        }
    }

    getNextPieceKey() {
        return this.queue[0];
    }

    start() {
        this.board.reset();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = 0;
        this.queue = [];
        this.fillQueue();
        this.isGameOver = false;
        this.isPaused = false;
        this.isPlaying = true;
        this.dropInterval = 800;

        this.spawnNextPiece();
    }

    spawnNextPiece() {
        const nextKey = this.queue.shift();
        this.fillQueue();

        this.activePiece = new ActivePiece(nextKey);

        if (!this.board.isValid(this.activePiece.shape, this.activePiece.x, this.activePiece.y)) {
            this.triggerGameOver();
        }
    }

    moveLeft() {
        if (!this.activePiece || this.isPaused || this.isGameOver) return;
        if (this.board.isValid(this.activePiece.shape, this.activePiece.x - 1, this.activePiece.y)) {
            this.activePiece.x--;
            if (this.onPieceMove) this.onPieceMove();
        }
    }

    moveRight() {
        if (!this.activePiece || this.isPaused || this.isGameOver) return;
        if (this.board.isValid(this.activePiece.shape, this.activePiece.x + 1, this.activePiece.y)) {
            this.activePiece.x++;
            if (this.onPieceMove) this.onPieceMove();
        }
    }

    rotate() {
        if (!this.activePiece || this.isPaused || this.isGameOver) return;
        if (this.activePiece.rotate(this.board)) {
            if (this.onPieceRotate) this.onPieceRotate();
        }
    }

    softDrop() {
        if (!this.activePiece || this.isPaused || this.isGameOver) return;
        if (this.board.isValid(this.activePiece.shape, this.activePiece.x, this.activePiece.y - 1)) {
            this.activePiece.y--;
            this.score += 1;
            if (this.onSoftDrop) this.onSoftDrop();
        } else {
            this.lockAndProgress();
        }
    }

    hardDrop() {
        if (!this.activePiece || this.isPaused || this.isGameOver) return;
        let dropCount = 0;
        while (this.board.isValid(this.activePiece.shape, this.activePiece.x, this.activePiece.y - 1)) {
            this.activePiece.y--;
            dropCount++;
        }
        this.score += dropCount * 2;
        if (this.onHardDrop) this.onHardDrop();
        this.lockAndProgress();
    }

    lockAndProgress() {
        this.board.lockPiece(this.activePiece);

        const fullRows = this.board.checkLineClears();
        if (fullRows.length > 0) {
            this.board.clearRows(fullRows);
            this.lines += fullRows.length;
            this.combo++;

            const baseScores = [0, 100, 300, 500, 800];
            const lineScore = (baseScores[fullRows.length] || 1000) * this.level;
            const comboBonus = this.combo > 1 ? this.combo * 50 * this.level : 0;
            this.score += lineScore + comboBonus;

            if (this.onLineClear) this.onLineClear(fullRows.length, this.combo);

            const newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel !== this.level) {
                this.level = newLevel;
                this.dropInterval = Math.max(80, 800 - (this.level - 1) * 70);
                if (this.onLevelUp) this.onLevelUp();
            }
        } else {
            this.combo = 0;
        }

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('aetheris_highscore', this.highScore.toString());
        }

        this.spawnNextPiece();
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.isPlaying = false;
        if (this.onGameOver) this.onGameOver();
    }

    update(time) {
        if (!this.isPlaying || this.isPaused || this.isGameOver) return false;

        if (time - this.lastDropTime > this.dropInterval) {
            this.softDrop();
            this.lastDropTime = time;
            return true;
        }
        return false;
    }
}
