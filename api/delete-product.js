export default async function handler(req, res) {
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.API_KEY;
  const API_SECRET = process.env.API_SECRET;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.body;

    const response = await fetch(`${ERPNEXT_URL}/api/resource/Item/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
      }
    });

    res.status(response.ok ? 200 : 400).json({ success: response.ok });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
