/* ============================================
   scoring.js — 计分、连击、命中率计算
   ============================================ */

const Scoring = {
    /**
     * Register a hit on a target
     * @param {Target} target - The target that was hit
     * @returns {object} Result: { points, targetDestroyed, comboText, comboMilestone }
     */
    registerHit(target) {
        const now = performance.now();

        // Check shot cooldown (prevent double-fires)
        if (now - STATE.lastShotTime < CONFIG.SHOT_COOLDOWN) {
            return null;
        }
        STATE.lastShotTime = now;

        STATE.hits++;
        STATE.totalShots++;
        STATE.currentCombo++;
        if (STATE.currentCombo > STATE.maxCombo) {
            STATE.maxCombo = STATE.currentCombo;
        }

        // Apply damage
        const alive = target.takeDamage(1);

        // Calculate points
        const comboMultiplier = Math.min(
            1 + STATE.currentCombo * CONFIG.COMBO_MULTIPLIER_STEP,
            CONFIG.COMBO_MULTIPLIER_MAX
        );
        const difficultyMultiplier = CONFIG.DIFFICULTY_MULTIPLIER[STATE.difficulty];
        let points = Math.round(target.pointsValue * comboMultiplier * difficultyMultiplier);

        let targetDestroyed = false;
        let comboText = null;
        let comboMilestone = false;
        const comboLevel = STATE.currentCombo;

        // Check if target was destroyed
        if (!alive) {
            targetDestroyed = true;
            STATE.kills++;
            // Bonus points for kill
            points += Math.round(CONFIG.BONUS_POINTS_KILL * comboMultiplier * difficultyMultiplier);
            // Spawn destruction effect
            Effects.spawnDestruction(target.x, target.y);
            Audio.playKill();
        } else {
            Effects.spawnHitSpark(target.x, target.y);
            Audio.playHit();
        }

        STATE.score += points;

        // Check combo milestones
        for (const milestone of CONFIG.COMBO_MILESTONES) {
            if (STATE.currentCombo === milestone.combo) {
                comboText = milestone.text;
                comboMilestone = true;
                Effects.spawnComboText(target.x, target.y - 30, milestone.text, milestone.color);
                Audio.playComboMilestone(milestone.combo / 5);
                break;
            }
        }

        // Update HUD immediately for snappy feel
        HUD.updateScore();

        return {
            points,
            targetDestroyed,
            comboText,
            comboMilestone,
            comboLevel,
        };
    },

    /**
     * Register a miss
     */
    registerMiss(x, y) {
        const now = performance.now();
        if (now - STATE.lastShotTime < CONFIG.SHOT_COOLDOWN) return;
        STATE.lastShotTime = now;

        STATE.misses++;
        STATE.totalShots++;
        STATE.currentCombo = 0;

        Effects.spawnMiss(x, y);
        Audio.playMiss();

        HUD.updateScore();
    },

    /**
     * Calculate current accuracy
     */
    getAccuracy() {
        if (STATE.totalShots === 0) return 0;
        return (STATE.hits / STATE.totalShots) * 100;
    },

    /**
     * Reset session scoring
     */
    resetSession() {
        STATE.score = 0;
        STATE.hits = 0;
        STATE.misses = 0;
        STATE.totalShots = 0;
        STATE.currentCombo = 0;
        STATE.maxCombo = 0;
        STATE.kills = 0;
        STATE.elapsedTime = 0;
        STATE.lastShotTime = 0;
    },

    /**
     * Get session summary
     */
    getSessionSummary() {
        return {
            score: STATE.score,
            hits: STATE.hits,
            misses: STATE.misses,
            totalShots: STATE.totalShots,
            accuracy: this.getAccuracy(),
            maxCombo: STATE.maxCombo,
            kills: STATE.kills,
            elapsedTime: STATE.elapsedTime,
        };
    },

    /**
     * Update persistent stats after session ends
     */
    saveSessionStats() {
        const summary = this.getSessionSummary();

        STATE.stats.totalPlayTime += summary.elapsedTime;
        STATE.stats.totalHits += summary.hits;
        STATE.stats.totalMisses += summary.misses;
        STATE.stats.totalShots += summary.totalShots;
        STATE.stats.sessionsPlayed++;

        if (summary.accuracy > STATE.stats.bestAccuracy) {
            STATE.stats.bestAccuracy = summary.accuracy;
        }
        if (summary.score > STATE.stats.bestScore) {
            STATE.stats.bestScore = summary.score;
        }
        if (summary.maxCombo > STATE.stats.bestCombo) {
            STATE.stats.bestCombo = summary.maxCombo;
        }

        // Per-mode stats
        const modeStats = STATE.stats.modeStats[STATE.mode];
        if (modeStats) {
            modeStats.played++;
            if (summary.score > modeStats.bestScore) {
                modeStats.bestScore = summary.score;
            }
        }

        Storage.saveStats();
    },
};
