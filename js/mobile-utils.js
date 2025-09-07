// Mobile Utilities for Arcadium Games
class MobileUtils {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTouch = 'ontouchstart' in window;
        this.orientation = this.getOrientation();
        
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
    
    getOrientation() {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
    
    init() {
        // Add mobile class to body
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        }
        
        // Add touch class if touch is supported
        if (this.isTouch) {
            document.body.classList.add('touch-device');
        }
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.orientation = this.getOrientation();
                this.handleOrientationChange();
            }, 100);
        });
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            this.isMobile = this.detectMobile();
            this.orientation = this.getOrientation();
            this.handleResize();
        });
        
        // Prevent zoom on double tap
        this.preventZoom();
        
        // Handle safe area for notched devices
        this.handleSafeArea();
    }
    
    preventZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevent pinch zoom
        document.addEventListener('touchmove', (event) => {
            if (event.scale !== 1) {
                event.preventDefault();
            }
        }, { passive: false });
    }
    
    handleSafeArea() {
        // Add CSS custom properties for safe areas
        const root = document.documentElement;
        
        // Check if device supports safe area insets
        if (CSS.supports('padding: env(safe-area-inset-top)')) {
            root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
            root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
            root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left)');
            root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right)');
        } else {
            root.style.setProperty('--safe-area-top', '0px');
            root.style.setProperty('--safe-area-bottom', '0px');
            root.style.setProperty('--safe-area-left', '0px');
            root.style.setProperty('--safe-area-right', '0px');
        }
    }
    
    handleOrientationChange() {
        // Dispatch custom event for games to handle
        window.dispatchEvent(new CustomEvent('arcadiumOrientationChange', {
            detail: { orientation: this.orientation }
        }));
    }
    
    handleResize() {
        // Dispatch custom event for games to handle
        window.dispatchEvent(new CustomEvent('arcadiumResize', {
            detail: { 
                isMobile: this.isMobile,
                orientation: this.orientation,
                width: window.innerWidth,
                height: window.innerHeight
            }
        }));
    }
    
    // Static method for adding touch support to elements
    static addTouchSupport(element, handler) {
        if (!element || typeof handler !== 'function') return;
        
        // Add touch events
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            element.classList.add('active');
        });
        
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            element.classList.remove('active');
            handler(e);
        });
        
        element.addEventListener('touchcancel', (e) => {
            element.classList.remove('active');
        });
        
        // Ensure mouse events still work
        element.addEventListener('mousedown', () => {
            element.classList.add('active');
        });
        
        element.addEventListener('mouseup', () => {
            element.classList.remove('active');
        });
        
        element.addEventListener('mouseleave', () => {
            element.classList.remove('active');
        });
    }
    
    // Utility method to create touch-friendly buttons
    createTouchButton(text, onClick, className = '') {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `touch-btn ${className}`;
        
        // Add both touch and mouse events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.classList.add('active');
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.classList.remove('active');
            onClick(e);
        });
        
        button.addEventListener('mousedown', () => {
            button.classList.add('active');
        });
        
        button.addEventListener('mouseup', () => {
            button.classList.remove('active');
        });
        
        button.addEventListener('click', onClick);
        
        return button;
    }
    
    // Utility method to handle swipe gestures
    addSwipeListener(element, callbacks) {
        let startX, startY, startTime;
        
        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        });
        
        element.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Minimum swipe distance and maximum time
            const minDistance = 50;
            const maxTime = 500;
            
            if (deltaTime > maxTime) return;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minDistance) {
                    if (deltaX > 0 && callbacks.right) {
                        callbacks.right();
                    } else if (deltaX < 0 && callbacks.left) {
                        callbacks.left();
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minDistance) {
                    if (deltaY > 0 && callbacks.down) {
                        callbacks.down();
                    } else if (deltaY < 0 && callbacks.up) {
                        callbacks.up();
                    }
                }
            }
            
            startX = startY = null;
        });
    }
    
    // Show mobile controls for a game
    showMobileControls(gameType, container) {
        if (!this.isMobile) return;
        
        const controlsContainer = container || document.body;
        const existingControls = controlsContainer.querySelector('.mobile-game-controls');
        
        if (existingControls) {
            existingControls.remove();
        }
        
        const controls = document.createElement('div');
        controls.className = 'mobile-game-controls';
        
        switch (gameType) {
            case 'directional':
                this.createDirectionalControls(controls);
                break;
            case 'paddle':
                this.createPaddleControls(controls);
                break;
            case 'tap':
                this.createTapControls(controls);
                break;
        }
        
        controlsContainer.appendChild(controls);
        return controls;
    }
    
    createDirectionalControls(container) {
        const dpad = document.createElement('div');
        dpad.className = 'mobile-dpad';
        
        const directions = [
            { dir: 'up', text: '↑', pos: 'top' },
            { dir: 'left', text: '←', pos: 'left' },
            { dir: 'right', text: '→', pos: 'right' },
            { dir: 'down', text: '↓', pos: 'bottom' }
        ];
        
        directions.forEach(({ dir, text, pos }) => {
            const btn = this.createTouchButton(text, () => {
                window.dispatchEvent(new CustomEvent('mobileDirection', {
                    detail: { direction: dir }
                }));
            }, `dpad-${pos}`);
            dpad.appendChild(btn);
        });
        
        container.appendChild(dpad);
    }
    
    createPaddleControls(container) {
        const paddleControls = document.createElement('div');
        paddleControls.className = 'mobile-paddle-controls';
        
        const leftBtn = this.createTouchButton('←', () => {
            window.dispatchEvent(new CustomEvent('mobilePaddle', {
                detail: { direction: 'left' }
            }));
        }, 'paddle-left');
        
        const rightBtn = this.createTouchButton('→', () => {
            window.dispatchEvent(new CustomEvent('mobilePaddle', {
                detail: { direction: 'right' }
            }));
        }, 'paddle-right');
        
        paddleControls.appendChild(leftBtn);
        paddleControls.appendChild(rightBtn);
        container.appendChild(paddleControls);
    }
    
    createTapControls(container) {
        const tapArea = document.createElement('div');
        tapArea.className = 'mobile-tap-area';
        tapArea.textContent = 'Tap to interact';
        
        tapArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('mobileTap', {
                detail: { 
                    x: e.touches[0].clientX, 
                    y: e.touches[0].clientY 
                }
            }));
        });
        
        container.appendChild(tapArea);
    }
}

// Initialize mobile utils when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileUtils = new MobileUtils();
});