// Neighborhood data handling and display
import { saveState, restoreState } from './utils/state.js';

document.addEventListener('DOMContentLoaded', async function() {
    const neighborhoodSelect = document.getElementById('neighborhoodSelect');
    const averagesDisplay = document.getElementById('averagesDisplay');

    // Format currency with commas and $ sign
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.error('Invalid amount:', amount);
            return 'N/A';
        }
        return '$' + amount.toLocaleString('en-US');
    };

    // Validate neighborhood data
    function validateNeighborhoodData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid neighborhood data format');
        }

        // Check if we have at least one valid neighborhood
        const hasValidNeighborhood = Object.values(data).some(hood => {
            // Convert values to numbers for validation
            const rent = Number(hood.avgCommercialRent);
            const price = Number(hood.avgDrinkPrice);
            const labor = Number(hood.avgLaborCost);
            
            return hood &&
                typeof hood === 'object' &&
                typeof hood.displayName === 'string' &&
                !isNaN(rent) && rent > 0 &&
                !isNaN(price) && price > 0 &&
                !isNaN(labor) && labor > 0;
        });

        if (!hasValidNeighborhood) {
            throw new Error('No valid neighborhood data found');
        }

        return true;
    }

    // Load and process neighborhood data
    async function loadNeighborhoodData() {
        try {
            // Show loading state
            neighborhoodSelect.disabled = true;
            averagesDisplay.innerHTML = '<div class="loading">Loading neighborhood data...</div>';
            
            let response;
            try {
                response = await fetch('./js/brooklyn-bar-data.json');
                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
                }
            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                throw new Error(`Failed to fetch JSON file: ${fetchError.message}`);
            }
            
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Failed to parse neighborhood data: Invalid JSON format');
            }            // Validate the data
            validateNeighborhoodData(data);
            
                        // Sort neighborhoods alphabetically and prepare for dropdown
            const neighborhoods = Object.entries(data)
                .map(([key, value]) => ({key, ...value}))
                .filter(hood => hood.displayName && typeof hood.displayName === 'string')
                .sort((a, b) => a.displayName.localeCompare(b.displayName));

            // Clear previous options
            neighborhoodSelect.innerHTML = '';
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a neighborhood...';
            defaultOption.selected = true;
            neighborhoodSelect.appendChild(defaultOption);
            
            // Add sorted neighborhoods to dropdown
            neighborhoods.forEach(hood => {
                const option = document.createElement('option');
                option.value = hood.key;
                option.textContent = hood.displayName;
                neighborhoodSelect.appendChild(option);
            });

            // Enable select and clear loading message
            neighborhoodSelect.disabled = false;
            defaultOption.disabled = true;
            averagesDisplay.textContent = '';
            
            return data;
        } catch (error) {
            console.error('Error loading neighborhood data:', error);
            neighborhoodSelect.disabled = true;
            averagesDisplay.innerHTML = `<div class="error">${error.message || 'Unable to load neighborhood data'}</div>`;
            return null;
        }
    }

    // Display neighborhood averages with animation
    function displayNeighborhoodAverages(neighborhood) {
        if (!neighborhood) {
            averagesDisplay.style.opacity = '0';
            setTimeout(() => {
                averagesDisplay.textContent = '';
                averagesDisplay.style.opacity = '1';
            }, 150);
            return;
        }

        // Parse and validate neighborhood data
        const rent = Number(neighborhood.avgCommercialRent);
        const price = Number(neighborhood.avgDrinkPrice);
        const labor = Number(neighborhood.avgLaborCost);
        
        // Validate neighborhood data
        const isValid = (
            !isNaN(rent) && rent > 0 &&
            !isNaN(price) && price > 0 &&
            !isNaN(labor) && labor > 0
        );

        if (!isValid) {
            averagesDisplay.innerHTML = '<div class="error">Invalid data for this neighborhood</div>';
            return;
        }

        const formattedData = `
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
        
        // Fade out
        averagesDisplay.style.opacity = '0';
        
        // Update content and fade in with slight delay for smooth transition
        setTimeout(() => {
            averagesDisplay.innerHTML = formattedData;
            averagesDisplay.style.opacity = '1';
        }, 150);
    }

    try {
        // Initialize with inline data
        const neighborhoodData = await loadNeighborhoodData();

        // Handle neighborhood selection
        if (neighborhoodData) {
            // Add change event listener
            neighborhoodSelect.addEventListener('change', (e) => {
                const selectedNeighborhood = e.target.value;
                if (!selectedNeighborhood) {
                    displayNeighborhoodAverages(null);
                    return;
                }
                
                const neighborhoodInfo = neighborhoodData[selectedNeighborhood];
                if (!neighborhoodInfo) {
                    console.error('Selected neighborhood not found:', selectedNeighborhood);
                    averagesDisplay.innerHTML = '<div class="error">Neighborhood data not found</div>';
                    return;
                }
                
                // Update form with neighborhood data
                const rentInput = document.getElementById('rent');
                const laborInput = document.getElementById('labor');
                const priceInput = document.getElementById('price');
                
                // Parse values as numbers and set them to form inputs
                if (rentInput) rentInput.value = Number(neighborhoodInfo.avgCommercialRent).toString();
                if (laborInput) laborInput.value = Number(neighborhoodInfo.avgLaborCost).toString();
                if (priceInput) priceInput.value = Number(neighborhoodInfo.avgDrinkPrice).toString();
                
                // Save state with new values, ensuring numbers are stored
                const state = restoreState() || {};
                saveState({
                    ...state,
                    neighborhood: selectedNeighborhood,
                    rent: Number(neighborhoodInfo.avgCommercialRent),
                    labor: Number(neighborhoodInfo.avgLaborCost),
                    price: Number(neighborhoodInfo.avgDrinkPrice)
                });
                
                displayNeighborhoodAverages(neighborhoodInfo);
            });
            
            // Initialize with default state
            neighborhoodSelect.disabled = false;
            const defaultOption = neighborhoodSelect.querySelector('option[value=""]');
            if (defaultOption) {
                defaultOption.disabled = true;
                defaultOption.selected = true;
            }
            displayNeighborhoodAverages(null);
        }
    } catch (error) {
        console.error('Error initializing neighborhoods:', error);
        averagesDisplay.innerHTML = '<div class="error">Failed to initialize neighborhood data</div>';
        neighborhoodSelect.disabled = true;
    }
});