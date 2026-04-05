/**
 * Ticker
*/
export class Ticker {
    static started = false;
    static lastTimestamp = 0;
    static listeners = [];

    // will call function reference repeatedly once registered
    static addListener(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Ticker.addListener() requires a function reference passed for a callback.');
        }

        Ticker.listeners.push(callback);

        // start frame-loop lazily
        if (!Ticker.started) {
            Ticker.started = true;
            Ticker.queueFrame();
        }
    }

    static queueFrame() {
        if (window.requestAnimationFrame) {
            requestAnimationFrame(Ticker.frameHandler);
        } else {
            webkitRequestAnimationFrame(Ticker.frameHandler);
        }
    }

    static frameHandler(timestamp) {
        let frameTime = timestamp - Ticker.lastTimestamp;
        Ticker.lastTimestamp = timestamp;
        
        // make sure negative time isn't reported (first frame can be whacky)
        if (frameTime < 0) {
            frameTime = 17;
        }
        // cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
        else if (frameTime > 68) {
            frameTime = 68;
        }

        // fire custom listeners
        Ticker.listeners.forEach(listener => listener.call(window, frameTime, frameTime / 16.6667));

        // always queue another frame
        Ticker.queueFrame();
    }
}