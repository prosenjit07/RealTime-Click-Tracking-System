// landing.js
console.log('landing.js loaded');
const amazonUrl = 'https://www.amazon.com';
const walmartUrl = 'https://www.walmart.com';
document.addEventListener('DOMContentLoaded', function() {
    const amazonBtn = document.getElementById('amazonBtn');
    const walmartBtn = document.getElementById('walmartBtn');

    // Handle Amazon button click
    amazonBtn.addEventListener('click', function() {
        trackClick(amazonUrl);
    });

    // Handle Walmart button click
    walmartBtn.addEventListener('click', function() {
        trackClick(walmartUrl);
    });

    function trackClick(linkUrl) {
        // Disable buttons to prevent multiple clicks
        disableButtons();

        // show loading state
        showLoading();  

        // make API call to track click
        fetch('/api/track-click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ linkUrl: linkUrl })
        })
        .then(response => {
            if (response.ok) {
                // the server will redirect us, so we don't need to handle the response
                // if we get here, it means the redirect didn't work, so we'll do it manually
                window.location.href = linkUrl;
            } else {
                throw new Error('Failed to track click. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error tracking click:', error);
            showError('Failed to track click. Please try again.');
            enableButtons();
        });
    }

    function disableButtons() {
        amazonBtn.disabled = true;
        walmartBtn.disabled = true;
        amazonBtn.classList.add('disabled');
        walmartBtn.classList.add('disabled');
    }

    /**
     * Enable all tracking buttons
     */
    function enableButtons() {
        amazonBtn.disabled = false;
        walmartBtn.disabled = false;
        amazonBtn.classList.remove('disabled');
        walmartBtn.classList.remove('disabled');
    }

    function showLoading() {
        amazonBtn.innerHTML = '<span class="btn-icon">⏳</span>Loading...';
        walmartBtn.innerHTML = '<span class="btn-icon">⏳</span>Loading...';
    }

    function showError(message) {
        // create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert error message after buttons container
        const buttonsContainer = document.querySelector('.buttons-container');
        buttonsContainer.insertAdjacentElement('afterend', errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);

        // Reset button text
        amazonBtn.innerHTML = '<span class="btn-icon">🛒</span>Go to Amazon';
        walmartBtn.innerHTML = '<span class="btn-icon">🏪</span>Go to Walmart';
    }
});
