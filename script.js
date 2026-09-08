document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  const currency = (value) => `₦${Number(value).toLocaleString()}`;

  const showToast = (message) => {
    let toast = document.querySelector('.toast');

    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  };

  const persistTheme = (darkMode) => {
    localStorage.setItem('tastybite-theme', darkMode ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    const isDark = body.classList.toggle('dark-mode');
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.textContent = isDark ? '☀️' : '🌙';
    }
    persistTheme(isDark);
  };

  const savedTheme = localStorage.getItem('tastybite-theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
  }

  const themeButton = document.querySelector('.theme-toggle');
  if (themeButton) {
    themeButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
    themeButton.addEventListener('click', toggleTheme);
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const navbar = document.querySelector('.navbar');
  if (menuToggle && navbar) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((link) => {
      const linkPage = link.getAttribute('href');
      const isCurrent = linkPage === currentPage;
      link.classList.toggle('active', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    menuToggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        navbar.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
      });
    });
  }

  const testimonialSlides = [...document.querySelectorAll('.testimonial-slide')];
  const prevButton = document.querySelector('.carousel-btn.prev');
  const nextButton = document.querySelector('.carousel-btn.next');
  let currentSlideIndex = 0;

  const showSlide = (index) => {
    if (!testimonialSlides.length) return;

    currentSlideIndex = (index + testimonialSlides.length) % testimonialSlides.length;

    testimonialSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === currentSlideIndex);
    });
  };

  if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => showSlide(currentSlideIndex - 1));
    nextButton.addEventListener('click', () => showSlide(currentSlideIndex + 1));
  }

  if (testimonialSlides.length) {
    setInterval(() => showSlide(currentSlideIndex + 1), 5000);
  }

  const cart = JSON.parse(localStorage.getItem('tastybite-cart') || '[]');

  const updateCartCount = () => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach((countEl) => {
      countEl.textContent = count;
    });
  };

  const saveCart = () => {
    localStorage.setItem('tastybite-cart', JSON.stringify(cart));
    updateCartCount();
  };

  const addToCart = (productName, price) => {
    const existing = cart.find((item) => item.name === productName);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name: productName, price: Number(price), quantity: 1 });
    }

    saveCart();
    showToast(`${productName} added to cart.`);
  };

  document.querySelectorAll('[data-order]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const productName = button.dataset.order || 'your order';
      const price = button.dataset.price || '0';

      if (button.tagName.toLowerCase() === 'a') {
        event.preventDefault();
      }

      addToCart(productName, price);
    });
  });

  const pills = document.querySelectorAll('.category-pills span');
  const menuItems = document.querySelectorAll('.menu-item');

  if (pills.length && menuItems.length) {
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const filter = pill.textContent.trim().toLowerCase();

        pills.forEach((item) => item.classList.remove('active'));
        pill.classList.add('active');

        menuItems.forEach((item) => {
          const category = (item.dataset.category || '').toLowerCase();
          const shouldShow = filter === 'all' || category === filter;
          item.style.display = shouldShow ? 'block' : 'none';
        });
      });
    });
  }

  const checkoutModal = document.getElementById('checkout-modal');
  const modalTotal = document.getElementById('modal-total');
  const modalSummary = document.getElementById('modal-summary');
  const confirmOrderButton = document.getElementById('confirm-order');
  const closeModalButton = document.querySelector('.modal-close');
  const editModalButton = document.querySelector('.modal-edit');

  const openModal = () => {
    if (!checkoutModal) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + 1500;

    if (modalTotal) {
      modalTotal.textContent = currency(total);
    }

    if (modalSummary) {
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      modalSummary.textContent = `${itemCount} delicious meal${itemCount === 1 ? '' : 's'} are ready for delivery.`;
    }

    checkoutModal.classList.remove('hidden');
    checkoutModal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    if (!checkoutModal) return;
    checkoutModal.classList.add('hidden');
    checkoutModal.setAttribute('aria-hidden', 'true');
  };

  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }

  if (editModalButton) {
    editModalButton.addEventListener('click', closeModal);
  }

  if (checkoutModal) {
    checkoutModal.addEventListener('click', (event) => {
      if (event.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });
  }

  const contactForm = document.querySelector('#checkout-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const nameField = document.getElementById('full-name');
      const name = nameField ? nameField.value.trim() : 'Guest';

      if (!cart.length) {
        showToast('Your cart is empty.');
        return;
      }

      showToast(`Order review for ${name}!`);
      openModal();
    });
  }

  if (confirmOrderButton) {
    confirmOrderButton.addEventListener('click', () => {
      const nameField = document.getElementById('full-name');
      const name = nameField ? nameField.value.trim() : 'Guest';
      showToast(`Order placed for ${name}!`);
      localStorage.removeItem('tastybite-cart');
      cart.length = 0;
      saveCart();
      closeModal();
      if (contactForm) {
        contactForm.reset();
      }
      renderCart();
      setTimeout(() => {
        window.location.href = 'success.html';
      }, 700);
    });
  }

  const cartItemsContainer = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  const deliveryFee = 1500;

  const renderCart = () => {
    if (!cartItemsContainer) return;

    if (!cart.length) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Add a few delicious meals to get started.</p>
          <a href="menu.html" class="btn">Browse Menu</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = currency(0);
      if (totalEl) totalEl.textContent = currency(deliveryFee);
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + deliveryFee;

    if (subtotalEl) subtotalEl.textContent = currency(subtotal);
    if (totalEl) totalEl.textContent = currency(total);

    cartItemsContainer.innerHTML = cart
      .map((item) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" alt="${item.name}">
            <div>
              <h3>${item.name}</h3>
              <p>${currency(item.price)}</p>
              <div class="qty-controls">
                <button type="button" class="qty-btn" data-action="decrease" data-name="${item.name}">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button type="button" class="qty-btn" data-action="increase" data-name="${item.name}">+</button>
              </div>
            </div>
          </div>
          <div class="cart-item-actions">
            <strong>${currency(item.price * item.quantity)}</strong>
            <button type="button" class="remove-item" data-name="${item.name}">Remove</button>
          </div>
        </div>
      `)
      .join('');

    document.querySelectorAll('.qty-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const name = button.dataset.name;
        const action = button.dataset.action;
        const product = cart.find((item) => item.name === name);

        if (!product) return;

        if (action === 'increase') {
          product.quantity += 1;
        } else if (action === 'decrease') {
          product.quantity -= 1;
          if (product.quantity <= 0) {
            const index = cart.findIndex((item) => item.name === name);
            cart.splice(index, 1);
          }
        }

        saveCart();
        renderCart();
      });
    });

    document.querySelectorAll('.remove-item').forEach((button) => {
      button.addEventListener('click', () => {
        const name = button.dataset.name;
        const index = cart.findIndex((item) => item.name === name);
        if (index >= 0) {
          cart.splice(index, 1);
          saveCart();
          renderCart();
        }
      });
    });
  };

  const contactFormMessage = document.querySelector('form');
  if (contactFormMessage && !contactFormMessage.id) {
    contactFormMessage.addEventListener('submit', (event) => {
      event.preventDefault();
      const nameField = document.getElementById('name');
      const name = nameField ? nameField.value.trim() : 'Guest';
      showToast(`Thanks ${name}! Your message has been sent.`);
      contactFormMessage.reset();
    });
  }

  if (body.classList.contains('subpage')) {
    const sectionTitle = document.querySelector('.page-hero h1');
    if (sectionTitle) {
      sectionTitle.setAttribute('data-fixed', 'true');
    }
  }

  updateCartCount();
  renderCart();
});

const style = document.createElement('style');
style.textContent = `
  .toast {
    position: fixed;
    right: 24px;
    bottom: 24px;
    background: #111827;
    color: #fff;
    padding: 12px 18px;
    border-radius: 999px;
    box-shadow: 0 12px 30px rgba(17, 24, 39, 0.25);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.25s ease;
    z-index: 9999;
    font-size: 14px;
    font-weight: 600;
  }

  .toast.show {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);
