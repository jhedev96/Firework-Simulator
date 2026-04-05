import { Constants } from '@/utils/Constants';
import { Math2 } from '@/utils/Math2';

/**
 * Sound Manager
*/
export class SoundManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.baseURL = Constants.SOUND_BASE_URL;
        this.ctx = new(window.AudioContext || window.webkitAudioContext)();
        this._lastSmallBurstTime = 0;

        this.sources = Constants.SOUND_SOURCES;
    }

    preload() {
        const allFilePromises = [];
        const checkStatus = (response) => {
            if (response.status >= 200 && response.status < 300) return response;
            throw new Error(response.statusText);
        };

        Object.keys(this.sources).forEach(type => {
            const source = this.sources[type];
            const filePromises = source.fileNames.map(fileName =>
                fetch(this.baseURL + fileName)
                .then(checkStatus)
                .then(res => res.arrayBuffer())
                .then(data => new Promise(resolve => this.ctx.decodeAudioData(data, resolve)))
            );

            Promise.all(filePromises).then(buffers => {
                source.buffers = buffers;
            });
            allFilePromises.push(...filePromises);
        });

        return Promise.all(allFilePromises);
    }

    pauseAll() {
        this.ctx.suspend();
    }

    resumeAll() {
        this.playSound('lift', 0); // Unlock iOS audio
        this.playSound('whistle', 0);
        setTimeout(() => this.ctx.resume(), 250);
    }

    playSound(type, scale = 1) {
        scale = Math2.clamp(scale, 0, 1);
        if (!this.stateManager.canPlaySound) return;

        if (type === 'burstSmall') {
            const now = Date.now();
            if (now - this._lastSmallBurstTime < 20) return;
            this._lastSmallBurstTime = now;
        }

        const source = this.sources[type];
        if (!source || !source.buffers) return;

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = source.volume * scale;

        const buffer = Math2.randomChoice(source.buffers);
        const bufferSource = this.ctx.createBufferSource();
        bufferSource.playbackRate.value = Math2.random(source.playbackRateMin, source.playbackRateMax) * (2 - scale);
        bufferSource.buffer = buffer;

        bufferSource.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        bufferSource.start(0);
    }
}