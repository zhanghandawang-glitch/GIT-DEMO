/* ============================================
   state.js — 集中式全局状态
   所有模块通过 STATE 对象共享数据
   ============================================ */

const STATE = {
    // --- Application ---
    screen: 'menu',           // 'menu' | 'countdown' | 'playing' | 'paused' | 'results'
    mode: 'tracking',         // 'tracking' | 'flick' | 'combined'
    difficulty: 'normal',     // 'easy' | 'normal' | 'hard'
    sessionDuration: 60,      // seconds, 0 = infinite
    prevScreen: 'menu',       // for returning from pause

    // --- Session ---
    elapsedTime: 0,
    sessionActive: false,
    countdownValue: 3,
    countdownTimer: 0,

    // --- Mouse / Input ---
    mouseX: 0,
    mouseY: 0,
    mouseDX: 0,
    mouseDY: 0,
    isPointerLocked: false,
    canvasWidth: 1920,
    canvasHeight: 1080,

    // --- Targets ---
    targets: [],
    maxConcurrentTargets: 1,
    spawnQueue: [],           // pending target spawns

    // --- Scoring ---
    score: 0,
    hits: 0,
    misses: 0,
    totalShots: 0,
    currentCombo: 0,
    maxCombo: 0,
    kills: 0,
    lastShotTime: 0,
    lastComboMilestone: 0,

    // --- Particles ---
    particles: [],

    // --- Settings (loaded from storage) ---
    currentPreset: 1,
    presets: {},
    bgMusicEnabled: true,
    sfxEnabled: true,
    masterVolume: 0.7,
    crosshairColor: '#ffffff',
    crosshairSize: 12,

    // --- Persistent Statistics ---
    stats: {
        totalPlayTime: 0,
        totalHits: 0,
        totalMisses: 0,
        totalShots: 0,
        bestAccuracy: 0,
        bestScore: 0,
        bestCombo: 0,
        sessionsPlayed: 0,
        modeStats: {
            tracking: { played: 0, bestScore: 0 },
            flick: { played: 0, bestScore: 0 },
            combined: { played: 0, bestScore: 0 },
        },
    },

    // --- Session Snapshot (for results comparison) ---
    sessionStartStats: null,
};

// Deep clone default presets into state
function initDefaultPresets() {
    STATE.presets = {};
    for (const [key, val] of Object.entries(CONFIG.DEFAULT_PRESETS)) {
        STATE.presets[Number(key)] = { ...val };
    }
}

// Initialize with defaults before storage loads
initDefaultPresets();
STATE.currentPreset = CONFIG.DEFAULT_SETTINGS.currentPreset;
STATE.bgMusicEnabled = CONFIG.DEFAULT_SETTINGS.bgMusicEnabled;
STATE.sfxEnabled = CONFIG.DEFAULT_SETTINGS.sfxEnabled;
STATE.masterVolume = CONFIG.DEFAULT_SETTINGS.masterVolume;
STATE.crosshairColor = CONFIG.DEFAULT_SETTINGS.crosshairColor;
STATE.crosshairSize = CONFIG.DEFAULT_SETTINGS.crosshairSize;
