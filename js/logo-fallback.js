// Logo fallback handler for Arcadium games
document.addEventListener('DOMContentLoaded', function() {
    // Find all logo images
    const logoImages = document.querySelectorAll('.brand img[src*="arcadium-logo"]');
    
    logoImages.forEach(img => {
        // Add error handler for failed logo loads
        img.addEventListener('error', function() {
            console.warn('Logo failed to load, using fallback');
            this.style.display = 'none';
            
            // Add fallback emoji to brand container
            const brand = this.closest('.brand');
            if (brand && !brand.querySelector('.logo-fallback')) {
                const fallback = document.createElement('span');
                fallback.className = 'logo-fallback';
                fallback.textContent = '🎮';
                fallback.style.fontSize = '2rem';
                fallback.style.marginRight = '10px';
                brand.insertBefore(fallback, brand.firstChild);
            }
        });
        
        // Add load success handler
        img.addEventListener('load', function() {
            console.log('Logo loaded successfully');
            // Remove any existing fallback
            const fallback = this.closest('.brand')?.querySelector('.logo-fallback');
            if (fallback) {
                fallback.remove();
            }
        });
        
        // Check if image is already loaded (cached)
        if (img.complete && img.naturalHeight !== 0) {
            img.dispatchEvent(new Event('load'));
        }
    });
});