// --- Preloader Logic (runs when window and all assets are fully loaded) ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const hasVisited = sessionStorage.getItem("hasVisitedVastrakart");

    if (preloader) {
        if (!hasVisited) {
            setTimeout(() => {
                preloader.classList.add('hidden');
                preloader.addEventListener('transitionend', function handler() {
                    preloader.remove();
                    sessionStorage.setItem("hasVisitedVastrakart", "true");
                    preloader.removeEventListener('transitionend', handler);
                }, { once: true });
            }, 3000); // 3 seconds for preloader
        } else {
            preloader.remove(); // Remove immediately if already visited
        }
    } else {
        console.error("Preloader element with ID 'preloader' not found!");
    }
});

// --- Fallback Preloader Hide (Safety Net) ---
setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        console.warn('⏱️ Forcing preloader hide after 15s timeout.');
        preloader.classList.add('hidden');
        preloader.addEventListener('transitionend', function handler() {
            preloader.remove();
            sessionStorage.setItem("hasVisitedVastrakart", "true");
            preloader.removeEventListener('transitionend', handler);
        }, { once: true });
    }
}, 15000); // 15 seconds max timeout for preloader

// --- DOM Ready Logic (runs when HTML is parsed and ready) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Navbar Toggler ---
    const navbarToggler = document.getElementById('navbarToggler');
    const navbarMenu = document.getElementById('navbarMenu');
    const navbarIcon = navbarToggler?.querySelector('i');

    if (navbarToggler && navbarMenu && navbarIcon) {
        navbarToggler.addEventListener('click', () => {
            navbarMenu.classList.toggle('show');
            navbarIcon.classList.toggle('fa-bars');
            navbarIcon.classList.toggle('fa-times');
        });

        navbarMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navbarMenu.classList.contains('show')) {
                    navbarMenu.classList.remove('show');
                    navbarIcon.classList.remove('fa-times');
                    navbarIcon.classList.add('fa-bars');
                }
            });
        });
    } else {
        console.warn("Navbar toggler or menu not found. Check HTML structure.");
    }

    // --- Flash Message Fade Out ---
    document.querySelectorAll('.flash-message').forEach(msg => {
        setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
        }, 3000);
    });

    // --- Search Filtering Logic ---
});

document.addEventListener('DOMContentLoaded', () => {
        const mainImage = document.querySelector('.main-dress-image');
        const otherImages = document.querySelectorAll('.other-dress-image');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = lightbox.querySelector('img');
        const closeBtn = lightbox.querySelector('.close-btn');

        // Set initial active state for the first thumbnail if available
        if (otherImages.length > 0) {
            otherImages.forEach((img, index) => {
                if (index === 0) {
                    img.classList.add('active');
                } else {
                    img.classList.remove('active');
                }
            });
        }

        otherImages.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                otherImages.forEach(img => img.classList.remove('active'));
                mainImage.src = thumbnail.src;
                thumbnail.classList.add('active');
            });
        });

        mainImage.addEventListener('click', () => {
            lightboxImg.src = mainImage.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });


// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('SearchInput');
    const searchButton = document.getElementById('searchButton');
    const storeGrid = document.querySelector('.store-grid');
    const noStoresMessage = document.getElementById('no-stores-initial-message');

    let allShopsData = [];

    function renderShops(shopsToRender) {
        storeGrid.innerHTML = '';
        if (shopsToRender.length === 0) {
            if (noStoresMessage) {
                noStoresMessage.textContent = 'No matching stores found.';
                noStoresMessage.style.display = 'block';
            }
            return;
        }

        if (noStoresMessage) {
            noStoresMessage.style.display = 'none';
            noStoresMessage.textContent = '';
        }

        shopsToRender.forEach(shop => {
            const div = document.createElement('div');
            div.className = 'store-card';
            div.innerHTML = `
                <img src="${shop.logo}" class="store-logo" alt="${shop.name}" onerror="this.onerror=null;this.src='/photos/default-shop-logo.png';">
                <h3>${shop.name}</h3>
                <p class="shop-location"><i class="fas fa-map-marker-alt"></i> ${shop.location}</p>
                <p class="shop-description">${shop.description || ''}</p>
                <a href="/stores/${shop._id}" class="btn btn-secondary">View Store</a>
            `;
            storeGrid.appendChild(div);
        });
    }

    async function performSearch() {
        const val = searchInput.value.toLowerCase().trim();
        const filtered = allShopsData.filter(shop =>
            (shop.name && shop.name.toLowerCase().includes(val)) ||
            (shop.location && shop.location.toLowerCase().includes(val)) ||
            (shop.description && shop.description.toLowerCase().includes(val))
        );
        renderShops(filtered);
    }

    if (searchInput && searchButton) {
        searchInput.addEventListener('input', performSearch);
        searchButton.addEventListener('click', performSearch);
    }

    async function initializeSearchData() {
        try {
            const res = await fetch('/api/shops');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            allShopsData = await res.json();
        } catch (err) {
            console.error('❌ Failed to load shop data:', err);
        }
    }

    initializeSearchData();
});

document.addEventListener('DOMContentLoaded', () => {
        const mainImage = document.querySelector('.main-dress-image');
        const otherImages = document.querySelectorAll('.other-dress-image');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = lightbox.querySelector('img');
        const closeBtn = lightbox.querySelector('.close-btn');

        // Set initial active state for the first thumbnail if available
        if (otherImages.length > 0) {
            otherImages[0].classList.add('active');
        }

        otherImages.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                // Remove active class from all thumbnails
                otherImages.forEach(img => img.classList.remove('active'));

                // Set new main image
                mainImage.src = thumbnail.src;
                thumbnail.classList.add('active'); // Add active class to clicked thumbnail
            });
        });

        mainImage.addEventListener('click', () => {
            lightboxImg.src = mainImage.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
        });

        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });

        lightbox.addEventListener('click', (e) => {
            // Close lightbox if clicked outside the image
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close lightbox with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
