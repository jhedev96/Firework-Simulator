import { Constants } from '@/utils/Constants';
import { Utils } from '@/utils/Utils';

/**
 * ParticleSystem
*/
export class ParticleSystem {
    constructor(app) {
        this.app = app;
        this.stars = this.createCollection();
        this.sparks = this.createCollection();
        this.burstFlashes = [];

        this.starPool = [];
        this.sparkPool = [];
        this.flashPool = [];
    }

    createCollection() {
        const col = {};
        Utils.colorCodesWithInvis.forEach(c => col[c] = []);
        return col;
    }

    addStar(x, y, color, angle, speed, life, speedOffX = 0, speedOffY = 0) {
        const instance = this.starPool.pop() || {};
        instance.visible = true;
        instance.heavy = false;
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed + speedOffX;
        instance.speedY = Math.cos(angle) * speed + speedOffY;
        instance.life = life;
        instance.fullLife = life;
        instance.spinAngle = Math.random() * Constants.PI_2;
        instance.spinSpeed = 0.8;
        instance.spinRadius = 0;
        instance.sparkFreq = 0;
        instance.sparkSpeed = 1;
        instance.sparkTimer = 0;
        instance.sparkColor = color;
        instance.sparkLife = 750;
        instance.sparkLifeVariation = 0.25;
        instance.strobe = false;

        this.stars[color].push(instance);
        return instance;
    }

    returnStar(instance) {
        if (instance.onDeath) instance.onDeath(instance);
        
        // Comprehensive reset of all particle properties for pool reuse
        instance.onDeath = null;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;
        
        // Reset word-specific properties
        instance.strobe = false;
        instance.strobeFreq = 0;
        instance.sparkFreq = 0;
        instance.sparkSpeed = 1;
        instance.sparkTimer = 0;
        instance.sparkColor = instance.color;
        instance.sparkLife = 750;
        instance.sparkLifeVariation = 0.25;
        instance.spinAngle = 0;
        instance.spinRadius = 0;
        
        this.starPool.push(instance);
    }

    addSpark(x, y, color, angle, speed, life) {
        const instance = this.sparkPool.pop() || {};
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed;
        instance.speedY = Math.cos(angle) * speed;
        instance.life = life;

        this.sparks[color].push(instance);
        return instance;
    }

    returnSpark(instance) {
        this.sparkPool.push(instance);
    }

    addBurstFlash(x, y, radius) {
        const instance = this.flashPool.pop() || {};
        instance.x = x;
        instance.y = y;
        instance.radius = radius;

        this.burstFlashes.push(instance);
        return instance;
    }

    returnBurstFlash(instance) {
        this.flashPool.push(instance);
    }
}