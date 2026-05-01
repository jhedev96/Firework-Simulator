import { Constants } from '@/utils/Constants';
import { Utils } from '@/utils/Utils';
import { Math2 } from '@/utils/Math2';
import { ShellFactory } from '@/entities/ShellFactory';

/**
 * Shell
*/
export class Shell {
    constructor(options, app) {
        this.app = app;
        Object.assign(this, options);
        this.starLifeVariation = options.starLifeVariation || 0.125;
        this.color = options.color || Utils.randomColor();
        this.glitterColor = options.glitterColor || this.color;

        if (!this.starCount) {
            const density = options.starDensity || 1;
            const scaledSize = this.spreadSize / 54;
            this.starCount = Math.max(6, scaledSize * scaledSize * density);
        }
    }

    launch(position, launchHeight) {
        const width = this.app.renderer.stageW;
        const height = this.app.renderer.stageH;
        const hpad = 60;
        const vpad = 50;
        const minHeight = height - height * 0.45;
        const launchX = position * (width - hpad * 2) + hpad;
        const launchY = height;
        const burstY = minHeight - (launchHeight * (minHeight - vpad));
        const launchDistance = launchY - burstY;
        const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);
        const color = typeof this.color === 'string' && this.color !== 'random' ? this.color : Constants.COLOR.White;

        const comet = this.comet = this.app.particles.addStar(launchX, launchY, color, Math.PI, launchVelocity * (this.horsetail ? 1.2 : 1), launchVelocity * (this.horsetail ? 100 : 400));
        comet.heavy = true;
        comet.spinRadius = Math2.random(0.32, 0.85);
        comet.sparkFreq = 32 / this.app.stateManager.quality;
        if (this.app.stateManager.quality === Constants.QUALITY_HIGH) comet.sparkFreq = 8;
        comet.sparkLife = 320;
        comet.sparkLifeVariation = 3;

        if (this.glitter === 'willow' || this.fallingLeaves) {
            comet.sparkFreq = 20 / this.app.stateManager.quality;
            comet.sparkSpeed = 0.5;
            comet.sparkLife = 500;
        }
        if (this.color === Constants.INVISIBLE) comet.sparkColor = Constants.COLOR.Gold;
        if (Math.random() > 0.4 && !this.horsetail) {
            comet.secondColor = Constants.INVISIBLE;
            comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
        }

        comet.onDeath = c => this.burst(c.x, c.y);

        // ────────────────────────────
        // [REVISI WHISTLE] Visual Wobble + Sound
        // ────────────────────────────
        const config = this.app.stateManager.state.config;
        // 25% chance roket bakal terbang sambil berputar & bunyi siul kalau fiturnya nyala
        if (config.whistles && Math.random() < 0.25) {
            this.app.soundManager.playSound('whistle');
            comet.wobble = true;
            comet.wobbleFreq = Math2.random(15, 30); // Seberapa cepat dia meliuk
            comet.wobbleAmp = Math2.random(2.5, 14.5); // Seberapa lebar liukannya
        } else {
            this.app.soundManager.playSound('lift');
        }
    }

    burst(x, y) {
        const speed = this.spreadSize / 96;
        let color, onDeath, sparkFreq, sparkSpeed, sparkLife, sparkLifeVariation = 0.25;
        let playedDeathSound = false;

        if (this.crossette) onDeath = star => {
            if (!playedDeathSound) {
                this.app.soundManager.playSound('crackleSmall');
                playedDeathSound = true;
            }
            ShellFactory.crossetteEffect(star, this.app);
        };

        if (this.crackle) onDeath = star => {
            if (!playedDeathSound) {
                this.app.soundManager.playSound('crackle');
                playedDeathSound = true;
            }
            ShellFactory.crackleEffect(star, this.app);
        };

        if (this.floral) onDeath = star => ShellFactory.floralEffect(star, this.app);
        if (this.fallingLeaves) onDeath = star => ShellFactory.fallingLeavesEffect(star, this.app);

        const glitterMap = {
            'light': [400, 0.3, 300, 2],
            'medium': [200, 0.44, 700, 2],
            'heavy': [80, 0.8, 1400, 2],
            'thick': [16, this.app.stateManager.quality === Constants.QUALITY_HIGH ? 1.65 : 1.5, 1400, 3],
            'streamer': [32, 1.05, 620, 2],
            'willow': [120, 0.34, 1400, 3.8]
        };

        if (this.glitter && glitterMap[this.glitter]) {
            [sparkFreq, sparkSpeed, sparkLife, sparkLifeVariation] = glitterMap[this.glitter];
            sparkFreq /= this.app.stateManager.quality;
        }

        const starFactory = (angle, speedMult) => {
            const standardInitialSpeed = this.spreadSize / 1800;
            const star = this.app.particles.addStar(x, y, color || Utils.randomColor(), angle, speedMult * speed, this.starLife + Math.random() * this.starLife * this.starLifeVariation, this.horsetail ? (this.comet?.speedX || 0) : 0, this.horsetail ? (this.comet?.speedY || 0) : -standardInitialSpeed);
            if (this.secondColor) {
                star.transitionTime = this.starLife * (Math.random() * 0.05 + 0.32);
                star.secondColor = this.secondColor;
            }
            if (this.strobe) {
                star.transitionTime = this.starLife * (Math.random() * 0.08 + 0.46);
                star.strobe = true;
                star.strobeFreq = Math.random() * 20 + 40;
                if (this.strobeColor) star.secondColor = this.strobeColor;
            }
            star.onDeath = onDeath;
            if (this.glitter) Object.assign(star, {
                sparkFreq,
                sparkSpeed,
                sparkLife,
                sparkLifeVariation,
                sparkColor: this.glitterColor,
                sparkTimer: Math.random() * sparkFreq
            });
        };

        // ───────────────────────────────────────
        // [REVISI WORD SHELL] ULTRA REALISTIC 3D & JITTER
        // ───────────────────────────────────────
        const isWordEnabled = this.app.stateManager.state.config.wordShell && !this.disableWord;
        const triggerWord = isWordEnabled && Math.random() < 0.35;

        if (triggerWord) {
            const rawWords = this.app.stateManager.state.config.customWords || "BOOM";
            const wordList = rawWords.split(',').map(w => w.trim()).filter(w => w.length > 0);
            const selectedWord = Math2.randomChoice(wordList) || "BOOM";
            const dotsMap = Utils.getTextDots(selectedWord);

            if (dotsMap && dotsMap.points.length > 0) {
                const wordColor = Utils.randomColor({
                    limitWhite: true
                });
                const dragFactor = 0.98;
                const explosionPowerMultiplier = (this.spreadSize / 130);

                // 1. Dynamic Rotation (Tilt)
                const isTilted = Math.random() < 0.7;
                const tiltAngle = isTilted ? Math2.random(-0.5, 0.5) : 0;
                const cosA = Math.cos(tiltAngle);
                const sinA = Math.sin(tiltAngle);

                // 2. 3D Perspective Squash (Bikin tulisan nampak menghadap serong)
                const squashX = Math.random() < 0.4 ? Math2.random(0.6, 1) : 1;
                const squashY = Math.random() < 0.4 ? Math2.random(0.6, 1) : 1;

                // 3. Sync Disappearance Style
                const wordStyles = ['crackle', 'strobe', 'floral', 'glitter', 'none'];
                const selectedStyle = Math2.randomChoice(wordStyles);
                let playedWordDeathSound = false;

                dotsMap.points.forEach(point => {
                    // Terapkan matriks rotasi + 3D squash
                    const rotatedX = (point.x * cosA - point.y * sinA) * squashX;
                    const rotatedY = (point.x * sinA + point.y * cosA) * squashY;

                    // 4. JITTER! Acak titik sedikit biar nampak organik kayak bubuk mesiu pecah, gak kotak sempurna.
                    const jitterX = Math2.random(-5, 5);
                    const jitterY = Math2.random(-5, 5);
                    const targetX = rotatedX + jitterX;
                    const targetY = rotatedY + jitterY;

                    const targetDistance = Math.sqrt(targetX * targetX + targetY * targetY);
                    const targetAngle = Math.atan2(targetX, targetY);
                    const requiredVelocity = targetDistance * (1 - dragFactor) * explosionPowerMultiplier;

                    // Variasi lifespan organik
                    const lifeVariation = Math2.random(-300, 400);

                    const star = this.app.particles.addStar(
                        x, y, wordColor,
                        targetAngle,
                        requiredVelocity,
                        this.starLife + lifeVariation,
                        (this.comet?.speedX * 0.15) || 0, // Momentum bawaan komet (sedikit horizontal)
                        (this.comet?.speedY * 0.15 || 0) - 0.4 // Gravitasi kecil di awal pas pecah
                    );

                    // Terapkan efek visual
                    if (selectedStyle === 'strobe') {
                        star.strobe = true;
                        star.strobeFreq = Math.random() * 20 + 30;
                        star.transitionTime = this.starLife;
                    } else if (selectedStyle === 'glitter') {
                        star.sparkFreq = 130 / this.app.stateManager.quality;
                        star.sparkSpeed = 0.4;
                        star.sparkLife = 600;
                        star.sparkColor = Constants.COLOR.Gold;
                    } else if (selectedStyle === 'crackle') {
                        star.onDeath = (s) => {
                            if (Math.random() < 0.15) { // 15% meledak
                                if (!playedWordDeathSound) {
                                    this.app.soundManager.playSound('crackleSmall');
                                    playedWordDeathSound = true;
                                }
                                ShellFactory.crackleEffect(s, this.app);
                            }
                        };
                    } else if (selectedStyle === 'floral') {
                        star.onDeath = (s) => {
                            if (Math.random() < 0.08) ShellFactory.floralEffect(s, this.app);
                        };
                    }
                });

                this.app.particles.addBurstFlash(x, y, this.spreadSize / 3);
                this.app.soundManager.playSound('burst', 1.2);
                return; // Done
            }
        }
        // ──────────────────────────────────────────────────────────

        if (typeof this.color === 'string') {
            color = this.color === 'random' ? null : this.color;
            if (this.ring) {
                const ringStartAngle = Math.random() * Math.PI;
                const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;
                Utils.createParticleArc(0, Constants.PI_2, this.starCount, 0, angle => {
                    const initX = Math.sin(angle) * speed * ringSquash;
                    const initY = Math.cos(angle) * speed;
                    const newSpeed = Math2.pointDist(0, 0, initX, initY);
                    const newAngle = Math2.pointAngle(0, 0, initX, initY) + ringStartAngle;
                    const star = this.app.particles.addStar(x, y, color, newAngle, newSpeed, this.starLife + Math.random() * this.starLife * this.starLifeVariation);
                    if (this.glitter) Object.assign(star, {
                        sparkFreq,
                        sparkSpeed,
                        sparkLife,
                        sparkLifeVariation,
                        sparkColor: this.glitterColor,
                        sparkTimer: Math.random() * sparkFreq
                    });
                });
            } else {
                Utils.createBurst(this.starCount, starFactory);
            }
        } else if (Array.isArray(this.color)) {
            if (Math.random() < 0.5) {
                const start = Math.random() * Math.PI;
                color = this.color[0];
                Utils.createBurst(this.starCount, starFactory, start, Math.PI);
                color = this.color[1];
                Utils.createBurst(this.starCount, starFactory, start + Math.PI, Math.PI);
            } else {
                color = this.color[0];
                Utils.createBurst(this.starCount / 2, starFactory);
                color = this.color[1];
                Utils.createBurst(this.starCount / 2, starFactory);
            }
        }

        if (this.pistil) {
            new Shell({
                spreadSize: this.spreadSize * 0.5,
                starLife: this.starLife * 0.6,
                starLifeVariation: this.starLifeVariation,
                starDensity: 1.4,
                color: this.pistilColor,
                glitter: 'light',
                glitterColor: this.pistilColor === Constants.COLOR.Gold ? Constants.COLOR.Gold : Constants.COLOR.White,
                disableWord: true
            }, this.app).burst(x, y);
        }

        if (this.streamers) {
            new Shell({
                spreadSize: this.spreadSize * 0.9,
                starLife: this.starLife * 0.8,
                starLifeVariation: this.starLifeVariation,
                starCount: Math.floor(Math.max(6, this.spreadSize / 45)),
                color: Constants.COLOR.White,
                glitter: 'streamer',
                disableWord: true
            }, this.app).burst(x, y);
        }

        this.app.particles.addBurstFlash(x, y, this.spreadSize / 4);
        if (this.comet) {
            const sizeDiff = Math.min(2, this.app.stateManager.shellSize - this.shellSize);
            this.app.soundManager.playSound('burst', (1 - sizeDiff / 2) * 0.3 + 0.7);
        }
    }
}