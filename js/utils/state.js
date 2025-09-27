const STATE_KEY = 'barCalculator';

export const saveState = (state) => {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save state:', e);
    }
};

export const restoreState = () => {
    try {
        const saved = localStorage.getItem(STATE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.warn('Failed to restore state:', e);
        return null;
    }
};