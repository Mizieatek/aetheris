/* ==========================================================================
   AETHERIS - Web Audio API Procedural Synthesizer & Music Engine
   ========================================================================== */

export class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxMuted = false;
        this.musicMuted = false;

        this.musicOsc1 = null;
        this.musicOsc2 = null;
        this.musicGain = null;
        this.isMusicPlaying = false;
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master compressor for clean dynamic balance
            this.masterCompressor = this.ctx.createDynamicsCompressor();
            this.masterCompressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
            this.masterCompressor.knee.setValueAtTime(30, this.ctx.currentTime);
            this.masterCompressor.ratio.setValueAtTime(12, this.ctx.currentTime);
            this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.masterCompressor.release.setValueAtTime(0.25, this.ctx.currentTime);
            this.masterCompressor.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSFX() {
        this.sfxMuted = !this.sfxMuted;
        return this.sfxMuted;
    }

    toggleMusic() {
        this.musicMuted = !this.musicMuted;
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : 0.08, this.ctx.currentTime);
        }
        return this.musicMuted;
    }

    playMove() {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.04);

        osc.connect(gain);
        gain.connect(this.masterCompressor);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    playRotate() {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.masterCompressor);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playSoftDrop() {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.03);

        osc.connect(gain);
        gain.connect(this.masterCompressor);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    playHardDrop() {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Low frequency punch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterCompressor);

        osc.start(now);
        osc.stop(now + 0.15);

        // Click noise transient
        const bufferSize = this.ctx.sampleRate * 0.02;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.02);

        noise.connect(noiseGain);
        noiseGain.connect(this.masterCompressor);

        noise.start(now);
    }

    playLineClear(lines = 1, combo = 0) {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = lines === 4 
            ? [261.63, 329.63, 392.00, 523.25, 659.25] 
            : [329.63, 392.00, 493.88];

        notes.forEach((freq, i) => {
            const startTime = now + i * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = lines === 4 ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq + (combo * 20), startTime);

            gain.gain.setValueAtTime(0.18, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

            osc.connect(gain);
            gain.connect(this.masterCompressor);

            osc.start(startTime);
            osc.stop(startTime + 0.28);
        });
    }

    playLevelUp() {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const freqs = [440, 554.37, 659.25, 880];

        freqs.forEach((freq, i) => {
            const startTime = now + i * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

            osc.connect(gain);
            gain.connect(this.masterCompressor);

            osc.start(startTime);
            osc.stop(startTime + 0.35);
        });
    }

    playPause() {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterCompressor);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playResume() {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterCompressor);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playGameOver() {
        if (this.sfxMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.9);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.9);

        osc.connect(gain);
        gain.connect(this.masterCompressor);

        osc.start(now);
        osc.stop(now + 0.9);
    }

    startMusic() {
        if (this.isMusicPlaying || !this.ctx) return;

        const now = this.ctx.currentTime;

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicMuted ? 0 : 0.08, now);

        // Ambient Pad Oscillator 1 (Root chord)
        this.musicOsc1 = this.ctx.createOscillator();
        this.musicOsc1.type = 'sine';
        this.musicOsc1.frequency.setValueAtTime(110, now); // A2

        // Ambient Pad Oscillator 2 (Fifth detuned)
        this.musicOsc2 = this.ctx.createOscillator();
        this.musicOsc2.type = 'triangle';
        this.musicOsc2.frequency.setValueAtTime(164.81, now); // E3

        // Filter for warm ambient sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);

        this.musicOsc1.connect(filter);
        this.musicOsc2.connect(filter);
        filter.connect(this.musicGain);
        this.musicGain.connect(this.masterCompressor);

        this.musicOsc1.start(now);
        this.musicOsc2.start(now);

        this.isMusicPlaying = true;
    }

    stopMusic() {
        if (!this.isMusicPlaying || !this.ctx) return;
        if (this.musicOsc1) this.musicOsc1.stop();
        if (this.musicOsc2) this.musicOsc2.stop();
        this.isMusicPlaying = false;
    }
}
