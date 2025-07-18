export function renderProductosConPorcentaje(root, productos, onBack) {
  console.log('[renderProductosConPorcentaje] productos:', productos);

  root.innerHTML = `
    <button id="btn-back" style="margin-bottom: 1rem;">← Volver</button>
    <div>
      <h3>Productos con porcentaje especial</h3>
      ${productos.length === 0
      ? '<p>No hay productos especiales para este cliente.</p>'
      : `
          <table style="width:100%; border-collapse: collapse; text-align: center;" border="1" cellspacing="0" cellpadding="5">
            <thead>
              <tr>
                 <th style="text-align: center;">ID Producto</th>
                 <th style="text-align: center;">Porcentaje Especial</th>
              </tr>
            </thead>
            <tbody>
              ${productos.map(p => {
        console.log('[renderProductosConPorcentaje] producto:', p);
        return `
                  <tr>
                    <td>${p.id_product}</td>
                    <td>${p.porcentaje}%</td>
                  </tr>`;
      }).join('')}
            </tbody>
          </table>
        `}
    </div>
  `;

  root.querySelector('#btn-back').addEventListener('click', onBack);
}
