import { showEditPorcentajeModal } from "./modals/editPorcentajeProductosModal/modalEditPorcentajeProductos.js";
import { deleteProductoEspecial, crearProductoEspecial } from '../api/api.js';
import { mostrarMensaje } from '../utils/mensajes.js';

export function renderProductosConPorcentaje(root, productos, onBack, clienteId, onSave) {

  // Función para pintar solo la tabla dentro del contenedor
  function pintarTabla() {
    const contenedorTabla = root.querySelector('#contenedor-tabla-productos');
    if (!contenedorTabla) return;

    if (productos.length === 0) {
      contenedorTabla.innerHTML = `<p style="color: #6c757d; font-style: italic; margin-top: 1rem;">
        No hay productos especiales para este cliente.
      </p>`;
      return;
    }

    contenedorTabla.innerHTML = `
      <h4 style="margin-top: 1.5rem; font-weight: 600; color: #212529;">
        Productos con Porcentaje Especial de cliente ID: ${clienteId}
      </h4>
      <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem; text-align: center; font-family: Arial, sans-serif; background-color: white;">
        <thead style="background-color: #f8f9fa; color: #495057; font-weight: 700; border-bottom: 2px solid #dee2e6;">
          <tr>
            <th style="padding: 0.75rem; border: 1px solid #dee2e6;">ID Producto</th>
            <th style="padding: 0.75rem; border: 1px solid #dee2e6;">ID Atributo</th>
            <th style="padding: 0.75rem; border: 1px solid #dee2e6;">Porcentaje Especial</th>
            <th style="padding: 0.75rem; border: 1px solid #dee2e6;">Acción</th>
          </tr>
        </thead>
        <tbody>
          ${productos.map(p => `
            <tr style="border-bottom: 1px solid #dee2e6;">
              <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.id_product}</td>
              <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.id_product_attribute}</td>
              <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.porcentaje}%</td>
              <td style="padding: 0.75rem; border: 1px solid #dee2e6;">
                <button class="btn-modificar" data-id-productocliente="${p.id_productocliente}" style="padding: 0.3rem 0.6rem; background-color: #0d6efd; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem;">
                  Modificar
                </button>
                <button class="btn-eliminar-producto"  data-id-productocliente="${p.id_productocliente}"  data-id-attr="${p.id_product_attribute}" style="padding: 0.3rem 0.6rem; background-color: #dc3545; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; margin-left: 0.5rem;">
                  Eliminar
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Reasignar eventos porque el DOM cambió
    asignarEventosBotones();
  }

  // Función para asignar eventos a botones modificar y eliminar (porque vuelves a pintar tabla)
  function asignarEventosBotones() {
    root.querySelectorAll('.btn-modificar').forEach(btn => {
      btn.addEventListener('click', () => {
        const idProductCliente = Number(btn.dataset.idProductocliente);
        const producto = productos.find(p => p.id_productocliente === idProductCliente);

        if (!producto) return;

        showEditPorcentajeModal({
          idProducto: producto.id_product,
          clienteId,
          porcentajeActual: producto.porcentaje ?? 0,
          onSave: async (nuevoPorcentaje) => {
            await onSave(producto.id_productocliente, nuevoPorcentaje);
            // Actualizar en el array local
            producto.porcentaje = nuevoPorcentaje;
            pintarTabla();
          },
          onCancel: () => mostrarMensaje('Edición cancelada por el usuario')
        });
      });
    });

    root.querySelectorAll('.btn-eliminar-producto').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idProductClienteId = Number(btn.dataset.idProductocliente);

        if (!confirm(`¿Seguro que quieres eliminar este producto especial?`)) return;

        try {
          await deleteProductoEspecial({ idProductClienteId });
          mostrarMensaje('Producto eliminado correctamente', 'success');

          // Eliminar producto del array local usando splice para no reasignar
          const index = productos.findIndex(p => p.id_productocliente === idProductClienteId);
          if (index > -1) productos.splice(index, 1);

          // Repintar tabla
          pintarTabla();

        } catch (err) {
          mostrarMensaje('Error al eliminar el producto: ' + err.message, 'danger');
        }
      });
    });
  }

  // Pintamos todo el layout menos la tabla, que la dejamos en un div vacío para pintar y actualizar
  root.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <button id="btn-back" style="background-color: #6c757d; border: none; color: white; padding: 0.5rem 1rem; font-size: 1rem; border-radius: 0.375rem; cursor: pointer; transition: background-color 0.3s ease;"
        onmouseover="this.style.backgroundColor='#5a6268'"
        onmouseout="this.style.backgroundColor='#6c757d'">
        ← Volver
      </button>
    </div>

    <div style="padding: 1rem; border: 1px solid #ced4da; border-radius: 0.375rem; background-color: #f8f9fa; font-family: Arial, sans-serif; color: #212529;">
      <h3 style="margin-bottom: 1rem;">Detalle del Cliente</h3>

      <button id="btn-crear-producto" style="background-color: #198754; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600; margin-bottom: 1rem;">+ Crear Producto Especial</button>

      <div id="contenedor-tabla-productos"></div>
    </div>

    <div id="modal-crear-producto" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); justify-content: center; align-items: center;">
      <div style="background: #fff; padding: 1.5rem; border-radius: 0.375rem; width: 320px; max-width: 90%;">
        <h4>Crear Producto Especial</h4>
        <label>ID Producto:<br/><input type="number" id="input-id-producto" style="width: 100%; margin-bottom: 0.75rem;" /></label>
        <label>ID Atributo:<br/><input type="number" id="input-id-atributo" style="width: 100%; margin-bottom: 0.75rem;" /></label>
        <label>Porcentaje:<br/><input type="number" step="0.01" id="input-porcentaje" style="width: 100%; margin-bottom: 0.75rem;" /></label>
        <button id="btn-guardar-producto" style="background: #198754; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; margin-right: 0.5rem;">Guardar</button>
        <button id="btn-cancelar-producto" style="background: #dc3545; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">Cancelar</button>
      </div>
    </div>
  `;

  // Botones generales
  root.querySelector('#btn-back')?.addEventListener('click', onBack);
  root.querySelector('#btn-crear-producto').addEventListener('click', () => {
    root.querySelector('#modal-crear-producto').style.display = 'flex';
  });
  root.querySelector('#btn-cancelar-producto').addEventListener('click', () => {
    root.querySelector('#modal-crear-producto').style.display = 'none';
  });
  root.querySelector('#btn-guardar-producto').addEventListener('click', async () => {
    const id_product = Number(root.querySelector('#input-id-producto').value);
    const id_product_attribute = Number(root.querySelector('#input-id-atributo').value);
    const porcentaje = parseFloat(root.querySelector('#input-porcentaje').value);

    if (!id_product || isNaN(porcentaje)) {
      mostrarMensaje('Debes ingresar un ID de producto válido y un porcentaje.');
      return;
    }

    try {
      await crearProductoEspecial({
        idProducto: id_product,
        id_product_attribute,
        id_customer: clienteId,
        porcentaje
      });
      mostrarMensaje('Producto creado correctamente');

      // Añadir el producto nuevo al array local y repintar tabla
      productos.push({
        id_product,
        id_product_attribute,
        porcentaje
      });
      root.querySelector('#modal-crear-producto').style.display = 'none';
      pintarTabla();

    } catch (error) {
      mostrarMensaje('Error al crear producto especial: ' + error.message);
    }
  });

  // Pintar tabla la primera vez
  pintarTabla();
}
