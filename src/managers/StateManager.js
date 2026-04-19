import { Constants } from '@/utils/Constants';
import { FullScreen } from '@/core/FullScreen';
import { Utils } from '@/utils/Utils';

/**
 * State Manager (Redux style)
*/
export class StateManager {
    constructor() {
        this._listeners = new Set();
        this.state = {
            paused: true,
            soundEnabled: false,
            menuOpen: false,
            openHelpTopic: null,
            fullscreen: typeof FullScreen !== 'undefined' && FullScreen.fullscreenElement !== null,
            config: {
                quality: String(Constants.IS_HIGH_END_DEVICE ? Constants.QUALITY_HIGH : Constants.QUALITY_NORMAL),
                shell: 'Random',
                size: Constants.IS_DESKTOP ? '3' : Constants.IS_HEADER ? '1.2' : '2',
                wordShell: true,
                customWords: "HAPPY,BOOM,WOW",
                autoLaunch: true,
                finale: false,
                skyLighting: Constants.SKY_LIGHT_NORMAL + '',
                hideControls: Constants.IS_HEADER,
                longExposure: false,
                scaleFactor: Constants.IS_MOBILE ? 0.9 : Constants.IS_HEADER ? 0.75 : 1,
                // whistle state
                whistleSfx: {
                    count: 0, // total yang udah diputar
                    max: Utils.randomInt(35, 1000), // batas maksimal whistle
                    lastTime: 0, // terakhir main
                    coolDown: 2000, // jeda minimal 2 detik
                    probChance: Utils.randomFloat(0.3, 0.6, 1000), // peluang awal 30%-60%
                    reset: true, // flag reset
                    resetTime: 60000, // reset tiap 1 menit (60000 ms)
                    lastReset: Date.now()
                },
            }
        };
        if (!Constants.IS_HEADER) this.load();
    }

    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    _dispatch(prevState) {
        this._listeners.forEach(listener => listener(this.state, prevState));
    }

    setState(nextState) {
        const prevState = {
            ...this.state,
            config: {
                ...this.state.config
            }
        };
        this.state = Object.assign({}, this.state, nextState);
        if (nextState.config) this.state.config = Object.assign({}, prevState.config, nextState.config);
        this._dispatch(prevState);
        this.persist();
    }

    load() {
        const sd = localStorage.getItem('cm_fireworks_data_v3');
        if (sd) {
            try {
                const {
                    data
                } = JSON.parse(sd);
                this.state.config = {
                    ...this.state.config,
                    ...data
                };
            } catch (e) {}
        }
    }

    persist() {
        localStorage.setItem('cm_fireworks_data_v3', JSON.stringify({
            data: this.state.config
        }));
    }

    get isRunning() {
        return !this.state.paused && !this.state.menuOpen;
    }
    get canPlaySound() {
        return this.isRunning && this.state.soundEnabled;
    }
    get quality() {
        return +this.state.config.quality;
    }
    get shellName() {
        return this.state.config.shell;
    }
    get shellSize() {
        return +this.state.config.size;
    }
    get scaleFactor() {
        return this.state.config.scaleFactor;
    }
    get whistleSfx() {
        return this.state.config.whistleSfx;
    }
}