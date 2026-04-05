import { Constants } from '@/utils/Constants';
import { Utils } from '@/utils/Utils';
import { I18nManager } from '@/utils/I18n';
import { StateManager } from '@/managers/StateManager';
import { SoundManager } from '@/managers/SoundManager';
import { UIManager } from '@/managers/UIManager';
import { Renderer } from '@/core/Renderer';
import { InputManager } from '@/managers/InputManager';
import { ParticleSystem } from '@/entities/ParticleSystem';
import { ShellFactory } from '@/entities/ShellFactory';
import { SequenceManager } from '@/managers/SequenceManager';

/**
 * FireworkApp (Main Orchestrator)
*/
export class FireworkApp {
    constructor() {
        this.simSpeed = 1;
        this.i18n = new I18nManager(); // Init micro-translator
        this.stateManager = new StateManager();
        this.soundManager = new SoundManager(this.stateManager);
        this.ui = new UIManager(this);
        this.renderer = new Renderer(this);
        this.inputManager = new InputManager(this);
        this.particles = new ParticleSystem(this);
        this.shellFactory = new ShellFactory(this);
        this.sequenceManager = new SequenceManager(this);

        this.stateManager.subscribe((state, prevState) => {
            if (this.stateManager.canPlaySound !== (prevState.isRunning && prevState.soundEnabled)) {
                if (this.stateManager.canPlaySound) this.soundManager.resumeAll();
                else this.soundManager.pauseAll();
            }
            if (+state.config.skyLighting === Constants.SKY_LIGHT_NONE) {
                if (this.ui.nodes.canvasContainer) {
                    this.ui.nodes.canvasContainer.style.backgroundColor = '#000';
                }
            }
        });
    }

    init() {
        this.stateManager.setState({
            paused: false
        });
        this.ui.render(this.stateManager.state, this.stateManager.state);
        this.renderer.mainStage.addEventListener('ticker', (ft, lag) => this.update(ft, lag));
    }

    update(frameTime, lag) {
        if (!this.stateManager.isRunning) return;

        const timeStep = frameTime * this.simSpeed;
        const speed = this.simSpeed * lag;

        this.renderer.currentFrame++;
        if (!this.inputManager.isUpdatingSpeed) this.renderer.speedBarOpacity = Math.max(0, this.renderer.speedBarOpacity - lag / 30);

        this.sequenceManager.update(timeStep);

        const starDrag = 1 - (1 - 0.98) * speed;
        const starDragHeavy = 1 - (1 - 0.992) * speed;
        const sparkDrag = 1 - (1 - 0.9) * speed;
        const gAcc = timeStep / 1000 * Constants.GRAVITY;

        Utils.colorCodesWithInvis.forEach(color => {
            const stars = this.particles.stars[color];
            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];
                if (star.updateFrame === this.renderer.currentFrame) continue;
                star.updateFrame = this.renderer.currentFrame;

                star.life -= timeStep;
                if (star.life <= 0) {
                    stars.splice(i, 1);
                    this.particles.returnStar(star);
                } else {
                    const burnRate = Math.pow(star.life / star.fullLife, 0.5);
                    const burnRateInverse = 1 - burnRate;

                    star.prevX = star.x;
                    star.prevY = star.y;
                    star.x += star.speedX * speed;
                    star.y += star.speedY * speed;

                    if (!star.heavy) {
                        star.speedX *= starDrag;
                        star.speedY *= starDrag;
                    } else {
                        star.speedX *= starDragHeavy;
                        star.speedY *= starDragHeavy;
                    }
                    star.speedY += gAcc;

                    if (star.spinRadius) {
                        star.spinAngle += star.spinSpeed * speed;
                        star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
                        star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
                    }

                    if (star.sparkFreq) {
                        star.sparkTimer -= timeStep;
                        while (star.sparkTimer < 0) {
                            star.sparkTimer += star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
                            this.particles.addSpark(star.x, star.y, star.sparkColor, Math.random() * Constants.PI_2, Math.random() * star.sparkSpeed * burnRate, star.sparkLife * 0.8 + Math.random() * star.sparkLifeVariation * star.sparkLife);
                        }
                    }

                    if (star.life < star.transitionTime) {
                        if (star.secondColor && !star.colorChanged) {
                            star.colorChanged = true;
                            star.color = star.secondColor;
                            stars.splice(i, 1);
                            this.particles.stars[star.secondColor].push(star);
                            if (star.secondColor === Constants.INVISIBLE) star.sparkFreq = 0;
                        }
                        if (star.strobe) star.visible = Math.floor(star.life / star.strobeFreq) % 3 === 0;
                    }
                }
            }

            const sparks = this.particles.sparks[color];
            for (let i = sparks.length - 1; i >= 0; i--) {
                const spark = sparks[i];
                spark.life -= timeStep;
                if (spark.life <= 0) {
                    sparks.splice(i, 1);
                    this.particles.returnSpark(spark);
                } else {
                    spark.prevX = spark.x;
                    spark.prevY = spark.y;
                    spark.x += spark.speedX * speed;
                    spark.y += spark.speedY * speed;
                    spark.speedX *= sparkDrag;
                    spark.speedY *= sparkDrag;
                    spark.speedY += gAcc;
                }
            }
        });

        this.renderer.render(speed);
    }
}