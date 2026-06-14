/* ============================================
   audio.js — Web Audio API 音频管理
   支持外部音频文件 + 合成音效兜底
   ============================================ */

const Audio = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    initialized: false,
    musicPlaying: false,
    musicNodes: [],    // for stopping synthetic music
    musicInterval: null,

    /**
     * Initialize AudioContext on first user gesture
     */
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = STATE.masterVolume;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = STATE.bgMusicEnabled ? 0.25 : 0;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = STATE.sfxEnabled ? 0.6 : 0;
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('Audio: Web Audio API not available.', e.message);
        }
    },

    /**
     * Resume audio context (needed after browser suspension)
     */
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    /**
     * Set master volume
     */
    setVolume(vol) {
        STATE.masterVolume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(STATE.masterVolume, this.ctx.currentTime, 0.05);
        }
    },

    /**
     * Toggle background music on/off
     */
    toggleMusic(enabled) {
        STATE.bgMusicEnabled = enabled;
        if (this.musicGain) {
            this.musicGain.gain.setTargetAtTime(enabled ? 0.25 : 0, this.ctx.currentTime, 0.1);
        }
        if (!enabled) {
            this.stopMusic();
        } else if (STATE.screen === 'menu') {
            this.startMenuMusic();
        }
    },

    /**
     * Toggle sound effects on/off
     */
    toggleSfx(enabled) {
        STATE.sfxEnabled = enabled;
        if (this.sfxGain) {
            this.sfxGain.gain.setTargetAtTime(enabled ? 0.6 : 0, this.ctx.currentTime, 0.05);
        }
    },

    // ============ Background Music (Synthetic Ambient Pad) ============

    /**
     * Start menu background music — synthetic ambient pad
     * Chord progression: Am - F - C - G (Overwatch menu feel)
     */
    startMenuMusic() {
        if (!this.initialized || this.musicPlaying) return;
        this.musicPlaying = true;

        const now = this.ctx.currentTime;
        const chords = [
            [220.00, 261.63, 329.63, 440.00],  // Am
            [174.61, 220.00, 261.63, 349.23],  // F
            [130.81, 164.81, 196.00, 261.63],  // C
            [196.00, 246.94, 293.66, 392.00],  // G
        ];
        const chordDuration = 8; // seconds per chord

        const playChord = (index, startTime) => {
            const freqs = chords[index % chords.length];
            freqs.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.06, startTime + 1);
                gain.gain.setValueAtTime(0.06, startTime + chordDuration - 1);
                gain.gain.linearRampToValueAtTime(0, startTime + chordDuration);
                osc.connect(gain);
                gain.connect(this.musicGain);
                osc.start(startTime);
                osc.stop(startTime + chordDuration);
                this.musicNodes.push(osc);
            });

            // Add a subtle pad filter sweep
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, startTime);
            filter.frequency.linearRampToValueAtTime(800, startTime + chordDuration * 0.6);
            filter.frequency.linearRampToValueAtTime(400, startTime + chordDuration);
        };

        // Play first 4 chords
        for (let i = 0; i < 4; i++) {
            playChord(i, now + i * chordDuration);
        }

        // Loop
        this.musicInterval = setInterval(() => {
            if (!this.musicPlaying) {
                clearInterval(this.musicInterval);
                this.musicInterval = null;
                return;
            }
            const t = this.ctx.currentTime;
            for (let i = 0; i < 4; i++) {
                playChord(i, t + i * chordDuration);
            }
        }, chordDuration * 4 * 1000);
    },

    /**
     * Stop menu background music
     */
    stopMusic() {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        // Stop all active music oscillators
        this.musicNodes.forEach(osc => {
            try { osc.stop(); } catch(e) { /* already stopped */ }
        });
        this.musicNodes = [];
    },

    // ============ Sound Effects (Synthesized) ============

    /**
     * Play a short synthesized tone
     */
    playTone(freq, type, duration, gainValue = 0.3, dest = null) {
        if (!this.initialized || !STATE.sfxEnabled) return;
        const destGain = dest || this.sfxGain;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(gainValue, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(destGain);
        osc.start(now);
        osc.stop(now + duration);
    },

    /**
     * Hit sound effect
     */
    playHit() {
        if (!this.initialized || !STATE.sfxEnabled) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 2;
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
    },

    /**
     * Miss sound effect
     */
    playMiss() {
        this.playTone(200, 'square', 0.1, 0.15);
    },

    /**
     * Target kill sound
     */
    playKill() {
        if (!this.initialized || !STATE.sfxEnabled) return;
        const now = this.ctx.currentTime;
        [600, 900, 1200].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, now + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.04);
            osc.stop(now + i * 0.04 + 0.12);
        });
    },

    /**
     * Combo milestone sound
     */
    playComboMilestone(comboLevel) {
        if (!this.initialized || !STATE.sfxEnabled) return;
        const now = this.ctx.currentTime;
        // Ascending notes based on combo level
        const baseFreq = 400 + comboLevel * 100;
        const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.2);
        });
    },

    /**
     * Countdown beep
     */
    playCountdown() {
        this.playTone(440, 'sine', 0.15, 0.4);
    },

    /**
     * Countdown final go
     */
    playGo() {
        this.playTone(880, 'sine', 0.3, 0.5);
    },

    /**
     * Session start fanfare
     */
    playSessionStart() {
        if (!this.initialized || !STATE.sfxEnabled) return;
        const now = this.ctx.currentTime;
        [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    },

    /**
     * UI click sound
     */
    playUIClick() {
        this.playTone(600, 'sine', 0.04, 0.1);
    },

    /**
     * Cleanup
     */
    destroy() {
        this.stopMusic();
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
        this.initialized = false;
    },
};
