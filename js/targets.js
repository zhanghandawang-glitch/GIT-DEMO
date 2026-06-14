/* ============================================
   targets.js — Target 类：运动、渲染、命中检测、死亡动画
   ============================================ */

class Target {
    constructor(x, y, radius, health, mode, difficulty) {
        // Position
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.health = health;
        this.maxHealth = health;

        // Mode & difficulty
        this.mode = mode;         // 'tracking' | 'flick' | 'combined'
        this.difficulty = difficulty;

        // State
        this.state = 'spawning';  // 'spawning' | 'active' | 'dying' | 'dead'
        this.alpha = 0;
        this.spawnAnim = 0;       // 0→1 grow animation

        // Movement (for tracking mode)
        this.speedX = 0;
        this.speedY = 0;
        this.movementPattern = 'linear';
        this.movementTimer = 0;
        this.movementDirChange = 0;
        this.centerX = x;
        this.centerY = y;
        this.movementAmplitude = 0;
        this.movementFrequency = 0;
        this.angularSpeed = 0;
        this.movementAngle = 0;
        this.circularRadius = 0;

        // Flick mode lifetime
        this.lifetime = 0;
        this.maxLifetime = 0;

        // Health bar
        this.healthBarAngle = Math.PI * 2;

        // Death animation
        this.deathTimer = 0;
        this.deathDuration = 0.35;

        // Points
        this.pointsValue = mode === 'flick' ? CONFIG.BASE_POINTS_FLICK : CONFIG.BASE_POINTS_TRACKING;

        // Spawn animation
        this.spawnAnimDuration = 0.2;
    }

    /**
     * Initialize movement pattern for tracking targets
     */
    initMovement(canvasW, canvasH) {
        const spd = CONFIG.TARGET_SPEED[this.difficulty];
        const speed = spd.min + Math.random() * (spd.max - spd.min);

        // Pick random pattern
        const patterns = CONFIG.MOVEMENT_PATTERNS;
        this.movementPattern = patterns[Math.floor(Math.random() * patterns.length)];

        switch (this.movementPattern) {
            case 'linear': {
                const angle = Math.random() * Math.PI * 2;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
                break;
            }
            case 'sinusoidal': {
                const angle = Math.random() * Math.PI * 2;
                this.speedX = Math.cos(angle) * speed * 0.7;
                this.speedY = Math.sin(angle) * speed * 0.7;
                this.centerX = this.x;
                this.centerY = this.y;
                this.movementAmplitude = 60 + Math.random() * 120;
                this.movementFrequency = 1.5 + Math.random() * 2.5;
                break;
            }
            case 'circular': {
                this.centerX = this.x;
                this.centerY = this.y;
                this.circularRadius = 60 + Math.random() * 140;
                this.angularSpeed = (1.0 + Math.random() * 2.0) * (Math.random() > 0.5 ? 1 : -1);
                this.movementAngle = Math.random() * Math.PI * 2;
                break;
            }
            case 'zigzag': {
                const angle = Math.random() * Math.PI * 2;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
                this.movementDirChange = 0.4 + Math.random() * 0.6;
                break;
            }
        }

        // For flick mode, set lifetime
        if (this.mode === 'flick' || (this.mode === 'combined' && Math.random() < 0.5)) {
            this.maxLifetime = CONFIG.FLICK_LIFETIME[this.difficulty];
            this.lifetime = this.maxLifetime;
        }
    }

    /**
     * Update target state
     */
    update(dt) {
        // Spawn animation
        if (this.state === 'spawning') {
            this.spawnAnim += dt / this.spawnAnimDuration;
            this.alpha = Math.min(1, this.spawnAnim);
            if (this.spawnAnim >= 1) {
                this.state = 'active';
                this.alpha = 1;
            }
        }

        // Active movement
        if (this.state === 'active') {
            this.updateMovement(dt);

            // Flick lifetime
            if (this.maxLifetime > 0) {
                this.lifetime -= dt;
                if (this.lifetime <= 0) {
                    this.startDeath();
                }
            }
        }

        // Death animation
        if (this.state === 'dying') {
            this.deathTimer += dt;
            this.alpha = 1 - (this.deathTimer / this.deathDuration);
            this.radius += dt * 30; // expand slightly
            if (this.deathTimer >= this.deathDuration) {
                this.state = 'dead';
                this.alpha = 0;
            }
        }
    }

    /**
     * Update movement based on pattern
     */
    updateMovement(dt) {
        if (this.mode === 'flick') return; // Flick targets don't move

        const w = STATE.canvasWidth;
        const h = STATE.canvasHeight;
        this.movementTimer += dt;

        switch (this.movementPattern) {
            case 'linear': {
                this.x += this.speedX * dt;
                this.y += this.speedY * dt;
                // Bounce off edges
                this.bounceEdges(w, h);
                break;
            }
            case 'sinusoidal': {
                this.centerX += this.speedX * dt;
                this.centerY += this.speedY * dt;
                // Bounce center
                this.bounceCenter(w, h);

                // Apply sinusoidal offset perpendicular to movement
                const moveAngle = Math.atan2(this.speedY, this.speedX);
                const perpAngle = moveAngle + Math.PI / 2;
                const offset = this.movementAmplitude * Math.sin(this.movementTimer * this.movementFrequency);
                this.x = this.centerX + Math.cos(perpAngle) * offset;
                this.y = this.centerY + Math.sin(perpAngle) * offset;
                break;
            }
            case 'circular': {
                this.movementAngle += this.angularSpeed * dt;
                this.x = this.centerX + this.circularRadius * Math.cos(this.movementAngle);
                this.y = this.centerY + this.circularRadius * Math.sin(this.movementAngle);
                // Move center to keep target on screen
                if (this.x < this.radius) this.centerX += dt * 50;
                if (this.x > w - this.radius) this.centerX -= dt * 50;
                if (this.y < this.radius) this.centerY += dt * 50;
                if (this.y > h - this.radius) this.centerY -= dt * 50;
                break;
            }
            case 'zigzag': {
                this.x += this.speedX * dt;
                this.y += this.speedY * dt;
                this.movementDirChange -= dt;
                if (this.movementDirChange <= 0) {
                    // Change direction with a random perturbation
                    const currentAngle = Math.atan2(this.speedY, this.speedX);
                    const newAngle = currentAngle + (Math.random() - 0.5) * Math.PI * 0.8;
                    const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
                    this.speedX = Math.cos(newAngle) * speed;
                    this.speedY = Math.sin(newAngle) * speed;
                    this.movementDirChange = 0.3 + Math.random() * 0.7;
                }
                this.bounceEdges(w, h);
                break;
            }
        }
    }

    /**
     * Bounce off canvas edges
     */
    bounceEdges(w, h) {
        const margin = this.radius + 4;
        if (this.x < margin) { this.x = margin; this.speedX = Math.abs(this.speedX); }
        if (this.x > w - margin) { this.x = w - margin; this.speedX = -Math.abs(this.speedX); }
        if (this.y < margin) { this.y = margin; this.speedY = Math.abs(this.speedY); }
        if (this.y > h - margin) { this.y = h - margin; this.speedY = -Math.abs(this.speedY); }
    }

    /**
     * Bounce center point (for sinusoidal)
     */
    bounceCenter(w, h) {
        const margin = this.radius + this.movementAmplitude + 10;
        if (this.centerX < margin) { this.centerX = margin; this.speedX = Math.abs(this.speedX); }
        if (this.centerX > w - margin) { this.centerX = w - margin; this.speedX = -Math.abs(this.speedX); }
        if (this.centerY < margin) { this.centerY = margin; this.speedY = Math.abs(this.speedY); }
        if (this.centerY > h - margin) { this.centerY = h - margin; this.speedY = -Math.abs(this.speedY); }
    }

    /**
     * Hit test: is point (px, py) inside target?
     */
    hitTest(px, py) {
        if (this.state !== 'active' && this.state !== 'spawning') return false;
        const dx = px - this.x;
        const dy = py - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }

    /**
     * Take damage
     * @returns {boolean} true if target is still alive, false if destroyed
     */
    takeDamage(amount = 1) {
        this.health -= amount;
        // Update health bar angle
        this.healthBarAngle = (this.health / this.maxHealth) * Math.PI * 2;
        if (this.health <= 0) {
            this.health = 0;
            this.healthBarAngle = 0;
            this.startDeath();
            return false; // destroyed
        }
        return true; // still alive
    }

    /**
     * Start death animation
     */
    startDeath() {
        if (this.state === 'dying' || this.state === 'dead') return;
        this.state = 'dying';
        this.deathTimer = 0;
    }

    /**
     * Render target shadow/glow
     */
    renderShadow(ctx) {
        ctx.save();
        const glowRadius = this.radius * 1.6;
        const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.5, this.x, this.y, glowRadius);
        gradient.addColorStop(0, `rgba(249, 158, 26, ${0.25 * this.alpha})`);
        gradient.addColorStop(0.5, `rgba(249, 158, 26, ${0.08 * this.alpha})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Render target
     */
    render(ctx) {
        if (this.state === 'dead') return;
        ctx.save();
        ctx.globalAlpha = this.alpha;

        // Outer glow ring
        const glowGrad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.7, this.x, this.y, this.radius * 1.15);
        glowGrad.addColorStop(0, 'rgba(33, 143, 254, 0)');
        glowGrad.addColorStop(1, `rgba(33, 143, 254, ${0.3})`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.15, 0, Math.PI * 2);
        ctx.fill();

        // Target body (white fill)
        const bodyGrad = ctx.createRadialGradient(this.x - this.radius * 0.2, this.y - this.radius * 0.2, this.radius * 0.1, this.x, this.y, this.radius);
        bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        bodyGrad.addColorStop(0.85, 'rgba(240, 240, 245, 0.6)');
        bodyGrad.addColorStop(1, 'rgba(200, 200, 220, 0.1)');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring
        ctx.strokeStyle = 'rgba(33, 143, 254, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        // Outer ring (main — Overwatch orange)
        ctx.strokeStyle = `rgba(249, 158, 26, ${0.85})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(249, 158, 26, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Health bar ring (only for tracking/combined mode targets with multi-hit)
        if (this.maxHealth > 1 && this.state === 'active') {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = this.health <= this.maxHealth * 0.3
                ? 'rgba(255, 68, 68, 0.8)'
                : 'rgba(68, 255, 136, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, -Math.PI / 2, -Math.PI / 2 + this.healthBarAngle);
            ctx.stroke();
        }

        // Lifetime bar (for flick targets)
        if (this.maxLifetime > 0 && this.state === 'active') {
            const lifeRatio = this.lifetime / this.maxLifetime;
            ctx.shadowBlur = 0;
            ctx.strokeStyle = lifeRatio < 0.3
                ? 'rgba(255, 68, 68, 0.7)'
                : 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 8, -Math.PI / 2, -Math.PI / 2 + lifeRatio * Math.PI * 2);
            ctx.stroke();
        }

        // Crosshair inside target center
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y);
        ctx.lineTo(this.x + 5, this.y);
        ctx.moveTo(this.x, this.y - 5);
        ctx.lineTo(this.x, this.y + 5);
        ctx.stroke();

        ctx.restore();
    }
}

/* ============================================
   TargetManager — 目标集合管理
   ============================================ */

const TargetManager = {
    /**
     * Create targets for tracking or flick modes
     */
    createTarget(x, y, mode, difficulty) {
        const radius = CONFIG.TARGET_RADIUS[difficulty];
        const health = CONFIG.TARGET_HEALTH[difficulty][mode === 'flick' ? 'flick' : 'tracking'];
        // For combined, determine actual behavior by mode flag
        const effectiveMode = mode === 'combined' ? 'tracking' : mode;

        const target = new Target(x, y, radius, health, effectiveMode, difficulty);

        // Override mode for combined tracking targets with movement
        if (mode === 'combined') {
            target.mode = 'combined';
        }

        target.initMovement(STATE.canvasWidth, STATE.canvasHeight);

        // For combined mode, randomly make some targets behave like flick targets
        if (mode === 'combined' && Math.random() >= CONFIG.COMBINED_TRACKING_WEIGHT) {
            target.mode = 'flick';
            target.maxLifetime = CONFIG.FLICK_LIFETIME[difficulty];
            target.lifetime = target.maxLifetime;
            target.health = 1;
            target.maxHealth = 1;
            target.pointsValue = CONFIG.BASE_POINTS_FLICK;
        }

        STATE.targets.push(target);
        return target;
    },

    /**
     * Create a flick target (single hit, stationary, timed)
     */
    createFlickTarget(x, y, difficulty) {
        const radius = CONFIG.TARGET_RADIUS[difficulty];
        const target = new Target(x, y, radius, 1, 'flick', difficulty);
        target.maxLifetime = CONFIG.FLICK_LIFETIME[difficulty];
        target.lifetime = target.maxLifetime;
        target.pointsValue = CONFIG.BASE_POINTS_FLICK;
        STATE.targets.push(target);
        return target;
    },

    /**
     * Find targets hit by a click
     * Returns array of hit targets sorted by distance (closest first)
     */
    findHits(x, y) {
        const hits = [];
        for (const target of STATE.targets) {
            if (target.hitTest(x, y)) {
                const dx = x - target.x;
                const dy = y - target.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                hits.push({ target, distance: dist });
            }
        }
        hits.sort((a, b) => a.distance - b.distance);
        return hits;
    },

    /**
     * Remove dead targets from the array
     */
    cleanup() {
        STATE.targets = STATE.targets.filter(t => t.state !== 'dead');
    },

    /**
     * Clear all targets
     */
    clearAll() {
        STATE.targets = [];
    },

    /**
     * Update all active targets
     */
    updateAll(dt) {
        for (const target of STATE.targets) {
            target.update(dt);
        }
        this.cleanup();
    },

    /**
     * Get position for spawning that's not too close to existing targets
     */
    getSpawnPosition(minDistFromTargets = 80) {
        const w = STATE.canvasWidth;
        const h = STATE.canvasHeight;
        const radius = CONFIG.TARGET_RADIUS[STATE.difficulty];
        const margin = radius + 20;
        let x, y, attempts = 0;

        do {
            x = margin + Math.random() * (w - margin * 2);
            y = margin + Math.random() * (h - margin * 2);
            attempts++;
        } while (attempts < 20 && this.tooCloseToTargets(x, y, minDistFromTargets));

        return { x, y };
    },

    /**
     * Check if a position is too close to any existing targets
     */
    tooCloseToTargets(x, y, minDist) {
        for (const t of STATE.targets) {
            if (t.state === 'dead' || t.state === 'dying') continue;
            const dx = x - t.x;
            const dy = y - t.y;
            if (Math.sqrt(dx * dx + dy * dy) < minDist) return true;
        }
        return false;
    },
};
