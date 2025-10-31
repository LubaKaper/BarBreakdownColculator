// Simple test for neighborhood loading without modules
console.log('Simple neighborhoods test starting...');

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded');
    
    const neighborhoodSelect = document.getElementById('neighborhoodSelect');
    if (!neighborhoodSelect) {
        console.error('Select not found!');
        return;
    }
    
    try {
        console.log('Fetching data...');
        const response = await fetch('./js/brooklyn-bar-data.json');
        console.log('Response:', response.status);
        
        const data = await response.json();
        console.log('Data loaded:', data);
        
        // Clear and populate select
        neighborhoodSelect.innerHTML = '<option value="">Select a neighborhood...</option>';
        
        Object.entries(data).forEach(([key, neighborhood]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = neighborhood.displayName;
            neighborhoodSelect.appendChild(option);
            console.log('Added:', neighborhood.displayName);
        });
        
        console.log('Population complete');
        
    } catch (error) {
        console.error('Error:', error);
    }
});