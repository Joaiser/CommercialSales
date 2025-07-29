export function renderProductosConPorcentaje(root, productos, onBack) {
  console.log('[renderProductosConPorcentaje] productos:', productos);

  const tablaProductos = productos.length === 0
    ? '<p class="text-muted">No hay productos especiales para este cliente.</p>'
    : `
      <h4 class="mt-4">Productos con Porcentaje Especial</h4>
      <table class="table table-bordered table-hover table-striped text-center mt-2 align-middle">
        <thead class="table-light">
          <tr>
            <th scope="col">ID Producto</th>
            <th scope="col">Porcentaje Especial</th>
          </tr>
        </thead>
        <tbody>
          ${productos.map(p => `
            <tr>
              <td>${p.id_product}</td>
              <td>${p.porcentaje}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  root.innerHTML = `
    <!-- Botón volver -->
    <div class="mb-3">
      <button id="btn-back" class="btn btn-secondary">← Volver</button>
    </div>

    <!-- Contenedor con estilo uniforme -->
    <div class="p-3 border rounded" style="background-color: #f8f9fa;">
      <h3 class="mb-3">Detalle del Cliente</h3>
      ${tablaProductos}
    </div>
  `;

  root.querySelector('#btn-back')?.addEventListener('click', onBack);
}
