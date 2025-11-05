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

    productsContainer.innerHTML = filtered.map(product => {
        const stockQty = product.stock_qty || 0;
        const isOutOfStock = stockQty <= 0;
        const cartItem = cart.find(item => item.id === product.name);
        const qtyInCart = cartItem ? cartItem.quantity : 0;
        const availableQty = stockQty - qtyInCart;

        return `
            <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}">
                ${product.image ? `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.item_name}" onerror="this.style.display='none'">
                        ${isOutOfStock ? '<div class="out-of-stock-badge">Agotado</div>' : ''}
                    </div>
                ` : `
                    <div class="product-image-placeholder">
                        <span>📦</span>
                        ${isOutOfStock ? '<div class="out-of-stock-badge">Agotado</div>' : ''}
                    </div>
                `}
                <div class="product-code">${product.item_code || 'SIN CÓDIGO'}</div>
                <div class="product-name">${product.item_name || 'Sin nombre'}</div>
                <div class="product-price">$${parseFloat(product.standard_rate || 0).toFixed(2)}</div>
                <div class="product-stock ${isOutOfStock ? 'text-red' : availableQty <= 5 ? 'text-orange' : 'text-green'}">
                    📦 ${isOutOfStock ? 'Sin stock' : `${availableQty} disponibles`}
                </div>
                ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                ${isOutOfStock ? `
                    <button class="btn-add-to-cart" disabled style="opacity: 0.5; cursor: not-allowed;">
                        Agotado
                    </button>
                ` : availableQty <= 0 ? `
                    <button class="btn-add-to-cart" disabled style="opacity: 0.5; cursor: not-allowed;">
                        Máximo en carrito
                    </button>
                ` : `
                    <button class="btn-add-to-cart" onclick="addToCart('${product.name}')">
                        🛒 Agregar al Carrito
                    </button>
                `}
            </div>
        `;
    }).join('');
}

// Agregar al carrito con validación de stock
function addToCart(productId) {
    const product = products.find(p => p.name === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const availableStock = product.stock_qty || 0;

    // Verificar si hay stock disponible
    if (currentQtyInCart >= availableStock) {
        alert(` No hay más stock disponible. Solo tenemos ${availableStock} unidades.`);
        return;
    }
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.name,
            code: product.item_code,
            name: product.item_name,
            price: parseFloat(product.standard_rate || 0),
            image: product.image,
            quantity: 1,
            maxStock: availableStock
        });
    }

    saveCart();
    updateCartUI();
    renderProducts(searchInput.value); // Re-renderizar para actualizar disponibilidad
    
    // Animación de feedback
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => cartIcon.style.transform = 'scale(1)', 300);
}

// Actualizar cantidad con validación de stock
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const product = products.find(p => p.name === productId);
    const maxStock = product ? product.stock_qty : item.maxStock || 999;

    const newQuantity = item.quantity + change;

    // Validar límites
    if (newQuantity > maxStock) {
        alert(` Solo hay ${maxStock} unidades disponibles en stock.`);
        return;
    }

    if (newQuantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    } else {
        item.quantity = newQuantity;
    }

    saveCart();
    updateCartUI();
    renderProducts(searchInput.value);
}

// Remover del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    renderProducts(searchInput.value);
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
        cartItems.innerHTML = cart.map(item => {
            const product = products.find(p => p.name === item.id);
            const maxStock = product ? product.stock_qty : item.maxStock || 999;
            const isAtMax = item.quantity >= maxStock;

            return `
                <div class="cart-item">
                    <div class="cart-item-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<span>📦</span>'}
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-stock" style="font-size: 12px; color: #6b7280;">
                            Stock: ${maxStock} disponibles
                        </div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)" ${isAtMax ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>+</button>
                            <button class="qty-btn" onclick="removeFromCart('${item.id}')" style="margin-left: auto; color: #ef4444;">🗑️</button>
                        </div>
                        ${isAtMax ? '<div style="font-size: 11px; color: #ef4444; margin-top: 5px;">⚠️ Máximo disponible</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
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

    // Verificar stock antes de ir al checkout
    const stockIssues = [];
    
    cart.forEach(item => {
        const product = products.find(p => p.name === item.id);
        if (product) {
            const availableStock = product.stock_qty || 0;
            if (item.quantity > availableStock) {
                stockIssues.push(`${item.name}: solo hay ${availableStock} disponibles`);
            }
        }
    });

    if (stockIssues.length > 0) {
        alert('⚠️ Algunos productos exceden el stock disponible:\n\n' + stockIssues.join('\n'));
        return;
    }

    window.location.href = 'checkout.html';
}


loadProducts();
