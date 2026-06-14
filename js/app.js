/* ============================================
   app.js — 应用启动入口，全局事件绑定，会话生命周期
   ============================================ */

const App = {
    /**
     * Initialize the application
     */
    init() {
        // Load persisted data
        Storage.loadSettings();
        Storage.loadStats();

        // Initialize sub-systems
        Canvas.init();
        Background.init();
        Input.init();
        HUD.init();
        ModeSelector.init();
        SettingsPanel.init();
        GameLoop.start();
        Audio.init();

        // Wire result/ pause buttons
        document.getElementById('btnResume').addEventListener('click', () => this.resumeGame());
        document.getElementById('btnQuit').addEventListener('click', () => this.goToMenu());
        document.getElementById('btnPlayAgain').addEventListener('click', () => this.playAgain());
        document.getElementById('btnChangeMode').addEventListener('click', () => this.goToMenu());

        // Update menu with loaded stats
        HUD.updateMenuStats();

        // Start in menu
        this.goToMenu();
    },

    /**
     * Go to menu screen
     */
    goToMenu() {
        STATE.screen = 'menu';
        STATE.prevScreen = 'menu';

        // Release pointer lock
        Input.exitPointerLock();
        STATE.isPointerLocked = false;
        document.body.style.cursor = 'default';

        // Clear game state
        TargetManager.clearAll();
        Effects.clearAll();
        Spawner.reset();
        Scoring.resetSession();

        // Show/hide UI
        ModeSelector.showMenu();
        HUD.hide();
        HUD.hidePause();
        HUD.hideCountdown();
        HUD.hideResults();

        // Audio — start menu music if enabled
        if (STATE.bgMusicEnabled) {
            Audio.stopMusic();
            Audio.startMenuMusic();
        }
    },

    /**
     * Start a new session
     */
    startSession() {
        Audio.resume();
        Audio.stopMusic(); // Stop menu music

        // Hide menu
        ModeSelector.hideMenu();

        // Reset session state
        Scoring.resetSession();
        TargetManager.clearAll();
        Effects.clearAll();
        Spawner.reset();

        // Save stats snapshot for results comparison
        STATE.sessionStartStats = { ...STATE.stats };

        // Start countdown
        STATE.screen = 'countdown';
        STATE.countdownValue = CONFIG.COUNTDOWN_SECONDS;
        STATE.countdownTimer = CONFIG.COUNTDOWN_SECONDS;
        STATE.elapsedTime = 0;
        STATE.sessionActive = false;

        // Show countdown
        HUD.showCountdown();
        document.getElementById('countdownNumber').textContent = STATE.countdownValue;

        // Position mouse at center
        STATE.mouseX = STATE.canvasWidth / 2;
        STATE.mouseY = STATE.canvasHeight / 2;

        // Request pointer lock NOW (must be synchronous from user gesture)
        Input.requestPointerLock();

        Audio.playCountdown();
    },

    /**
     * Start actual gameplay (after countdown)
     */
    startPlaying() {
        STATE.screen = 'playing';
        STATE.sessionActive = true;

        HUD.hideCountdown();
        HUD.show();

        // Initialize spawner for this mode
        Spawner.init();

        Audio.playSessionStart();
    },

    /**
     * Pause the game
     */
    pauseGame() {
        if (STATE.screen !== 'playing') return;
        STATE.prevScreen = 'playing';
        STATE.screen = 'paused';
        STATE.sessionActive = false;

        Input.exitPointerLock();
        HUD.showPause();
        Audio.playUIClick();
    },

    /**
     * Resume the game
     */
    resumeGame() {
        if (STATE.screen !== 'paused') return;
        STATE.screen = 'playing';
        STATE.sessionActive = true;

        HUD.hidePause();
        Input.requestPointerLock();
        Audio.playUIClick();
    },

    /**
     * Restart current session
     */
    restartSession() {
        const mode = STATE.mode;
        const difficulty = STATE.difficulty;
        const duration = STATE.sessionDuration;

        STATE.mode = mode;
        STATE.difficulty = difficulty;
        STATE.sessionDuration = duration;

        Scoring.resetSession();
        TargetManager.clearAll();
        Effects.clearAll();
        Spawner.reset();

        STATE.screen = 'countdown';
        STATE.countdownValue = CONFIG.COUNTDOWN_SECONDS;
        STATE.countdownTimer = CONFIG.COUNTDOWN_SECONDS;
        STATE.elapsedTime = 0;

        HUD.hidePause();
        HUD.showCountdown();
        document.getElementById('countdownNumber').textContent = STATE.countdownValue;

        Audio.playCountdown();
    },

    /**
     * End the session (timer expired or manual)
     */
    endSession() {
        STATE.screen = 'results';
        STATE.sessionActive = false;

        Input.exitPointerLock();
        document.body.style.cursor = 'default';

        // Save stats
        Scoring.saveSessionStats();

        // Clean up game objects
        TargetManager.clearAll();
        Effects.clearAll();

        // Show results
        HUD.hide();
        HUD.showResults();
        HUD.updateMenuStats();

        // Resume menu music
        if (STATE.bgMusicEnabled) {
            Audio.startMenuMusic();
        }
    },

    /**
     * Play again with same settings
     */
    playAgain() {
        HUD.hideResults();
        this.startSession();
    },
};

// --- Bootstrap ---
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
