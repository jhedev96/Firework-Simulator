import { FullScreen } from '@/core/FullScreen';

/**
 * InputManager
*/
export class InputManager {
    constructor(app) {
        this.app = app;
        this.stateManager = app.stateManager;
        this.mainStage = app.renderer.mainStage;
        this.isUpdatingSpeed = false;

        this.bindEvents();
    }

    bindEvents() {
        this.mainStage.addEventListener('pointerstart', e => this.handlePointerStart(e));
        this.mainStage.addEventListener('pointerend', () => this.isUpdatingSpeed = false);
        this.mainStage.addEventListener('pointermove', e => this.handlePointerMove(e));
        window.addEventListener('keydown', e => this.handleKeydown(e));
    }

    toggleFullscreen() {
        if (typeof FullScreen !== 'undefined' && FullScreen.fullscreenEnabled) {
            if (FullScreen.fullscreenElement) FullScreen.exitFullscreen();
            else FullScreen.requestFullscreen(document.documentElement);
        }
    }

    handlePointerStart(event) {
        const btnSize = 50;
        if (event.y < btnSize) {
            if (event.x < btnSize) return this.stateManager.setState({
                paused: !this.stateManager.state.paused
            });
            if (event.x > this.mainStage.width / 2 - btnSize / 2 && event.x < this.mainStage.width / 2 + btnSize / 2) {
                return this.stateManager.setState({
                    soundEnabled: !this.stateManager.state.soundEnabled
                });
            }
            if (event.x > this.mainStage.width - btnSize) return this.stateManager.setState({
                menuOpen: !this.stateManager.state.menuOpen
            });
        }

        if (!this.stateManager.isRunning) return;

        if (this.updateSpeedFromEvent(event)) {
            this.isUpdatingSpeed = true;
        } else if (event.onCanvas) {
            this.app.shellFactory.launchShellFromConfig(event);
        }
    }

    handlePointerMove(event) {
        if (!this.stateManager.isRunning) return;
        if (this.isUpdatingSpeed) this.updateSpeedFromEvent(event);
    }

    handleKeydown(event) {
        if (event.keyCode === 80) this.stateManager.setState({
            paused: !this.stateManager.state.paused
        }); // P
        else if (event.keyCode === 79) this.stateManager.setState({
            menuOpen: !this.stateManager.state.menuOpen
        }); // O
        else if (event.keyCode === 27) this.stateManager.setState({
            menuOpen: false
        }); // Esc
    }

    updateSpeedFromEvent(event) {
        if (this.isUpdatingSpeed || event.y >= this.mainStage.height - 44) {
            const edge = 16;
            const newSpeed = (event.x - edge) / (this.mainStage.width - edge * 2);
            this.app.simSpeed = Math.min(Math.max(newSpeed, 0), 1);
            this.app.renderer.speedBarOpacity = 1;
            return true;
        }
        return false;
    }
}