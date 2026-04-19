import { Constants } from '@/utils/Constants';
import { FullScreen } from '@/core/FullScreen';
import { ShellFactory } from '@/entities/ShellFactory';

/**
 * UI Manager
*/
export class UIManager {
    constructor(app) {
        this.app = app;
        this.stateManager = app.stateManager;
        this.i18n = app.i18n;

        this.nodes = {
            stageContainer: document.querySelector('.stage-container'),
            canvasContainer: document.querySelector('.canvas-container'),
            controls: document.querySelector('.controls'),
            menu: document.querySelector('.menu'),
            menuInnerWrap: document.querySelector('.menu__inner-wrap'),
            pauseBtnSVG: document.querySelector('.pause-btn use'),
            soundBtnSVG: document.querySelector('.sound-btn use'),
            appLanguage: document.querySelector('.app-language'),
            shellType: document.querySelector('.shell-type'),
            shellSize: document.querySelector('.shell-size'),
            quality: document.querySelector('.quality-ui'),
            skyLighting: document.querySelector('.sky-lighting'),
            scaleFactor: document.querySelector('.scaleFactor'),
            wordShell: document.querySelector('.word-shell'),
            wordText: document.querySelector('.word-text'),
            autoLaunch: document.querySelector('.auto-launch'),
            finaleMode: document.querySelector('.finale-mode'),
            finaleModeFormOption: document.querySelector('.form-option--finale-mode'),
            hideControls: document.querySelector('.hide-controls'),
            fullscreen: document.querySelector('.fullscreen'),
            fullscreenFormOption: document.querySelector('.form-option--fullscreen'),
            longExposure: document.querySelector('.long-exposure'),
            helpModal: document.querySelector('.help-modal'),
            helpModalHeader: document.querySelector('.help-modal__header'),
            helpModalBody: document.querySelector('.help-modal__body')
        };

        this.initDOM();
        this.bindEvents();
        this.stateManager.subscribe((state, prevState) => this.render(state, prevState));
    }

    setOptions(node, options) {
        if (!node) return;
        const currentVal = node.value;
        node.innerHTML = options.reduce((acc, opt) => acc += `<option value="${opt.value !== undefined ? opt.value : opt}">${opt.label || opt}</option>`, '');
        if (currentVal) node.value = currentVal;
    }

    updateSelectOptions() {
        const t = (k) => this.i18n.t(k);

        this.setOptions(this.nodes.appLanguage, [{
            label: t('opt.langAuto'),
            value: 'auto'
        }, {
            label: 'English',
            value: 'en'
        }, {
            label: 'Indonesia',
            value: 'id'
        }]);

        const translatedShells = ShellFactory.shellNames.map(name => {
            const camelKey = name.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '');
            return {
                label: t('opt.' + camelKey) !== 'opt.' + camelKey ? t('opt.' + camelKey) : name,
                value: name
            };
        });

        this.setOptions(this.nodes.shellType, translatedShells);

        this.setOptions(this.nodes.shellSize, ['3"', '4"', '6"', '8"', '12"', '16"'].map((opt, i) => ({
            label: opt,
            value: i
        })));

        this.setOptions(this.nodes.quality, [{
            label: t('opt.low'),
            value: Constants.QUALITY_LOW
        }, {
            label: t('opt.normal'),
            value: Constants.QUALITY_NORMAL
        }, {
            label: t('opt.high'),
            value: Constants.QUALITY_HIGH
        }]);

        this.setOptions(this.nodes.skyLighting, [{
            label: t('opt.none'),
            value: Constants.SKY_LIGHT_NONE
        }, {
            label: t('opt.dim'),
            value: Constants.SKY_LIGHT_DIM
        }, {
            label: t('opt.normal'),
            value: Constants.SKY_LIGHT_NORMAL
        }]);

        this.setOptions(this.nodes.scaleFactor, [0.5, 0.62, 0.75, 0.9, 1.0, 1.5, 2.0].map(v => ({
            value: v.toFixed(2),
            label: `${v*100}%`
        })));

        // Keep values synced
        if (this.nodes.appLanguage) this.nodes.appLanguage.value = this.i18n.selectedSetting;
    }

    initDOM() {
        if (typeof FullScreen !== 'undefined' && !FullScreen.fullscreenEnabled && this.nodes.fullscreenFormOption) {
            this.nodes.fullscreenFormOption.classList.add('remove');
        }

        const loader = document.querySelector('.loading-init');
        if (loader) loader.remove();

        if (this.nodes.stageContainer) {
            this.nodes.stageContainer.classList.remove('remove');
        }

        this.i18n.translateDOM();
        this.updateSelectOptions();
    }

    bindEvents() {
        const updateConfig = () => {
            this.stateManager.setState({
                config: {
                    quality: this.nodes.quality.value,
                    shell: this.nodes.shellType.value,
                    size: this.nodes.shellSize.value,
                    wordShell: this.nodes.wordShell.checked,
                    customWords: this.nodes.wordText.value || "BOOM,WOW",
                    autoLaunch: this.nodes.autoLaunch.checked,
                    finale: this.nodes.finaleMode.checked,
                    skyLighting: this.nodes.skyLighting.value,
                    longExposure: this.nodes.longExposure.checked,
                    hideControls: this.nodes.hideControls.checked,
                    scaleFactor: parseFloat(this.nodes.scaleFactor.value)
                }
            });
        };

        ['quality', 'shellType', 'shellSize', 'skyLighting', 'wordText'].forEach(key => {
            if (this.nodes[key]) this.nodes[key].addEventListener('input', updateConfig);
        });

        ['wordShell', 'autoLaunch', 'finaleMode', 'longExposure', 'hideControls'].forEach(key => {
            if (this.nodes[key]) this.nodes[key].addEventListener('click', () => setTimeout(updateConfig, 0));
        });

        if (this.nodes.scaleFactor) {
            this.nodes.scaleFactor.addEventListener('input', () => {
                updateConfig();
                if (this.app.renderer) this.app.renderer.handleResize();
            });
        }

        if (this.nodes.fullscreen) {
            this.nodes.fullscreen.addEventListener('click', () => {
                setTimeout(() => this.app.inputManager && this.app.inputManager.toggleFullscreen(), 0);
            });
        }

        if (this.nodes.appLanguage) {
            this.nodes.appLanguage.addEventListener('change', (e) => {
                this.i18n.setLanguage(e.target.value);
                this.updateSelectOptions();

                // Refresh modal content if open
                if (this.stateManager.state.openHelpTopic) {
                    this.stateManager.setState({
                        openHelpTopic: this.stateManager.state.openHelpTopic
                    });
                }
            });
        }

        // Help Modal Events
        Object.entries(Constants.HELP_TOPIC_SELECTORS).forEach(([selector, topicKey]) => {
            const el = document.querySelector(selector);
            if (el) {
                el.addEventListener('click', () => {
                    this.stateManager.setState({
                        openHelpTopic: topicKey
                    });
                });
            }
        });

        const closeBtn = document.querySelector('.help-modal__close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.stateManager.setState({
            openHelpTopic: null
        }));

        const overlay = document.querySelector('.help-modal__overlay');
        if (overlay) overlay.addEventListener('click', () => this.stateManager.setState({
            openHelpTopic: null
        }));

        if (typeof FullScreen !== 'undefined') {
            FullScreen.addEventListener('fullscreenchange', () => this.stateManager.setState({
                fullscreen: !!FullScreen.fullscreenElement
            }));
        }
    }

    render(state) {
        if (!this.nodes.pauseBtnSVG || !this.nodes.soundBtnSVG) return;

        this.nodes.pauseBtnSVG.setAttribute('href', `#icon-${state.paused ? 'play' : 'pause'}`);
        this.nodes.soundBtnSVG.setAttribute('href', `#icon-sound-${state.soundEnabled ? 'on' : 'off'}`);
        this.nodes.controls.classList.toggle('hide', state.menuOpen || state.config.hideControls);
        this.nodes.canvasContainer.classList.toggle('blur', state.menuOpen);
        this.nodes.menu.classList.toggle('hide', !state.menuOpen);

        this.nodes.finaleModeFormOption.style.opacity = state.config.autoLaunch ? 1 : 0.32;
        this.nodes.wordText.parentElement.style.opacity = state.config.wordShell ? 1 : 0.32;

        this.nodes.quality.value = state.config.quality;
        this.nodes.shellType.value = state.config.shell;
        this.nodes.shellSize.value = state.config.size;
        this.nodes.wordShell.checked = state.config.wordShell;
        this.nodes.wordText.value = state.config.customWords;
        this.nodes.autoLaunch.checked = state.config.autoLaunch;
        this.nodes.finaleMode.checked = state.config.finale;
        this.nodes.skyLighting.value = state.config.skyLighting;
        this.nodes.hideControls.checked = state.config.hideControls;
        this.nodes.fullscreen.checked = state.fullscreen;
        this.nodes.longExposure.checked = state.config.longExposure;
        this.nodes.scaleFactor.value = parseFloat(state.config.scaleFactor).toFixed(2);

        this.nodes.menuInnerWrap.style.opacity = state.openHelpTopic ? 0.12 : 1;
        this.nodes.helpModal.classList.toggle('active', !!state.openHelpTopic);

        if (state.openHelpTopic) {
            this.nodes.helpModalHeader.textContent = this.i18n.t(`help.${state.openHelpTopic}.h`);
            this.nodes.helpModalBody.textContent = this.i18n.t(`help.${state.openHelpTopic}.b`);
        }
    }
}