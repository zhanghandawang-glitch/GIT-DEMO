/* ============================================
   input.js — Pointer Lock API，鼠标输入，准星，射击处理
   ============================================ */

const Input = {
    canvas: null,

    /**
     * Initialize input handlers
     */
    init() {
        this.canvas = document.getElementById('gameCanvas');

        // Pointer Lock change
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());

        // Mouse move (with pointer lock, movementX/Y are raw unaccelerated values)
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Mouse down (shoot)
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));

        // Keyboard
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Context menu prevention
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Visibility change (auto-pause)
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    },

    /**
     * Request pointer lock
     */
    requestPointerLock() {
        this.canvas.requestPointerLock();
    },

    /**
     * Exit pointer lock
     */
    exitPointerLock() {
        if (document.pointerLockElement === this.canvas) {
            document.exitPointerLock();
        }
    },

    /**
     * Handle pointer lock state change
     */
    onPointerLockChange() {
        const wasLocked = STATE.isPointerLocked;
        STATE.isPointerLocked = document.pointerLockElement === this.canvas;

        if (STATE.isPointerLocked) {
            // Locked — game is active
            document.body.style.cursor = 'none';
        } else {
            document.body.style.cursor = 'default';
            // If we were playing and lost lock (not by our choice), pause
            if (wasLocked && STATE.screen === 'playing') {
                App.pauseGame();
            }
        }
    },

    /**
     * Handle mouse movement
     */
    onMouseMove(e) {
        if (!STATE.isPointerLocked) {
            // Track position for menu (non-locked mode)
            STATE.mouseX = e.clientX;
            STATE.mouseY = e.clientY;
            STATE.mouseDX = 0;
            STATE.mouseDY = 0;
            return;
        }

        // Use raw movement delta from pointer lock
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;

        STATE.mouseDX = dx;
        STATE.mouseDY = dy;
        STATE.mouseX += dx;
        STATE.mouseY += dy;

        // Clamp to canvas bounds
        STATE.mouseX = Math.max(0, Math.min(STATE.canvasWidth, STATE.mouseX));
        STATE.mouseY = Math.max(0, Math.min(STATE.canvasHeight, STATE.mouseY));
    },

    /**
     * Handle mouse click (shoot)
     */
    onMouseDown(e) {
        if (e.button !== 0) return; // Left click only

        // Audio init on first click
        if (!Audio.initialized) {
            Audio.init();
        }

        if (STATE.screen === 'playing' && STATE.isPointerLocked) {
            this.fireShot();
        }
    },

    /**
     * Process a shot at current mouse position
     */
    fireShot() {
        const hits = TargetManager.findHits(STATE.mouseX, STATE.mouseY);

        if (hits.length > 0) {
            // Hit the closest target
            const result = Scoring.registerHit(hits[0].target);

            if (result && result.targetDestroyed) {
                Spawner.onTargetDestroyed();
            }
        } else {
            // Miss
            Scoring.registerMiss(STATE.mouseX, STATE.mouseY);
        }
    },

    /**
     * Handle keyboard input
     */
    onKeyDown(e) {
        switch (e.key) {
            case 'Escape':
                if (STATE.screen === 'playing') {
                    App.pauseGame();
                } else if (STATE.screen === 'paused') {
                    App.resumeGame();
                }
                break;

            case 'r':
            case 'R':
                if (STATE.screen === 'playing') {
                    App.restartSession();
                }
                break;

            case 'm':
            case 'M':
                if (STATE.screen === 'paused' || STATE.screen === 'results') {
                    App.goToMenu();
                }
                break;

            case '1': case '2': case '3': case '4': case '5':
                if (STATE.screen === 'playing' || STATE.screen === 'menu') {
                    const presetNum = parseInt(e.key);
                    if (STATE.presets[presetNum]) {
                        STATE.currentPreset = presetNum;
                        HUD.updatePresetLabel();
                        Storage.saveSettings();
                        Audio.playUIClick();
                    }
                }
                break;

            default:
                break;
        }
    },

    /**
     * Handle tab visibility change
     */
    onVisibilityChange() {
        if (document.hidden && STATE.screen === 'playing') {
            App.pauseGame();
        }
    },
};
