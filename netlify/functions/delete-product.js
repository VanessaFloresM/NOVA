const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.API_KEY;
  const API_SECRET = process.env.API_SECRET;

  try {
    const { productId } = JSON.parse(event.body);

    const response = await fetch(`${ERPNEXT_URL}/api/resource/Item/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
      }
    });

    return {
      statusCode: response.ok ? 200 : 400,
      headers,
      body: JSON.stringify({ success: response.ok })
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
