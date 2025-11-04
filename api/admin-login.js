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

  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const { username, password } = req.body;

  try {
    // Verificar credenciales con ERPNext
    const response = await fetch(`${ERPNEXT_URL}/api/method/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usr: username,
        pwd: password
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, user: username });
    } else {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
