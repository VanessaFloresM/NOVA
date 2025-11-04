let products = [];
let editingId = null;

const btnNuevo = document.getElementById('btnNuevo');
const btnCerrarForm = document.getElementById('btnCerrarForm');
const btnCancelar = document.getElementById('btnCancelar');
const btnGuardar = document.getElementById('btnGuardar');
const formContainer = document.getElementById('formContainer');
const formTitle = document.getElementById('formTitle');
const searchInput = document.getElementById('searchInput');
const productsContainer = document.getElementById('productsContainer');
const loading = document.getElementById('loading');
const productCount = document.getElementById('productCount');


const btnLogout = document.getElementById('btnLogout');
const adminUsername = document.getElementById('adminUsername');

// Mostrar usuario actual
if (sessionStorage.getItem('adminUser')) {
    adminUsername.textContent = ` ${sessionStorage.getItem('adminUser')}`;
}

// Función de cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}

// Event Listeners 
btnNuevo?.addEventListener('click', showForm);
btnCerrarForm?.addEventListener('click', hideForm);
btnCancelar?.addEventListener('click', hideForm);
btnGuardar?.addEventListener('click', saveProduct);
searchInput?.addEventListener('input', (e) => renderProducts(e.target.value));
btnLogout?.addEventListener('click', logout);

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
                <p>${search ? 'No se encontraron resultados' : 'Comienza agregando tu primer producto'}</p>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-code">${product.item_code || 'SIN CÓDIGO'}</div>
            <div class="product-name">${product.item_name || 'Sin nombre'}</div>
            <div class="product-price">$${parseFloat(product.standard_rate || 0).toFixed(2)}</div>
            <div class="product-uom">📦 ${product.stock_uom || 'N/A'}</div>
            ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
        </div>
    `).join('');
}

function showForm(product = null) {
    formContainer.classList.remove('hidden');
    
    if (product) {
        formTitle.textContent = 'Editar Producto';
        editingId = product.name;
        document.getElementById('item_code').value = product.item_code || '';
        document.getElementById('item_code').disabled = true;
        document.getElementById('item_name').value = product.item_name || '';
        document.getElementById('standard_rate').value = product.standard_rate || 0;
        document.getElementById('stock_uom').value = product.stock_uom || 'Nos';
        document.getElementById('description').value = product.description || '';
    } else {
        formTitle.textContent = 'Nuevo Producto';
        editingId = null;
        clearForm();
        document.getElementById('item_code').disabled = false;
    }

    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
    formContainer.classList.add('hidden');
    clearForm();
    editingId = null;
}

function clearForm() {
    document.getElementById('item_code').value = '';
    document.getElementById('item_name').value = '';
    document.getElementById('standard_rate').value = 0;
    document.getElementById('stock_uom').value = 'Nos';
    document.getElementById('description').value = '';
}

async function saveProduct() {
    const itemCode = document.getElementById('item_code').value.trim();
    const itemName = document.getElementById('item_name').value.trim();

    if (!itemCode || !itemName) {
        alert('⚠️ El código y nombre del producto son obligatorios');
        return;
    }

    const productData = {
        item_code: itemCode,
        item_name: itemName,
        item_group: 'Products',
        stock_uom: document.getElementById('stock_uom').value || 'Nos',
        standard_rate: parseFloat(document.getElementById('standard_rate').value) || 0,
        description: document.getElementById('description').value
    };

    const btnGuardarTexto = document.getElementById('btnGuardarTexto');
    const originalText = btnGuardarTexto.textContent;
    btnGuardar.disabled = true;
    btnGuardarTexto.textContent = '⏳ Guardando...';

    try {
        const endpoint = editingId ? 'update-product' : 'create-product';
        const method = editingId ? 'PUT' : 'POST';
        const body = editingId ? { productId: editingId, ...productData } : productData;

        const response = await fetch(`/api/${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ Producto ${editingId ? 'actualizado' : 'creado'} correctamente`);
            hideForm();
            await loadProducts();
        } else {
            alert(`❌ Error: ${data.message || data.error || 'No se pudo guardar el producto'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar el producto. Verifica tu conexión.');
    } finally {
        btnGuardar.disabled = false;
        btnGuardarTexto.textContent = originalText;
    }
}

function editProduct(productId) {
    const product = products.find(p => p.name === productId);
    if (product) {
        showForm(product);
    }
}

async function deleteProduct(productId) {
    const product = products.find(p => p.name === productId);
    
    if (!confirm(`¿Estás seguro de eliminar "${product?.item_name}"?`)) {
        return;
    }

    try {
        const response = await fetch('/api/delete-product', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });

        if (response.ok) {
            alert('✅ Producto eliminado correctamente');
            await loadProducts();
        } else {
            alert('❌ Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar el producto');
    }
}

loadProducts();
