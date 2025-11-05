export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ERPNEXT_URL = process.env.ERPNEXT_URL;
  const API_KEY = process.env.API_KEY;
  const API_SECRET = process.env.API_SECRET;

  if (!ERPNEXT_URL || !API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  try {
    // Obtener productos con información de stock
    const response = await fetch(
      `${ERPNEXT_URL}/api/resource/Item?fields=["name","item_code","item_name","standard_rate","stock_uom","description","image"]&limit_page_length=200`,
      {
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    const items = data.data || [];

    // Obtener stock para cada producto
    const itemsWithStock = await Promise.all(
      items.map(async (item) => {
        try {
          // Obtener cantidad disponible en inventario
          const stockResponse = await fetch(
            `${ERPNEXT_URL}/api/resource/Bin?fields=["actual_qty"]&filters=[["item_code","=","${item.item_code}"]]`,
            {
              headers: {
                'Authorization': `token ${API_KEY}:${API_SECRET}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const stockData = await stockResponse.json();
          
          // Sumar todas las cantidades de diferentes almacenes
          const totalStock = stockData.data?.reduce((sum, bin) => {
            return sum + (parseFloat(bin.actual_qty) || 0);
          }, 0) || 0;

          return {
            ...item,
            stock_qty: Math.floor(totalStock) // Cantidad entera disponible
          };
        } catch (error) {
          console.error(`Error obteniendo stock para ${item.item_code}:`, error);
          return {
            ...item,
            stock_qty: 0
          };
        }
      })
    );

    return res.status(200).json({ data: itemsWithStock });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
