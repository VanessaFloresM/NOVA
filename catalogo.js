let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elementos DOM
const searchInput = document.getElementById('searchInput');
const productsContainer = document.getElementById('productsContainer');
const loading = document.getElementById('loading');
const productCount = document.getElementById('productCount');
const cartIcon = document.getElementById('cartIcon');
const cartBadge = document.getElementById('cartBadge');
const cartSidebar = document.getElementById('cartSidebar');
const btnCloseCart = document.getElementById('btnCloseCart');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const btnCheckout = document.getElementById('btnCheckout');

// Event Listeners
searchInput?.addEventListener('input', (e) => renderProducts(e.target.value));
cartIcon?.addEventListener('click', () => cartSidebar.classList.add('open'));
btnCloseCart?.addEventListener('click', () => cartSidebar.classList.remove('open'));
btnCheckout?.addEventListener('click', checkout);

// Cargar productos
async function loadProducts() {
    loading.style.display = 'block';
    productsContainer.innerHTML = '';
    
    try {
        const response = await fetch('/api/get-products');
        
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }
        
        const data = await response.json();
        products = data.data || [];
        renderProducts();
        updateCartUI();
    } catch (error) {
        console.error('Error:', error);
        productsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Error al cargar productos</h3>
                <p>Por favor, intenta de nuevo más tarde</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Renderizar productos
function renderProducts(search = '') {
    const filtered = products.filter(p => 
        p.item_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.item_code?.toLowerCase().includes(search.toLowerCase())
    );

    productCount.textContent = filtered.length;

    if (filtered.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No hay productos disponibles</h3>
                <p>${search ? 'No se encontraron resultados' : 'Próximamente nuevos productos'}</p>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = filtered.map(product => `
        <div class="product-card">
            ${product.image ? `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.item_name}" onerror="this.style.display='none'">
                </div>
            ` : `
                <div class="product-image-placeholder">
                    <span>📦</span>
                </div>
            `}
            <div class="product-code">${product.item_code || 'SIN CÓDIGO'}</div>
            <div class="product-name">${product.item_name || 'Sin nombre'}</div>
            <div class="product-price">$${parseFloat(product.standard_rate || 0).toFixed(2)}</div>
            <div class="product-uom">📦 ${product.stock_uom || 'N/A'}</div>
            ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
            <button class="btn-add-to-cart" onclick="addToCart('${product.name}')">
                🛒 Agregar al Carrito
            </button>
        </div>
    `).join('');
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.name === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.name,
            code: product.item_code,
            name: product.item_name,
            price: parseFloat(product.standard_rate || 0),
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    
    // Animación de feedback
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => cartIcon.style.transform = 'scale(1)', 300);
}

// Actualizar cantidad
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
    updateCartUI();
}

// Remover del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Actualizar UI del carrito
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega productos para comenzar</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<span>📦</span>'}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        <button class="qty-btn" onclick="removeFromCart('${item.id}')" style="margin-left: auto; color: #ef4444;">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
        cartFooter.style.display = 'block';
    }

    cartTotal.textContent = `$${totalAmount.toFixed(2)}`;
}

// Guardar carrito
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Proceder al checkout
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    // Redirigir a página de pago (lo crearemos en la Fase 4)
    window.location.href = 'checkout.html';
}

// Cargar productos al iniciar
loadProducts();
