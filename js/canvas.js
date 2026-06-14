/* ============================================
   canvas.js — Canvas 初始化、DPI 缩放、渲染管线
   ============================================ */

const Canvas = {
    canvas: null,
    ctx: null,

    /**
     * Initialize canvas and context
     */
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    /**
     * Resize canvas to fill viewport with DPI scaling
     */
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';

        // Store logical dimensions for game logic
        STATE.canvasWidth = w;
        STATE.canvasHeight = h;

        // Scale context so we draw in logical pixels
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, STATE.canvasWidth, STATE.canvasHeight);
    },

    /**
     * Draw the custom crosshair
     */
    drawCrosshair(x, y) {
        if (!STATE.isPointerLocked && STATE.screen === 'playing') return;
        const ctx = this.ctx;
        const size = STATE.crosshairSize;
        const gap = Math.max(2, size * 0.35);
        const lineWidth = Math.max(1, size * 0.15);
        const color = STATE.crosshairColor;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = CONFIG.COLORS.OW_ORANGE;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        // Top
        ctx.moveTo(x, y - gap);
        ctx.lineTo(x, y - gap - size);
        // Bottom
        ctx.moveTo(x, y + gap);
        ctx.lineTo(x, y + gap + size);
        // Left
        ctx.moveTo(x - gap, y);
        ctx.lineTo(x - gap - size, y);
        // Right
        ctx.moveTo(x + gap, y);
        ctx.lineTo(x + gap + size, y);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(x, y, lineWidth * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    /**
     * Get the rendering context
     */
    getCtx() {
        return this.ctx;
    },
};
