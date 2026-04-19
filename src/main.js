import '@/styles/reset.css';
import '@/styles/font.css';
import '@/styles/main.css';
import { Constants } from '@/utils/Constants';
import { FireworkApp } from '@/core/FireworkApp';

/**
 * Bootstrap / Kick Things Off
*/
const app = new FireworkApp();

if (Constants.IS_HEADER) {
    app.init();
} else {
    const statusEl = document.querySelector('.loading-init__status');
    // Translate the initial loading status!
    if (statusEl) statusEl.textContent = app.i18n.t('ui.lighting');

    setTimeout(() => {
        app.soundManager.preload().then(() => app.init(), reason => {
            app.init();
            console.warn('Audio preload failed, initializing without audio:', reason);
        });
    }, 0);
}