const fetch = require('node-fetch');

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
ions/delete-product.js
