/**
 * Full Screen
*/

export class FullScreen {
    // Semua variabel dimasukin ke dalam class sebagai static properties
    static key = {
        fullscreenEnabled: 0,
        fullscreenElement: 1,
        requestFullscreen: 2,
        exitFullscreen: 3,
        fullscreenchange: 4,
        fullscreenerror: 5,
        fullscreen: 6,
    };

    static webkit = [
        'webkitFullscreenEnabled',
        'webkitFullscreenElement',
        'webkitRequestFullscreen',
        'webkitExitFullscreen',
        'webkitfullscreenchange',
        'webkitfullscreenerror',
        '-webkit-full-screen',
    ];

    static moz = [
        'mozFullScreenEnabled',
        'mozFullScreenElement',
        'mozRequestFullScreen',
        'mozCancelFullScreen',
        'mozfullscreenchange',
        'mozfullscreenerror',
        '-moz-full-screen',
    ];

    static ms = [
        'msFullscreenEnabled',
        'msFullscreenElement',
        'msRequestFullscreen',
        'msExitFullscreen',
        'MSFullscreenChange',
        'MSFullscreenError',
        '-ms-fullscreen',
    ];

    // so it doesn't throw if no window or document
    static doc = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};

    static vendor = ('fullscreenEnabled' in FullScreen.doc && Object.keys(FullScreen.key)) || 
                    (FullScreen.webkit[0] in FullScreen.doc && FullScreen.webkit) || 
                    (FullScreen.moz[0] in FullScreen.doc && FullScreen.moz) || 
                    (FullScreen.ms[0] in FullScreen.doc && FullScreen.ms) || [];

    // Method-method pakai FullScreen.* untuk akses variabel statisnya
    static requestFullscreen(element) { return element[FullScreen.vendor[FullScreen.key.requestFullscreen]](); }
    static requestFullscreenFunction(element) { return element[FullScreen.vendor[FullScreen.key.requestFullscreen]]; }
    
    static get exitFullscreen() {
        return FullScreen.doc[FullScreen.vendor[FullScreen.key.exitFullscreen]].bind(FullScreen.doc);
    }
    
    static get fullscreenPseudoClass() {
        return `:${FullScreen.vendor[FullScreen.key.fullscreen]}`;
    }
    
    static addEventListener(type, handler, options) { FullScreen.doc.addEventListener(FullScreen.vendor[FullScreen.key[type]], handler, options); }
    static removeEventListener(type, handler, options) { FullScreen.doc.removeEventListener(FullScreen.vendor[FullScreen.key[type]], handler, options); }
    
    static get fullscreenEnabled() {
        return Boolean(FullScreen.doc[FullScreen.vendor[FullScreen.key.fullscreenEnabled]]);
    }
    static set fullscreenEnabled(val) {}
    
    static get fullscreenElement() {
        return FullScreen.doc[FullScreen.vendor[FullScreen.key.fullscreenElement]];
    }
    static set fullscreenElement(val) {}
    
    static get onfullscreenchange() {
        return FullScreen.doc[`on${FullScreen.vendor[FullScreen.key.fullscreenchange]}`.toLowerCase()];
    }
    static set onfullscreenchange(handler) {
        return FullScreen.doc[`on${FullScreen.vendor[FullScreen.key.fullscreenchange]}`.toLowerCase()] = handler;
    }
    
    static get onfullscreenerror() {
        return FullScreen.doc[`on${FullScreen.vendor[FullScreen.key.fullscreenerror]}`.toLowerCase()];
    }
    static set onfullscreenerror(handler) {
        return FullScreen.doc[`on${FullScreen.vendor[FullScreen.key.fullscreenerror]}`.toLowerCase()] = handler;
    }
}
