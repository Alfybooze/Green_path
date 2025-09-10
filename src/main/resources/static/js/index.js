// Green Path Interactive JavaScript - Optimized Version
document.addEventListener('DOMContentLoaded', function () {
    // Global variables
    let viewer = null;
    let isMapInitialized = false;

    // Smooth scrolling for navigation links
    const smoothScrollLinks = document.querySelectorAll('.smooth-scroll');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
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

    window.addEventListener('scroll', function () {
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
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });

    // Parallax effect for hero background
    const heroSection = document.querySelector('.hero-section');
    const heroAnimation = document.querySelector('.hero-animation');

    if (heroSection && heroAnimation) {
        window.addEventListener('scroll', function () {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;

            if (scrolled < heroSection.offsetHeight) {
                heroAnimation.style.transform = `translateY(${parallax}px)`;
            }
        });
    }

    // Dynamic typing effect for hero title
    const heroTitle = document.querySelector('.hero-title');
    const leadText = document.querySelector('.lead');

    function typewriterEffectAdvanced() {
        console.log('Starting typewriter effect');

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
                console.log('Typewriter effect completed');
            }
        }

        typeNext();
    }

    if (heroTitle && leadText) {
        // Watch the lead text for intersection
        const leadTextObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(typewriterEffectAdvanced, 300);
                    leadTextObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        leadTextObserver.observe(leadText);
    } else if (heroSection && heroTitle && !leadText) {
        // Fallback to hero section
        const heroSectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
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
            console.log('Fallback trigger - starting typewriter anyway');
            typewriterEffectAdvanced();
        }
    }, 3000);

    // Interactive map dots animation
    const mapDots = document.querySelectorAll('.dot');
    mapDots.forEach((dot, index) => {
        dot.addEventListener('mouseenter', function () {
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

        dot.addEventListener('mouseleave', function () {
            this.style.transform = '';
            this.style.zIndex = '';

            const tooltip = this.querySelector('.map-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });

        // Add click handler for modal
        dot.addEventListener('click', function () {
            createAndShowMapModal();
        });
    });

    // Create and show map modal function
    function createAndShowMapModal() {
        // Remove existing modal if it exists
        const existingModal = document.querySelector('#mapModal');
        if (existingModal) {
            existingModal.remove();
        }

        const mapModalHTML = `
        <div class="modal fade" id="mapModal" tabindex="-1" aria-labelledby="mapModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title" id="mapModalLabel">
                            <i class="fas fa-map-marked-alt me-2 text-success"></i>
                            Green Path 3D Coverage Map
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-0 position-relative">
                        <div id="cesiumContainer" style="height: 500px; width: 100%;"></div>
                        <div class="state-info position-absolute top-0 start-0 m-3 p-3 bg-dark bg-opacity-75 rounded">
                            <h6 class="text-success fw-bold mb-2">
                                <i class="fas fa-leaf me-2"></i>Active Coverage Areas
                            </h6>
                            <p class="mb-2 small">Click on states to see farmer and herder locations</p>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <div class="d-flex justify-content-between w-100">
                            <div class="text-center">
                                <h6 class="text-success mb-1">500+</h6>
                                <small>Active Farmers</small>
                            </div>
                            <div class="text-center">
                                <h6 class="text-success mb-1">200+</h6>
                                <small>Herder Groups</small>
                            </div>
                            <div class="text-center">
                                <h6 class="text-success mb-1">5</h6>
                                <small>Coverage States</small>
                            </div>
                            <div class="text-center">
                                <h6 class="text-success mb-1">0%</h6>
                                <small>Conflict Reduction</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', mapModalHTML);

        // Show the modal
        const mapModal = new bootstrap.Modal(document.getElementById('mapModal'));
        mapModal.show();

        // Initialize Cesium when modal is shown
        document.getElementById('mapModal').addEventListener('shown.bs.modal', function () {
            if (typeof Cesium !== 'undefined' && !isMapInitialized) {
                initializeCesiumMap();
                isMapInitialized = true;
            } else if (typeof Cesium === 'undefined') {
                console.warn('Cesium library not loaded. Showing fallback map.');
                showFallbackMap();
            }
        });

        // Clean up when modal is closed
        document.getElementById('mapModal').addEventListener('hidden.bs.modal', function () {
            cleanupCesiumViewer();
            // Reset the initialization flag to allow re-initialization
            isMapInitialized = false;
        });

    }
    function cleanupCesiumViewer() {
        if (viewer) {
            try {
                viewer.destroy();
                console.log('Cesium viewer destroyed successfully');
            } catch (err) {
                console.warn("Error destroying Cesium viewer:", err);
            }
            viewer = null;
        }

        // Clear the container
        const cesiumContainer = document.getElementById('cesiumContainer');
        if (cesiumContainer) {
            cesiumContainer.innerHTML = '';
        }
    }

    // Consolidated Cesium 3D Map initialization
    function initializeCesiumMap() {
        try {
            // Set Cesium access token
            Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMmQzZjI5NS02MjhiLTRlODAtODdkOC0yMTZmYmMxZDhlNTQiLCJpZCI6MzM2MDAyLCJpYXQiOjE3NTYzMzk5MDR9.jRQFPFiOIsC9cA4zVYEup3aWQ5N0x4BuMlxsOMzycqI';

            const cesiumContainer = document.getElementById('cesiumContainer');
            if (!cesiumContainer) {
                console.error('Cesium container not found');
                return;
            }

            // Create viewer with proper terrain and imagery
            viewer = new Cesium.Viewer('cesiumContainer', {
                // Use default imagery provider instead of Bing Maps to avoid API key issues
                terrain: Cesium.Terrain.fromWorldTerrain(),
            });

            const nigeriaStates = {
                'Benue': { lat: 7.3300, lng: 8.7320, color: Cesium.Color.YELLOW.withAlpha(0.7) },
                'Plateau': { lat: 9.2000, lng: 9.2500, color: Cesium.Color.ORANGE.withAlpha(0.7) },
                'Adamawa': { lat: 9.3200, lng: 12.3900, color: Cesium.Color.RED.withAlpha(0.7) },
                'Nasarawa': { lat: 8.5500, lng: 8.1900, color: Cesium.Color.LIME.withAlpha(0.7) },
                'Taraba': { lat: 8.0000, lng: 11.0000, color: Cesium.Color.CYAN.withAlpha(0.7) }
            };

            Object.entries(nigeriaStates).forEach(([stateName, coords]) => {
                // Add a circular highlight for each state
                viewer.entities.add({
                    name: `${stateName} State Coverage`,
                    position: Cesium.Cartesian3.fromDegrees(coords.lng, coords.lat),
                    ellipse: {
                        semiMinorAxis: 80000,
                        semiMajorAxis: 80000,
                        material: coords.color,
                        outline: true,
                        outlineColor: Cesium.Color.WHITE,
                        height: 0
                    },
                    label: {
                        text: stateName,
                        font: '14pt Arial',
                        fillColor: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -10),
                        scaleByDistance: new Cesium.NearFarScalar(10000, 1.0, 5000000, 0.5)
                    },
                    description: `<div style="padding: 10px;">
                            <h4>${stateName} State</h4>
                            <p>Active farmers and herders in this region are using Green Path to coordinate activities and prevent conflicts.</p>
                            <ul>
                                <li>GPS Land Mapping</li>
                                <li>Route Coordination</li>
                                <li>Direct Communication</li>
                                <li>Conflict Prevention</li>
                            </ul>
                        </div>`
                });

                // Add farmers and herders for each state
                for (let i = 0; i < 4; i++) {
                    const randomLat = coords.lat + (Math.random() - 0.5) * 1.2;
                    const randomLng = coords.lng + (Math.random() - 0.5) * 1.2;

                    viewer.entities.add({
                        name: `Farmer - ${stateName} ${i + 1}`,
                        position: Cesium.Cartesian3.fromDegrees(randomLng, randomLat),
                        billboard: {
                            image: createFarmerIcon(),
                            width: 28,
                            height: 28,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            scaleByDistance: new Cesium.NearFarScalar(1000, 1.2, 5000000, 0.4)
                        },
                        description: `<div style="padding: 10px;">
                                <h4><i class="fas fa-seedling"></i> Farmer in ${stateName}</h4>
                                <p>This farmer is actively using Green Path to:</p>
                                <ul>
                                    <li>Map and register farmland boundaries</li>
                                    <li>Coordinate with local herders</li>
                                    <li>Access the marketplace</li>
                                    <li>Report any conflicts early</li>
                                </ul>
                            </div>`
                    });
                }
                // Add herders for each state
                for (let i = 0; i < 3; i++) {
                    const randomLat = coords.lat + (Math.random() - 0.5) * 1.4;
                    const randomLng = coords.lng + (Math.random() - 0.5) * 1.4;

                    viewer.entities.add({
                        name: `Herder Group - ${stateName} ${i + 1}`,
                        position: Cesium.Cartesian3.fromDegrees(randomLng, randomLat),
                        billboard: {
                            image: createHerderIcon(),
                            width: 28,
                            height: 28,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            scaleByDistance: new Cesium.NearFarScalar(1000, 1.2, 5000000, 0.4)
                        },
                        description: `<div style="padding: 10px;">
                                <h4><i class="fas fa-horse"></i> Herder Group in ${stateName}</h4>
                                <p>This herder group uses Green Path for:</p>
                                <ul>
                                    <li>Planning safe grazing routes</li>
                                    <li>Communicating with farmers</li>
                                    <li>Finding water sources</li>
                                    <li>Avoiding restricted areas</li>
                                </ul>
                            </div>`
                    });
                }
            });

            // Set camera to show Nigeria
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(8.5, 9.5, 1800000),
                orientation: {
                    heading: 0.0,
                    pitch: -0.5,
                    roll: 0.0
                }
            });

            // Add click handler for entities
            viewer.selectedEntityChanged.addEventListener(function (selectedEntity) {
                if (selectedEntity && selectedEntity.name) {
                    const stateInfoElement = document.querySelector('.state-info h6');
                    if (stateInfoElement) {
                        if (selectedEntity.name.includes('Farmer')) {
                            stateInfoElement.innerHTML = '<i class="fas fa-seedling me-2 text-warning"></i>Farmer Selected: ' + selectedEntity.name;
                        } else if (selectedEntity.name.includes('Herder')) {
                            stateInfoElement.innerHTML = '<i class="fas fa-horse me-2 text-success"></i>Herder Selected: ' + selectedEntity.name;
                        } else {
                            stateInfoElement.innerHTML = `<i class="fas fa-map-pin me-2 text-info"></i>${selectedEntity.name} State Coverage`;
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error initializing Cesium map:', error);
            showFallbackMap();
        }
    }

    // Fallback map when Cesium is not available
   function showFallbackMap() {
    const cesiumContainer = document.getElementById('cesiumContainer');
    if (cesiumContainer) {
        cesiumContainer.innerHTML = `
            <div class="fallback-map d-flex align-items-center justify-content-center h-100" 
                 style="background: linear-gradient(135deg, #28a745, #20c997); position: relative;">
                <div class="text-center text-white">
                    <i class="fas fa-map-marked-alt fa-4x mb-3"></i>
                    <h4>Interactive Coverage Map</h4>
                    <p class="mb-3">Green Path operates across 5 Nigerian states</p>
                    <div class="row g-2">
                        <div class="col-12">
                            <div class="card bg-dark text-white mb-2">
                                <div class="card-body py-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span><i class="fas fa-map-pin text-warning me-2"></i>Benue State</span>
                                        <div>
                                            <span class="badge bg-success me-1">120+ Farmers</span>
                                            <span class="badge bg-info">80+ Herders</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="card bg-dark text-white mb-2">
                                <div class="card-body py-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span><i class="fas fa-map-pin text-warning me-2"></i>Plateau State</span>
                                        <div>
                                            <span class="badge bg-success me-1">95+ Farmers</span>
                                            <span class="badge bg-info">60+ Herders</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="card bg-dark text-white mb-2">
                                <div class="card-body py-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span><i class="fas fa-map-pin text-warning me-2"></i>Adamawa State</span>
                                        <div>
                                            <span class="badge bg-success me-1">150+ Farmers</span>
                                            <span class="badge bg-info">90+ Herders</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="card bg-dark text-white mb-2">
                                <div class="card-body py-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span><i class="fas fa-map-pin text-warning me-2"></i>Nasarawa State</span>
                                        <div>
                                            <span class="badge bg-success me-1">85+ Farmers</span>
                                            <span class="badge bg-info">50+ Herders</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="card bg-dark text-white">
                                <div class="card-body py-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span><i class="fas fa-map-pin text-warning me-2"></i>Taraba State</span>
                                        <div>
                                            <span class="badge bg-success me-1">110+ Farmers</span>
                                            <span class="badge bg-info">70+ Herders</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <small class="text-light">3D map requires Cesium library</small>
                    </div>
                </div>
            </div>
        `;
    }
}

    // Create custom icons for farmers and herders
    function createFarmerIcon() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Draw farmer icon (green circle)
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(16, 16, 14, 0, 2 * Math.PI);
        ctx.fill();

        // Add white border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add 'F' for farmer
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('F', 16, 16);

        return canvas.toDataURL();
    }

    function createHerderIcon() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Draw herder icon (brown circle)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(16, 16, 14, 0, 2 * Math.PI);
        ctx.fill();

        // Add white border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add 'H' for herder
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', 16, 16);

        return canvas.toDataURL();
    }

    // Feature cards interactive effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            // Add subtle animation to other cards
            featureCards.forEach(otherCard => {
                if (otherCard !== this) {
                    otherCard.style.transform = 'scale(0.95)';
                    otherCard.style.opacity = '0.7';
                }
            });
        });

        card.addEventListener('mouseleave', function () {
            // Reset all cards
            featureCards.forEach(otherCard => {
                otherCard.style.transform = '';
                otherCard.style.opacity = '';
            });
        });
    });

    // Step cards progressive reveal
    const stepCards = document.querySelectorAll('.step-card');

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
        feature.addEventListener('click', function () {
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

        carousel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        });

        carousel.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                const carouselInstance = bootstrap.Carousel.getInstance(carousel);
                if (carouselInstance) {
                    if (diff > 0) {
                        carouselInstance.next();
                    } else {
                        carouselInstance.prev();
                    }
                }
            }
        }

        // Pause carousel on hover
        carousel.addEventListener('mouseenter', function () {
            const carouselInstance = bootstrap.Carousel.getInstance(carousel);
            if (carouselInstance) {
                carouselInstance.pause();
            }
        });

        carousel.addEventListener('mouseleave', function () {
            const carouselInstance = bootstrap.Carousel.getInstance(carousel);
            if (carouselInstance) {
                carouselInstance.cycle();
            }
        });
    }

    // Testimonial cards interaction
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            // Animate stars
            const stars = this.querySelectorAll('.fas.fa-star');
            stars.forEach((star, index) => {
                setTimeout(() => {
                    star.style.transform = 'scale(1.2) rotate(360deg)';
                    star.style.transition = 'all 0.3s ease';
                }, index * 50);
            });
        });

        card.addEventListener('mouseleave', function () {
            const stars = this.querySelectorAll('.fas.fa-star');
            stars.forEach(star => {
                star.style.transform = '';
            });
        });
    });

    // CTA buttons enhancement
    const ctaButtons = document.querySelectorAll('.cta-button, .signup-btn');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function () {
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
                width: 100px;
                height: 100px;
                left: 50%;
                top: 50%;
                margin-left: -50px;
                margin-top: -50px;
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

    // Add CSS animations
    const animationCSS = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
        @keyframes blink {
            0%, 50% { border-color: #ffc107; }
            51%, 100% { border-color: transparent; }
        }
        .btn-floating {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
    `;
    const style = document.createElement('style');
    style.textContent = animationCSS;
    document.head.appendChild(style);

    // Back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'btn btn-primary btn-floating';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.style.display = 'none';
    backToTopButton.setAttribute('aria-label', 'Back to top');

    document.body.appendChild(backToTopButton);

    // Show/hide back to top button
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'block';
            backToTopButton.style.animation = 'fadeIn 0.3s ease';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Form validation for signup
    function setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

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

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Performance optimization: Lazy load images
    function setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Add loading states for buttons
    function addLoadingState(button, text = 'Loading...') {
        const originalText = button.innerHTML;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${text}`;
        button.disabled = true;

        return function () {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }

    // Example usage for signup buttons
    document.querySelectorAll('.signup-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                const resetLoading = addLoadingState(this, 'Creating Account...');

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
        skipLink.addEventListener('focus', function () {
            this.style.top = '6px';
        });
        skipLink.addEventListener('blur', function () {
            this.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content identifier
        const heroSectionForAccessibility = document.querySelector('.hero-section');
        if (heroSectionForAccessibility) {
            heroSectionForAccessibility.id = 'main-content';
        }

        // Improve focus indicators
        const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
        focusableElements.forEach(el => {
            el.addEventListener('focus', function () {
                this.style.outline = '3px solid #ffc107';
                this.style.outlineOffset = '2px';
            });
            el.addEventListener('blur', function () {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }

    // Hero image placeholder click handler
    const heroImagePlaceholder = document.querySelector('.hero-image-placeholder');
    if (heroImagePlaceholder) {
        heroImagePlaceholder.style.cursor = 'pointer';
        heroImagePlaceholder.addEventListener('click', function () {
            createAndShowMapModal();
        });
    }

    // Video Modal Setup
    function createVideoModal() {
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
                            <div class="video-placeholder" style="height: 300px; background: linear-gradient(135deg, #28a745, #20c997); display: flex; align-items: center; justify-content: center; color: white;">
                                <div class="text-center">
                                    <i class="fas fa-play fa-4x mb-3"></i>
                                    <p class="mt-3 h5">Demo Video Coming Soon</p>
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
    }

    // Initialize all features
    setupLazyLoading();
    setupFormValidation();
    enhanceAccessibility();
    createVideoModal();

    // Console welcome message

});