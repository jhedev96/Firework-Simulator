import { Constants } from '@/utils/Constants';

/**
 * Utils
*/
export class Utils {
    static colorNames = Object.keys(Constants.COLOR);
    static colorCodes = Utils.colorNames.map(name => Constants.COLOR[name]);
    static colorCodesWithInvis = [...Utils.colorCodes, Constants.INVISIBLE];

    static colorTuples = Utils.colorCodes.reduce((acc, hex) => {
        acc[hex] = {
            r: parseInt(hex.substr(1, 2), 16),
            g: parseInt(hex.substr(3, 2), 16),
            b: parseInt(hex.substr(5, 2), 16)
        };
        return acc;
    }, {});

    static lastColor = null;
    static wordCache = {};
    static MAX_CACHE_SIZE = 20;
    
    // Reusable off-screen canvas for text rendering
    static textCanvas = null;
    static textCtx = null;

    // Initialize reusable canvas
    static initTextCanvas() {
        if (!Utils.textCanvas) {
            Utils.textCanvas = document.createElement("canvas");
            Utils.textCtx = Utils.textCanvas.getContext("2d", { willReadFrequently: true });
        }
    }

    // LRU Cache helper with size limit
    static _updateCache(key) {
        const cache = Utils.wordCache;
        // Move to end (most recently used)
        if (cache[key]) {
            const entry = cache[key];
            delete cache[key];
            cache[key] = entry;
            return;
        }
        // Evict oldest if at capacity
        const keys = Object.keys(cache);
        if (keys.length >= Utils.MAX_CACHE_SIZE) {
            delete cache[keys[0]];
        }
    }

    static randomColorSimple() {
        return Utils.colorCodes[Math.random() * Utils.colorCodes.length | 0];
    }

    static randomColor(options = {}) {
        const {
            notSame,
            notColor,
            limitWhite
        } = options;
        let color = Utils.randomColorSimple();
        if (limitWhite && color === Constants.COLOR.White && Math.random() < 0.6) color = Utils.randomColorSimple();
        if (notSame) {
            while (color === Utils.lastColor) color = Utils.randomColorSimple();
        } else if (notColor) {
            while (color === notColor) color = Utils.randomColorSimple();
        }
        Utils.lastColor = color;
        return color;
    }

    static whiteOrGold() {
        return Math.random() < 0.5 ? Constants.COLOR.Gold : Constants.COLOR.White;
    }

    static makePistilColor(shellColor) {
        return (shellColor === Constants.COLOR.White || shellColor === Constants.COLOR.Gold) ? Utils.randomColor({
            notColor: shellColor
        }) : Utils.whiteOrGold();
    }

    static createParticleArc(start, arcLength, count, randomness, particleFactory) {
        const angleDelta = arcLength / count;
        const end = start + arcLength - (angleDelta * 0.5);
        if (end > start) {
            for (let angle = start; angle < end; angle = angle + angleDelta) {
                particleFactory(angle + Math.random() * angleDelta * randomness);
            }
        } else {
            for (let angle = start; angle > end; angle = angle + angleDelta) {
                particleFactory(angle + Math.random() * angleDelta * randomness);
            }
        }
    }

    static createBurst(count, particleFactory, startAngle = 0, arcLength = Constants.PI_2) {
        const R = 0.5 * Math.sqrt(count / Math.PI);
        const C = 2 * R * Math.PI;
        const C_HALF = C / 2;
        for (let i = 0; i <= C_HALF; i++) {
            const ringAngle = i / C_HALF * Constants.PI_HALF;
            const ringSize = Math.cos(ringAngle);
            const partsPerFullRing = C * ringSize;
            const partsPerArc = partsPerFullRing * (arcLength / Constants.PI_2);
            const angleInc = Constants.PI_2 / partsPerFullRing;
            const angleOffset = Math.random() * angleInc + startAngle;
            const maxRandomAngleOffset = angleInc * 0.33;
            for (let j = 0; j < partsPerArc; j++) {
                particleFactory(angleInc * j + angleOffset + Math.random() * maxRandomAngleOffset, ringSize);
            }
        }
    }

    // Optimasi Text to Dot Array pakai Memoization (Cache)
    static getTextDots(text) {
        if (!text) return null;
        if (Utils.wordCache[text]) {
            Utils._updateCache(text);
            return Utils.wordCache[text];
        }

        // Initialize reusable canvas on first use
        Utils.initTextCanvas();

        const density = 3; // Seberapa rapet titik-titiknya
        const fontSizeStr = "80px";
        const fontFamily = "Russo One, sans-serif";
        const canvas = Utils.textCanvas;
        const ctx = Utils.textCtx;

        ctx.font = `${fontSizeStr} ${fontFamily}`;
        const width = ctx.measureText(text).width;
        const fontSize = parseInt(fontSizeStr.match(/(\d+)px/)[1]);

        canvas.width = width + 20;
        canvas.height = fontSize + 30;

        ctx.font = `${fontSizeStr} ${fontFamily}`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Gambar di titik pusat canvas
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Clear canvas immediately after reading pixel data
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const dots = [];

        for (let y = 0; y < imageData.height; y += density) {
            for (let x = 0; x < imageData.width; x += density) {
                const i = (y * imageData.width + x) * 4;
                if (imageData.data[i + 3] > 128) {
                    // Normalize (0,0) ke titik pusat biar pas meledak gampang di-rotate
                    dots.push({
                        x: x - canvas.width / 2,
                        y: y - canvas.height / 2
                    });
                }
            }
        }

        const result = {
            width: canvas.width,
            height: canvas.height,
            points: dots
        };
        Utils.wordCache[text] = result;
        return result;
    }

    static randomInt(min, max) {
        return Math.floor(
            Math.random() * (max - min + 1) + min
        );
    }
    static randomFloat(min, max, int = 1000) {
        return Math.random() * (max - min) + min * int;
    }
}