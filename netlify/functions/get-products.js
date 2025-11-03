export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Datos de ejemplo temporalmente
  const mockData = {
    data: [
      {
        name: "1",
        item_code: "PROD001",
        item_name: "Producto de Ejemplo",
        standard_rate: 100.00,
        stock_uom: "Nos",
        description: "Producto de prueba para desarrollo"
      }
    ]
  };

  return res.status(200).json(mockData);
}
