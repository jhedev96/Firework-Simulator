import { Constants } from '@/utils/Constants';
import { Utils } from '@/utils/Utils';
import { Stage } from '@/core/Stage';

/**
 * Renderer
*/
export class Renderer {
    constructor(app) {
        this.app = app;
        this.trailsStage = new Stage('trails-canvas');
        this.mainStage = new Stage('main-canvas');
        this.stageW = 0;
        this.stageH = 0;
        this.speedBarOpacity = 0;
        this.currentFrame = 0;
        this.currentSkyColor = { r: 0, g: 0, b: 0 };
        this.targetSkyColor = { r: 0, g: 0, b: 0 };

        this.handleResize();
        
        // Debounced resize handler
        let resizeTimeout = null;
        const debouncedResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
                resizeTimeout = null;
            }, 150);
        };
        window.addEventListener('resize', debouncedResize);
    }

    handleResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const containerW = Math.min(w, Constants.MAX_WIDTH);
        const containerH = w <= 420 ? h : Math.min(h, Constants.MAX_HEIGHT);

        if (this.app.ui && this.app.ui.nodes.stageContainer) {
            this.app.ui.nodes.stageContainer.style.width = containerW + 'px';
            this.app.ui.nodes.stageContainer.style.height = containerH + 'px';
        }

        this.trailsStage.resize(containerW, containerH);
        this.mainStage.resize(containerW, containerH);

        const sf = this.app.stateManager.scaleFactor || 1;
        this.stageW = containerW / sf;
        this.stageH = containerH / sf;
    }

    colorSky(speed) {
        // Throttle: only recalculate target colors every 3 frames
        this._skyFrameCount = (this._skyFrameCount || 0) + 1;
        
        const maxSkySaturation = +this.app.stateManager.state.config.skyLighting * 15;
        
        // Only recalculate target sky color periodically
        if (this._skyFrameCount % 3 === 0) {
            let totalStarCount = 0;
            this.targetSkyColor.r = this.targetSkyColor.g = this.targetSkyColor.b = 0;

            const colorCodes = Utils.colorCodes;
            const colorTuples = Utils.colorTuples;
            const stars = this.app.particles.stars;
            
            for (let i = 0; i < colorCodes.length; i++) {
                const color = colorCodes[i];
                const count = stars[color].length;
                totalStarCount += count;
                const tuple = colorTuples[color];
                this.targetSkyColor.r += tuple.r * count;
                this.targetSkyColor.g += tuple.g * count;
                this.targetSkyColor.b += tuple.b * count;
            }

            const intensity = Math.pow(Math.min(1, totalStarCount / 500), 0.3);
            const maxColorComponent = Math.max(1, this.targetSkyColor.r, this.targetSkyColor.g, this.targetSkyColor.b);

            this.targetSkyColor.r = this.targetSkyColor.r / maxColorComponent * maxSkySaturation * intensity;
            this.targetSkyColor.g = this.targetSkyColor.g / maxColorComponent * maxSkySaturation * intensity;
            this.targetSkyColor.b = this.targetSkyColor.b / maxColorComponent * maxSkySaturation * intensity;
        }

        const colorChange = 10;
        this.currentSkyColor.r += (this.targetSkyColor.r - this.currentSkyColor.r) / colorChange * speed;
        this.currentSkyColor.g += (this.targetSkyColor.g - this.currentSkyColor.g) / colorChange * speed;
        this.currentSkyColor.b += (this.targetSkyColor.b - this.currentSkyColor.b) / colorChange * speed;

        // Only update DOM every 2nd frame when there's significant change
        if (this._skyFrameCount % 2 === 0 && this.app.ui && this.app.ui.nodes.canvasContainer) {
            this.app.ui.nodes.canvasContainer.style.backgroundColor = `rgb(${this.currentSkyColor.r | 0}, ${this.currentSkyColor.g | 0}, ${this.currentSkyColor.b | 0})`;
        }
    }

    render(speed) {
        const { dpr } = this.mainStage;
        const trailsCtx = this.trailsStage.ctx;
        const mainCtx = this.mainStage.ctx;
        const sf = this.app.stateManager.scaleFactor || 1;

        if (+this.app.stateManager.state.config.skyLighting !== Constants.SKY_LIGHT_NONE) this.colorSky(speed);

        trailsCtx.scale(dpr * sf, dpr * sf);
        mainCtx.scale(dpr * sf, dpr * sf);

        trailsCtx.globalCompositeOperation = 'source-over';
        trailsCtx.fillStyle = `rgba(0, 0, 0, ${this.app.stateManager.state.config.longExposure ? 0.0025 : 0.175 * speed})`;
        trailsCtx.fillRect(0, 0, this.stageW, this.stageH);
        mainCtx.clearRect(0, 0, this.stageW, this.stageH);

        // Draw Burst Flashes
        while (this.app.particles.burstFlashes.length) {
            const bf = this.app.particles.burstFlashes.pop();
            const burstGradient = trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
            burstGradient.addColorStop(0.024, 'rgba(255, 255, 255, 1)');
            burstGradient.addColorStop(0.125, 'rgba(255, 160, 20, 0.2)');
            burstGradient.addColorStop(0.32, 'rgba(255, 140, 20, 0.11)');
            burstGradient.addColorStop(1, 'rgba(255, 120, 20, 0)');
            trailsCtx.fillStyle = burstGradient;
            trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
            this.app.particles.returnBurstFlash(bf);
        }

        // Draw Stars - Optimized with cached values and reduced context switches
        const quality = this.app.stateManager.quality;
        const isHighQuality = quality === Constants.QUALITY_HIGH;
        const isLowQuality = quality === Constants.QUALITY_LOW;
        
        trailsCtx.globalCompositeOperation = 'lighten';
        trailsCtx.lineWidth = isHighQuality ? 0.75 : 1;
        trailsCtx.lineCap = isLowQuality ? 'square' : 'round';
        mainCtx.strokeStyle = '#fff';
        mainCtx.lineWidth = 1;
        mainCtx.beginPath();

        // Draw Stars - batch by color but with optimized path construction
        const colorCodes = Utils.colorCodes;
        for (let c = 0; c < colorCodes.length; c++) {
            const color = colorCodes[c];
            const stars = this.app.particles.stars[color];
            if (stars.length === 0) continue;
            
            trailsCtx.strokeStyle = color;
            trailsCtx.beginPath();
            for (let s = 0; s < stars.length; s++) {
                const star = stars[s];
                if (star.visible) {
                    trailsCtx.moveTo(star.x, star.y);
                    trailsCtx.lineTo(star.prevX, star.prevY);
                    mainCtx.moveTo(star.x, star.y);
                    mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
                }
            }
            trailsCtx.stroke();
        }
        mainCtx.stroke();

        // Draw Sparks - optimized
        trailsCtx.lineWidth = 0;
        trailsCtx.lineCap = 'butt';
        for (let c = 0; c < colorCodes.length; c++) {
            const color = colorCodes[c];
            const sparks = this.app.particles.sparks[color];
            if (sparks.length === 0) continue;
            
            trailsCtx.strokeStyle = color;
            trailsCtx.beginPath();
            for (let s = 0; s < sparks.length; s++) {
                const spark = sparks[s];
                trailsCtx.moveTo(spark.x, spark.y);
                trailsCtx.lineTo(spark.prevX, spark.prevY);
            }
            trailsCtx.stroke();
        }

        // Draw Speedbar
        if (this.speedBarOpacity) {
            mainCtx.globalAlpha = this.speedBarOpacity;
            mainCtx.fillStyle = Constants.COLOR.Blue;
            mainCtx.fillRect(0, this.stageH - 6, this.stageW * this.app.simSpeed, 6);
            mainCtx.globalAlpha = 1;
        }

        trailsCtx.setTransform(1, 0, 0, 1, 0, 0);
        mainCtx.setTransform(1, 0, 0, 1, 0, 0);
    }
}