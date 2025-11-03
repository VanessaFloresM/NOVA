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

// Verificar que los elementos existan antes de agregar event listeners
if (btnNuevo) btnNuevo.addEventListener('click', showForm);
if (btnCerrarForm) btnCerrarForm.addEventListener('click', hideForm);
if (btnCancelar) btnCancelar.addEventListener('click', hideForm);
if (btnGuardar) btnGuardar.addEventListener('click', saveProduct);
if (searchInput) searchInput.addEventListener('input', (e) => renderProducts(e.target.value));

async function loadProducts() {
    if (!loading || !productsContainer) return;
    
    loading.style.display = 'block';
    productsContainer.innerHTML = '';
    
    try {
        // Usar ruta absoluta para evitar problemas en producción
        const baseURL = window.location.origin;
        const response = await fetch(`${baseURL}/api/get-products`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        products = data.data || [];
        renderProducts();
    } catch (error) {
        console.error('Error cargando productos:', error);
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Error al cargar productos</h3>
                    <p>${error.message}</p>
                    <button onclick="loadProducts()" style="margin-top: 10px; padding: 5px 10px;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function renderProducts(search = '') {
    if (!productsContainer || !productCount) return;

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
            <div class="product-code">${escapeHtml(product.item_code || 'SIN CÓDIGO')}</div>
            <div class="product-name">${escapeHtml(product.item_name || 'Sin nombre')}</div>
            <div class="product-price">$${parseFloat(product.standard_rate || 0).toFixed(2)}</div>
            <div class="product-uom">📦 ${escapeHtml(product.stock_uom || 'N/A')}</div>
            ${product.description ? `<div class="product-description">${escapeHtml(product.description)}</div>` : ''}
            <div class="product-actions">
                <button class="action-btn btn-edit" onclick="editProduct('${escapeHtml(product.name)}')">
                    ✏️ Editar
                </button>
                <button class="action-btn btn-delete" onclick="deleteProduct('${escapeHtml(product.name)}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function showForm(product = null) {
    if (!formContainer || !formTitle) return;
    
    formContainer.classList.remove('hidden');
    
    if (product) {
        formTitle.textContent = 'Editar Producto';
        editingId = product.name;
        setFormValue('item_code', product.item_code || '');
        setFormValue('item_name', product.item_name || '');
        setFormValue('standard_rate', product.standard_rate || 0);
        setFormValue('stock_uom', product.stock_uom || 'Nos');
        setFormValue('description', product.description || '');
        
        const itemCodeField = document.getElementById('item_code');
        if (itemCodeField) itemCodeField.disabled = true;
    } else {
        formTitle.textContent = 'Nuevo Producto';
        editingId = null;
        clearForm();
        const itemCodeField = document.getElementById('item_code');
        if (itemCodeField) itemCodeField.disabled = false;
    }

    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function setFormValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.value = value;
}

function hideForm() {
    if (!formContainer) return;
    
    formContainer.classList.add('hidden');
    clearForm();
    editingId = null;
}

function clearForm() {
    setFormValue('item_code', '');
    setFormValue('item_name', '');
    setFormValue('standard_rate', 0);
    setFormValue('stock_uom', 'Nos');
    setFormValue('description', '');
}

async function saveProduct() {
    const itemCode = document.getElementById('item_code')?.value.trim();
    const itemName = document.getElementById('item_name')?.value.trim();

    if (!itemCode || !itemName) {
        alert('⚠️ El código y nombre del producto son obligatorios');
        return;
    }

    const productData = {
        item_code: itemCode,
        item_name: itemName,
        item_group: 'Products',
        stock_uom: document.getElementById('stock_uom')?.value || 'Nos',
        standard_rate: parseFloat(document.getElementById('standard_rate')?.value) || 0,
        description: document.getElementById('description')?.value
    };

    const btnGuardarTexto = document.getElementById('btnGuardarTexto');
    const originalText = btnGuardarTexto?.textContent;
    if (btnGuardar) btnGuardar.disabled = true;
    if (btnGuardarTexto) btnGuardarTexto.textContent = '⏳ Guardando...';

    try {
        const endpoint = editingId ? 'update-product' : 'create-product';
        const method = editingId ? 'PUT' : 'POST';
        const body = editingId ? { productId: editingId, ...productData } : productData;

        const baseURL = window.location.origin;
        const response = await fetch(`${baseURL}/api/${endpoint}`, {
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
        if (btnGuardar) btnGuardar.disabled = false;
        if (btnGuardarTexto) btnGuardarTexto.textContent = originalText;
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
        const baseURL = window.location.origin;
        const response = await fetch(`${baseURL}/api/delete-product`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });

        if (response.ok) {
            alert('✅ Producto eliminado correctamente');
            await loadProducts();
        } else {
            const errorData = await response.json();
            alert(`❌ Error al eliminar el producto: ${errorData.message || errorData.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar el producto');
    }
}

// Función auxiliar para prevenir XSS
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Hacer funciones disponibles globalmente
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadProducts = loadProducts;

// Cargar productos cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
} else {
    loadProducts();
}
