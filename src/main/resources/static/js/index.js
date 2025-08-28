// Green Path Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const smoothScrollLinks = document.querySelectorAll('.smooth-scroll');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animated counter for hero stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        updateCounter();
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger counter animations
                if (entry.target.classList.contains('counter')) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
                
                // Add fade-in animations
                if (entry.target.classList.contains('fade-in-up')) {
                    entry.target.style.animationPlayState = 'running';
                }
                
                // Trigger feature item animations
                if (entry.target.classList.contains('feature-item')) {
                    entry.target.style.animationPlayState = 'running';
                }
                
                // Add card hover effects when visible
                if (entry.target.classList.contains('card-hover')) {
                    entry.target.classList.add('animate__fadeInUp');
                }
            }
        });
    }, observerOptions);

    // Observe elements for animations
    document.querySelectorAll('.counter, .fade-in-up, .feature-item, .card-hover').forEach(el => {
        observer.observe(el);
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove shadow based on scroll position
        if (scrollTop > 50) {
            navbar.classList.add('shadow-sm');
            navbar.style.backgroundColor = 'rgba(40, 167, 69, 0.95)';
        } else {
            navbar.classList.remove('shadow-sm');
            navbar.style.backgroundColor = '';
        }
        
        // Hide/show navbar on scroll (mobile only)
        if (window.innerWidth <= 768) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
    });

    // Mobile menu close on link click
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });

    // Parallax effect for hero background
    const heroSection = document.querySelector('.hero-section');
    const heroAnimation = document.querySelector('.hero-animation');
    
    if (heroSection && heroAnimation) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            if (scrolled < heroSection.offsetHeight) {
                heroAnimation.style.transform = `translateY(${parallax}px)`;
            }
        });
    }

// Dynamic typing effect for hero title
// Dynamic typing effect triggered by lead text
const heroTitle = document.querySelector('.hero-title');
const leadText = document.querySelector('.lead'); // The paragraph below the title

if (heroTitle && leadText) {
    
    function typewriterEffectAdvanced() {
        console.log('🚀 Starting typewriter effect triggered by lead text');
        
        const originalHTML = heroTitle.innerHTML;
        
        // Make element visible AND opaque
        heroTitle.style.display = 'block';
        heroTitle.style.opacity = '1';
        
        heroTitle.innerHTML = '<span class="typewriter-cursor" style="border-right: 3px solid #ffc107; animation: blink 1s infinite;"></span>';
        
        // Convert HTML to array of characters and tags
        const htmlArray = [];
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        
        function parseNode(node) {
            if (node.nodeType === 3) { // Text node
                for (let char of node.textContent) {
                    htmlArray.push({ type: 'char', content: char });
                }
            } else if (node.nodeType === 1) { // Element node
                htmlArray.push({ type: 'openTag', content: node.outerHTML.split('>')[0] + '>' });
                for (let child of node.childNodes) {
                    parseNode(child);
                }
                htmlArray.push({ type: 'closeTag', content: `</${node.tagName.toLowerCase()}>` });
            }
        }
        
        for (let child of tempDiv.childNodes) {
            parseNode(child);
        }
        
        let index = 0;
        let currentHTML = '';
        
        function typeNext() {
            if (index < htmlArray.length) {
                const current = htmlArray[index];
                
                if (current.type === 'char') {
                    currentHTML += current.content;
                    heroTitle.innerHTML = currentHTML + '<span class="typewriter-cursor" style="border-right: 3px solid #ffc107; animation: blink 1s infinite;"></span>';
                    setTimeout(typeNext, 50); // Character delay
                } else {
                    // Add tags instantly
                    currentHTML += current.content;
                    setTimeout(typeNext, 0);
                }
                
                index++;
            } else {
                // Remove cursor
                heroTitle.innerHTML = currentHTML;
                console.log('✅ Typewriter effect completed');
            }
        }
        
        typeNext();
    }
    
    // Watch the lead text instead of the hero title
    const leadTextObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log('Lead text intersection observed:', entry.isIntersecting);
            if (entry.isIntersecting) {
                console.log('Lead text visible! Starting typewriter in 300ms...');
                setTimeout(typewriterEffectAdvanced, 300);
                leadTextObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.2,  // Trigger when 20% of lead text is visible
        rootMargin: '0px 0px -50px 0px'  // Trigger a bit before it fully enters
    });
    
    leadTextObserver.observe(leadText);  // ← Watch the lead text, not the title!

} else {
    console.error('Hero title or lead text not found');
    console.log('Hero title:', !!heroTitle);
    console.log('Lead text:', !!leadText);
}

// Alternative: Use the hero section container as trigger
const hero_Section = document.querySelector('.hero-section');
if (hero_Section && heroTitle && !leadText) {
    console.log('Using hero section as fallback trigger');
    
    const heroSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log('Hero section intersection observed:', entry.isIntersecting);
            if (entry.isIntersecting) {
                console.log('Hero section visible! Starting typewriter...');
                setTimeout(typewriterEffectAdvanced, 500);
                heroSectionObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px'
    });
    
    heroSectionObserver.observe(heroSection);
}

// Emergency fallback - trigger on page load after delay
setTimeout(() => {
    if (heroTitle && heroTitle.style.display === 'none') {
        console.log('🆘 Fallback trigger - no intersection detected, starting typewriter anyway');
        typewriterEffectAdvanced();
    }
}, 3000); // Wait 3 seconds then trigger anyway
    // Interactive map dots animation
    const mapDots = document.querySelectorAll('.dot');
    mapDots.forEach((dot, index) => {
        dot.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.5)';
            this.style.zIndex = '10';
            
            // Show tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'map-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 0.5rem;
                border-radius: 5px;
                font-size: 0.8rem;
                z-index: 20;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
            `;
            
            if (this.classList.contains('farmer-dot')) {
                tooltip.textContent = 'Active Farmer';
            } else {
                tooltip.textContent = 'Herder Group';
            }
            
            this.appendChild(tooltip);
        });
        
        dot.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.zIndex = '';
            
            const tooltip = this.querySelector('.map-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });

    // Feature cards interactive effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle animation to other cards
            featureCards.forEach(otherCard => {
                if (otherCard !== this) {
                    otherCard.style.transform = 'scale(0.95)';
                    otherCard.style.opacity = '0.7';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset all cards
            featureCards.forEach(otherCard => {
                otherCard.style.transform = '';
                otherCard.style.opacity = '';
            });
        });
    });

    // Step cards progressive reveal
    const stepCards = document.querySelectorAll('.step-card');
    let stepRevealTimer;
    
    function revealSteps() {
        stepCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'all 0.6s ease';
            }, index * 200);
        });
    }
    
    // Initialize steps as hidden
    stepCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });
    
    // Reveal when section comes into view
    const stepsSection = document.querySelector('#how-it-works');
    if (stepsSection) {
        const stepsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealSteps();
                    stepsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        stepsObserver.observe(stepsSection);
    }

    // Marketplace features animation
    const marketplaceFeatures = document.querySelectorAll('.marketplace-features .feature-item');
    marketplaceFeatures.forEach((feature, index) => {
        feature.addEventListener('click', function() {
            // Add pulse effect
            this.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 600);
        });
    });

    // Success stories carousel enhancements
    const carousel = document.querySelector('#successCarousel');
    if (carousel) {
        // Add swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carousel.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                const carouselInstance = bootstrap.Carousel.getInstance(carousel);
                if (diff > 0) {
                    carouselInstance.next();
                } else {
                    carouselInstance.prev();
                }
            }
        }
        
        // Pause carousel on hover
        carousel.addEventListener('mouseenter', function() {
            const carouselInstance = bootstrap.Carousel.getInstance(carousel);
            if (carouselInstance) {
                carouselInstance.pause();
            }
        });
        
        carousel.addEventListener('mouseleave', function() {
            const carouselInstance = bootstrap.Carousel.getInstance(carousel);
            if (carouselInstance) {
                carouselInstance.cycle();
            }
        });
    }

    // Testimonial cards interaction
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Animate stars
            const stars = this.querySelectorAll('.fas.fa-star');
            stars.forEach((star, index) => {
                setTimeout(() => {
                    star.style.transform = 'scale(1.2) rotate(360deg)';
                    star.style.transition = 'all 0.3s ease';
                }, index * 50);
            });
        });
        
        card.addEventListener('mouseleave', function() {
            const stars = this.querySelectorAll('.fas.fa-star');
            stars.forEach(star => {
                star.style.transform = '';
            });
        });
    });

    // CTA buttons enhancement
    const ctaButtons = document.querySelectorAll('.cta-button, .signup-btn');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });

    // Add ripple animation CSS
    const rippleCSS = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    const style = document.createElement('style');
    style.textContent = rippleCSS;
    document.head.appendChild(style);

    // Back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'btn btn-primary btn-floating';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.style.display = 'none';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    
    document.body.appendChild(backToTopButton);
    
    // Show/hide back to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'block';
            backToTopButton.style.animation = 'fadeIn 0.3s ease';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Form validation for signup (if forms are added later)
    function setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Add form validation logic here
                const inputs = form.querySelectorAll('input[required]');
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('is-invalid');
                    } else {
                        input.classList.remove('is-invalid');
                    }
                });
                
                if (isValid) {
                    // Show success message
                    showNotification('Success! Welcome to Green Path community.', 'success');
                } else {
                    showNotification('Please fill in all required fields.', 'error');
                }
            });
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} notification-toast`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1050;
            min-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Add notification animations CSS
    const notificationCSS = `
        @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
    `;
    style.textContent += notificationCSS;

    // Performance optimization: Lazy load images when implemented
    function setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Initialize lazy loading
    setupLazyLoading();
    
    // Setup form validation
    setupFormValidation();

    // Add loading states for buttons
    function addLoadingState(button, text = 'Loading...') {
        const originalText = button.innerHTML;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${text}`;
        button.disabled = true;
        
        return function() {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }

    // Example usage for signup buttons
    document.querySelectorAll('.signup-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                const resetLoading = addLoadingState(this, 'Creating Account...');
                
                // Simulate API call
                setTimeout(() => {
                    resetLoading();
                    showNotification('Feature coming soon! We will notify you when registration opens.', 'info');
                }, 2000);
            }
        });
    });

    // Accessibility enhancements
    function enhanceAccessibility() {
        // Add skip links
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'visually-hidden-focusable';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 1051;
            color: white;
            background: #007bff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
        `;
        skipLink.addEventListener('focus', function() {
            this.style.top = '6px';
        });
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content identifier
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.id = 'main-content';
        }

        // Improve focus indicators
        const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
        focusableElements.forEach(el => {
            el.addEventListener('focus', function() {
                this.style.outline = '3px solid #ffc107';
                this.style.outlineOffset = '2px';
            });
            el.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }

    // Initialize accessibility enhancements
    enhanceAccessibility();

    // Console welcome message
    console.log('%c🌱 Welcome to Green Path! 🌱', 'color: #28a745; font-size: 20px; font-weight: bold;');
    console.log('%cBridging Communities, Growing Together', 'color: #ffc107; font-size: 14px;');
    console.log('%cFor technical inquiries: hello@greenpath.ng', 'color: #6c757d; font-size: 12px;');

});

// Video Modal Setup (add this if you want the video modal to work)
document.addEventListener('DOMContentLoaded', function() {
    // Create video modal if it doesn't exist
    if (!document.querySelector('#videoModal')) {
        const modalHTML = `
        <div class="modal fade" id="videoModal" tabindex="-1" aria-labelledby="videoModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="videoModalLabel">Green Path Platform Demo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-0">
                        <div class="video-placeholder">
                            <div class="video-overlay">
                                <i class="fas fa-play"></i>
                                <p class="mt-3">Demo Video Coming Soon</p>
                                <small>See how farmers and herders are using Green Path to build peace</small>
                            </div>
                        </div>
                        <div class="p-4">
                            <h6 class="fw-bold mb-3">What you'll see in this demo:</h6>
                            <div class="demo-features">
                                <span class="badge bg-success me-2 mb-2">GPS Land Mapping</span>
                                <span class="badge bg-success me-2 mb-2">Route Planning</span>
                                <span class="badge bg-success me-2 mb-2">Direct Messaging</span>
                                <span class="badge bg-success me-2 mb-2">Marketplace Trading</span>
                                <span class="badge bg-success me-2 mb-2">Conflict Resolution</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    // Just initialize AOS with built-in animations
});