// Socket.io connection
const socket = io();

// DOM elements
const connectionIndicator = document.getElementById('connectionIndicator');
const connectionText = document.getElementById('connectionText');
const amazonClicks = document.getElementById('amazonClicks');
const walmartClicks = document.getElementById('walmartClicks');
const totalClicks = document.getElementById('totalClicks');
const recentClicksList = document.getElementById('recentClicksList');
const refreshBtn = document.getElementById('refreshBtn');

// Connection state
let isConnected = false;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
});

/**
 * Initialize dashboard with initial data
 */
async function initializeDashboard() {
    try {
        // Join dashboard room
        socket.emit('joinDashboard');
        
        // Load initial statistics
        await loadStatistics();
        
        // Update connection status
        updateConnectionStatus(true);
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        updateConnectionStatus(false);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Refresh button
    refreshBtn.addEventListener('click', loadStatistics);
    
    // Socket.io event listeners
    socket.on('connect', () => {
        console.log('Connected to server');
        updateConnectionStatus(true);
        socket.emit('joinDashboard');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
    });
    
    socket.on('newClick', (data) => {
        console.log('New click received:', data);
        handleNewClick(data);
    });
    
    socket.on('statsUpdate', (data) => {
        console.log('Stats update received:', data);
        updateStatistics(data);
    });
    
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        updateConnectionStatus(false);
    });
}

/**
 * Load statistics from API
 */
async function loadStatistics() {
    try {
        showLoadingState();
        
        const response = await fetch('/api/stats');
        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }
        
        const stats = await response.json();
        updateStatistics(stats);
        
    } catch (error) {
        console.error('Error loading statistics:', error);
        showError('Failed to load statistics');
    }
}

/**
 * Update statistics display
 * @param {Object} stats - Statistics object with amazon, walmart, and total counts
 */
function updateStatistics(stats) {
    amazonClicks.textContent = stats.amazon || 0;
    walmartClicks.textContent = stats.walmart || 0;
    totalClicks.textContent = stats.total || 0;
    
    // Add animation effect
    animateStatUpdate();
}

/**
 * Handle new click event from Socket.io
 * @param {Object} data - Click data with linkUrl, timestamp, and total
 */
function handleNewClick(data) {
    // Update statistics
    updateStatistics({
        amazon: data.linkUrl === 'https://www.amazon.com' ? 
                parseInt(amazonClicks.textContent) + 1 : 
                parseInt(amazonClicks.textContent),
        walmart: data.linkUrl === 'https://www.walmart.com' ? 
                 parseInt(walmartClicks.textContent) + 1 : 
                 parseInt(walmartClicks.textContent),
        total: data.total || parseInt(totalClicks.textContent) + 1
    });
    
    // Add to recent clicks
    addRecentClick(data);
    
    // Show notification
    showClickNotification(data.linkUrl);
}

/**
 * Add recent click to the list
 * @param {Object} data - Click data
 */
function addRecentClick(data) {
    const clickItem = document.createElement('div');
    clickItem.className = 'click-item';
    
    const icon = data.linkUrl === 'https://www.amazon.com' ? '🛒' : '🏪';
    const siteName = data.linkUrl === 'https://www.amazon.com' ? 'Amazon' : 'Walmart';
    const timestamp = new Date(data.timestamp).toLocaleTimeString();
    
    clickItem.innerHTML = `
        <span class="click-icon">${icon}</span>
        <span class="click-site">${siteName}</span>
        <span class="click-time">${timestamp}</span>
    `;
    
    // Remove "no data" message if it exists
    const noDataMessage = recentClicksList.querySelector('.no-data');
    if (noDataMessage) {
        noDataMessage.remove();
    }
    
    // Add to top of list
    recentClicksList.insertBefore(clickItem, recentClicksList.firstChild);
    
    // Keep only last 10 clicks
    const clicks = recentClicksList.querySelectorAll('.click-item');
    if (clicks.length > 10) {
        clicks[clicks.length - 1].remove();
    }
}

/**
 * Show click notification
 * @param {string} linkUrl - The URL that was clicked
 */
function showClickNotification(linkUrl) {
    const notification = document.createElement('div');
    notification.className = 'click-notification';
    
    const siteName = linkUrl === 'https://www.amazon.com' ? 'Amazon' : 'Walmart';
    const icon = linkUrl === 'https://www.amazon.com' ? '🛒' : '🏪';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-text">New click: ${siteName}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Update connection status
 * @param {boolean} connected - Whether connected to server
 */
function updateConnectionStatus(connected) {
    isConnected = connected;
    
    if (connected) {
        connectionIndicator.style.background = '#2ed573';
        connectionText.textContent = 'Connected - Real-time updates active';
    } else {
        connectionIndicator.style.background = '#ff4757';
        connectionText.textContent = 'Disconnected - Manual refresh required';
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    refreshBtn.innerHTML = '⏳ Loading...';
    refreshBtn.disabled = true;
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    refreshBtn.innerHTML = '🔄 Refresh Data';
    refreshBtn.disabled = false;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
    
    hideLoadingState();
}

/**
 * Animate statistics update
 */
function animateStatUpdate() {
    const statCards = document.querySelectorAll('.stat-card h3');
    statCards.forEach(card => {
        card.style.transform = 'scale(1.1)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 200);
    });
}
