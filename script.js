// Cart System
let cartCount = 0;
const cartBadge = document.getElementById("cart-count");
const miniCart = document.getElementById("mini-cart");
const cartItemsList = document.getElementById("cart-items-list");

// Toggle Mini Cart
document.getElementById("cart-link").addEventListener("click", (e) => {
  e.preventDefault();
  miniCart.style.display = miniCart.style.display === "block" ? "none" : "block";
});

// Add to Cart
function addToCart(name, price) {
  cartCount++;
  cartBadge.innerText = cartCount;

  const li = document.createElement("li");
  li.textContent = `${name} - ${price}`;
  cartItemsList.appendChild(li);
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
    const product = e.target.closest(".product");
    addToCart(product.dataset.name, product.dataset.price);
  });
});

// Add to cart from modal
modalAddCart.addEventListener("click", () => {
  addToCart(modalName.innerText, modalPrice.innerText);
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
