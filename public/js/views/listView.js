import { navigateTo } from '../router.js';
import { deleteComercial } from '../api/api.js';  // O la ruta correcta a tu api.js


export function renderList(root, comerciales, onVerMas) {
  root.innerHTML = `
    <!-- Botón para abrir modal -->
    <button 
      class="btn btn-primary mb-3" 
      id="btn-crear-comercial"
    >
      Crear Comercial
    </button>

    <!-- Tabla con la lista de comerciales -->
    <table class="table table-striped table-bordered table-hover text-center">
      <thead class="table-dark">
        <tr>
          <th>Comercial ID</th>
          <th>Porcentaje</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${comerciales.map(c => `
          <tr>
            <td>${c.id_customer}</td>
            <td>${c.porcentaje_general}%</td>
          <td>
            <button class="btn-ver btn btn-sm btn-info" data-id="${c.id_customer}">Ver más</button>
            <button class="btn-borrar btn btn-sm btn-danger" data-id="${c.id_customer}">Borrar</button>
            <button class="btn-crear-informe btn btn-sm btn-success" data-id="${c.id_customer}" style="margin-left: 0.5rem;">
              Crear Informe
            </button>
            <!-- TODO: Añadir listener para btn-crear-informe y función en api.js para crear informe -->
          </td>

          </tr>
        `).join('')}
      </tbody>
    </table>

    <div id="modal-root"></div>
  `;

  // Listener para "Ver más"
  root.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', () => onVerMas(btn.dataset.id));
  });

  // Listener para abrir modal navegando a la ruta /create
  const btnCrear = root.querySelector('#btn-crear-comercial');
  btnCrear.addEventListener('click', () => {
    navigateTo('/create');
  });

  root.querySelectorAll('.btn-borrar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;

      if (!confirm(`¿Seguro que quieres borrar el comercial ID ${id}?`)) return;

      try {
        const res = await deleteComercial(id);
        alert('Comercial borrado correctamente');

        // Eliminar la fila del DOM directamente
        const fila = btn.closest('tr');
        if (fila) fila.remove();

      } catch (err) {
        alert('Error al borrar el comercial');
        console.error(err);
      }
    });
  });


}
