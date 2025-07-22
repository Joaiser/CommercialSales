import { navigateTo } from '../router.js';

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
}
