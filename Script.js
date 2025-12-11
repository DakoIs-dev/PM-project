class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartUI();
        this.attachEventListeners();
    }

    loadCart() {
        const savedCart = localStorage.getItem('shoppingCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
        this.updateCartUI();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showNotification('Товар добавлен в корзину');
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(id);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (this.parsePrice(item.price) * item.quantity);
        }, 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    parsePrice(priceString) {
        return parseInt(priceString.replace(/\D/g, ''));
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + '₸';
    }

    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }

        this.renderCartItems();
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutButton = document.getElementById('checkout-btn');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '';
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (checkoutButton) checkoutButton.style.display = 'none';
            if (cartTotal) cartTotal.textContent = '0₸';
            return;
        }

        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (checkoutButton) checkoutButton.style.display = 'block';

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${this.formatPrice(this.parsePrice(item.price))}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="remove-btn" onclick="cart.removeItem('${item.id}')">Удалить</button>
                    </div>
                </div>
            </div>
        `).join('');

        if (cartTotal) {
            cartTotal.textContent = this.formatPrice(this.getTotal());
        }
    }

    attachEventListeners() {
        const cartButton = document.querySelector('.cart-btn');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartClose = document.getElementById('cart-close');
        const cartOverlay = document.getElementById('cart-overlay');

        if (cartButton) {
            cartButton.addEventListener('click', () => {
                if (cartSidebar) cartSidebar.classList.add('active');
                if (cartOverlay) cartOverlay.classList.add('active');
            });
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => {
                this.closeCart();
            });
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.closeCart();
            });
        }

        const checkoutButton = document.getElementById('checkout-btn');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                if (this.items.length > 0) {
                    window.location.href = 'checkout.html';
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const product = this.extractProductData(productCard);
                    this.addItem(product);
                }
            }
        });
    }

    extractProductData(productCard) {
        const nameElement = productCard.querySelector('.product-name');
        const priceElement = productCard.querySelector('.product-price');
        const imageElement = productCard.querySelector('.product-image img');
        
        const name = nameElement ? nameElement.textContent.replace('NEW!', '').trim() : 'Товар';
        const price = priceElement ? priceElement.textContent.trim() : '0₸';
        const image = imageElement ? imageElement.src : '';
        const id = `${name}-${price}`.replace(/\s+/g, '-').toLowerCase();

        return { id, name, price, image };
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }
}

let cart;
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    initMobileMenu();
});

function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    document.body.appendChild(overlay);

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        overlay.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

function applyPromoCode() {
    const promoInput = document.getElementById('promo-code-input');
    const promoMessage = document.getElementById('promo-message');
    
    if (!promoInput || !promoMessage) return;

    const code = promoInput.value.trim().toUpperCase();
    const validCodes = {
        'AMIR67': 0.3,
        'WELCOME10': 0.1,
        'SALE20': 0.2
    };

    if (validCodes[code]) {
        const discount = validCodes[code];
        localStorage.setItem('promoCode', code);
        localStorage.setItem('promoDiscount', discount.toString());
        promoMessage.textContent = `Промокод применен! Скидка ${(discount * 100).toFixed(0)}%`;
        promoMessage.className = 'promo-message success';
        if (window.location.pathname.includes('checkout.html')) {
            updateCheckoutTotal();
        }
    } else {
        promoMessage.textContent = 'Неверный промокод';
        promoMessage.className = 'promo-message error';
    }
}

function updateCheckoutTotal() {
    if (!cart) return;
    
    const subtotalElement = document.getElementById('checkout-subtotal');
    const discountElement = document.getElementById('checkout-discount');
    const totalElement = document.getElementById('checkout-total');
    
    if (!subtotalElement || !totalElement) return;

    const subtotal = cart.getTotal();
    const promoDiscount = parseFloat(localStorage.getItem('promoDiscount') || '0');
    const discount = subtotal * promoDiscount;
    const total = subtotal - discount;

    subtotalElement.textContent = cart.formatPrice(subtotal);
    if (discountElement) {
        discountElement.textContent = `-${cart.formatPrice(discount)}`;
        discountElement.parentElement.style.display = discount > 0 ? 'flex' : 'none';
    }
    totalElement.textContent = cart.formatPrice(total);
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    if (!cart || cart.items.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    const formData = new FormData(e.target);
    const subtotal = cart.getTotal();
    const promoDiscount = parseFloat(localStorage.getItem('promoDiscount') || '0');
    const discount = subtotal * promoDiscount;
    const total = subtotal - discount;

    const orderData = {
        customer: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        items: cart.items,
        subtotal: subtotal,
        discount: discount,
        total: total,
        promoCode: localStorage.getItem('promoCode') || null,
        paymentMethod: formData.get('payment'),
        comments: formData.get('comments') || '',
        date: new Date().toISOString()
    };

    if (typeof auth !== 'undefined' && auth && auth.isAuthenticated()) {
        auth.addOrder(orderData);
    }

    console.log('Заказ оформлен:', orderData);
    
    cart.clearCart();
    localStorage.removeItem('promoCode');
    localStorage.removeItem('promoDiscount');
    
    window.location.href = 'order-success.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
        updateCheckoutTotal();
        
        if (cart && cart.items.length > 0) {
            const checkoutItemsContainer = document.getElementById('checkout-items');
            if (checkoutItemsContainer) {
                checkoutItemsContainer.innerHTML = cart.items.map(item => `
                    <div class="checkout-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="checkout-item-info">
                            <h4>${item.name}</h4>
                            <div class="checkout-item-meta">
                                <span>${item.quantity} шт.</span>
                                <span>×</span>
                                <span>${cart.formatPrice(cart.parsePrice(item.price))}</span>
                            </div>
                        </div>
                        <div class="checkout-item-total">
                            ${cart.formatPrice(cart.parsePrice(item.price) * item.quantity)}
                        </div>
                    </div>
                `).join('');
            }
        } else if (window.location.pathname.includes('checkout.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    const promoInput = document.getElementById('promo-code-input');
    if (promoInput) {
        promoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromoCode();
            }
        });
    }
});

