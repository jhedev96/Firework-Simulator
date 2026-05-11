/**
 * Wake Lock Manager
*/
export class WakeLockManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.wakeLock = null;

        // Handle kalo user pindah tab, wake lock otomatis lepas dari browser.
        // Jadi kita request ulang pas tabnya diliat lagi.
        document.addEventListener('visibilitychange', () => {
            if (this.wakeLock !== null && document.visibilityState === 'visible') {
                this.requestLock();
            }
        });

        // Pantau state, kalo user centang/uncentang
        this.stateManager.subscribe((state) => {
            if (state.config.wakeLock) this.requestLock();
            else this.releaseLock();
        });
    }

    async requestLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.warn(`Wake Lock error: ${err.name}, ${err.message}`);
            }
        }
    }

    releaseLock() {
        if (this.wakeLock !== null) {
            this.wakeLock.release()
                .then(() => {
                    this.wakeLock = null;
                });
        }
    }
}