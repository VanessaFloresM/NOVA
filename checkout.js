// Cargar carrito
const cart = JSON.parse(localStorage.getItem('cart')) || [];

// Verificar que haya productos
if (cart.length === 0) {
    alert('Tu carrito está vacío');
    window.location.href = 'catalogo.html';
}

// Calcular totales
const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
const shipping = 100; // Envío fijo de $100
const total = subtotal + shipping;

// Mostrar resumen
document.getElementById('order-items').innerHTML = cart.map(item => `
    <div class="order-item">
        <div class="order-item-image">
            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<span>📦</span>'}
        </div>
        <div class="order-item-info">
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-quantity">Cantidad: ${item.quantity}</div>
        </div>
        <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
`).join('');

document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
document.getElementById('total').textContent = `$${total.toFixed(2)}`;

// Inicializar Stripe
const stripe = Stripe('pk_test_51SPv0bA7NMlUE8J0Vlfk8VYgjpAKbXimAmDXLqHF02uEsTMXv6eqhLJJpeihRCbpLRhpKxu77HFjFfnTsMBKrXYB00miz2xK8d');
const elements = stripe.elements();
const cardElement = elements.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#333',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
    },
});

cardElement.mount('#card-element');

// Manejar errores de la tarjeta
cardElement.on('change', (event) => {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

// Manejar envío del formulario
const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = document.getElementById('submit-button');
    const buttonText = document.getElementById('button-text');
    
    submitButton.disabled = true;
    buttonText.textContent = '⏳ Procesando...';

    // Crear el PaymentIntent
    try {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: Math.round(total * 100), // Stripe usa centavos
                currency: 'mxn',
                customerInfo: {
                    email: document.getElementById('email').value,
                    name: document.getElementById('name').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    postal_code: document.getElementById('postal_code').value,
                    phone: document.getElementById('phone').value
                },
                cart: cart
            })
        });

        const { clientSecret } = await response.json();

        // Confirmar el pago
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    address: {
                        line1: document.getElementById('address').value,
                        city: document.getElementById('city').value,
                        postal_code: document.getElementById('postal_code').value,
                        country: 'MX'
                    }
                }
            }
        });

        if (error) {
            // Mostrar error
            document.getElementById('card-errors').textContent = error.message;
            submitButton.disabled = false;
            buttonText.textContent = ' Pagar Ahora';
        } else if (paymentIntent.status === 'succeeded') {
            // Pago exitoso
            localStorage.removeItem('cart');
            window.location.href = 'success.html?payment_intent=' + paymentIntent.id;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar el pago');
        submitButton.disabled = false;
        buttonText.textContent = ' Pagar Ahora';
    }
});
