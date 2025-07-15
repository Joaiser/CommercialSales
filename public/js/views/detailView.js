export function renderDetail(root, comercial, pedidos, onBack) {
  // calcular ganancias, renderizar tabla pedidos o info relevante
  const gananciasTotales = pedidos.reduce((acc, p) => acc + (p.importe * (comercial.porcentaje_general / 100)), 0);

  root.innerHTML = `
    <button id="btn-back">Volver</button>
    <h2>Detalles Comercial ID: ${comercial.id_customer}</h2>
    <p>Porcentaje: ${comercial.porcentaje_general}%</p>
    <p>Ganancias totales: ${gananciasTotales.toFixed(2)}€</p>
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse: collapse;">
      <thead><tr><th>Pedido ID</th><th>Importe</th></tr></thead>
      <tbody>
        ${pedidos.map(p => `
          <tr>
            <td>${p.id_pedido}</td>
            <td>${p.importe}€</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  root.querySelector('#btn-back').addEventListener('click', onBack);
}



//AQUI SALE UNA TABLA, A LA IZQUIERDA NOMBRE DE CLIENTE Y PORCENTAJE