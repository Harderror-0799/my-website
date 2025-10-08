// Enhanced Cart System
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Persist cart
const cartBadge = document.getElementById("cart-count");
const miniCart = document.getElementById("mini-cart");
const cartItemsList = document.getElementById("cart-items-list");

// Enhanced: Close cart when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#mini-cart') && !e.target.closest('#cart-link')) {
    miniCart.style.display = 'none';
  }
});

// Enhanced: Toggle Mini Cart with animation
document.getElementById("cart-link").addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  miniCart.style.display = miniCart.style.display === "block" ? "none" : "block";
});

// Enhanced: Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Enhanced: Calculate total price
function calculateTotal() {
  return cart.reduce((total, item) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    return total + (price * item.quantity);
  }, 0);
}

// Enhanced: Update Cart Display with quantities
function updateCartDisplay() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.innerText = totalItems;
  cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  
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
      margin-bottom: 8px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    `;
    
    const itemInfo = document.createElement("div");
    itemInfo.style.flex = "1";
    itemInfo.innerHTML = `
      <strong style="display:block; margin-bottom:4px;">${item.name}</strong>
      <span style="color:#f39c12; font-weight:bold;">${item.price}</span>
    `;
    
    // Enhanced: Quantity controls
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
      font-size: 16px;
    `;
    decreaseBtn.onclick = () => updateQuantity(index, -1);
    
    const quantityDisplay = document.createElement("span");
    quantityDisplay.textContent = item.quantity;
    quantityDisplay.style.cssText = `
      min-width: 20px;
      text-align: center;
      font-weight: bold;
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
      font-size: 16px;
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
      font-size: 18px;
      line-height: 1;
    `;
    removeBtn.onclick = () => removeFromCart(index);
    
    itemActions.appendChild(quantityControls);
    itemActions.appendChild(removeBtn);
    
    li.appendChild(itemInfo);
    li.appendChild(itemActions);
    cartItemsList.appendChild(li);
  });
  
  // Enhanced: Total display with price
  const totalLi = document.createElement("li");
  totalLi.style.cssText = `
    margin-top: 15px;
    padding-top: 15px;
    border-top: 2px solid #ddd;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  `;
  
  const totalPrice = calculateTotal();
  totalLi.innerHTML = `
    <span>Total (${cart.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
    <span style="color:#e74c3c;">$${totalPrice.toFixed(2)}</span>
  `;
  cartItemsList.appendChild(totalLi);
  
  // Enhanced: Checkout button
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
    font-size: 16px;
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

// Enhanced: Add to Cart with quantity and duplicate checking
function addToCart(name, price, image) {
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => 
    item.name === name && item.price === price
  );
  
  if (existingItemIndex > -1) {
    // Increase quantity if item exists
    cart[existingItemIndex].quantity += 1;
    showNotification(`${name} quantity updated!`, "info");
  } else {
    // Add new item with quantity
    cart.push({ 
      name, 
      price, 
      image, 
      quantity: 1,
      id: Date.now() // Unique identifier
    });
    showNotification(`${name} added to cart!`, "success");
  }
  
  updateCartDisplay();
  saveCart();
  animateCartBadge();
}

// Enhanced: Remove from Cart
function removeFromCart(index) {
  const itemName = cart[index].name;
  cart.splice(index, 1);
  updateCartDisplay();
  saveCart();
  showNotification(`${itemName} removed from cart`, "warning");
}

// New: Update item quantity
function updateQuantity(index, change) {
  const newQuantity = cart[index].quantity + change;
  
  if (newQuantity < 1) {
    removeFromCart(index);
    return;
  }
  
  cart[index].quantity = newQuantity;
  updateCartDisplay();
  saveCart();
}

// New: Enhanced notification system
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  const bgColor = type === "success" ? "#4CAF50" : 
                  type === "info" ? "#2196F3" : 
                  type === "warning" ? "#ff9800" : "#f44336";
  
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${bgColor};
    color: #fff;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 9999;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}

// New: Cart badge animation
function animateCartBadge() {
  cartBadge.style.transform = "scale(1.2)";
  setTimeout(() => {
    cartBadge.style.transform = "scale(1)";
  }, 300);
}

// New: Checkout function
function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!", "warning");
    return;
  }
  
  // For GitHub Pages, you'll need to integrate with a payment processor
  // Example: Redirect to Stripe Checkout or show checkout modal
  showNotification("Redirecting to checkout...", "info");
  
  // Here you would integrate with your payment processor
  // For now, just show an alert
  setTimeout(() => {
    const total = calculateTotal();
    alert(`Checkout initiated!\nTotal: $${total.toFixed(2)}\n\nThis would redirect to payment processing in a real implementation.`);
  }, 1000);
}

// Enhanced: Product modal with add to cart
modalAddCart.addEventListener("click", () => {
  addToCart(modalName.innerText, modalPrice.innerText, modalImage.src);
  modal.style.display = "none";
});

// Initialize cart display
updateCartDisplay();

// Enhanced: Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.style.display = 'none';
    miniCart.style.display = 'none';
  }
});

// New: Export cart data (useful for form submission)
function getCartData() {
  return {
    items: cart,
    total: calculateTotal(),
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
  };
}

// New: Clear cart function
function clearCart() {
  cart = [];
  updateCartDisplay();
  saveCart();
  showNotification("Cart cleared!", "info");
}
