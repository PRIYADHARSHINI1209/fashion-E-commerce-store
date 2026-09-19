/**
 * ÉLÉGANCE - FASHION E-COMMERCE CORE JAVASCRIPT
 * Pure Vanilla JavaScript Implementation
 */

// Global State Management
const AppState = {
  cart: JSON.parse(localStorage.getItem('elegance_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('elegance_wishlist')) || [],

  // Save Cart to LocalStorage
  saveCart() {
    localStorage.setItem('elegance_cart', JSON.stringify(this.cart));
    this.updateBadges();
  },

  // Save Wishlist to LocalStorage
  saveWishlist() {
    localStorage.setItem('elegance_wishlist', JSON.stringify(this.wishlist));
    this.updateBadges();
  },

  // Update Cart & Wishlist Badge Counts
  updateBadges() {
    const cartBadges = document.querySelectorAll('.cart-badge-count');
    const wishlistBadges = document.querySelectorAll('.wishlist-badge-count');

    const totalCartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
    const wishlistCount = this.wishlist.length;

    cartBadges.forEach(badge => {
      badge.textContent = totalCartCount;
      badge.style.display = totalCartCount > 0 ? 'inline-flex' : 'none';
    });

    wishlistBadges.forEach(badge => {
      badge.textContent = wishlistCount;
      badge.style.display = wishlistCount > 0 ? 'inline-flex' : 'none';
    });
  },

  // Cart Operations
  addToCart(productId, quantity = 1, color = null, size = null) {
    const product = PRODUCTS_DATA.find(p => p.id === Number(productId));
    if (!product) return;

    const selectedColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Default');
    const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');

    const existingIndex = this.cart.findIndex(
      item => item.id === product.id && item.color === selectedColor && item.size === selectedSize
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        color: selectedColor,
        size: selectedSize,
        quantity: quantity
      });
    }

    this.saveCart();
    showToast(`Added "${product.name}" to your shopping bag!`);
  },

  removeFromCart(index) {
    if (index >= 0 && index < this.cart.length) {
      const removedItem = this.cart.splice(index, 1)[0];
      this.saveCart();
      showToast(`Removed "${removedItem.name}" from your shopping bag.`, 'info');
    }
  },

  updateCartQuantity(index, newQty) {
    if (index >= 0 && index < this.cart.length) {
      if (newQty <= 0) {
        this.removeFromCart(index);
      } else {
        this.cart[index].quantity = newQty;
        this.saveCart();
      }
    }
  },

  // Wishlist Operations
  toggleWishlist(productId) {
    const pId = Number(productId);
    const product = PRODUCTS_DATA.find(p => p.id === pId);
    if (!product) return false;

    const index = this.wishlist.findIndex(id => id === pId);
    let added = false;

    if (index > -1) {
      this.wishlist.splice(index, 1);
      showToast(`Removed "${product.name}" from your wishlist.`, 'info');
    } else {
      this.wishlist.push(pId);
      showToast(`Added "${product.name}" to your wishlist!`);
      added = true;
    }

    this.saveWishlist();
    this.updateWishlistButtonsUI();
    return added;
  },

  isInWishlist(productId) {
    return this.wishlist.includes(Number(productId));
  },

  updateWishlistButtonsUI() {
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const id = Number(btn.getAttribute('data-wishlist-id'));
      if (this.isInWishlist(id)) {
        btn.classList.add('active');
        btn.setAttribute('aria-label', 'Remove from wishlist');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-label', 'Add to wishlist');
      }
    });
  }
};

function getCategoryLabel(category) {
  const labels = {
    dresses: 'Dresses',
    outerwear: 'Outerwear',
    shirts: 'Shirts & Tops',
    knitwear: 'Knitwear',
    pants: 'Pants & Trousers',
    bags: 'Handbags',
    shoes: 'Shoes',
    accessories: 'Accessories'
  };
  return labels[category] || category;
}

// Reusable Dynamic Product Card Component
function createProductCardHTML(product) {
  const isWishlisted = AppState.isInWishlist(product.id);
  const badgeHTML = product.newArrival 
    ? `<span class="badge badge-pink card-badge">NEW</span>`
    : product.discount > 0 
      ? `<span class="badge badge-dark card-badge">-${product.discount}%</span>`
      : product.bestSeller 
        ? `<span class="badge badge-pink card-badge">BESTSELLER</span>` 
        : '';

  const starsHTML = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

  return `
    <article class="product-card">
      <div class="product-card-image-wrapper">
        <a href="product.html?id=${product.id}">
          <img src="${product.images[0]}" alt="${product.name}" class="product-card-img" loading="lazy">
        </a>
        ${badgeHTML}
        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${product.id}" aria-label="Toggle Wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" fill="${isWishlisted ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button class="quick-add-btn" data-add-cart-id="${product.id}">
          Add to Bag
        </button>
      </div>

      <div class="product-card-info">
        <span class="product-card-category">${getCategoryLabel(product.category).toUpperCase()}</span>
        <h3 class="product-card-title">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-card-rating">
          <span class="stars">${starsHTML}</span>
          <span class="rating-count">(${product.reviewCount})</span>
        </div>
        <div class="product-card-price">
          <span class="current-price">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

// Toast Notification System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span class="toast-text">${message}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Global UI Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Badge counts
  AppState.updateBadges();

  // Mobile Menu Drawer Handler
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileOverlay = document.getElementById('mobile-overlay');

  function openMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // Global delegate for Wishlist & Cart Buttons
  document.addEventListener('click', (e) => {
    const wishlistBtn = e.target.closest('[data-wishlist-id]');
    if (wishlistBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = wishlistBtn.getAttribute('data-wishlist-id');
      AppState.toggleWishlist(id);
    }

    const addToCartBtn = e.target.closest('[data-add-cart-id]');
    if (addToCartBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = addToCartBtn.getAttribute('data-add-cart-id');
      AppState.addToCart(id, 1);
    }
  });

  AppState.updateWishlistButtonsUI();
});
