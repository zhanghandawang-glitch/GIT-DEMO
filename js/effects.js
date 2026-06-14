/* ============================================
   effects.js — 粒子系统（命中火花、爆炸、连击文字）
   ============================================ */

const Effects = {
    particles: [],

    /**
     * Spawn hit sparks at a position
     */
    spawnHitSpark(x, y) {
        const count = 8 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 120 + Math.random() * 200;
            this.particles.push({
                type: 'spark',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.25 + Math.random() * 0.15,
                maxLife: 0.25 + Math.random() * 0.15,
                size: 2 + Math.random() * 3,
                color: Math.random() < 0.7 ? CONFIG.COLORS.OW_ORANGE : CONFIG.COLORS.OW_WHITE,
                gravity: 80,
            });
        }
    },

    /**
     * Spawn destruction burst (target killed)
     */
    spawnDestruction(x, y, color = CONFIG.COLORS.OW_ORANGE) {
        const count = 20 + Math.floor(Math.random() * 15);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 300;
            this.particles.push({
                type: 'burst',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3 + Math.random() * 0.4,
                maxLife: 0.3 + Math.random() * 0.4,
                size: 2 + Math.random() * 5,
                color: Math.random() < 0.5 ? color : CONFIG.COLORS.OW_WHITE,
                gravity: 30,
            });
        }

        // Expanding ring
        this.particles.push({
            type: 'ring',
            x, y,
            radius: 5,
            maxRadius: 60 + Math.random() * 40,
            life: 0.4,
            maxLife: 0.4,
            color: color,
        });
    },

    /**
     * Spawn a floating combo text
     */
    spawnComboText(x, y, text, color = CONFIG.COLORS.OW_ORANGE) {
        this.particles.push({
            type: 'text',
            x, y,
            vy: -80,
            life: 0.8,
            maxLife: 0.8,
            text: text,
            color: color,
        });
    },

    /**
     * Spawn a miss indicator
     */
    spawnMiss(x, y) {
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
            const len = 8;
            this.particles.push({
                type: 'missLine',
                x, y,
                x2: x + Math.cos(angle) * len,
                y2: y + Math.sin(angle) * len,
                life: 0.15,
                maxLife: 0.15,
                color: CONFIG.COLORS.OW_RED,
            });
        }
    },

    /**
     * Spawn trail particle behind moving target
     */
    spawnTrail(x, y) {
        if (this.particles.filter(p => p.type === 'trail' && p.life > 0).length > 40) return;
        this.particles.push({
            type: 'trail',
            x, y,
            life: 0.4 + Math.random() * 0.3,
            maxLife: 0.4 + Math.random() * 0.3,
            size: 3 + Math.random() * 4,
            color: CONFIG.COLORS.OW_BLUE,
        });
    },

    /**
     * Update all particles
     */
    updateAll(dt) {
        for (const p of this.particles) {
            p.life -= dt;

            if (p.vy !== undefined && p.gravity) {
                p.vy += p.gravity * dt;
            }

            if (p.vx !== undefined) p.x += p.vx * dt;
            if (p.vy !== undefined) p.y += p.vy * dt;

            if (p.type === 'ring') {
                p.radius = p.maxRadius * (1 - p.life / p.maxLife);
            }
        }

        // Cull dead particles
        this.particles = this.particles.filter(p => p.life > 0);

        // Hard cap
        if (this.particles.length > CONFIG.MAX_PARTICLES) {
            this.particles = this.particles.slice(-CONFIG.MAX_PARTICLES);
        }
    },

    /**
     * Render all particles
     */
    renderAll(ctx) {
        for (const p of this.particles) {
            const alpha = Math.max(0, p.life / p.maxLife);

            switch (p.type) {
                case 'spark':
                case 'burst': {
                    ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                    if (p.color.startsWith('#')) {
                        ctx.globalAlpha = alpha;
                        ctx.fillStyle = p.color;
                    }
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    break;
                }

                case 'ring': {
                    ctx.strokeStyle = p.color.startsWith('#')
                        ? p.color + Math.floor(alpha * 80).toString(16).padStart(2, '0')
                        : `rgba(249, 158, 26, ${alpha * 0.6})`;
                    ctx.lineWidth = 2 * alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                }

                case 'text': {
                    ctx.fillStyle = p.color.startsWith('#')
                        ? p.color
                        : CONFIG.COLORS.OW_ORANGE;
                    ctx.globalAlpha = alpha;
                    ctx.font = 'bold 16px "Orbitron", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 10;
                    ctx.fillText(p.text, p.x, p.y);
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                    break;
                }

                case 'missLine': {
                    ctx.strokeStyle = CONFIG.COLORS.OW_RED;
                    ctx.globalAlpha = alpha;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x2, p.y2);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    break;
                }

                case 'trail': {
                    ctx.fillStyle = `rgba(33, 143, 254, ${alpha * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                }
            }
        }
    },

    /**
     * Clear all particles
     */
    clearAll() {
        this.particles = [];
    },
};
