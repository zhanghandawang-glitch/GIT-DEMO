/* ============================================
   hud.js — DOM 覆盖层 HUD（分数、计时器、连击、命中率）
   ============================================ */

const HUD = {
    elements: {},
    lastScore: 0,
    lastCombo: 0,
    frameSkip: 0,

    /**
     * Cache DOM element references
     */
    init() {
        this.elements = {
            container: document.getElementById('hud'),
            mode: document.getElementById('hudMode'),
            difficulty: document.getElementById('hudDifficulty'),
            score: document.getElementById('hudScore'),
            combo: document.getElementById('hudCombo'),
            timer: document.getElementById('hudTimer'),
            accuracy: document.getElementById('hudAccuracy'),
            preset: document.getElementById('hudPreset'),
        };
    },

    /**
     * Show the HUD
     */
    show() {
        this.elements.container.classList.remove('hidden');
        this.updateModeLabel();
        this.updatePresetLabel();
        this.updateScore();
        this.lastScore = STATE.score;
        this.lastCombo = STATE.currentCombo;
    },

    /**
     * Hide the HUD
     */
    hide() {
        this.elements.container.classList.add('hidden');
    },

    /**
     * Update mode label
     */
    updateModeLabel() {
        const modeNames = {
            tracking: '移动靶 · TRACKING',
            flick: '瞬移靶 · FLICKING',
            combined: '结合靶 · COMBINED',
        };
        const diffNames = {
            easy: '简单',
            normal: '普通',
            hard: '困难',
        };
        this.elements.mode.textContent = modeNames[STATE.mode] || '';
        this.elements.difficulty.textContent = diffNames[STATE.difficulty] || '';
    },

    /**
     * Update score and combo display
     */
    updateScore() {
        const scoreEl = this.elements.score;
        const comboEl = this.elements.combo;

        // Animate score change
        if (STATE.score !== this.lastScore) {
            scoreEl.textContent = STATE.score.toLocaleString();
            scoreEl.style.transform = 'scale(1.15)';
            setTimeout(() => { scoreEl.style.transform = 'scale(1)'; }, 80);
            this.lastScore = STATE.score;
        }

        // Combo display
        if (STATE.currentCombo !== this.lastCombo) {
            if (STATE.currentCombo >= 3) {
                comboEl.textContent = `x${STATE.currentCombo} 连击!`;
                comboEl.classList.add('pulse');
                setTimeout(() => comboEl.classList.remove('pulse'), 300);
            } else {
                comboEl.textContent = '';
            }
            this.lastCombo = STATE.currentCombo;
        }
    },

    /**
     * Update preset label
     */
    updatePresetLabel() {
        const preset = STATE.presets[STATE.currentPreset];
        if (preset) {
            this.elements.preset.textContent = `${preset.name} | ${preset.dpi} DPI`;
        }
    },

    /**
     * Called each frame during gameplay — throttled updates
     */
    refresh() {
        this.frameSkip++;
        if (this.frameSkip % 3 !== 0) return; // Update every 3 frames

        // Timer
        if (STATE.sessionDuration > 0) {
            const remaining = Math.max(0, STATE.sessionDuration - STATE.elapsedTime);
            const seconds = Math.ceil(remaining);
            this.elements.timer.textContent = seconds;

            // Warning color < 10s
            if (seconds <= 10) {
                this.elements.timer.classList.add('warning');
            } else {
                this.elements.timer.classList.remove('warning');
            }
        } else {
            this.elements.timer.textContent = '∞';
        }

        // Accuracy
        const acc = Scoring.getAccuracy();
        this.elements.accuracy.textContent = `命中率: ${acc.toFixed(1)}%`;
    },

    // --- Menu screen stats ---
    updateMenuStats() {
        const bestScoreEl = document.getElementById('menuBestScore');
        const bestAccEl = document.getElementById('menuBestAcc');
        const totalTimeEl = document.getElementById('menuTotalTime');

        if (bestScoreEl) bestScoreEl.textContent = STATE.stats.bestScore.toLocaleString();
        if (bestAccEl) bestAccEl.textContent = STATE.stats.bestAccuracy.toFixed(1) + '%';
        if (totalTimeEl) totalTimeEl.textContent = Math.floor(STATE.stats.totalPlayTime / 60) + '分钟';
    },

    // --- Pause screen ---
    showPause() {
        document.getElementById('pauseScore').textContent = STATE.score.toLocaleString();
        document.getElementById('pauseAcc').textContent = Scoring.getAccuracy().toFixed(1) + '%';
        const remaining = Math.max(0, STATE.sessionDuration - STATE.elapsedTime);
        document.getElementById('pauseTime').textContent = Math.ceil(remaining) + 's';
        document.getElementById('pauseScreen').classList.remove('hidden');
    },

    hidePause() {
        document.getElementById('pauseScreen').classList.add('hidden');
    },

    // --- Results screen ---
    showResults() {
        const summary = Scoring.getSessionSummary();
        const isNewBest = summary.score >= STATE.stats.bestScore && STATE.stats.sessionsPlayed > 1;

        document.getElementById('resultsFinalScore').textContent = summary.score.toLocaleString();
        document.getElementById('resultsAcc').textContent = summary.accuracy.toFixed(1) + '%';
        document.getElementById('resultsHits').textContent = summary.hits;
        document.getElementById('resultsMisses').textContent = summary.misses;
        document.getElementById('resultsCombo').textContent = summary.maxCombo + 'x';

        const badge = document.getElementById('resultsNewBest');
        if (isNewBest) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        document.getElementById('resultsScreen').classList.remove('hidden');
    },

    hideResults() {
        document.getElementById('resultsScreen').classList.add('hidden');
    },

    // --- Countdown ---
    showCountdown() {
        document.getElementById('countdownScreen').classList.remove('hidden');
        document.getElementById('countdownNumber').textContent = STATE.countdownValue;
    },

    hideCountdown() {
        document.getElementById('countdownScreen').classList.add('hidden');
    },
};
