/**
 * Math2
*/
export class Math2 {
    // degree/radian conversion constants
    static toDeg = 180 / Math.PI;
    static toRad = Math.PI / 180;
    static halfPI = Math.PI / 2;
    static twoPI = Math.PI * 2;

    // Pythagorean Theorem distance calculation
    static dist(width, height) {
        return Math.sqrt(width * width + height * height);
    }

    // Pythagorean Theorem point distance calculation
    static pointDist(x1, y1, x2, y2) {
        const distX = x2 - x1;
        const distY = y2 - y1;
        return Math.sqrt(distX * distX + distY * distY);
    }

    // Returns the angle (in radians) of a 2D vector
    static angle(width, height) {
        return Math2.halfPI + Math.atan2(height, width);
    }

    // Returns the angle (in radians) between two points
    static pointAngle(x1, y1, x2, y2) {
        return Math2.halfPI + Math.atan2(y2 - y1, x2 - x1);
    }

    // Splits a speed vector into x and y components
    static splitVector(speed, angle) {
        return {
            x: Math.sin(angle) * speed,
            y: -Math.cos(angle) * speed
        };
    }

    // Generates a random number between min (inclusive) and max (exclusive)
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Generates a random integer between and possibly including min and max values
    static randomInt(min, max) {
        return ((Math.random() * (max - min + 1)) | 0) + min;
    }

    // Returns a random element from an array, or simply the set of provided arguments
    static randomChoice(...args) {
        if (args.length === 1 && Array.isArray(args[0])) {
            const choices = args[0];
            return choices[(Math.random() * choices.length) | 0];
        }
        return args[(Math.random() * args.length) | 0];
    }

    // Clamps a number between min and max values
    static clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    static randomFloat(min, max, int = 1000) {
        return Math.random() * (max - min) + min * int;
    }
}