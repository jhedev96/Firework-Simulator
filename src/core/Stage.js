import { Ticker } from '@/core/Ticker';

/**
 * Stage
 */
export class Stage {
    // Variabel track yang tadinya di luar sekarang jadi static property
    static lastTouchTimestamp = 0;

    // track all Stage instances
    static stages = [];

    // allow turning off high DPI support for perf reasons
    static disableHighDPI = false;

    // Static initialization block, langsung dieksekusi otomatis pas class di-load!
    static {
        if (typeof document !== 'undefined') {
            document.addEventListener('mousedown', Stage.mouseHandler);
            document.addEventListener('mousemove', Stage.mouseHandler);
            document.addEventListener('mouseup', Stage.mouseHandler);
            document.addEventListener('touchstart', Stage.touchHandler);
            document.addEventListener('touchmove', Stage.touchHandler);
            document.addEventListener('touchend', Stage.touchHandler);
        }
    }

    // Stage constructor (canvas can be a dom node, or an id string)
    constructor(canvas) {
        if (typeof canvas === 'string') canvas = document.getElementById(canvas);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.style.touchAction = 'none';

        this.speed = 1;
        this.dpr = Stage.disableHighDPI ? 1 : ((window.devicePixelRatio || 1) / (this.ctx.backingStorePixelRatio || 1));

        this.width = canvas.width;
        this.height = canvas.height;
        this.naturalWidth = this.width * this.dpr;
        this.naturalHeight = this.height * this.dpr;

        if (this.width !== this.naturalWidth) {
            this.canvas.width = this.naturalWidth;
            this.canvas.height = this.naturalHeight;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
        }

        Stage.stages.push(this);

        this._listeners = {
            resize: [],
            pointerstart: [],
            pointermove: [],
            pointerend: [],
            lastPointerPos: {
                x: 0,
                y: 0
            }
        };
    }

    addEventListener(event, handler) {
        try {
            if (event === 'ticker') {
                Ticker.addListener(handler);
            } else {
                this._listeners[event].push(handler);
            }
        } catch (e) {
            throw new Error('Invalid Event');
        }
    }

    dispatchEvent(event, val) {
        const listeners = this._listeners[event];
        if (listeners) {
            listeners.forEach(listener => listener.call(this, val));
        } else {
            throw new Error('Invalid Event');
        }
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.naturalWidth = w * this.dpr;
        this.naturalHeight = h * this.dpr;
        this.canvas.width = this.naturalWidth;
        this.canvas.height = this.naturalHeight;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';

        this.dispatchEvent('resize');
    }

    pointerEvent(type, x, y) {
        const evt = {
            type: type,
            x: x,
            y: y
        };
        evt.onCanvas = (x >= 0 && x <= this.width && y >= 0 && y <= this.height);
        this.dispatchEvent('pointer' + type, evt);
    }

    static windowToCanvas(canvas, x, y) {
        const bbox = canvas.getBoundingClientRect();
        return {
            x: (x - bbox.left) * (canvas.width / bbox.width),
            y: (y - bbox.top) * (canvas.height / bbox.height)
        };
    }

    static mouseHandler(evt) {
        // Akses properti static yang udah dipindah ke dalam
        if (Date.now() - Stage.lastTouchTimestamp < 500) return;

        let type = 'start';
        if (evt.type === 'mousemove') type = 'move';
        else if (evt.type === 'mouseup') type = 'end';

        Stage.stages.forEach(stage => {
            const pos = Stage.windowToCanvas(stage.canvas, evt.clientX, evt.clientY);
            stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
        });
    }

    static touchHandler(evt) {
        // Akses properti static yang udah dipindah ke dalam
        Stage.lastTouchTimestamp = Date.now();

        let type = 'start';
        if (evt.type === 'touchmove') type = 'move';
        else if (evt.type === 'touchend') type = 'end';

        Stage.stages.forEach(stage => {
            for (let touch of Array.from(evt.changedTouches)) {
                let pos;
                if (type !== 'end') {
                    pos = Stage.windowToCanvas(stage.canvas, touch.clientX, touch.clientY);
                    stage._listeners.lastPointerPos = pos;
                    if (type === 'start') stage.pointerEvent('move', pos.x / stage.dpr, pos.y / stage.dpr);
                } else {
                    pos = stage._listeners.lastPointerPos;
                }
                stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
            }
        });
    }
}