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

export const revealValues = (elements, interval = 100) => {
    if (!Array.isArray(elements)) {
        elements = [elements];
    }

    elements.forEach((element, index) => {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            // Ensure the element has the metric-value class
            if (!element.classList.contains('metric-value')) {
                element.classList.add('metric-value');
            }

            // Reset the animation
            element.classList.remove('reveal');
            
            // Trigger the animation with a delay based on position
            setTimeout(() => {
                element.classList.add('reveal');
            }, index * interval);
        }
    });
};