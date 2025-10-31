// Simple, working neighborhoods loader
console.log('NEIGHBORHOODS: Script loaded');

async function initializeNeighborhoods() {
    console.log('NEIGHBORHOODS: Initializing...');
    
    const neighborhoodSelect = document.getElementById('neighborhoodSelect');
    const averagesDisplay = document.getElementById('averagesDisplay');
    
    if (!neighborhoodSelect) {
        console.error('NEIGHBORHOODS: Select element not found!');
        return;
    }
    
    if (!averagesDisplay) {
        console.error('NEIGHBORHOODS: Averages display element not found!');
        return;
    }
    
    console.log('NEIGHBORHOODS: Elements found, proceeding...');

    // Format currency
    const formatCurrency = (amount) => {
        return '$' + Number(amount).toLocaleString('en-US');
    };

    // Show loading
    neighborhoodSelect.innerHTML = '<option value="">Loading...</option>';
    neighborhoodSelect.disabled = true;

    try {
        console.log('NEIGHBORHOODS: Fetching data...');
        const response = await fetch('./js/brooklyn-bar-data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('NEIGHBORHOODS: Data loaded successfully:', Object.keys(data).length, 'neighborhoods');
        
        // Clear select
        neighborhoodSelect.innerHTML = '<option value="" disabled selected>Select a neighborhood...</option>';
        
        // Sort and add options
        const neighborhoods = Object.entries(data)
            .map(([key, value]) => ({key, ...value}))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));
        
        neighborhoods.forEach(hood => {
            const option = document.createElement('option');
            option.value = hood.key;
            option.textContent = hood.displayName;
            neighborhoodSelect.appendChild(option);
        });
        
        // Enable select
        neighborhoodSelect.disabled = false;
        console.log('NEIGHBORHOODS: Dropdown populated with', neighborhoods.length, 'options');
        
        // Handle selection changes
        neighborhoodSelect.addEventListener('change', function(e) {
            const selectedKey = e.target.value;
            console.log('NEIGHBORHOODS: Selected:', selectedKey);
            
            if (!selectedKey) {
                averagesDisplay.innerHTML = '<p style="color: #8791a3; font-style: italic;">Select a neighborhood to see averages</p>';
                return;
            }
            
            const neighborhood = data[selectedKey];
            if (!neighborhood) {
                console.error('NEIGHBORHOODS: Neighborhood not found:', selectedKey);
                return;
            }
            
            // Update averages display
            const html = `
                <div class="metric">
                    <div class="metric-label">Monthly Rent</div>
                    <div class="metric-value">${formatCurrency(neighborhood.avgCommercialRent)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Average Drink Price</div>
                    <div class="metric-value">${formatCurrency(neighborhood.avgDrinkPrice)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Monthly Labor Cost</div>
                    <div class="metric-value">${formatCurrency(neighborhood.avgLaborCost)}</div>
                </div>
            `;
            
            averagesDisplay.innerHTML = html;
            
            // Update form fields
            const rentInput = document.getElementById('rent');
            const laborInput = document.getElementById('labor');
            const priceInput = document.getElementById('price');
            
            if (rentInput) rentInput.value = neighborhood.avgCommercialRent;
            if (laborInput) laborInput.value = neighborhood.avgLaborCost;
            if (priceInput) priceInput.value = neighborhood.avgDrinkPrice;
            
            console.log('NEIGHBORHOODS: Updated form with neighborhood data');
        });
        
        // Initialize display
        averagesDisplay.innerHTML = '<p style="color: #8791a3; font-style: italic;">Select a neighborhood to see averages</p>';
        
    } catch (error) {
        console.error('NEIGHBORHOODS: Failed to load neighborhood data:', error);
        neighborhoodSelect.innerHTML = '<option value="">Error loading data</option>';
        averagesDisplay.innerHTML = `<div style="color: #f87171; padding: 10px;">Error: ${error.message}</div>`;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNeighborhoods);
} else {
    // DOM is already loaded
    initializeNeighborhoods();
}