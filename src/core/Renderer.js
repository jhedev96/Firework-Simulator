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
        this.currentSkyColor = {
            r: 0,
            g: 0,
            b: 0
        };
        this.targetSkyColor = {
            r: 0,
            g: 0,
            b: 0
        };

        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
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
        const maxSkySaturation = +this.app.stateManager.state.config.skyLighting * 15;
        let totalStarCount = 0;
        this.targetSkyColor.r = this.targetSkyColor.g = this.targetSkyColor.b = 0;

        Utils.colorCodes.forEach(color => {
            const count = this.app.particles.stars[color].length;
            totalStarCount += count;
            this.targetSkyColor.r += Utils.colorTuples[color].r * count;
            this.targetSkyColor.g += Utils.colorTuples[color].g * count;
            this.targetSkyColor.b += Utils.colorTuples[color].b * count;
        });

        const intensity = Math.pow(Math.min(1, totalStarCount / 500), 0.3);
        const maxColorComponent = Math.max(1, this.targetSkyColor.r, this.targetSkyColor.g, this.targetSkyColor.b);

        this.targetSkyColor.r = this.targetSkyColor.r / maxColorComponent * maxSkySaturation * intensity;
        this.targetSkyColor.g = this.targetSkyColor.g / maxColorComponent * maxSkySaturation * intensity;
        this.targetSkyColor.b = this.targetSkyColor.b / maxColorComponent * maxSkySaturation * intensity;

        const colorChange = 10;
        this.currentSkyColor.r += (this.targetSkyColor.r - this.currentSkyColor.r) / colorChange * speed;
        this.currentSkyColor.g += (this.targetSkyColor.g - this.currentSkyColor.g) / colorChange * speed;
        this.currentSkyColor.b += (this.targetSkyColor.b - this.currentSkyColor.b) / colorChange * speed;

        if (this.app.ui && this.app.ui.nodes.canvasContainer) {
            this.app.ui.nodes.canvasContainer.style.backgroundColor = `rgb(${this.currentSkyColor.r | 0}, ${this.currentSkyColor.g | 0}, ${this.currentSkyColor.b | 0})`;
        }
    }

    render(speed) {
        const {
            dpr
        } = this.mainStage;
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

        trailsCtx.globalCompositeOperation = 'lighten';
        trailsCtx.lineWidth = this.app.stateManager.quality === Constants.QUALITY_HIGH ? 0.75 : 1;
        trailsCtx.lineCap = this.app.stateManager.quality === Constants.QUALITY_LOW ? 'square' : 'round';
        mainCtx.strokeStyle = '#fff';
        mainCtx.lineWidth = 1;
        mainCtx.beginPath();

        // Draw Stars
        Utils.colorCodes.forEach(color => {
            const stars = this.app.particles.stars[color];
            trailsCtx.strokeStyle = color;
            trailsCtx.beginPath();
            stars.forEach(star => {
                if (star.visible) {
                    trailsCtx.moveTo(star.x, star.y);
                    trailsCtx.lineTo(star.prevX, star.prevY);
                    mainCtx.moveTo(star.x, star.y);
                    mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
                }
            });
            trailsCtx.stroke();
        });
        mainCtx.stroke();

        // Draw Sparks
        trailsCtx.lineWidth = 0;
        trailsCtx.lineCap = 'butt';
        Utils.colorCodes.forEach(color => {
            const sparks = this.app.particles.sparks[color];
            trailsCtx.strokeStyle = color;
            trailsCtx.beginPath();
            sparks.forEach(spark => {
                trailsCtx.moveTo(spark.x, spark.y);
                trailsCtx.lineTo(spark.prevX, spark.prevY);
            });
            trailsCtx.stroke();
        });

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