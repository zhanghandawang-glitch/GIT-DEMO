/* ============================================
   spawner.js — 目标生成逻辑（三种模式）
   ============================================ */

const Spawner = {
    spawnTimer: 0,
    spawnDelay: 0,
    spawnHistory: [],   // last 8 spawn types for combined mode
    pendingSpawn: null, // queued spawn info

    /**
     * Initialize spawner for a new session
     */
    init() {
        this.spawnTimer = 0;
        this.spawnDelay = 0;
        this.spawnHistory = [];
        this.pendingSpawn = null;

        // Set concurrent targets based on mode
        switch (STATE.mode) {
            case 'tracking':
                STATE.maxConcurrentTargets = 1;
                break;
            case 'flick':
                STATE.maxConcurrentTargets = 1;
                break;
            case 'combined':
                STATE.maxConcurrentTargets = STATE.difficulty === 'hard' ? 2 : 1;
                break;
        }

        // Spawn first target immediately
        this.spawnTarget();
    },

    /**
     * Update spawner each frame
     */
    update(dt) {
        // Count active/ spawning targets
        const activeCount = STATE.targets.filter(
            t => t.state === 'active' || t.state === 'spawning'
        ).length;

        // Check if we can spawn
        if (activeCount < STATE.maxConcurrentTargets) {
            if (this.pendingSpawn) {
                this.spawnTimer -= dt;
                if (this.spawnTimer <= 0) {
                    this.executePendingSpawn();
                }
            } else if (activeCount === 0) {
                // No targets on screen — spawn one
                this.spawnTarget();
            }
        }
    },

    /**
     * Queue a target spawn with delay
     */
    queueSpawn(delay) {
        this.pendingSpawn = {
            mode: STATE.mode,
            difficulty: STATE.difficulty,
        };
        this.spawnTimer = delay;
    },

    /**
     * Spawn a target now
     */
    spawnTarget() {
        const pos = TargetManager.getSpawnPosition();

        switch (STATE.mode) {
            case 'tracking':
                TargetManager.createTarget(pos.x, pos.y, 'tracking', STATE.difficulty);
                break;
            case 'flick':
                TargetManager.createFlickTarget(pos.x, pos.y, STATE.difficulty);
                break;
            case 'combined': {
                // Choose type based on history
                const type = this.chooseCombinedType();
                this.spawnHistory.push(type);
                if (this.spawnHistory.length > 8) this.spawnHistory.shift();

                if (type === 'flick') {
                    TargetManager.createFlickTarget(pos.x, pos.y, STATE.difficulty);
                } else {
                    TargetManager.createTarget(pos.x, pos.y, 'combined', STATE.difficulty);
                }
                break;
            }
        }
    },

    /**
     * Execute a pending spawn
     */
    executePendingSpawn() {
        this.pendingSpawn = null;
        this.spawnTimer = 0;
        this.spawnTarget();
    },

    /**
     * Handle target destroyed event
     */
    onTargetDestroyed() {
        const delay = STATE.mode === 'flick'
            ? CONFIG.SPAWN_DELAY_FLICK
            : CONFIG.SPAWN_DELAY_TRACKING;

        this.queueSpawn(delay);
    },

    /**
     * Choose next target type for combined mode
     * Prevents long streaks of the same type
     */
    chooseCombinedType() {
        const recent = this.spawnHistory.slice(-5);
        const trackingCount = recent.filter(t => t === 'tracking').length;

        if (trackingCount >= 4) return 'flick';
        if (trackingCount <= 1 && recent.length >= 4) return 'tracking';

        return Math.random() < CONFIG.COMBINED_TRACKING_WEIGHT ? 'tracking' : 'flick';
    },

    /**
     * Reset spawner state
     */
    reset() {
        this.spawnTimer = 0;
        this.spawnDelay = 0;
        this.spawnHistory = [];
        this.pendingSpawn = null;
    },
};
