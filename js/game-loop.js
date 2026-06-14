/* ============================================
   game-loop.js — requestAnimationFrame 主循环
   ============================================ */

const GameLoop = {
    lastTime: 0,
    fps: 0,
    fpsAccum: 0,
    fpsCount: 0,
    running: false,
    rafId: null,

    /**
     * Start the game loop
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame((t) => this.tick(t));
    },

    /**
     * Stop the game loop
     */
    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    },

    /**
     * Single frame tick
     */
    tick(now) {
        if (!this.running) return;

        // Calculate delta time (capped to prevent spiral of death)
        let dt = (now - this.lastTime) / 1000;
        if (dt > 0.1) dt = 0.1;  // Cap at 100ms
        if (dt <= 0) dt = 0.016; // Fallback for time jumps

        this.lastTime = now;

        // FPS counter
        this.fpsAccum += dt;
        this.fpsCount++;
        if (this.fpsAccum >= 1.0) {
            this.fps = Math.round(this.fpsCount / this.fpsAccum);
            this.fpsAccum = 0;
            this.fpsCount = 0;
        }

        // Update
        this.update(dt);

        // Render
        this.render();

        // Next frame
        this.rafId = requestAnimationFrame((t) => this.tick(t));
    },

    /**
     * Update game logic
     */
    update(dt) {
        // Always animate background
        Background.update(dt);

        // Game-specific updates
        switch (STATE.screen) {
            case 'playing':
                this.updatePlaying(dt);
                break;
            case 'countdown':
                this.updateCountdown(dt);
                break;
            default:
                break;
        }
    },

    /**
     * Update during active gameplay
     */
    updatePlaying(dt) {
        // Timer
        if (STATE.sessionDuration > 0) {
            STATE.elapsedTime += dt;
            if (STATE.elapsedTime >= STATE.sessionDuration) {
                STATE.elapsedTime = STATE.sessionDuration;
                App.endSession();
                return;
            }
        }

        // Targets
        TargetManager.updateAll(dt);

        // Spawner
        Spawner.update(dt);

        // Particles
        Effects.updateAll(dt);

        // HUD refresh (throttled to every-other-frame equivalent)
        HUD.refresh();
    },

    /**
     * Update countdown phase
     */
    updateCountdown(dt) {
        STATE.countdownTimer -= dt;
        if (STATE.countdownTimer <= 0) {
            App.startPlaying();
        } else {
            const newValue = Math.ceil(STATE.countdownTimer);
            if (newValue !== STATE.countdownValue && newValue > 0) {
                STATE.countdownValue = newValue;
                document.getElementById('countdownNumber').textContent = newValue;
                Audio.playCountdown();
            } else if (newValue === 0 && STATE.countdownValue === 1) {
                STATE.countdownValue = 0;
                document.getElementById('countdownNumber').textContent = 'GO!';
                Audio.playGo();
            }
        }
    },

    /**
     * Render the current frame
     */
    render() {
        const ctx = Canvas.getCtx();
        Canvas.clear();

        // Background (always visible)
        Background.render(ctx);

        // Game elements during play
        if (STATE.screen === 'playing' || STATE.screen === 'paused') {
            // Target glows
            for (const target of STATE.targets) {
                if (target.state === 'active' || target.state === 'dying') {
                    target.renderShadow(ctx);
                }
            }

            // Targets
            for (const target of STATE.targets) {
                if (target.state !== 'dead') {
                    target.render(ctx);
                }
            }

            // Particles
            Effects.renderAll(ctx);
        }

        // Crosshair (during play, regardless of pause)
        if ((STATE.screen === 'playing' || STATE.screen === 'paused')
            && STATE.isPointerLocked) {
            Canvas.drawCrosshair(STATE.mouseX, STATE.mouseY);
        }
    },

    /**
     * Get current FPS
     */
    getFps() {
        return this.fps;
    },
};
