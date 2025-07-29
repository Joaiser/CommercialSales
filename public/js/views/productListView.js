import { showEditPorcentajeModal } from "./modalEditPorcentajeProductos.js";
import { deleteProductoEspecial } from '../api/api.js';

export function renderProductosConPorcentaje(root, productos, onBack, clienteId, onModify) {
  console.log('[renderProductosConPorcentaje] productos:', productos);
  console.log('[renderProductosConPorcentaje] clienteId:', clienteId);

  const tablaProductos = productos.length === 0
    ? `<p style="
          color: #6c757d;
          font-style: italic;
          margin-top: 1rem;
        ">No hay productos especiales para este cliente.</p>`
    : `<h4 style="
          margin-top: 1.5rem;
          font-weight: 600;
          color: #212529;
        ">
          Productos con Porcentaje Especial de cliente ID: ${clienteId}
      </h4>
      <table style="
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5rem;
          text-align: center;
          font-family: Arial, sans-serif;
          background-color: white;
      ">
        <!-- Cambiar <thead> para añadir las nuevas columnas -->
          <thead style="
            background-color: #f8f9fa;
            color: #495057;
            font-weight: 700;
            border-bottom: 2px solid #dee2e6;
          ">
            <tr>
              <th scope="col" style="padding: 0.75rem; border: 1px solid #dee2e6;">ID Producto</th>
              <th scope="col" style="padding: 0.75rem; border: 1px solid #dee2e6;">ID Atributo</th> <!-- Nueva -->
              <th scope="col" style="padding: 0.75rem; border: 1px solid #dee2e6;">Porcentaje Especial</th>
              <th scope="col" style="padding: 0.75rem; border: 1px solid #dee2e6;">Acción</th>
            </tr>
          </thead>
     <tbody>
  ${productos.map(p => `
    <tr style="border-bottom: 1px solid #dee2e6;">
      <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.id_product}</td>
      <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.id_product_attribute}</td>
      <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.porcentaje}%</td>
      <td style="padding: 0.75rem; border: 1px solid #dee2e6;">
        <button 
          class="btn-modificar" 
          data-id="${p.id_product}" 
          style="padding: 0.3rem 0.6rem; background-color: #0d6efd; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem;"
        >
          Modificar
        </button>

        <button 
          class="btn-eliminar-producto" 
          data-id-product="${p.id_product}" 
          data-id-attr="${p.id_product_attribute}" 
          style="padding: 0.3rem 0.6rem; background-color: #dc3545; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; margin-left: 0.5rem;"
        >
          Eliminar
        </button>
      </td>
    </tr>
  `).join('')}
</tbody>


      </table>
    `;

  root.innerHTML = `
    <!-- Botón volver -->
    <div style="margin-bottom: 1rem;">
      <button id="btn-back" style="
        background-color: #6c757d;
        border: none;
        color: white;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
      "
      onmouseover="this.style.backgroundColor='#5a6268'"
      onmouseout="this.style.backgroundColor='#6c757d'">
        ← Volver
      </button>
    </div>

    <!-- Contenedor con estilo uniforme -->
    <div style="
      padding: 1rem;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      background-color: #f8f9fa;
      font-family: Arial, sans-serif;
      color: #212529;
    ">
      <h3 style="margin-bottom: 1rem;">Detalle del Cliente</h3>
      ${tablaProductos}
    </div>
  `;

  // Botón volver
  root.querySelector('#btn-back')?.addEventListener('click', onBack);

  // Botones Modificar
  root.querySelectorAll('.btn-modificar').forEach(btn => {
    btn.addEventListener('click', () => {
      const idProducto = Number(btn.dataset.id);
      const producto = productos.find(p => p.id_product === idProducto);

      if (!producto) {
        console.warn(`Producto con ID ${idProducto} no encontrado`);
        return;
      }

      showEditPorcentajeModal({
        idProducto,
        clienteId,
        porcentajeActual: producto.porcentaje ?? 0,
        onSave: (nuevoPorcentaje) => {
          onModify(idProducto, nuevoPorcentaje);
        },
        onCancel: () => {
          console.log('Cancelado');
        }
      });
    });
  });

  root.querySelectorAll('.btn-eliminar-producto').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idProduct = Number(btn.dataset.idProduct);
      const idAttr = Number(btn.dataset.idAttr);

      if (!confirm(`¿Seguro que quieres eliminar el producto ${idProduct} con combinación ${idAttr}?`)) return;

      try {
        await deleteProductoEspecial({
          id_product: idProduct,
          id_product_attribute: idAttr,
          id_customer: clienteId
        });

        alert('Producto eliminado correctamente');
        onBack(); // o recarga dinámica si prefieres
      } catch (err) {
        console.error(err);
        alert('Error al eliminar el producto');
      }
    });
  });

}