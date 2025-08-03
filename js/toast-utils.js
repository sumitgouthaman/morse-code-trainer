// Toast notification utilities
import { settings } from './settings.js';

/**
 * Show a toast notification
 */
export function showToast(message, isCorrect) {
    if (!settings.get('showToast')) {
        return; // Do not show toast if disabled in settings
    }

    let toast = document.getElementById('session-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'session-toast';
        toast.className = 'session-toast';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<div class="toast-content">${message}</div>`;
    toast.style.backgroundColor = isCorrect ? 'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)';
    toast.classList.remove('fade-out');

    // Remove any existing timeout
    if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
    }

    // Set new timeout
    toast.timeoutId = setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    }, 3000);
}