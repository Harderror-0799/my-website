// Cart System
let cart = []; // Store cart items as objects
const cartBadge = document.getElementById("cart-count");
const miniCart = document.getElementById("mini-cart");
const cartItemsList = document.getElementById("cart-items-list");

// Toggle Mini Cart
document.getElementById("cart-link").addEventListener("click", (e) => {
  e.preventDefault();
  miniCart.style.display = miniCart.style.display === "block" ? "none" : "block";
});

// Update Cart Display
function updateCartDisplay() {
  cartBadge.innerText = cart.length;
  cartItemsList.innerHTML = "";
  
  if (cart.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "Your cart is empty";
    emptyMessage.style.color = "#999";
    emptyMessage.style.fontStyle = "italic";
    cartItemsList.appendChild(emptyMessage);
    return;
  }
  
  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.marginBottom = "8px";
    li.style.padding = "8px";
    li.style.background = "#f9f9f9";
    li.style.borderRadius = "5px";
    
    const itemInfo = document.createElement("div");
    itemInfo.innerHTML = `<strong>${item.name}</strong><br><span style="color:#f39c12;">${item.price}</span>`;
    
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.style.background = "#ff4444";
    removeBtn.style.color = "#fff";
    removeBtn.style.border = "none";
    removeBtn.style.borderRadius = "50%";
    removeBtn.style.width = "25px";
    removeBtn.style.height = "25px";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontSize = "18px";
    removeBtn.style.lineHeight = "1";
    removeBtn.onclick = () => removeFromCart(index);
    
    li.appendChild(itemInfo);
    li.appendChild(removeBtn);
    cartItemsList.appendChild(li);
  });
  
  // Add total price
  const totalLi = document.createElement("li");
  totalLi.style.marginTop = "10px";
  totalLi.style.paddingTop = "10px";
  totalLi.style.borderTop = "2px solid #ddd";
  totalLi.style.fontWeight = "bold";
  totalLi.innerHTML = `Total Items: ${cart.length}`;
  cartItemsList.appendChild(totalLi);
}

// Add to Cart
function addToCart(name, price, image) {
  cart.push({ name, price, image });
  updateCartDisplay();
  
  // Show confirmation
  const notification = document.createElement("div");
  notification.textContent = `${name} added to cart!`;
  notification.style.position = "fixed";
  notification.style.top = "80px";
  notification.style.right = "20px";
  notification.style.background = "#4CAF50";
  notification.style.color = "#fff";
  notification.style.padding = "15px 20px";
  notification.style.borderRadius = "8px";
  notification.style.zIndex = "9999";
  notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// Remove from Cart
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartDisplay();
}

// Product click to open modal
const modal = document.getElementById("product-modal");
const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const modalSpecs = document.getElementById("modal-specs");
const modalAddCart = document.getElementById("modal-add-cart");
const modalClose = document.querySelector(".close");

document.querySelectorAll(".product img, .product h3").forEach(el => {
  el.addEventListener("click", (e) => {
    const product = e.target.closest(".product");
    modalImage.src = product.querySelector("img").src;
    modalName.innerText = product.dataset.name;
    modalPrice.innerText = product.dataset.price;
    modalSpecs.innerText = product.dataset.specs;
    modal.style.display = "flex";
  });
});

// Close modal
modalClose.addEventListener("click", () => { modal.style.display = "none"; });
window.addEventListener("click", (e) => { if(e.target === modal) modal.style.display = "none"; });

// Add to cart from product button
document.querySelectorAll(".add-to-cart").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const product = e.target.closest(".product");
    const img = product.querySelector("img").src;
    addToCart(product.dataset.name, product.dataset.price, img);
  });
});

// Add to cart from modal
modalAddCart.addEventListener("click", () => {
  addToCart(modalName.innerText, modalPrice.innerText, modalImage.src);
  modal.style.display = "none";
});

// Category Filter
document.querySelectorAll(".category-card").forEach(cat => {
  cat.addEventListener("click", () => {
    const category = cat.dataset.category;
    document.querySelectorAll(".product").forEach(prod => {
      prod.style.display = (category === prod.dataset.category || category === "All") ? "block" : "none";
    });
  });
});

// Product Search Filter
const searchInput = document.getElementById("product-search");
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll(".product").forEach(product => {
    const name = product.dataset.name.toLowerCase();
    product.style.display = name.includes(filter) ? "block" : "none";
  });
});

// Initialize cart display
updateCartDisplay();
