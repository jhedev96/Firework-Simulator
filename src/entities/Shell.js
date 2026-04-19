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

        const now = Date.now();

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

        // cek apakah waktunya reset counter
        if (this.app.stateManager.whistleSfx.reset) {
            if (now - this.app.stateManager.whistleSfx.lastReset > this.app.stateManager.whistleSfx.resetTime) {
                this.app.stateManager.whistleSfx.count = 0;
                this.app.stateManager.whistleSfx.lastReset = now;
            }
        }

        // Hybrid rule: max 5x per periode reset, cooldown 2s, 40% chance
        if (
            this.app.stateManager.whistleSfx.count < this.app.stateManager.whistleSfx.max &&
            (now - this.app.stateManager.whistleSfx.lastTime > this.app.stateManager.whistleSfx.coolDown) &&
            Math.random() < this.app.stateManager.whistleSfx.probChance
        ) {
            this.app.soundManager.playSound('lift');
            this.app.soundManager.playSound('whistle');
            this.app.stateManager.whistleSfx.count++;
            this.app.stateManager.whistleSfx.lastTime = now;
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

        // ─── DYNAMIC PHYSICS & SYNC DISAPPEARANCE ─────────────────────────────────────────
        const isWordEnabled = this.app.stateManager.state.config.wordShell && !this.disableWord;
        const triggerWord = isWordEnabled && Math.random() < 0.35; // 35% chance biar makin sering muncul

        if (triggerWord) {
            const rawWords = this.app.stateManager.state.config.customWords || "BOOM";
            const wordList = rawWords.split(',').map(w => w.trim()).filter(w => w.length > 0);
            const selectedWord = Math2.randomChoice(wordList) || "BOOM";
            const dotsMap = Utils.getTextDots(selectedWord);

            if (dotsMap && dotsMap.points.length > 0) {
                const wordColor = Utils.randomColor({
                    limitWhite: true
                });
                const dragFactor = 0.98; // Konstanta fisika sistem
                const explosionPowerMultiplier = (this.spreadSize / 130);

                // Dynamic Rotation
                // Bikin kemiringan acak dari -30 derajat sampai +30 derajat, atau lurus
                const isTilted = Math.random() < 0.7; // 70% peluang miring
                const tiltAngle = isTilted ? Math2.random(-0.5, 0.5) : 0;
                const cosA = Math.cos(tiltAngle);
                const sinA = Math.sin(tiltAngle);

                // Sync Disappearance (Random Style)
                // Biar pas ngilang nggak monoton, kita acak gaya hilangnya
                const wordStyles = ['crackle', 'strobe', 'floral', 'glitter'];
                const selectedStyle = Math2.randomChoice(wordStyles);
                let playedWordDeathSound = false; // Flag throttle sound buat crackle

                dotsMap.points.forEach(point => {
                    // Terapkan matriks rotasi 2D ke titik koordinat teks
                    const rotatedX = point.x * cosA - point.y * sinA;
                    const rotatedY = point.x * sinA + point.y * cosA;

                    // Abstrak & Jitter 
                    // Bikin posisi target sedikit acak biar nggak kaku kayak kotak
                    const targetX = rotatedX + Math2.random(-4, 4);
                    const targetY = rotatedY + Math2.random(-4, 4);

                    const targetDistance = Math.sqrt(targetX * targetX + targetY * targetY);

                    // Pakai Math.atan2(dx, dy) buat sistem koordinat canvas (X = sin, Y = cos)
                    const targetAngle = Math.atan2(targetX, targetY);

                    // Hitung seberapa kuat harus dilempar biar nyampe di titik target
                    const requiredVelocity = targetDistance * (1 - dragFactor) * explosionPowerMultiplier;

                    // Variasi lifespan biar hilangnya satu-satu organik
                    const lifeVariation = Math2.random(-200, 500);

                    const star = this.app.particles.addStar(
                        x, y, wordColor,
                        targetAngle,
                        requiredVelocity,
                        this.starLife + lifeVariation,
                        (this.comet?.speedX * 0.15) || 0, // Dikit banget pengaruh momentum awal 
                        (this.comet?.speedY * 0.15 || 0) - 0.4 // Gravitasi kecil di awal
                    );

                    // Terapkan efek visual berdasarkan 'selectedStyle'
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
                            // Cuma 12% titik yang meledak biar hp nggak hang & suara nggak nabrak
                            if (Math.random() < 0.12) {
                                if (!playedWordDeathSound) {
                                    this.app.soundManager.playSound('crackleSmall');
                                    playedWordDeathSound = true;
                                }
                                ShellFactory.crackleEffect(s, this.app);
                            }
                        };
                    } else if (selectedStyle === 'floral') {
                        star.onDeath = (s) => {
                            if (Math.random() < 0.08) { // Cuma 8% titik yg jadi bunga
                                ShellFactory.floralEffect(s, this.app);
                            }
                        };
                    }
                });

                this.app.particles.addBurstFlash(x, y, this.spreadSize / 3);
                this.app.soundManager.playSound('burst', 1.2);
                return; // Selesai ngerender teks, nggak usah ngerender bintang normal
            }
        }
        // ──────────────────────────────────────────────

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