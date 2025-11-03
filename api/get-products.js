module.exports = async (req, res) => {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Aquí tu lógica para conectar con ERPNext
    const mockProducts = [
      {
        name: "1",
        item_code: "PROD001", 
        item_name: "Producto Ejemplo",
        standard_rate: 100.00,
        stock_uom: "Nos",
        description: "Producto de prueba"
      }
    ];
    
    res.status(200).json({
      success: true,
      data: mockProducts
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
