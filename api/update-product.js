export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.API_KEY;
  const API_SECRET = process.env.API_SECRET;

  try {
    const { productId, ...productData } = req.body;

    // Primero obtener el producto completo
    const getResponse = await fetch(`${ERPNEXT_URL}/api/resource/Item/${productId}`, {
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      return res.status(400).json({ error: 'No se pudo obtener el producto' });
    }

    const currentProduct = await getResponse.json();

    // Combinar datos actuales con los nuevos
    const updatedData = {
      ...currentProduct.data,
      ...productData
    };

    // Actualizar el producto
    const updateResponse = await fetch(`${ERPNEXT_URL}/api/resource/Item/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });

    const data = await updateResponse.json();

    if (updateResponse.ok) {
      return res.status(200).json(data);
    } else {
      console.error('Error de ERPNext:', data);
      return res.status(400).json({ 
        error: data.message || data.exception || 'Error al actualizar',
        details: data
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
