export const countUp = (element, target, formatter, duration = 700) => {
    if (!element) return;
    
    const start = 0;
    const startTime = performance.now();
    
    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (target - start) * easeOutQuart;
        
        element.textContent = formatter(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    };
    
    requestAnimationFrame(update);
};

export const revealValues = (ids) => {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('reveal');
            // Remove the class after animation completes
            setTimeout(() => el.classList.remove('reveal'), 700);
        }
    });
};