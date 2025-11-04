exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }export default async function handler(req, res) {
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.API_KEY;
  const API_SECRET = process.env.API_SECRET;

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, ...productData } = req.body;

    const response = await fetch(`${ERPNEXT_URL}/api/resource/Item/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    res.status(response.ok ? 200 : 400).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.API_KEY;
  const API_SECRET = process.env.API_SECRET;

  try {
    const { productId, ...productData } = JSON.parse(event.body);

    const response = await fetch(`${ERPNEXT_URL}/api/resource/Item/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : 400,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
   netlify/functions/delete-product.js
