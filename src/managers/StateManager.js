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
                whistles: true, // [REVISI WHISTLE] Jadi simple boolean, logic di-handle class
                autoLaunch: true,
                finale: false,
                skyLighting: Constants.SKY_LIGHT_NORMAL + '',
                hideControls: Constants.IS_HEADER,
                longExposure: false,
                scaleFactor: Constants.IS_MOBILE ? 0.9 : Constants.IS_HEADER ? 0.75 : 1,
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
        const sd = localStorage.getItem('cm_fireworks_v4');
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
        localStorage.setItem('cm_fireworks_v4', JSON.stringify({
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
}