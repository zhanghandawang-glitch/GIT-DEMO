/* ============================================
   background.js — 动画背景（渐变 + 浮动六边形 + 星场）
   ============================================ */

const Background = {
    hexagons: [],
    stars: [],

    /**
     * Initialize background elements
     */
    init() {
        // Create floating hexagons
        this.hexagons = [];
        for (let i = 0; i < CONFIG.BG_HEX_COUNT; i++) {
            this.hexagons.push({
                x: Math.random() * 2000,
                y: Math.random() * 1200,
                size: 30 + Math.random() * 80,
                speedX: (Math.random() - 0.5) * 8,
                speedY: (Math.random() - 0.5) * 6,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.3,
                alpha: 0.03 + Math.random() * 0.06,
                pulseSpeed: 0.5 + Math.random() * 1.5,
                pulseOffset: Math.random() * Math.PI * 2,
            });
        }

        // Create star field
        this.stars = [];
        for (let i = 0; i < CONFIG.BG_STAR_COUNT; i++) {
            this.stars.push({
                x: Math.random() * 2000,
                y: Math.random() * 1200,
                size: 1 + Math.random() * 2.5,
                alpha: 0.2 + Math.random() * 0.6,
                twinkleSpeed: 1 + Math.random() * 3,
                twinkleOffset: Math.random() * Math.PI * 2,
                drift: (Math.random() - 0.5) * 2,
            });
        }
    },

    /**
     * Update background elements
     */
    update(dt) {
        const w = STATE.canvasWidth;
        const h = STATE.canvasHeight;

        // Update hexagons
        for (const hex of this.hexagons) {
            hex.x += hex.speedX * dt;
            hex.y += hex.speedY * dt;
            hex.rotation += hex.rotSpeed * dt;

            // Wrap around
            if (hex.x > w + 100) hex.x = -100;
            if (hex.x < -100) hex.x = w + 100;
            if (hex.y > h + 100) hex.y = -100;
            if (hex.y < -100) hex.y = h + 100;
        }

        // Update stars (subtle drift + twinkle)
        const time = performance.now() * 0.001;
        for (const star of this.stars) {
            star.x += star.drift * dt;
            if (star.x > w + 10) star.x = -10;
            if (star.x < -10) star.x = w + 10;
        }
    },

    /**
     * Draw a single hexagon shape
     */
    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    },

    /**
     * Render background
     */
    render(ctx) {
        const w = STATE.canvasWidth;
        const h = STATE.canvasHeight;
        const time = performance.now() * 0.001;

        // --- Gradient base ---
        const gradient = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.6, h * 0.6, Math.max(w, h) * 0.8);
        gradient.addColorStop(0, '#141030');
        gradient.addColorStop(0.5, '#0D1028');
        gradient.addColorStop(1, '#060918');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // --- Hexagons ---
        for (const hex of this.hexagons) {
            const currentAlpha = hex.alpha + Math.sin(time * hex.pulseSpeed + hex.pulseOffset) * 0.02;
            ctx.save();
            ctx.translate(hex.x, hex.y);
            ctx.rotate(hex.rotation);
            ctx.strokeStyle = `rgba(249, 158, 26, ${Math.max(0.01, currentAlpha)})`;
            ctx.lineWidth = 1;
            this.drawHexagon(ctx, 0, 0, hex.size);
            ctx.stroke();
            ctx.restore();
        }

        // --- Star field ---
        for (const star of this.stars) {
            const twinkle = star.alpha * (0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset));
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Occasional orange stars
            if (star.size > 2 && Math.sin(time * 0.5 + star.twinkleOffset) > 0.5) {
                ctx.fillStyle = `rgba(249, 158, 26, ${twinkle * 0.6})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // --- Ambient light spots ---
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Orange glow (top-right)
        const glow1 = ctx.createRadialGradient(w * 0.75, h * 0.15, 0, w * 0.5, h * 0.3, w * 0.5);
        glow1.addColorStop(0, 'rgba(249, 158, 26, 0.04)');
        glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, w, h);

        // Blue glow (bottom-left)
        const glow2 = ctx.createRadialGradient(w * 0.2, h * 0.8, 0, w * 0.4, h * 0.6, w * 0.5);
        glow2.addColorStop(0, 'rgba(33, 143, 254, 0.04)');
        glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow2;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();

        // --- Subtle scan lines (menu mode only) ---
        if (STATE.screen === 'menu' || STATE.screen === 'results') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.008)';
            const scanLineHeight = 3;
            const scanGap = 6;
            for (let y = (time * 20) % (scanLineHeight + scanGap); y < h; y += scanLineHeight + scanGap) {
                ctx.fillRect(0, y, w, scanLineHeight);
            }
        }
    },
};
