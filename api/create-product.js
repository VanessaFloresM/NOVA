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
  const API_KEY = process.env.API_KEY;
  const API_SECRET = process.env.API_SECRET;

  try {
    const productData = req.body;

    const response = await fetch(`${ERPNEXT_URL}/api/resource/Item`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
