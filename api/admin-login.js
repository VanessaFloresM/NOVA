export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Credenciales válidas (temporalmente)
  const validUsers = {
    'novaproyectone@gmail.com': 'Nova2025',
    'admin@nova.com': 'Nova2025'
  };

  // Verificar credenciales
  if (validUsers[username] && validUsers[username] === password) {
    return res.status(200).json({ 
      success: true, 
      user: username 
    });
  } else {
    return res.status(401).json({ 
      success: false, 
      error: 'Credenciales inválidas' 
    });
  }
}
