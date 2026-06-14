/* ============================================
   settings-panel.js — 右下角设置面板（DPI预设、音量、准星等）
   ============================================ */

const SettingsPanel = {
    panel: null,
    toggle: null,
    isOpen: false,

    /**
     * Initialize settings panel
     */
    init() {
        this.panel = document.getElementById('settingsPanel');
        this.toggle = document.getElementById('settingsToggle');

        // Toggle panel
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel();
        });

        // Close button
        document.getElementById('btnCloseSettings').addEventListener('click', () => {
            this.closePanel();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && e.target !== this.toggle) {
                this.closePanel();
            }
        });

        // Volume slider
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeLabel = document.getElementById('volumeLabel');
        volumeSlider.addEventListener('input', () => {
            const vol = parseInt(volumeSlider.value) / 100;
            volumeLabel.textContent = volumeSlider.value + '%';
            Audio.setVolume(vol);
            Storage.saveSettings();
        });

        // BG Music toggle
        document.getElementById('bgMusicToggle').addEventListener('change', (e) => {
            Audio.toggleMusic(e.target.checked);
            Storage.saveSettings();
        });

        // SFX toggle
        document.getElementById('sfxToggle').addEventListener('change', (e) => {
            Audio.toggleSfx(e.target.checked);
            Storage.saveSettings();
        });

        // Crosshair color
        document.getElementById('crosshairColor').addEventListener('input', (e) => {
            STATE.crosshairColor = e.target.value;
            Storage.saveSettings();
        });

        // Crosshair size
        document.getElementById('crosshairSize').addEventListener('input', (e) => {
            STATE.crosshairSize = parseInt(e.target.value);
            Storage.saveSettings();
        });

        // Add preset button
        document.getElementById('btnAddPreset').addEventListener('click', () => {
            this.addPreset();
        });

        // Reset settings
        document.getElementById('btnResetSettings').addEventListener('click', () => {
            if (confirm('确定要恢复所有设置为默认值吗？')) {
                this.resetToDefaults();
            }
        });

        // Build initial preset list
        this.renderPresets();
    },

    /**
     * Toggle panel open/close
     */
    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    },

    /**
     * Open settings panel
     */
    openPanel() {
        this.refreshUI();
        this.panel.classList.remove('hidden');
        this.isOpen = true;
    },

    /**
     * Close settings panel
     */
    closePanel() {
        this.panel.classList.add('hidden');
        this.isOpen = false;
    },

    /**
     * Refresh all UI elements to match current STATE
     */
    refreshUI() {
        document.getElementById('volumeSlider').value = Math.round(STATE.masterVolume * 100);
        document.getElementById('volumeLabel').textContent = Math.round(STATE.masterVolume * 100) + '%';
        document.getElementById('bgMusicToggle').checked = STATE.bgMusicEnabled;
        document.getElementById('sfxToggle').checked = STATE.sfxEnabled;
        document.getElementById('crosshairColor').value = STATE.crosshairColor;
        document.getElementById('crosshairSize').value = STATE.crosshairSize;

        this.renderPresets();
    },

    /**
     * Render preset list
     */
    renderPresets() {
        const list = document.getElementById('presetList');
        list.innerHTML = '';

        const presetKeys = Object.keys(STATE.presets).map(Number).sort((a, b) => a - b);

        for (const key of presetKeys) {
            const preset = STATE.presets[key];
            const row = document.createElement('div');
            row.className = 'preset-row' + (key === STATE.currentPreset ? ' active' : '');
            row.innerHTML = `
                <input type="radio" class="preset-radio" name="activePreset" value="${key}"
                    ${key === STATE.currentPreset ? 'checked' : ''} title="设为当前预设">
                <span class="preset-label">#${key}</span>
                <input type="text" class="preset-name" value="${this.escapeHtml(preset.name)}" maxlength="20">
                <span class="preset-label">DPI</span>
                <input type="number" class="preset-dpi" value="${preset.dpi}" min="100" max="32000" step="100">
                <span class="preset-label">灵敏度</span>
                <input type="number" class="preset-sens" value="${preset.inGameSens}" min="0.1" max="100" step="0.1">
                ${presetKeys.length > 1 ? '<button class="btn-delete-preset" title="删除">✕</button>' : ''}
            `;

            // Radio change
            const radio = row.querySelector('.preset-radio');
            radio.addEventListener('change', () => {
                STATE.currentPreset = key;
                HUD.updatePresetLabel();
                Storage.saveSettings();
                this.renderPresets();
            });

            // Name change
            const nameInput = row.querySelector('.preset-name');
            nameInput.addEventListener('input', () => {
                preset.name = nameInput.value || ('鼠标速度 ' + key);
                Storage.saveSettings();
                HUD.updatePresetLabel();
            });

            // DPI change
            const dpiInput = row.querySelector('.preset-dpi');
            dpiInput.addEventListener('input', () => {
                preset.dpi = parseInt(dpiInput.value) || 800;
                Storage.saveSettings();
            });

            // Sensitivity change
            const sensInput = row.querySelector('.preset-sens');
            sensInput.addEventListener('input', () => {
                preset.inGameSens = parseFloat(sensInput.value) || 5.0;
                Storage.saveSettings();
            });

            // Delete button
            const deleteBtn = row.querySelector('.btn-delete-preset');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deletePreset(key);
                });
            }

            list.appendChild(row);
        }
    },

    /**
     * Add a new preset
     */
    addPreset() {
        const keys = Object.keys(STATE.presets).map(Number);
        if (keys.length >= CONFIG.MAX_PRESETS) {
            alert('最多支持 ' + CONFIG.MAX_PRESETS + ' 个预设。');
            return;
        }

        // Find next available key
        let newKey = 1;
        while (STATE.presets[newKey]) newKey++;

        STATE.presets[newKey] = {
            name: '鼠标速度 ' + newKey,
            dpi: 800,
            inGameSens: 5.0,
        };

        Storage.saveSettings();
        this.renderPresets();
    },

    /**
     * Delete a preset
     */
    deletePreset(key) {
        const keys = Object.keys(STATE.presets).map(Number);
        if (keys.length <= 1) {
            alert('至少保留一个预设。');
            return;
        }

        delete STATE.presets[key];

        // If the current preset was deleted, switch to the first available
        if (STATE.currentPreset === key) {
            STATE.currentPreset = Object.keys(STATE.presets).map(Number)[0];
        }

        Storage.saveSettings();
        HUD.updatePresetLabel();
        this.renderPresets();
    },

    /**
     * Reset all settings to defaults
     */
    resetToDefaults() {
        Storage.resetAll();

        // Reset STATE
        initDefaultPresets();
        STATE.currentPreset = CONFIG.DEFAULT_SETTINGS.currentPreset;
        STATE.bgMusicEnabled = CONFIG.DEFAULT_SETTINGS.bgMusicEnabled;
        STATE.sfxEnabled = CONFIG.DEFAULT_SETTINGS.sfxEnabled;
        STATE.masterVolume = CONFIG.DEFAULT_SETTINGS.masterVolume;
        STATE.crosshairColor = CONFIG.DEFAULT_SETTINGS.crosshairColor;
        STATE.crosshairSize = CONFIG.DEFAULT_SETTINGS.crosshairSize;

        // Reset stats
        STATE.stats = {
            totalPlayTime: 0, totalHits: 0, totalMisses: 0, totalShots: 0,
            bestAccuracy: 0, bestScore: 0, bestCombo: 0, sessionsPlayed: 0,
            modeStats: {
                tracking: { played: 0, bestScore: 0 },
                flick: { played: 0, bestScore: 0 },
                combined: { played: 0, bestScore: 0 },
            },
        };

        // Update audio
        Audio.setVolume(STATE.masterVolume);
        Audio.toggleMusic(STATE.bgMusicEnabled);
        Audio.toggleSfx(STATE.sfxEnabled);

        this.refreshUI();
        HUD.updatePresetLabel();
        HUD.updateMenuStats();
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
};
