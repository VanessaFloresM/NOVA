const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const btnLogin = document.getElementById('btnLogin');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    btnLogin.disabled = true;
    btnLogin.textContent = 'Verificando...';
    errorMessage.style.display = 'none';
    
    try {
        const response = await fetch('/api/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Guardar sesión
            sessionStorage.setItem('adminAuth', 'true');
            sessionStorage.setItem('adminUser', username);
            
            // Redirigir a panel admin
            window.location.href = 'coleccion.html';
        } else {
            errorMessage.textContent = '❌ Usuario o contraseña incorrectos';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = '❌ Error de conexión. Intenta de nuevo.';
        errorMessage.style.display = 'block';
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Iniciar Sesión';
    }
});
