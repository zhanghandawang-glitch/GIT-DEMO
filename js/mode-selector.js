/* ============================================
   mode-selector.js — 模式选择界面
   ============================================ */

const ModeSelector = {
    /**
     * Initialize mode selector
     */
    init() {
        // Mode card click — select the card
        const cards = document.querySelectorAll('.mode-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't select when clicking selects or buttons
                if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION' || e.target.tagName === 'BUTTON') return;
                this.selectCard(card);
            });
        });

        // Start buttons
        const startButtons = document.querySelectorAll('.btn-start');
        startButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const mode = btn.dataset.mode;
                this.startSession(mode);
            });
        });

        // Select first card by default
        if (cards.length > 0) {
            this.selectCard(cards[0]);
        }
    },

    /**
     * Highlight a mode card as selected
     */
    selectCard(card) {
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Update STATE mode
        STATE.mode = card.dataset.mode;
    },

    /**
     * Start a session with the selected mode
     */
    startSession(mode) {
        // Get difficulty and duration from the corresponding card
        const card = document.querySelector(`.mode-card[data-mode="${mode}"]`);
        const diffSelect = card.querySelector('.diff-select');
        const durSelect = card.querySelector('.duration-select');

        STATE.mode = mode;
        STATE.difficulty = diffSelect ? diffSelect.value : 'normal';
        STATE.sessionDuration = durSelect ? parseInt(durSelect.value) : 60;

        App.startSession();
    },

    /**
     * Show the menu screen
     */
    showMenu() {
        document.getElementById('menuScreen').classList.remove('hidden');
        HUD.hide();
        HUD.hideResults();
        HUD.hidePause();
        HUD.hideCountdown();
        HUD.updateMenuStats();
    },

    /**
     * Hide the menu screen
     */
    hideMenu() {
        document.getElementById('menuScreen').classList.add('hidden');
    },
};
