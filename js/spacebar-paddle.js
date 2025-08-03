/**
 * SpacebarPaddle - Timing-based morse code input using spacebar
 * Short presses = dots, longer presses = dashes
 */

// Timing constants based on morse code standards
const MORSE_TIMING = {
    BASE_DOT_DURATION_FORMULA: 1200, // ms per WPM (standard morse formula)
    DOT_TO_DASH_RATIO: 3,            // Standard morse code ratio
    PADDLE_TIMING_MULTIPLIER: 1.2,   // Slightly longer than audio for human input
    TOLERANCE_RATIO: 0.4,             // Timing tolerance as ratio of dot duration
    DEFAULT_DOT_THRESHOLD: 150,       // Default dot threshold (ms)
    DEFAULT_DASH_THRESHOLD: 500,      // Default dash threshold (ms) 
    DEFAULT_TOLERANCE: 50             // Default tolerance (ms)
};

// Global instance tracking for cleanup
let activeSpacebarPaddle = null;

export class SpacebarPaddle {
    constructor(options = {}) {
        // Clean up any existing paddle instance
        if (activeSpacebarPaddle) {
            activeSpacebarPaddle.destroy();
        }
        activeSpacebarPaddle = this;
        
        this.enabled = false;
        this.pressStartTime = null;
        this.isPressed = false;
        this.keydownHandler = null;
        this.keyupHandler = null;
        this.animationId = null;
        
        // Touch/mouse conflict prevention
        this.lastInteractionType = null;
        this.interactionTimeout = null;
        
        // Timing configuration (milliseconds)
        this.timing = {
            dotThreshold: MORSE_TIMING.DEFAULT_DOT_THRESHOLD,    // max duration for dot
            dashThreshold: MORSE_TIMING.DEFAULT_DASH_THRESHOLD,   // max duration for dash
            tolerance: MORSE_TIMING.DEFAULT_TOLERANCE             // timing tolerance
        };
        
        // Callbacks
        this.onInput = options.onInput || (() => {});
        this.onPressStart = options.onPressStart || (() => {});
        this.onPressEnd = options.onPressEnd || (() => {});
        this.onInvalidTiming = options.onInvalidTiming || (() => {});
        
        // Visual feedback elements (inline mode)
        this.useInlineMode = options.useInlineMode || false;
        this.inlineContainer = options.inlineContainer || null;
        this.inlineTimingBar = options.inlineTimingBar || null;
        
        // Validate inline mode setup
        if (this.useInlineMode) {
            if (!this.inlineContainer) {
                console.warn('SpacebarPaddle: Inline mode enabled but no inlineContainer provided');
                this.useInlineMode = false;
            } else if (!(this.inlineContainer instanceof Element)) {
                console.warn('SpacebarPaddle: inlineContainer is not a valid DOM element');
                this.useInlineMode = false;
                this.inlineContainer = null;
            }
            
            if (this.inlineTimingBar && !(this.inlineTimingBar instanceof Element)) {
                console.warn('SpacebarPaddle: inlineTimingBar is not a valid DOM element');
                this.inlineTimingBar = null;
            }
        }
        
        // Floating indicator (fallback mode)
        this.pressIndicator = null;
        this.timingBar = null;
        
        if (!this.useInlineMode) {
            this.setupVisualFeedback();
        }
        
        // Bind methods
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleKeyup = this.handleKeyup.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }
    
    /**
     * Enable paddle input
     */
    enable() {
        if (this.enabled) return;
        
        this.enabled = true;
        document.addEventListener('keydown', this.handleKeydown);
        document.addEventListener('keyup', this.handleKeyup);
        
        // Add mouse and touch events for both desktop and mobile support
        if (this.useInlineMode && this.inlineContainer) {
            try {
                this.inlineContainer.style.display = 'block';
                // Mouse events for desktop
                this.inlineContainer.addEventListener('mousedown', this.handleMouseDown);
                this.inlineContainer.addEventListener('mouseup', this.handleMouseUp);
                this.inlineContainer.addEventListener('mouseleave', this.handleMouseUp); // Handle mouse leaving area
                // Touch events for mobile
                this.inlineContainer.addEventListener('touchstart', this.handleTouchStart, { passive: false });
                this.inlineContainer.addEventListener('touchend', this.handleTouchEnd, { passive: false });
                this.inlineContainer.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
            } catch (error) {
                console.warn('SpacebarPaddle: Error setting up inline container events:', error);
            }
        } else if (this.pressIndicator) {
            try {
                this.pressIndicator.style.display = 'block';
                // Mouse events for desktop
                this.pressIndicator.addEventListener('mousedown', this.handleMouseDown);
                this.pressIndicator.addEventListener('mouseup', this.handleMouseUp);
                this.pressIndicator.addEventListener('mouseleave', this.handleMouseUp);
                // Touch events for mobile
                this.pressIndicator.addEventListener('touchstart', this.handleTouchStart, { passive: false });
                this.pressIndicator.addEventListener('touchend', this.handleTouchEnd, { passive: false });
                this.pressIndicator.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
            } catch (error) {
                console.warn('SpacebarPaddle: Error setting up press indicator events:', error);
            }
        } else {
            console.warn('SpacebarPaddle: No valid container element found for paddle interface');
        }
    }
    
    /**
     * Disable paddle input
     */
    disable() {
        if (!this.enabled) return;
        
        this.enabled = false;
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('keyup', this.handleKeyup);
        
        // Remove mouse and touch events
        if (this.useInlineMode && this.inlineContainer) {
            try {
                // Remove mouse events
                this.inlineContainer.removeEventListener('mousedown', this.handleMouseDown);
                this.inlineContainer.removeEventListener('mouseup', this.handleMouseUp);
                this.inlineContainer.removeEventListener('mouseleave', this.handleMouseUp);
                // Remove touch events
                this.inlineContainer.removeEventListener('touchstart', this.handleTouchStart);
                this.inlineContainer.removeEventListener('touchend', this.handleTouchEnd);
                this.inlineContainer.removeEventListener('touchcancel', this.handleTouchEnd);
            } catch (error) {
                console.warn('SpacebarPaddle: Error removing inline container events:', error);
            }
        } else if (this.pressIndicator) {
            try {
                // Remove mouse events
                this.pressIndicator.removeEventListener('mousedown', this.handleMouseDown);
                this.pressIndicator.removeEventListener('mouseup', this.handleMouseUp);
                this.pressIndicator.removeEventListener('mouseleave', this.handleMouseUp);
                // Remove touch events
                this.pressIndicator.removeEventListener('touchstart', this.handleTouchStart);
                this.pressIndicator.removeEventListener('touchend', this.handleTouchEnd);
                this.pressIndicator.removeEventListener('touchcancel', this.handleTouchEnd);
            } catch (error) {
                console.warn('SpacebarPaddle: Error removing press indicator events:', error);
            }
        }
        
        // Reset state
        this.isPressed = false;
        this.pressStartTime = null;
        
        // Cancel any ongoing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Safely update UI elements
        try {
            if (this.useInlineMode && this.inlineContainer) {
                this.inlineContainer.style.display = 'none';
                this.inlineContainer.classList.remove('pressed');
                if (this.inlineTimingBar) {
                    this.inlineTimingBar.style.width = '0%';
                }
            } else if (this.pressIndicator) {
                this.pressIndicator.style.display = 'none';
                this.pressIndicator.classList.remove('pressed');
                if (this.timingBar) {
                    this.timingBar.style.width = '0%';
                }
            }
        } catch (error) {
            console.warn('SpacebarPaddle: Error updating UI during disable:', error);
        }
    }
    
    /**
     * Update timing configuration
     */
    updateTiming(newTiming) {
        this.timing = { ...this.timing, ...newTiming };
    }
    
    /**
     * Handle keydown events
     */
    handleKeydown(event) {
        if (!this.enabled || event.code !== 'Space' || this.isPressed) {
            return;
        }
        
        // Prevent default spacebar behavior (scrolling, etc.)
        event.preventDefault();
        
        this.isPressed = true;
        this.pressStartTime = performance.now();
        
        // Visual feedback
        if (this.useInlineMode && this.inlineContainer) {
            this.inlineContainer.classList.add('pressed');
        } else if (this.pressIndicator) {
            this.pressIndicator.classList.add('pressed');
        }
        
        // Start timing bar animation
        this.startTimingAnimation();
        
        this.onPressStart();
    }
    
    /**
     * Handle keyup events
     */
    handleKeyup(event) {
        if (!this.enabled || event.code !== 'Space' || !this.isPressed) {
            return;
        }
        
        event.preventDefault();
        
        const duration = performance.now() - this.pressStartTime;
        const symbol = this.calculateMorseSymbol(duration);
        
        // Reset state
        this.isPressed = false;
        this.pressStartTime = null;
        
        // Cancel any ongoing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Visual feedback
        if (this.useInlineMode && this.inlineContainer) {
            this.inlineContainer.classList.remove('pressed');
        } else if (this.pressIndicator) {
            this.pressIndicator.classList.remove('pressed');
        }
        this.stopTimingAnimation();
        
        this.onPressEnd(duration, symbol);
        
        if (symbol) {
            this.onInput(symbol);
        } else {
            this.onInvalidTiming(duration);
        }
    }
    
    /**
     * Set interaction type and prevent conflicts
     */
    setInteractionType(type) {
        // Prevent conflicts between touch and mouse on hybrid devices
        if (this.lastInteractionType && this.lastInteractionType !== type) {
            // If switching interaction types within 100ms, ignore the new one
            if (this.interactionTimeout) {
                return false; // Ignore this interaction
            }
        }
        
        this.lastInteractionType = type;
        
        // Clear any existing timeout
        if (this.interactionTimeout) {
            clearTimeout(this.interactionTimeout);
        }
        
        // Reset interaction type after a delay
        this.interactionTimeout = setTimeout(() => {
            this.lastInteractionType = null;
            this.interactionTimeout = null;
        }, 100);
        
        return true; // Allow this interaction
    }

    /**
     * Shared logic for starting a press (touch/mouse)
     */
    startPress(event, interactionType) {
        if (!this.enabled || this.isPressed) {
            return false;
        }
        
        // Prevent touch/mouse conflicts
        if (!this.setInteractionType(interactionType)) {
            return false;
        }
        
        // Prevent default behavior
        event.preventDefault();
        
        this.isPressed = true;
        this.pressStartTime = performance.now();
        
        // Visual feedback
        try {
            if (this.useInlineMode && this.inlineContainer) {
                this.inlineContainer.classList.add('pressed');
            } else if (this.pressIndicator) {
                this.pressIndicator.classList.add('pressed');
            }
        } catch (error) {
            console.warn('SpacebarPaddle: Error applying pressed visual feedback:', error);
        }
        
        // Start timing bar animation
        this.startTimingAnimation();
        
        this.onPressStart();
        return true;
    }

    /**
     * Shared logic for ending a press (touch/mouse)
     */
    endPress(event) {
        if (!this.enabled || !this.isPressed) {
            return;
        }
        
        event.preventDefault();
        
        const duration = performance.now() - this.pressStartTime;
        const symbol = this.calculateMorseSymbol(duration);
        
        // Reset state
        this.isPressed = false;
        this.pressStartTime = null;
        
        // Cancel any ongoing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Visual feedback
        try {
            if (this.useInlineMode && this.inlineContainer) {
                this.inlineContainer.classList.remove('pressed');
            } else if (this.pressIndicator) {
                this.pressIndicator.classList.remove('pressed');
            }
        } catch (error) {
            console.warn('SpacebarPaddle: Error removing pressed visual feedback:', error);
        }
        this.stopTimingAnimation();
        
        this.onPressEnd(duration, symbol);
        
        if (symbol) {
            this.onInput(symbol);
        } else {
            this.onInvalidTiming(duration);
        }
    }

    /**
     * Handle touch start events (mobile support)
     */
    handleTouchStart(event) {
        this.startPress(event, 'touch');
    }
    
    /**
     * Handle touch end events (mobile support)
     */
    handleTouchEnd(event) {
        this.endPress(event);
    }
    
    /**
     * Handle mouse down events (desktop support)
     */
    handleMouseDown(event) {
        this.startPress(event, 'mouse');
    }
    
    /**
     * Handle mouse up events (desktop support)
     */
    handleMouseUp(event) {
        this.endPress(event);
    }
    
    /**
     * Calculate morse symbol based on press duration
     */
    calculateMorseSymbol(duration) {
        const { dotThreshold, dashThreshold, tolerance } = this.timing;
        
        if (duration <= dotThreshold + tolerance) {
            return '.';
        } else if (duration >= dotThreshold - tolerance && duration <= dashThreshold + tolerance) {
            return '-';
        } else {
            return null; // Invalid timing
        }
    }
    
    /**
     * Setup visual feedback elements
     */
    setupVisualFeedback() {
        try {
            // Create press indicator
            this.pressIndicator = document.createElement('div');
            this.pressIndicator.className = 'spacebar-paddle-indicator';
            this.pressIndicator.innerHTML = `
                <div class="paddle-status">
                    <div class="paddle-icon">⎵</div>
                    <div class="paddle-text">Spacebar Paddle</div>
                </div>
                <div class="timing-guides">
                    <div class="timing-zone dot-zone">DOT</div>
                    <div class="timing-zone dash-zone">DASH</div>
                </div>
                <div class="timing-bar-container">
                    <div class="timing-bar"></div>
                </div>
            `;
            
            this.timingBar = this.pressIndicator.querySelector('.timing-bar');
            if (!this.timingBar) {
                console.warn('SpacebarPaddle: Failed to find timing bar in created indicator');
            }
            
            this.pressIndicator.style.display = 'none';
            
            if (document.body) {
                document.body.appendChild(this.pressIndicator);
            } else {
                console.warn('SpacebarPaddle: document.body not available, cannot append press indicator');
            }
        } catch (error) {
            console.warn('SpacebarPaddle: Error setting up visual feedback elements:', error);
            this.pressIndicator = null;
            this.timingBar = null;
        }
    }
    
    /**
     * Start timing bar animation
     */
    startTimingAnimation() {
        const timingBar = this.useInlineMode ? this.inlineTimingBar : this.timingBar;
        if (!timingBar) {
            console.warn('SpacebarPaddle: No timing bar element found for animation');
            return;
        }
        
        try {
            timingBar.style.width = '0%';
            timingBar.style.transition = 'none';
        } catch (error) {
            console.warn('SpacebarPaddle: Error initializing timing bar animation:', error);
            return;
        }
        
        // Use requestAnimationFrame for smooth animation
        const animate = () => {
            if (!this.isPressed) {
                // Clean up animation reference when stopping
                this.animationId = null;
                return;
            }
            
            try {
                const elapsed = performance.now() - this.pressStartTime;
                const maxDuration = this.timing.dashThreshold + this.timing.tolerance;
                const progress = Math.min((elapsed / maxDuration) * 100, 100);
                
                timingBar.style.width = `${progress}%`;
                
                // Color coding based on timing zones
                if (elapsed <= this.timing.dotThreshold) {
                    timingBar.className = 'timing-bar dot-timing';
                } else if (elapsed <= this.timing.dashThreshold) {
                    timingBar.className = 'timing-bar dash-timing';
                } else {
                    timingBar.className = 'timing-bar invalid-timing';
                }
                
                this.animationId = requestAnimationFrame(animate);
            } catch (error) {
                console.warn('SpacebarPaddle: Error during timing bar animation:', error);
                // Stop animation on error
                this.animationId = null;
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    /**
     * Stop timing bar animation
     */
    stopTimingAnimation() {
        const timingBar = this.useInlineMode ? this.inlineTimingBar : this.timingBar;
        if (!timingBar) return;
        
        // Brief feedback showing final result
        setTimeout(() => {
            try {
                if (timingBar) {
                    timingBar.style.width = '0%';
                    timingBar.className = 'timing-bar';
                }
            } catch (error) {
                console.warn('SpacebarPaddle: Error resetting timing bar:', error);
            }
        }, 200);
    }
    
    /**
     * Get current timing configuration for display
     */
    getTimingInfo() {
        return {
            dotRange: `0-${this.timing.dotThreshold + this.timing.tolerance}ms`,
            dashRange: `${this.timing.dotThreshold - this.timing.tolerance}-${this.timing.dashThreshold + this.timing.tolerance}ms`,
            tolerance: `±${this.timing.tolerance}ms`
        };
    }
    
    /**
     * Update timing from WPM (matches sound-to-char timing)
     */
    setTimingFromWPM(wpm) {
        const dotDuration = MORSE_TIMING.BASE_DOT_DURATION_FORMULA / wpm;
        this.updateTiming({
            dotThreshold: Math.round(dotDuration * MORSE_TIMING.PADDLE_TIMING_MULTIPLIER),
            dashThreshold: Math.round(dotDuration * MORSE_TIMING.DOT_TO_DASH_RATIO * MORSE_TIMING.PADDLE_TIMING_MULTIPLIER),
            tolerance: Math.round(dotDuration * MORSE_TIMING.TOLERANCE_RATIO)
        });
    }
    
    /**
     * Cleanup - remove event listeners and DOM elements
     */
    destroy() {
        this.disable();
        
        // Clean up interaction timeout
        if (this.interactionTimeout) {
            clearTimeout(this.interactionTimeout);
            this.interactionTimeout = null;
        }
        
        if (this.pressIndicator && this.pressIndicator.parentNode) {
            this.pressIndicator.parentNode.removeChild(this.pressIndicator);
        }
        
        // Clear global reference if this is the active instance
        if (activeSpacebarPaddle === this) {
            activeSpacebarPaddle = null;
        }
    }
}

/**
 * Utility function to clean up any active paddle instance
 */
export function cleanupActiveSpacebarPaddle() {
    if (activeSpacebarPaddle) {
        activeSpacebarPaddle.destroy();
        activeSpacebarPaddle = null;
    }
}