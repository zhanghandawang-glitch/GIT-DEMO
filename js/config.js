/* ============================================
   config.js — 常量、默认值、配置
   ============================================ */

const CONFIG = {
    // --- Canvas ---
    CANVAS_DEFAULT_W: 1920,
    CANVAS_DEFAULT_H: 1080,

    // --- Colors (Overwatch Theme) ---
    COLORS: {
        BG_DEEP: '#0A0E27',
        BG_PURPLE: '#1A0A2E',
        OW_ORANGE: '#F99E1A',
        OW_ORANGE_DARK: '#D47E0A',
        OW_BLUE: '#218FFE',
        OW_BLUE_DARK: '#1A6FCC',
        OW_WHITE: '#FAFAFA',
        OW_GRAY: '#8A8FA0',
        OW_RED: '#FF4444',
        OW_GREEN: '#44FF88',
    },

    // --- Target Sizes by Difficulty ---
    TARGET_RADIUS: {
        easy: 40,
        normal: 28,
        hard: 18,
    },

    // --- Target Health (hits to kill) ---
    TARGET_HEALTH: {
        easy: { tracking: 3, flick: 1 },
        normal: { tracking: 4, flick: 1 },
        hard: { tracking: 5, flick: 1 },
    },

    // --- Movement Speeds (px/s) ---
    TARGET_SPEED: {
        easy: { min: 80, max: 150 },
        normal: { min: 120, max: 250 },
        hard: { min: 180, max: 350 },
    },

    // --- Flick Target Lifetime (seconds) ---
    FLICK_LIFETIME: {
        easy: 3.0,
        normal: 2.0,
        hard: 1.2,
    },

    // --- Combined Mode Weights ---
    COMBINED_TRACKING_WEIGHT: 0.6,  // 60% tracking, 40% flick

    // --- Spawn Delays (seconds) ---
    SPAWN_DELAY_TRACKING: 0.35,
    SPAWN_DELAY_FLICK: 0.08,

    // --- Scoring ---
    BASE_POINTS_FLICK: 10,
    BASE_POINTS_TRACKING: 5,
    BONUS_POINTS_KILL: 25,

    COMBO_MULTIPLIER_STEP: 0.1,
    COMBO_MULTIPLIER_MAX: 3.0,

    DIFFICULTY_MULTIPLIER: {
        easy: 0.8,
        normal: 1.0,
        hard: 1.5,
    },

    // --- Combo Milestones ---
    COMBO_MILESTONES: [
        { combo: 5,  text: 'Nice!',        color: '#44FF88' },
        { combo: 10, text: 'Great!',       color: '#218FFE' },
        { combo: 20, text: 'ON FIRE!',     color: '#F99E1A' },
        { combo: 30, text: 'GODLIKE!',     color: '#FF4444' },
    ],

    // --- Shot Cooldown (ms) ---
    SHOT_COOLDOWN: 50,

    // --- Particle Pool ---
    MAX_PARTICLES: 200,

    // --- Background Hexagons ---
    BG_HEX_COUNT: 15,
    BG_STAR_COUNT: 80,

    // --- Countdown ---
    COUNTDOWN_SECONDS: 3,

    // --- Default Presets ---
    DEFAULT_PRESETS: {
        1: { name: '鼠标速度 1', dpi: 800,  inGameSens: 5.0 },
        2: { name: '鼠标速度 2', dpi: 1200, inGameSens: 5.0 },
        3: { name: '鼠标速度 3', dpi: 1600, inGameSens: 5.0 },
        4: { name: '鼠标速度 4', dpi: 2400, inGameSens: 5.0 },
        5: { name: '鼠标速度 5', dpi: 3200, inGameSens: 5.0 },
    },

    // --- Max Presets ---
    MAX_PRESETS: 10,

    // --- Default Settings ---
    DEFAULT_SETTINGS: {
        currentPreset: 1,
        bgMusicEnabled: true,
        sfxEnabled: true,
        masterVolume: 0.7,
        crosshairColor: '#ffffff',
        crosshairSize: 12,
    },

    // --- Movement Patterns for Tracking ---
    MOVEMENT_PATTERNS: ['linear', 'sinusoidal', 'circular', 'zigzag'],

    // --- Overwatch Hero Sensitivity Reference (informational) ---
    HERO_EDPI_REFERENCE: [
        { hero: '士兵76', edpi: '4000-5600', style: '追踪型' },
        { hero: '猎空', edpi: '4800-6400', style: '高速型' },
        { hero: '麦克雷', edpi: '3200-4800', style: '精准型' },
        { hero: '黑百合', edpi: '2400-4000', style: '狙击型' },
        { hero: '源氏', edpi: '4800-8000', style: '高机动型' },
        { hero: '查莉娅', edpi: '4000-5600', style: '追踪型' },
        { hero: '安娜', edpi: '3200-4800', style: '综合型' },
        { hero: '艾什', edpi: '3200-4800', style: '精准型' },
    ],

    // --- localStorage Keys ---
    STORAGE_KEY_SETTINGS: 'owAimTrainer_settings',
    STORAGE_KEY_STATS: 'owAimTrainer_stats',
    STORAGE_VERSION: 1,
};
