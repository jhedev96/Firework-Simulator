import { Constants } from '@/utils/Constants';
import { Utils } from '@/utils/Utils';
import { Shell } from '@/entities/Shell';


/**
 * ShellFactory
*/
export class ShellFactory {
    static crysanthemumShell(size, app) {
        const glitter = Math.random() < 0.25;
        const singleColor = Math.random() < 0.72;
        const color = singleColor ? Utils.randomColor({
            limitWhite: true
        }) : [Utils.randomColor(), Utils.randomColor({
            notSame: true
        })];
        const pistil = singleColor && Math.random() < 0.42;
        const pistilColor = pistil && Utils.makePistilColor(color);
        const secondColor = singleColor && (Math.random() < 0.2 || color === Constants.COLOR.White) ? pistilColor || Utils.randomColor({
            notColor: color,
            limitWhite: true
        }) : null;

        let starDensity = glitter ? 1.1 : 1.25;
        if (app.stateManager.quality === Constants.QUALITY_LOW) starDensity *= 0.8;
        if (app.stateManager.quality === Constants.QUALITY_HIGH) starDensity = 1.2;

        return {
            shellSize: size,
            spreadSize: 300 + size * 100,
            starLife: 900 + size * 200,
            starDensity,
            color,
            secondColor,
            glitter: glitter ? 'light' : '',
            glitterColor: Utils.whiteOrGold(),
            pistil,
            pistilColor,
            streamers: !pistil && color !== Constants.COLOR.White && Math.random() < 0.42
        };
    }

    static ghostShell(size, app) {
        const shell = ShellFactory.crysanthemumShell(size, app);
        shell.starLife *= 1.5;
        shell.streamers = true;
        shell.color = Constants.INVISIBLE;
        shell.secondColor = Utils.randomColor({
            notColor: Constants.COLOR.White
        });
        shell.glitter = '';
        return shell;
    }

    static strobeShell(size) {
        const color = Utils.randomColor({
            limitWhite: true
        });
        return {
            shellSize: size,
            spreadSize: 280 + size * 92,
            starLife: 1100 + size * 200,
            starLifeVariation: 0.4,
            starDensity: 1.1,
            color,
            glitter: 'light',
            glitterColor: Constants.COLOR.White,
            strobe: true,
            strobeColor: Math.random() < 0.5 ? Constants.COLOR.White : null,
            pistil: Math.random() < 0.5,
            pistilColor: Utils.makePistilColor(color)
        };
    }

    static palmShell(size) {
        const thick = Math.random() < 0.5;
        return {
            shellSize: size,
            color: Utils.randomColor(),
            spreadSize: 250 + size * 75,
            starDensity: thick ? 0.15 : 0.4,
            starLife: 1800 + size * 200,
            glitter: thick ? 'thick' : 'heavy'
        };
    }

    static ringShell(size) {
        const color = Utils.randomColor();
        const pistil = Math.random() < 0.75;
        return {
            shellSize: size,
            ring: true,
            color,
            spreadSize: 300 + size * 100,
            starLife: 900 + size * 200,
            starCount: 2.2 * Constants.PI_2 * (size + 1),
            pistil,
            pistilColor: Utils.makePistilColor(color),
            glitter: !pistil ? 'light' : '',
            glitterColor: color === Constants.COLOR.Gold ? Constants.COLOR.Gold : Constants.COLOR.White,
            streamers: Math.random() < 0.3
        };
    }

    static crossetteShell(size) {
        const color = Utils.randomColor({
            limitWhite: true
        });
        return {
            shellSize: size,
            spreadSize: 300 + size * 100,
            starLife: 750 + size * 160,
            starLifeVariation: 0.4,
            starDensity: 0.85,
            color,
            crossette: true,
            pistil: Math.random() < 0.5,
            pistilColor: Utils.makePistilColor(color)
        };
    }

    static floralShell(size) {
        return {
            shellSize: size,
            spreadSize: 300 + size * 120,
            starDensity: 0.12,
            starLife: 500 + size * 50,
            starLifeVariation: 0.5,
            color: Math.random() < 0.65 ? 'random' : (Math.random() < 0.15 ? Utils.randomColor() : [Utils.randomColor(), Utils.randomColor({
                notSame: true
            })]),
            floral: true
        };
    }

    static fallingLeavesShell(size) {
        return {
            shellSize: size,
            color: Constants.INVISIBLE,
            spreadSize: 300 + size * 120,
            starDensity: 0.12,
            starLife: 500 + size * 50,
            starLifeVariation: 0.5,
            glitter: 'medium',
            glitterColor: Constants.COLOR.Gold,
            fallingLeaves: true
        };
    }

    static willowShell(size) {
        return {
            shellSize: size,
            spreadSize: 300 + size * 100,
            starDensity: 0.6,
            starLife: 3000 + size * 300,
            glitter: 'willow',
            glitterColor: Constants.COLOR.Gold,
            color: Constants.INVISIBLE
        };
    }

    static crackleShell(size, app) {
        const color = Math.random() < 0.75 ? Constants.COLOR.Gold : Utils.randomColor();
        return {
            shellSize: size,
            spreadSize: 380 + size * 75,
            starDensity: app.stateManager.quality === Constants.QUALITY_LOW ? 0.65 : 1,
            starLife: 600 + size * 100,
            starLifeVariation: 0.32,
            glitter: 'light',
            glitterColor: Constants.COLOR.Gold,
            color,
            crackle: true,
            pistil: Math.random() < 0.65,
            pistilColor: Utils.makePistilColor(color)
        };
    }

    static horsetailShell(size) {
        const color = Utils.randomColor();
        return {
            shellSize: size,
            horsetail: true,
            color,
            spreadSize: 250 + size * 38,
            starDensity: 0.9,
            starLife: 2500 + size * 300,
            glitter: 'medium',
            glitterColor: Math.random() < 0.5 ? Utils.whiteOrGold() : color,
            strobe: color === Constants.COLOR.White
        };
    }

    static get shellTypes() {
        return {
            'Random': (size, app) => ShellFactory.randomShell(size, app),
            'Crackle': ShellFactory.crackleShell,
            'Crossette': ShellFactory.crossetteShell,
            'Crysanthemum': ShellFactory.crysanthemumShell,
            'Falling Leaves': ShellFactory.fallingLeavesShell,
            'Floral': ShellFactory.floralShell,
            'Ghost': ShellFactory.ghostShell,
            'Horse Tail': ShellFactory.horsetailShell,
            'Palm': ShellFactory.palmShell,
            'Ring': ShellFactory.ringShell,
            'Strobe': ShellFactory.strobeShell,
            'Willow': ShellFactory.willowShell
        };
    }

    static get shellNames() {
        return Object.keys(ShellFactory.shellTypes);
    }

    static randomShellName() {
        return Math.random() < 0.5 ? 'Crysanthemum' : ShellFactory.shellNames[(Math.random() * (ShellFactory.shellNames.length - 1) + 1) | 0];
    }

    static randomShell(size, app) {
        if (Constants.IS_HEADER) return ShellFactory.randomFastShell()(size, app);
        return ShellFactory.shellTypes[ShellFactory.randomShellName()](size, app);
    }

    static randomFastShell() {
        let shellName = ShellFactory.randomShellName();
        while (['Falling Leaves', 'Floral', 'Willow'].includes(shellName)) shellName = ShellFactory.randomShellName();
        return ShellFactory.shellTypes[shellName];
    }

    static crossetteEffect(star, app) {
        Utils.createParticleArc(Math.random() * Constants.PI_HALF, Constants.PI_2, 4, 0.5, angle => {
            app.particles.addStar(star.x, star.y, star.color, angle, Math.random() * 0.6 + 0.75, 600);
        });
    }

    static floralEffect(star, app) {
        Utils.createBurst(12 + 6 * app.stateManager.quality, (angle, speedMult) => {
            app.particles.addStar(star.x, star.y, star.color, angle, speedMult * 2.4, 1000 + Math.random() * 300, star.speedX, star.speedY);
        });
        app.particles.addBurstFlash(star.x, star.y, 46);
        app.soundManager.playSound('burstSmall');
    }

    static fallingLeavesEffect(star, app) {
        Utils.createBurst(7, (angle, speedMult) => {
            const newStar = app.particles.addStar(star.x, star.y, Constants.INVISIBLE, angle, speedMult * 2.4, 2400 + Math.random() * 600, star.speedX, star.speedY);
            Object.assign(newStar, {
                sparkColor: Constants.COLOR.Gold,
                sparkFreq: 144 / app.stateManager.quality,
                sparkSpeed: 0.28,
                sparkLife: 750,
                sparkLifeVariation: 3.2
            });
        });
        app.particles.addBurstFlash(star.x, star.y, 46);
        app.soundManager.playSound('burstSmall');
    }

    static crackleEffect(star, app) {
        const count = app.stateManager.quality === Constants.QUALITY_HIGH ? 32 : 16;
        Utils.createParticleArc(0, Constants.PI_2, count, 1.8, angle => {
            app.particles.addSpark(star.x, star.y, Constants.COLOR.Gold, angle, Math.pow(Math.random(), 0.45) * 2.4, 300 + Math.random() * 200);
        });
    }

    constructor(app) {
        this.app = app;
    }

    shellFromConfig(size) {
        return ShellFactory.shellTypes[this.app.stateManager.shellName](size, this.app);
    }

    launchShellFromConfig(event) {
        const shell = new Shell(this.shellFromConfig(this.app.stateManager.shellSize), this.app);
        const w = this.app.renderer.mainStage.width;
        const h = this.app.renderer.mainStage.height;
        const edge = 0.18;
        const hPos = event ? event.x / w : (1 - edge * 2) * Math.random() + edge;
        const vPos = event ? 1 - event.y / h : Math.random() * 0.75;
        shell.launch(hPos, vPos);
    }
}