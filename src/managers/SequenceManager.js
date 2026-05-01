import { Constants } from '@/utils/Constants';
import { Shell } from '@/entities/Shell';
import { ShellFactory } from '@/entities/ShellFactory';

/**
 * SequenceManager
*/
export class SequenceManager {
    constructor(app) {
        this.app = app;
        this.autoLaunchTime = 0;
        this.isFirstSeq = true;
        this.currentFinaleCount = 0;
        this.finaleCount = 32;
        this.cooldowns = {
            seqSmallBarrage: 0
        };
    }

    getRandomShellSize() {
        const baseSize = this.app.stateManager.shellSize;
        const maxVariance = Math.min(2.5, baseSize);
        const variance = Math.random() * maxVariance;
        const size = baseSize - variance;
        const height = maxVariance === 0 ? Math.random() : 1 - (variance / maxVariance);
        const centerOffset = Math.random() * (1 - height * 0.65) * 0.5;
        const x = Math.random() < 0.5 ? 0.5 - centerOffset : 0.5 + centerOffset;

        return {
            size,
            x: (1 - 0.36) * x + 0.18,
            height: height * 0.75
        };
    }

    seqRandomShell() {
        const {
            size,
            x,
            height
        } = this.getRandomShellSize();
        const shell = new Shell(this.app.shellFactory.shellFromConfig(size), this.app);
        shell.launch(x, height);

        return 900 + Math.random() * 600 + (shell.fallingLeaves ? 4600 : shell.starLife);
    }

    seqRandomFastShell() {
        const {
            size,
            x,
            height
        } = this.getRandomShellSize();
        const shell = new Shell(ShellFactory.randomFastShell()(size, this.app), this.app);
        shell.launch(x, height);

        return 900 + Math.random() * 600 + shell.starLife;
    }

    seqTwoRandom() {
        const s1 = this.getRandomShellSize();
        const s2 = this.getRandomShellSize();
        const shell1 = new Shell(this.app.shellFactory.shellFromConfig(s1.size), this.app);
        const shell2 = new Shell(this.app.shellFactory.shellFromConfig(s2.size), this.app);
        shell1.launch(0.3 + Math.random() * 0.2 - 0.1, s1.height);

        setTimeout(() => shell2.launch(0.7 + Math.random() * 0.2 - 0.1, s2.height), 100);

        return 900 + Math.random() * 600 + Math.max(shell1.starLife, shell2.starLife) + (shell1.fallingLeaves || shell2.fallingLeaves ? 4600 : 0);
    }

    seqTriple() {
        const shellType = ShellFactory.randomFastShell();
        const baseSize = this.app.stateManager.shellSize;
        const smallSize = Math.max(0, baseSize - 1.25);
        new Shell(shellType(baseSize, this.app), this.app).launch(0.5 + Math.random() * 0.08 - 0.04, 0.7);

        setTimeout(() => new Shell(shellType(smallSize, this.app), this.app).launch(0.2 + Math.random() * 0.08 - 0.04, 0.1), 1000 + Math.random() * 400);
        setTimeout(() => new Shell(shellType(smallSize, this.app), this.app).launch(0.8 + Math.random() * 0.08 - 0.04, 0.1), 1000 + Math.random() * 400);

        return 4000;
    }

    seqPyramid() {
        const barrageCountHalf = Constants.IS_DESKTOP ? 7 : 4;
        const largeSize = this.app.stateManager.shellSize;
        const smallSize = Math.max(0, largeSize - 3);
        const randomMainShell = Math.random() < 0.78 ? ShellFactory.shellTypes['Crysanthemum'] : ShellFactory.shellTypes['Ring'];

        const launchShell = (x, useSpecial) => {
            const shellType = this.app.stateManager.shellName === 'Random' ? (useSpecial ? ShellFactory.randomShell : randomMainShell) : ShellFactory.shellTypes[this.app.stateManager.shellName];
            new Shell(shellType(useSpecial ? largeSize : smallSize, this.app), this.app).launch(x, useSpecial ? 0.75 : (x <= 0.5 ? x / 0.5 : (1 - x) / 0.5) * 0.42);
        };

        let count = 0,
            delay = 0;

        while (count <= barrageCountHalf) {
            if (count === barrageCountHalf) {
                setTimeout(() => launchShell(0.5, true), delay);
            } else {
                const offset = count / barrageCountHalf * 0.5;
                setTimeout(() => launchShell(offset, false), delay);
                setTimeout(() => launchShell(1 - offset, false), delay + Math.random() * 30 + 30);
            }
            count++;
            delay += 200;
        }

        return 3400 + barrageCountHalf * 250;
    }

    seqSmallBarrage() {
        this.cooldowns.seqSmallBarrage = Date.now();
        const barrageCount = Constants.IS_DESKTOP ? 11 : 5;
        const specialIndex = Constants.IS_DESKTOP ? 3 : 1;
        const shellSize = Math.max(0, this.app.stateManager.shellSize - 2);
        const randomMainShell = Math.random() < 0.78 ? ShellFactory.shellTypes['Crysanthemum'] : ShellFactory.shellTypes['Ring'];

        const launchShell = (x, useSpecial) => {
            const shellType = this.app.stateManager.shellName === 'Random' ? (useSpecial ? ShellFactory.randomFastShell() : randomMainShell) : ShellFactory.shellTypes[this.app.stateManager.shellName];
            new Shell(shellType(shellSize, this.app), this.app).launch(x, ((Math.cos(x * 5 * Math.PI + Constants.PI_HALF) + 1) / 2) * 0.75);
        };

        let count = 0,
            delay = 0;

        while (count < barrageCount) {
            if (count === 0) {
                launchShell(0.5, false);
                count++;
            } else {
                const offset = (count + 1) / barrageCount / 2;
                const useSpecial = count === specialIndex;
                setTimeout(() => launchShell(0.5 + offset, useSpecial), delay);
                setTimeout(() => launchShell(0.5 - offset, useSpecial), delay + Math.random() * 30 + 30);
                count += 2;
            }
            delay += 200;
        }

        return 3400 + barrageCount * 120;
    }

    startSequence() {
        if (this.isFirstSeq) {
            this.isFirstSeq = false;
            if (Constants.IS_HEADER) return this.seqTwoRandom();
            new Shell(ShellFactory.shellTypes['Crysanthemum'](this.app.stateManager.shellSize, this.app), this.app).launch(0.5, 0.5);
            return 2400;
        }

        if (this.app.stateManager.state.config.finale) {
            this.seqRandomFastShell();
            if (this.currentFinaleCount < this.finaleCount) {
                this.currentFinaleCount++;
                return 170;
            }
            this.currentFinaleCount = 0;
            return 6000;
        }

        const rand = Math.random();
        if (rand < 0.08 && Date.now() - this.cooldowns.seqSmallBarrage > 15000) return this.seqSmallBarrage();
        if (rand < 0.1) return this.seqPyramid();
        if (rand < 0.6 && !Constants.IS_HEADER) return this.seqRandomShell();
        if (rand < 0.8) return this.seqTwoRandom();

        return this.seqTriple();
    }

    update(timeStep) {
        if (!this.app.stateManager.state.config.autoLaunch) return;
        this.autoLaunchTime -= timeStep;

        if (this.autoLaunchTime <= 0) {
            this.autoLaunchTime = this.startSequence() * 1.25;
        }
    }
}