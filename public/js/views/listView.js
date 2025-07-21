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
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse: collapse; text-align: center;">
      <thead>
        <tr>
          <th style="text-align: center;">Comercial ID</th>
          <th style="text-align: center;">Porcentaje</th>
          <th style="text-align: center;">Acciones</th>
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
