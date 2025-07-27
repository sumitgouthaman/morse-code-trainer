// Settings management with cookie persistence
class Settings {
    constructor() {
        this.settings = {
            includePunctuation: true, // default value
            morseSpeed: 12, // default speed in WPM
            sessionLength: 10
        };
        this.loadFromCookies();
    }

    // Load settings from cookies
    loadFromCookies() {
        const cookieValue = this.getCookie('morseTrainerSettings');
        if (cookieValue) {
            try {
                const savedSettings = JSON.parse(cookieValue);
                this.settings = { ...this.settings, ...savedSettings };
            } catch (e) {
                console.warn('Failed to parse settings cookie:', e);
            }
        }
    }

    // Save settings to cookies
    saveToCookies() {
        const cookieValue = JSON.stringify(this.settings);
        this.setCookie('morseTrainerSettings', cookieValue, 365); // 1 year expiry
    }

    // Get a setting value
    get(key) {
        return this.settings[key];
    }

    // Set a setting value and save to cookies
    set(key, value) {
        this.settings[key] = value;
        this.saveToCookies();
    }

    // Cookie helper functions
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
}

// Create global settings instance
export const settings = new Settings();
