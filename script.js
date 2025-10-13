// Enhanced Cart System with Mobile Support
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartBadge = document.getElementById("cart-count");
const miniCart = document.getElementById("mini-cart");
const cartItemsList = document.getElementById("cart-items-list");

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - initializing cart system');
    updateCartDisplay();
    setupEventListeners();
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
    
    // FIX: Ensure all products are displayed on load
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

    // Add to cart buttons
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const product = e.target.closest(".product");
            addToCartFromProduct(product);
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

    modalImage.src = img ? img.src : '';
    modalImage.alt = name;
    modalName.textContent = name || 'Product Name';
    modalPrice.textContent = price || 'R0';
    modalSpecs.textContent = specs || 'No specifications available';

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById("product-modal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

function addToCartFromProduct(product) {
    const name = product.dataset.name;
    const price = product.dataset.price;
    const img = product.querySelector("img");
    const imageSrc = img ? img.src : '';

    if (!name || !price) {
        console.error('Product data missing:', product);
        return;
    }

    addToCart(name, price, imageSrc);
}

function addToCartFromModal() {
    const modal = document.getElementById("product-modal");
    if (modal.style.display !== "flex") return;

    const name = document.getElementById("modal-name").textContent;
    const price = document.getElementById("modal-price").textContent;
    const imageSrc = document.getElementById("modal-image").src;

    addToCart(name, price, imageSrc);
    closeModal();
}

function addToCart(name, price, image) {
    // Check if item already exists
    const existingItemIndex = cart.findIndex(item => 
        item.name === name && item.price === price
    );

    if (existingItemIndex > -1) {
        // Increase quantity
        cart[existingItemIndex].quantity += 1;
        showNotification(`➕ ${name} quantity updated!`, "info");
    } else {
        // Add new item
        cart.push({ 
            name, 
            price, 
            image, 
            quantity: 1,
            id: Date.now() + Math.random()
        });
        showNotification(`✅ ${name} added to cart!`, "success");
    }

    updateCartDisplay();
    saveCart();
    animateCartBadge();
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        updateCartDisplay();
        saveCart();
        showNotification(`🗑️ ${itemName} removed from cart`, "warning");
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
        // Ensure cart is updated when opened
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    if (!cartBadge || !cartItemsList) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    // Show/hide badge based on items
    if (totalItems > 0) {
        cartBadge.style.display = 'inline-flex';
    } else {
        cartBadge.style.display = 'none';
    }

    cartItemsList.innerHTML = "";

    if (cart.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-cart-message";
        emptyMessage.textContent = "Your cart is empty";
        emptyMessage.style.cssText = "color:#999; font-style:italic; text-align:center; padding:20px;";
        cartItemsList.appendChild(emptyMessage);
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

        // Quantity controls
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
            align-items: flex-end;
            gap: 8px;
        `;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "×";
        removeBtn.title = "Remove item";
        removeBtn.style.cssText = `
            background: #ff4444;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
        `;
        removeBtn.onclick = () => removeFromCart(index);

        itemActions.appendChild(quantityControls);
        itemActions.appendChild(removeBtn);

        li.appendChild(itemInfo);
        li.appendChild(itemActions);
        cartItemsList.appendChild(li);
    });

    // Add total and checkout button
    const totalPrice = calculateTotal();
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const totalLi = document.createElement("li");
    totalLi.style.cssText = `
        margin-top: 15px;
        padding-top: 15px;
        border-top: 2px solid #ddd;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
    `;
    totalLi.innerHTML = `
        <span>Total (${totalItemsCount} items):</span>
        <span style="color:#e74c3c;">R${totalPrice.toFixed(2)}</span>
    `;
    cartItemsList.appendChild(totalLi);

    const checkoutLi = document.createElement("li");
    checkoutLi.style.marginTop = "10px";

    const checkoutBtn = document.createElement("button");
    checkoutBtn.textContent = "Proceed to Checkout";
    checkoutBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.3s;
    `;
    checkoutBtn.onmouseover = () => checkoutBtn.style.background = "#219a52";
    checkoutBtn.onmouseout = () => checkoutBtn.style.background = "#27ae60";
    checkoutBtn.onclick = proceedToCheckout;

    checkoutLi.appendChild(checkoutBtn);
    cartItemsList.appendChild(checkoutLi);
}

function calculateTotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
        return total + (price * item.quantity);
    }, 0);
}

function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart to localStorage:', e);
    }
}

function filterProductsByCategory(category) {
    // Replaced with logic to always show all products for now
    document.querySelectorAll(".product").forEach(product => {
        product.style.display = "block";
    });
}

function filterProductsBySearch(filter) {
    document.querySelectorAll(".product").forEach(product => {
        const name = product.dataset.name.toLowerCase();
        const display = name.includes(filter) ? "block" : "none";
        product.style.display = display;
    });
}

function showNotification(message, type = "success") {
    // Remove existing notifications
    document.querySelectorAll('.cart-notification').forEach(notif => notif.remove());

    const notification = document.createElement("div");
    notification.className = "cart-notification";
    const bgColor = type === "success" ? "#4CAF50" : 
                    type === "info" ? "#2196F3" : 
                    type === "warning" ? "#ff9800" : "#f44336";

    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: #fff;
        padding: 12px 18px;
        border-radius: 6px;
        z-index: 9999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        font-size: 14px;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 2000);
}

function animateCartBadge() {
    if (cartBadge) {
        cartBadge.style.transform = "scale(1.3)";
        setTimeout(() => {
            cartBadge.style.transform = "scale(1)";
        }, 300);
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification("Your cart is empty!", "warning");
        return;
    }

    const total = calculateTotal();
    showNotification(`Redirecting to checkout... Total: R${total.toFixed(2)}`, "info");
    
    // In a real implementation, this would redirect to your payment processor
    setTimeout(() => {
        alert(`Checkout Feature\n\nTotal: R${total.toFixed(2)}\nItems: ${cart.reduce((sum, item) => sum + item.quantity, 0)}\n\nThis would redirect to payment processing in a live store.`);
    }, 1000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        miniCart.style.display = 'none';
    }
});

// Export cart data for forms
function getCartData() {
    return {
        items: cart,
        total: calculateTotal(),
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
}

// Clear cart function
function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCart();
    showNotification("Cart cleared!", "info");
}

console.log('Cart system initialized successfully');
