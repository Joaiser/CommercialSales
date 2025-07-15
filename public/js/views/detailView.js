export function renderDetail(root, comercial, pedidos, onBack) {
  const gananciasTotales = pedidos.reduce(
    (acc, p) => acc + (p.importe * (comercial.porcentaje_general / 100)),
    0
  );

  root.innerHTML = `
    <button id="btn-back" style="margin-bottom: 1rem;">← Volver</button>
    <div style="display: flex; gap: 2rem; align-items: flex-start;">
      <aside style="min-width: 200px; padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
        <h3>Comercial</h3>
        <p><strong>ID:</strong> ${comercial.id_customer}</p>
        <p><strong>Porcentaje:</strong> ${comercial.porcentaje_general}%</p>
        <p><strong>Ganancias totales:</strong> ${gananciasTotales.toFixed(2)}€</p>
      </aside>
      <section style="flex-grow: 1;">
        <h2>Pedidos del Comercial</h2>
        <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Pedido ID</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            ${pedidos
      .map(
        (p) => `
              <tr>
                <td>${p.id_pedido}</td>
                <td>${p.importe}€</td>
              </tr>
            `
      )
      .join('')}
          </tbody>
        </table>
      </section>
    </div>
  `;

  root.querySelector('#btn-back').addEventListener('click', onBack);
}
