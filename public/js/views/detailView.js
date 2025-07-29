import { fetchPorcentajeClientes, deleteCliente } from '../api/api.js';

export async function renderDetail(root, comercial, onBack) {
  const datosPorcentaje = await fetchPorcentajeClientes(comercial.id_customer);

  let tablaHTML = '';
  const renderFila = (cli) => `
  <tr data-id="${cli.id_customer}">
    <td>${cli.id_customer}</td>
    <td>${cli.porcentaje}%</td>
    <td>
      <button 
        class="btn btn-sm btn-info ver-productos" 
        data-id="${cli.id_customer}">
        Ver productos con porcentaje
      </button>
      <button 
        class="btn btn-sm btn-danger borrar-cliente"
        data-id="${cli.id_customer}">
        Borrar
      </button>
    </td>
  </tr>
`;

  if (Array.isArray(datosPorcentaje)) {
    tablaHTML = `
      <h4 class="mt-4">Clientes con Porcentaje Especial</h4>
      <table class="table table-bordered mt-2">
        <thead>
          <tr>
            <th>ID Cliente</th>
            <th>Porcentaje</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${datosPorcentaje.map(renderFila).join('')}
        </tbody>
      </table>
    `;
  } else {
    tablaHTML = `
      <h4 class="mt-4">Cliente con Porcentaje Especial</h4>
      <table class="table table-bordered mt-2">
        <thead>
          <tr>
            <th>ID Cliente</th>
            <th>Porcentaje</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${renderFila(datosPorcentaje)}
        </tbody>
      </table>
    `;
  }

  root.innerHTML = `
    <button id="btn-back" style="margin-bottom: 1rem;">← Volver</button>
    <div class="p-3 border rounded">
      <h3>Detalles del Comercial</h3>
      <p><strong>ID del Comercial:</strong> ${comercial.id_customer}</p>
      ${tablaHTML}
      <button id="btn-clientes-asignados" class="btn btn-secondary mt-2 ms-2">
        Ver clientes asignados
      </button>
    </div>
  `;

  // Botón "Volver"
  root.querySelector('#btn-back').addEventListener('click', () => {
    window.location.hash = '#/';
  });

  // Botón "Clientes asignados"
  root.querySelector('#btn-clientes-asignados').addEventListener('click', () => {
    window.location.hash = `#/${comercial.id_customer}/asignarPorcentaje`;
  });

  // Botones "Ver productos con porcentaje"
  root.querySelectorAll('.ver-productos').forEach(boton => {
    boton.addEventListener('click', () => {
      const idCliente = boton.dataset.id;
      window.location.hash = `/productos/${idCliente}`;
    });
  });

  // Botones "Borrar"
  root.querySelectorAll('.borrar-cliente').forEach(boton => {
    boton.addEventListener('click', async () => {
      const idCliente = boton.dataset.id;
      const confirmar = confirm(`¿Seguro que quieres borrar al cliente ${idCliente}?`);
      if (!confirmar) return;

      try {
        await deleteCliente(idCliente);
        console.log('[BORRADO REAL] Cliente a borrar:', idCliente);

        const fila = boton.closest('tr');
        fila.remove();
      } catch (err) {
        alert('Error al borrar el cliente: ' + err.message);
      }
    });
  });

}
