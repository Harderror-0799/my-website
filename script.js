// Enhanced Affiliate Marketing System
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartBadge = document.getElementById("cart-count");
const miniCart = document.getElementById("mini-cart");
const cartItemsList = document.getElementById("cart-items-list");

// Affiliate tracking
let affiliateClicks = JSON.parse(localStorage.getItem('affiliateClicks')) || {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Affiliate marketing system initialized');
    updateCartDisplay();
    setupEventListeners();
    trackPageView();
});

function setupEventListeners() {
    // Cart toggle
    const cartLink = document.getElementById("cart-link");
    if (cartLink) {
        cartLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMiniCart();
        });
    }

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#mini-cart') && !e.target.closest('#cart-link')) {
            miniCart.style.display = 'none';
        }
    });

    // Product click handlers
    setupProductHandlers();
    
    // Category filter
    setupCategoryFilters();
    
    // Search functionality
    setupSearch();
    
    // Newsletter form
    setupNewsletter();
    
    // Display all products on load
    filterProductsByCategory('All');
}

function setupProductHandlers() {
    // Product click to open modal
    document.querySelectorAll(".product").forEach(product => {
        const img = product.querySelector("img");
        const title = product.querySelector("h3");
        
        if (img) {
            img.addEventListener("click", (e) => {
                openProductModal(product);
            });
        }
        
        if (title) {
            title.addEventListener("click", (e) => {
                openProductModal(product);
            });
        }
    });

    // Add to cart buttons (now "Compare Prices")
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const product = e.target.closest(".product");
            openProductModal(product);
        });
    });

    // Modal add to cart
    const modalAddCart = document.getElementById("modal-add-cart");
    if (modalAddCart) {
        modalAddCart.addEventListener("click", addToCartFromModal);
    }

    // Modal close
    const modal = document.getElementById("product-modal");
    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }
}

function setupCategoryFilters() {
    document.querySelectorAll(".category-card").forEach(cat => {
        cat.addEventListener("click", () => {
            const category = cat.dataset.category;
            filterProductsByCategory(category);
            
            // Visual feedback
            document.querySelectorAll(".category-card").forEach(c => {
                c.style.borderColor = 'transparent';
            });
            cat.style.borderColor = 'var(--secondary-color)';
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById("product-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const filter = e.target.value.toLowerCase();
            filterProductsBySearch(filter);
        });
    }
}

function setupNewsletter() {
    const form = document.getElementById("newsletter-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            // Let formspree handle it, but show confirmation
            setTimeout(() => {
                showNotification("✅ Thanks for subscribing! Check your email for exclusive deals.", "success");
            }, 500);
        });
    }
}

function openProductModal(product) {
    const modal = document.getElementById("product-modal");
    const modalImage = document.getElementById("modal-image");
    const modalName = document.getElementById("modal-name");
    const modalPrice = document.getElementById("modal-price");
    const modalSpecs = document.getElementById("modal-specs");

    if (!modal || !modalImage || !modalName || !modalPrice || !modalSpecs) {
        console.error('Modal elements not found');
        return;
    }

    const img = product.querySelector("img");
    const name = product.dataset.name;
    const price = product.dataset.price;
    const specs = product.dataset.specs;
    const affiliateLink = product.dataset.affiliate || '#';

    modalImage.src = img ? img.src : '';
    modalImage.alt = name;
    modalName.textContent = name || 'Product Name';
    modalPrice.textContent = price || 'R0';
    modalSpecs.textContent = specs || 'No specifications available';

    // Setup affiliate buttons
    setupAffiliateButtons(name, affiliateLink);

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    // Track modal view
    trackEvent('modal_view', name);
}

function setupAffiliateButtons(productName, baseLink) {
    const amazonBtn = document.getElementById("modal-amazon");
    const ebayBtn = document.getElementById("modal-ebay");
    const backmarketBtn = document.getElementById("modal-backmarket");
    
    // Generate search queries for each platform
    const searchQuery = encodeURIComponent(productName);
    
    if (amazonBtn) {
        amazonBtn.href = baseLink !== '#' ? baseLink : `https://www.amazon.com/s?k=${searchQuery}`;
        amazonBtn.addEventListener("click", (e) => {
            trackAffiliateClick('amazon', productName);
            showNotification("🛒 Opening Amazon... You'll earn 5% cashback!", "info");
        });
    }
    
    if (ebayBtn) {
        ebayBtn.href = `https://www.ebay.com/sch/i.html?_nkw=${searchQuery}`;
        ebayBtn.addEventListener("click", (e) => {
            trackAffiliateClick('ebay', productName);
            showNotification("🛒 Opening eBay... You'll earn 4% cashback!", "info");
        });
    }
    
    if (backmarketBtn) {
        backmarketBtn.href = `https://www.backmarket.com/en-us/search?q=${searchQuery}`;
        backmarketBtn.addEventListener("click", (e) => {
            trackAffiliateClick('backmarket', productName);
            showNotification("🛒 Opening Back Market... You'll earn 6% cashback!", "info");
        });
    }
}

function closeModal() {
    const modal = document.getElementById("product-modal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

function addToCartFromModal() {
    const modal = document.getElementById("product-modal");
    if (modal.style.display !== "flex") return;

    const name = document.getElementById("modal-name").textContent;
    const price = document.getElementById("modal-price").textContent;
    const imageSrc = document.getElementById("modal-image").src;

    addToCart(name, price, imageSrc);
}

function addToCart(name, price, image) {
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => 
        item.name === name && item.price === price
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
        showNotification(`➕ ${name} quantity updated in wishlist!`, "info");
    } else {
        cart.push({ 
            name, 
            price, 
            image, 
            quantity: 1,
            id: Date.now() + Math.random()
        });
        showNotification(`✅ ${name} added to wishlist!`, "success");
    }

    updateCartDisplay();
    saveCart();
    animateCartBadge();
    trackEvent('add_to_wishlist', name);
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        updateCartDisplay();
        saveCart();
        showNotification(`🗑️ ${itemName} removed from wishlist`, "warning");
        trackEvent('remove_from_wishlist', itemName);
    }
}

function updateQuantity(index, change) {
    if (index >= 0 && index < cart.length) {
        const newQuantity = cart[index].quantity + change;
        
        if (newQuantity < 1) {
            removeFromCart(index);
            return;
        }
        
        cart[index].quantity = newQuantity;
        updateCartDisplay();
        saveCart();
    }
}

function toggleMiniCart() {
    if (miniCart.style.display === "block") {
        miniCart.style.display = "none";
    } else {
        miniCart.style.display = "block";
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    if (!cartBadge || !cartItemsList) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    if (totalItems > 0) {
        cartBadge.style.display = 'inline-flex';
    } else {
        cartBadge.style.display = 'none';
    }

    cartItemsList.innerHTML = "";

    if (cart.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-cart-message";
        emptyMessage.textContent = "Your wishlist is empty";
        emptyMessage.style.cssText = "color:#999; font-style:italic; text-align:center; padding:20px;";
        cartItemsList.appendChild(emptyMessage);
        
        // Hide checkout button
        const checkoutContainer = document.querySelector('.checkout-button-container');
        if (checkoutContainer) checkoutContainer.style.display = 'none';
        return;
    }

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        `;

        const itemInfo = document.createElement("div");
        itemInfo.style.flex = "1";
        itemInfo.innerHTML = `
            <strong style="display:block; margin-bottom:4px; font-size:14px;">${item.name}</strong>
            <span style="color:#f39c12; font-weight:bold; font-size:13px;">${item.price}</span>
        `;

        const quantityControls = document.createElement("div");
        quantityControls.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 8px 0;
        `;

        const decreaseBtn = document.createElement("button");
        decreaseBtn.textContent = "−";
        decreaseBtn.style.cssText = `
            width: 25px;
            height: 25px;
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 3px;
            cursor: pointer;
            font-size: 14px;
        `;
        decreaseBtn.onclick = () => updateQuantity(index, -1);

        const quantityDisplay = document.createElement("span");
        quantityDisplay.textContent = item.quantity;
        quantityDisplay.style.cssText = `
            min-width: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
        `;

        const increaseBtn = document.createElement("button");
        increaseBtn.textContent = "+";
        increaseBtn.style.cssText = `
            width: 25px;
            height: 25px;
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 3px;
            cursor: pointer;
            font-size: 14px;
        `;
        increaseBtn.onclick = () => updateQuantity(index, 1);

        quantityControls.appendChild(decreaseBtn);
        quantityControls.appendChild(quantityDisplay);
        quantityControls.appendChild(increaseBtn);

        const itemActions = document.createElement("div");
        itemActions.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: flex-end;
        `;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "🗑️";
        removeBtn.style.cssText = `
            background: #e74c3c;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        removeBtn.onclick = () => removeFromCart(index);

        itemActions.appendChild(quantityControls);
        itemActions.appendChild(removeBtn);

        li.appendChild(itemInfo);
        li.appendChild(itemActions);
        cartItemsList.appendChild(li);
    });

    // Show checkout button
    const checkoutContainer = document.querySelector('.checkout-button-container');
    if (checkoutContainer) {
        checkoutContainer.style.display = 'block';
        
        const checkoutBtn = document.getElementById('proceed-to-checkout');
        if (checkoutBtn) {
            checkoutBtn.onclick = () => {
                showNotification("💰 Compare prices for your wishlist items to find the best deals!", "success");
                miniCart.style.display = 'none';
                trackEvent('view_wishlist', 'checkout_clicked');
            };
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function animateCartBadge() {
    if (cartBadge) {
        cartBadge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartBadge.style.transform = 'scale(1)';
        }, 300);
    }
}

function filterProductsByCategory(category) {
    const products = document.querySelectorAll(".product");
    
    products.forEach(product => {
        const productCategory = product.dataset.category;
        
        if (category === "All" || productCategory === category) {
            product.style.display = "flex";
        } else {
            product.style.display = "none";
        }
    });
    
    trackEvent('filter_category', category);
}

function filterProductsBySearch(filter) {
    const products = document.querySelectorAll(".product");
    
    products.forEach(product => {
        const name = product.dataset.name.toLowerCase();
        const specs = product.dataset.specs.toLowerCase();
        
        if (name.includes(filter) || specs.includes(filter)) {
            product.style.display = "flex";
        } else {
            product.style.display = "none";
        }
    });
    
    if (filter) {
        trackEvent('search', filter);
    }
}

function showNotification(message, type = "info") {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Color based on type
    if (type === "success") {
        notification.style.background = '#27ae60';
    } else if (type === "warning") {
        notification.style.background = '#e67e22';
    } else if (type === "info") {
        notification.style.background = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Analytics & Tracking Functions
function trackPageView() {
    const pageData = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer
    };
    
    console.log('Page view tracked:', pageData);
    
    // Send to analytics (replace with your analytics endpoint)
    // fetch('/api/track/pageview', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(pageData)
    // });
}

function trackEvent(eventName, eventData) {
    const event = {
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString()
    };
    
    console.log('Event tracked:', event);
    
    // Send to analytics
    // fetch('/api/track/event', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(event)
    // });
}

function trackAffiliateClick(platform, productName) {
    const clickData = {
        platform: platform,
        product: productName,
        timestamp: new Date().toISOString()
    };
    
    // Save to local storage for tracking
    if (!affiliateClicks[platform]) {
        affiliateClicks[platform] = [];
    }
    affiliateClicks[platform].push(clickData);
    localStorage.setItem('affiliateClicks', JSON.stringify(affiliateClicks));
    
    console.log('Affiliate click tracked:', clickData);
    
    // Send to your backend for commission tracking
    // fetch('/api/track/affiliate', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(clickData)
    // });
}

// Performance optimization
if ('loading' in HTMLImageElement.prototype) {
    // Browser supports lazy loading
    console.log('Native lazy loading supported');
} else {
    // Fallback for browsers that don't support lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
}

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

