/* ============================================
   storage.js — localStorage 读写封装
   ============================================ */

const Storage = {
    /**
     * Load settings from localStorage into STATE
     */
    loadSettings() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS);
            if (!raw) return;

            const data = JSON.parse(raw);
            if (!data || data.version !== CONFIG.STORAGE_VERSION) return;

            // Load presets
            if (data.presets && typeof data.presets === 'object') {
                STATE.presets = {};
                for (const [key, val] of Object.entries(data.presets)) {
                    STATE.presets[Number(key)] = { ...val };
                }
            }

            // Load other settings
            if (data.currentPreset !== undefined) STATE.currentPreset = data.currentPreset;
            if (data.bgMusicEnabled !== undefined) STATE.bgMusicEnabled = data.bgMusicEnabled;
            if (data.sfxEnabled !== undefined) STATE.sfxEnabled = data.sfxEnabled;
            if (data.masterVolume !== undefined) STATE.masterVolume = data.masterVolume;
            if (data.crosshairColor !== undefined) STATE.crosshairColor = data.crosshairColor;
            if (data.crosshairSize !== undefined) STATE.crosshairSize = data.crosshairSize;

        } catch (e) {
            // Private browsing or corrupted data — use defaults
            console.warn('Storage: Could not load settings, using defaults.', e.message);
        }
    },

    /**
     * Save current settings from STATE to localStorage
     */
    saveSettings() {
        try {
            const data = {
                version: CONFIG.STORAGE_VERSION,
                currentPreset: STATE.currentPreset,
                presets: STATE.presets,
                bgMusicEnabled: STATE.bgMusicEnabled,
                sfxEnabled: STATE.sfxEnabled,
                masterVolume: STATE.masterVolume,
                crosshairColor: STATE.crosshairColor,
                crosshairSize: STATE.crosshairSize,
            };
            localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(data));
        } catch (e) {
            console.warn('Storage: Could not save settings.', e.message);
        }
    },

    /**
     * Load accumulated stats from localStorage into STATE
     */
    loadStats() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY_STATS);
            if (!raw) return;

            const data = JSON.parse(raw);
            if (!data) return;

            // Merge into STATE.stats, preserving structure
            if (data.totalPlayTime !== undefined) STATE.stats.totalPlayTime = data.totalPlayTime;
            if (data.totalHits !== undefined) STATE.stats.totalHits = data.totalHits;
            if (data.totalMisses !== undefined) STATE.stats.totalMisses = data.totalMisses;
            if (data.totalShots !== undefined) STATE.stats.totalShots = data.totalShots;
            if (data.bestAccuracy !== undefined) STATE.stats.bestAccuracy = data.bestAccuracy;
            if (data.bestScore !== undefined) STATE.stats.bestScore = data.bestScore;
            if (data.bestCombo !== undefined) STATE.stats.bestCombo = data.bestCombo;
            if (data.sessionsPlayed !== undefined) STATE.stats.sessionsPlayed = data.sessionsPlayed;

            if (data.modeStats) {
                for (const mode of ['tracking', 'flick', 'combined']) {
                    if (data.modeStats[mode]) {
                        STATE.stats.modeStats[mode] = { ...data.modeStats[mode] };
                    }
                }
            }
        } catch (e) {
            console.warn('Storage: Could not load stats.', e.message);
        }
    },

    /**
     * Save accumulated stats from STATE to localStorage
     */
    saveStats() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY_STATS, JSON.stringify(STATE.stats));
        } catch (e) {
            console.warn('Storage: Could not save stats.', e.message);
        }
    },

    /**
     * Reset all stored data
     */
    resetAll() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY_SETTINGS);
            localStorage.removeItem(CONFIG.STORAGE_KEY_STATS);
        } catch (e) {
            // ignore
        }
    },
};
