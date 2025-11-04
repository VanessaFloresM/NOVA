export default async function handler(req, res) {
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.API_KEY;
  const API_SECRET = process.env.API_SECRET;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `${ERPNEXT_URL}/api/resource/Item?fields=["name","item_code","item_name","standard_rate","stock_uom","description"]&limit_page_length=200`,
      {
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
