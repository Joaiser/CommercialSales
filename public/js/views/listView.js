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

    <!-- Aquí agregamos un contenedor para el modal dinámico -->
    <div id="modal-root"></div>
  `;

  // Listener para "Ver más"
  root.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', () => onVerMas(btn.dataset.id));
  });

  // Listener para abrir modal y cargar formulario dinámicamente
  const btnCrear = root.querySelector('#btn-crear-comercial');
  btnCrear.addEventListener('click', async () => {
    const { renderCreate } = await import('./createCommercialView.js');
    const { createComercial, fetchComerciales } = await import('../api/api.js')

    // Contenedor para el modal
    const modalRoot = document.getElementById('modal-root');

    // Función que maneja la creación y refresco
    const onCreate = async (data) => {
      await createComercial(data);
      //hay que ver como hacemos lo del id_comercial, porque en la bd es auto_incr
      // Refrescar lista tras crear
      const updated = await fetchComerciales();
      renderList(root, updated, onVerMas);
    };

    // Renderizamos y mostramos el modal dinámicamente
    renderCreate(modalRoot, onCreate);
  });
}
