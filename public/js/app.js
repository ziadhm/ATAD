let currentShortCode = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadUrls();
    
    // Set minimum datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('expiresAt').min = now.toISOString().slice(0, 16);
});

// Handle form submission
document.getElementById('shortenForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const originalUrl = document.getElementById('originalUrl').value;
    const customAlias = document.getElementById('customAlias').value;
    const expiresAt = document.getElementById('expiresAt').value;
    
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    // Hide previous results
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    
    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                originalUrl,
                customAlias: customAlias || undefined,
                expiresAt: expiresAt || undefined
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success
            document.getElementById('shortUrl').value = data.data.shortUrl;
            currentShortCode = data.data.shortCode;
            resultDiv.classList.remove('hidden');
            document.getElementById('qrCode').classList.add('hidden');
            
            // Reset form
            document.getElementById('shortenForm').reset();
            
            // Reload URL list
            loadUrls();
        } else {
            // Show error
            errorDiv.textContent = data.error || 'An error occurred';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.remove('hidden');
    }
});

// Copy to clipboard
function copyToClipboard() {
    const shortUrlInput = document.getElementById('shortUrl');
    shortUrlInput.select();
    document.execCommand('copy');
    
    alert('✅ Copied to clipboard!');
}

// Generate QR Code
async function generateQR() {
    if (!currentShortCode) return;
    
    const qrCodeDiv = document.getElementById('qrCode');
    qrCodeDiv.innerHTML = '<p class="loading">Generating QR code...</p>';
    qrCodeDiv.classList.remove('hidden');
    
    try {
        const response = await fetch(`/api/qr/${currentShortCode}`);
        const data = await response.json();
        
        if (response.ok) {
            qrCodeDiv.innerHTML = `
                <img src="${data.data.qrCode}" alt="QR Code">
                <p style="margin-top: 10px; color: var(--gray);">Scan to visit ${data.data.shortUrl}</p>
            `;
        } else {
            qrCodeDiv.innerHTML = `<p class="error">${data.error}</p>`;
        }
    } catch (error) {
        qrCodeDiv.innerHTML = '<p class="error">Failed to generate QR code</p>';
    }
}

// View Analytics
function viewAnalytics() {
    if (!currentShortCode) return;
    showAnalyticsModal(currentShortCode);
}

// Load all URLs
async function loadUrls() {
    const urlListDiv = document.getElementById('urlList');
    urlListDiv.innerHTML = '<p class="loading">Loading URLs...</p>';
    
    try {
        const response = await fetch('/api/urls?limit=20');
        const data = await response.json();
        
        if (response.ok && data.data.length > 0) {
            urlListDiv.innerHTML = data.data.map(url => createUrlItem(url)).join('');
        } else {
            urlListDiv.innerHTML = '<p style="text-align: center; color: var(--gray);">No URLs yet. Create your first short link!</p>';
        }
    } catch (error) {
        urlListDiv.innerHTML = '<p class="error">Failed to load URLs</p>';
    }
}

// Create URL item HTML
function createUrlItem(url) {
    const createdDate = new Date(url.createdAt).toLocaleDateString();
    const expiresDate = url.expiresAt ? new Date(url.expiresAt).toLocaleDateString() : 'Never';
    const status = url.isExpired ? 'Expired' : 'Active';
    const badgeClass = url.isExpired ? 'badge-danger' : 'badge-success';
    
    return `
        <div class="url-item">
            <div class="url-item-header">
                <div class="url-info">
                    <h4>${url.shortUrl}</h4>
                    <p>→ ${url.originalUrl}</p>
                </div>
                <span class="badge ${badgeClass}">${status}</span>
            </div>
            
            <div class="url-stats">
                <div class="stat">
                    <div class="stat-value">${url.clicks}</div>
                    <div class="stat-label">Total Clicks</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${createdDate}</div>
                    <div class="stat-label">Created</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${expiresDate}</div>
                    <div class="stat-label">Expires</div>
                </div>
            </div>
            
            <div class="url-actions">
                <button onclick="copyUrl('${url.shortUrl}')" class="btn-secondary">📋 Copy</button>
                <button onclick="showAnalyticsModal('${url.shortCode}')" class="btn-secondary">📊 Analytics</button>
                <button onclick="showQRModal('${url.shortCode}')" class="btn-secondary">📱 QR Code</button>
                <button onclick="deleteUrl('${url.shortCode}')" class="btn-secondary" style="background: #fed7d7; color: #742a2a;">🗑️ Delete</button>
            </div>
        </div>
    `;
}

// Copy URL to clipboard
function copyUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('✅ Link copied to clipboard!');
    });
}

// Show Analytics Modal
async function showAnalyticsModal(shortCode) {
    const modal = document.getElementById('analyticsModal');
    const content = document.getElementById('analyticsContent');
    
    modal.classList.remove('hidden');
    content.innerHTML = '<p class="loading">Loading analytics...</p>';
    
    try {
        const response = await fetch(`/api/analytics/${shortCode}`);
        const data = await response.json();
        
        if (response.ok) {
            const analytics = data.data.analytics;
            const url = data.data.url;
            
            // Create analytics HTML
            content.innerHTML = `
                <div class="analytics-section">
                    <h3>URL Information</h3>
                    <p><strong>Short URL:</strong> ${url.shortUrl}</p>
                    <p><strong>Original URL:</strong> ${url.originalUrl}</p>
                    <p><strong>Created:</strong> ${new Date(url.createdAt).toLocaleString()}</p>
                    ${url.expiresAt ? `<p><strong>Expires:</strong> ${new Date(url.expiresAt).toLocaleString()}</p>` : ''}
                </div>
                
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h3>${analytics.totalClicks}</h3>
                        <p>Total Clicks</p>
                    </div>
                    <div class="analytics-card">
                        <h3>${analytics.uniqueVisitors}</h3>
                        <p>Unique Visitors</p>
                    </div>
                </div>
                
                <div class="analytics-section">
                    <h3>Clicks by Country</h3>
                    <ul class="country-list">
                        ${Object.entries(analytics.clicksByCountry)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(([country, count]) => `
                                <li class="country-item">
                                    <span>${country}</span>
                                    <span><strong>${count}</strong> clicks</span>
                                </li>
                            `).join('')}
                    </ul>
                </div>
                
                <div class="analytics-section">
                    <h3>Recent Clicks</h3>
                    <ul class="click-list">
                        ${analytics.recentClicks.map(click => `
                            <li class="click-item">
                                <span>${new Date(click.timestamp).toLocaleString()}</span>
                                <span>${click.city}, ${click.country}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        } else {
            content.innerHTML = `<p class="error">${data.error}</p>`;
        }
    } catch (error) {
        content.innerHTML = '<p class="error">Failed to load analytics</p>';
    }
}

// Show QR Code Modal
async function showQRModal(shortCode) {
    const modal = document.getElementById('analyticsModal');
    const content = document.getElementById('analyticsContent');
    
    modal.classList.remove('hidden');
    content.innerHTML = '<p class="loading">Generating QR code...</p>';
    
    try {
        const response = await fetch(`/api/qr/${shortCode}`);
        const data = await response.json();
        
        if (response.ok) {
            content.innerHTML = `
                <div style="text-align: center;">
                    <h3 style="margin-bottom: 20px;">QR Code</h3>
                    <img src="${data.data.qrCode}" alt="QR Code" style="max-width: 100%; border: 2px solid var(--light-gray); border-radius: var(--border-radius); padding: 20px;">
                    <p style="margin-top: 20px; color: var(--gray);">Scan to visit ${data.data.shortUrl}</p>
                </div>
            `;
        } else {
            content.innerHTML = `<p class="error">${data.error}</p>`;
        }
    } catch (error) {
        content.innerHTML = '<p class="error">Failed to generate QR code</p>';
    }
}

// Close Modal
function closeModal() {
    document.getElementById('analyticsModal').classList.add('hidden');
}

// Delete URL
async function deleteUrl(shortCode) {
    if (!confirm('Are you sure you want to delete this short URL?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/urls/${shortCode}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Short URL deleted successfully!');
            loadUrls();
        } else {
            alert('❌ ' + (data.error || 'Failed to delete URL'));
        }
    } catch (error) {
        alert('❌ Network error. Please try again.');
    }
}

// Refresh URLs
function refreshUrls() {
    loadUrls();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('analyticsModal');
    if (event.target === modal) {
        closeModal();
    }
}
