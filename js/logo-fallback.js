// Logo fallback handler for Arcadium games
document.addEventListener('DOMContentLoaded', function() {
    console.log('Logo fallback script loaded');
    
    // Find all logo images
    const logoImages = document.querySelectorAll('.brand img, #logo');
    console.log('Found logo images:', logoImages.length);
    
    logoImages.forEach((img, index) => {
        console.log(`Logo ${index + 1} src:`, img.src);
        
        // Add error handler for failed logo loads
        img.addEventListener('error', function() {
            console.error('Logo failed to load:', this.src);
            
            // Try alternative logo paths
            if (this.src.includes('arcadium-logo.svg')) {
                console.log('Trying simple logo fallback...');
                this.src = this.src.replace('arcadium-logo.svg', 'arcadium-logo-simple.svg');
                return;
            }
            
            // If all else fails, hide image and show emoji
            this.style.display = 'none';
            
            // Add fallback emoji to brand container
            const brand = this.closest('.brand') || this.closest('.logo-circle');
            if (brand && !brand.querySelector('.logo-fallback')) {
                const fallback = document.createElement('span');
                fallback.className = 'logo-fallback';
                fallback.textContent = '🎮';
                fallback.style.fontSize = '2rem';
                fallback.style.marginRight = '10px';
                fallback.style.color = 'white';
                brand.insertBefore(fallback, brand.firstChild);
                console.log('Added emoji fallback');
            }
        });
        
        // Add load success handler
        img.addEventListener('load', function() {
            console.log('Logo loaded successfully:', this.src);
            // Remove any existing fallback
            const fallback = this.closest('.brand')?.querySelector('.logo-fallback') || 
                            this.closest('.logo-circle')?.querySelector('.logo-fallback');
            if (fallback) {
                fallback.remove();
            }
        });
        
        // Check if image is already loaded (cached)
        if (img.complete && img.naturalHeight !== 0) {
            console.log('Logo already loaded (cached)');
            img.dispatchEvent(new Event('load'));
        } else if (img.complete && img.naturalHeight === 0) {
            console.log('Logo failed to load (cached error)');
            img.dispatchEvent(new Event('error'));
        }
    });
    
    // Also add fallback for main site logos
    const mainLogos = document.querySelectorAll('#logo');
    mainLogos.forEach(logo => {
        if (!logo.closest('.brand')) {
            // This is a main site logo
            logo.addEventListener('error', function() {
                console.error('Main logo failed to load');
                const container = this.closest('.logo-circle');
                if (container && !container.querySelector('.logo-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'logo-fallback';
                    fallback.textContent = '🎮';
                    fallback.style.fontSize = '3rem';
                    fallback.style.color = 'white';
                    fallback.style.textAlign = 'center';
                    container.appendChild(fallback);
                    this.style.display = 'none';
                }
            });
        }
    });
});