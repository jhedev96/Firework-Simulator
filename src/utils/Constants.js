/**
 * Constants & Public Variables
*/
export class Constants {
    static IS_MOBILE = window.innerWidth <= 640;
    static IS_DESKTOP = window.innerWidth > 800;
    static IS_HEADER = Constants.IS_DESKTOP && window.innerHeight < 300;

    static IS_HIGH_END_DEVICE = (() => {
        const hwConcurrency = navigator.hardwareConcurrency;
        if (!hwConcurrency) return false;
        const minCount = window.innerWidth <= 1024 ? 4 : 8;
        return hwConcurrency >= minCount;
    })();

    static MAX_WIDTH = 7680;
    static MAX_HEIGHT = 4320;
    static GRAVITY = 0.9;
    static PI_2 = Math.PI * 2;
    static PI_HALF = Math.PI * 0.5;

    static QUALITY_LOW = 1;
    static QUALITY_NORMAL = 2;
    static QUALITY_HIGH = 3;

    static SKY_LIGHT_NONE = 0;
    static SKY_LIGHT_DIM = 1;
    static SKY_LIGHT_NORMAL = 2;
    
    static SOUND_BASE_URL = './assets/sounds/';
    static SOUND_SOURCES = {
        lift: {
            volume: 1,
            playbackRateMin: 0.85,
            playbackRateMax: 0.95,
            fileNames: ['lift1.mp3', 'lift2.mp3', 'lift3.mp3']
        },
        burst: {
            volume: 1,
            playbackRateMin: 0.8,
            playbackRateMax: 0.9,
            fileNames: ['burst1.mp3', 'burst2.mp3']
        },
        burstSmall: {
            volume: 0.25,
            playbackRateMin: 0.8,
            playbackRateMax: 1,
            fileNames: ['burst-sm-1.mp3', 'burst-sm-2.mp3']
        },
        crackle: {
            volume: 0.2,
            playbackRateMin: 1,
            playbackRateMax: 1,
            fileNames: ['crackle1.mp3']
        },
        crackleSmall: {
            volume: 0.3,
            playbackRateMin: 1,
            playbackRateMax: 1,
            fileNames: ['crackle-sm-1.mp3']
        },
        whistle: {
            volume: 0.5,
            playbackRateMin: 0.85,
            playbackRateMax: 0.95,
            fileNames: ['whistle1.mp3', 'whistle2.mp3']
        },
    };

    static COLOR = {
        Red: '#ff0043',
        Green: '#14fc56',
        Blue: '#1e7fff',
        Purple: '#e60aff',
        Gold: '#ffbf36',
        White: '#ffffff'
    };

    static INVISIBLE = '_INVISIBLE_';

    // Map UI labels to Help Topic Keys (using data-i18n key logic)
    static HELP_TOPIC_SELECTORS = {
        '.shell-type-label': 'shellType',
        '.shell-size-label': 'shellSize',
        '.quality-ui-label': 'quality',
        '.sky-lighting-label': 'skyLighting',
        '.scaleFactor-label': 'scaleFactor',
        '.auto-launch-label': 'autoLaunch',
        '.finale-mode-label': 'finaleMode',
        '.hide-controls-label': 'hideControls',
        '.fullscreen-label': 'fullscreen',
        '.long-exposure-label': 'longExposure'
    };
}