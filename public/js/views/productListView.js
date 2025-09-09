import { showEditPorcentajeModal } from "./modals/editPorcentajeProductosModal/modalEditPorcentajeProductos.js";
import { deleteProductoEspecial } from '../api/api.js';
import { mostrarMensaje } from '../utils/mensajes.js';
import { initCrearProductoModal } from '../views/modals/modalCrearProductoEspecial/crearProductoEspecial.js';

export function renderProductosConPorcentaje(root, productos, onBack, clienteId, onSave) {

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
              <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.nombre_producto}</td>
              <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.referencia_combinacion ?? ''}</td>
              <td style="padding: 0.75rem; border: 1px solid #dee2e6;">${p.porcentaje}%</td>
              <td style="padding: 0.75rem; border: 1px solid #dee2e6;">
                <button class="btn-modificar" data-id-productocliente="${p.id_productocliente}" style="padding: 0.3rem 0.6rem; background-color: #0d6efd; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem;">
                  Modificar
                </button>
                <button class="btn-eliminar-producto"  data-id-productocliente="${p.id_productocliente}" style="padding: 0.3rem 0.6rem; background-color: #dc3545; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; margin-left: 0.5rem;">
                  Eliminar
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    asignarEventosBotones();
  }

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
            producto.porcentaje = nuevoPorcentaje;
            pintarTabla();
          },
          onCancel: () => mostrarMensaje('Edición cancelada por el usuario', 'info')
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

          const index = productos.findIndex(p => p.id_productocliente === idProductClienteId);
          if (index > -1) productos.splice(index, 1);
          pintarTabla();
        } catch (err) {
          mostrarMensaje('Error al eliminar el producto: ' + err.message, 'danger');
        }
      });
    });
  }

  // Primero pintamos el contenido principal
  root.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <button id="btn-back" style="background-color: #6c757d; border: none; color: white; padding: 0.5rem 1rem; font-size: 1rem; border-radius: 0.375rem; cursor: pointer;">
        ← Volver
      </button>
    </div>

    <div style="padding: 1rem; border: 1px solid #ced4da; border-radius: 0.375rem; background-color: #f8f9fa; font-family: Arial, sans-serif; color: #212529;">
      <h3 style="margin-bottom: 1rem;">Detalle del Cliente</h3>
      <button id="btn-crear-producto" style="background-color: #198754; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 600; margin-bottom: 1rem;">+ Crear Producto Especial</button>
      <div id="contenedor-tabla-productos"></div>
    </div>
  `;

  // Inicializamos el modal **después** de pintar el contenido
  const crearProductoModal = initCrearProductoModal({
    root,
    clienteId,
    onProductoCreado: (nuevoProducto) => {
      productos.push(nuevoProducto);
      pintarTabla();
    }
  });

  // Asignamos listeners
  root.querySelector('#btn-crear-producto').addEventListener('click', () => crearProductoModal.show());
  root.querySelector('#btn-back')?.addEventListener('click', onBack);

  // Pintamos la tabla inicialmente
  pintarTabla();
}
