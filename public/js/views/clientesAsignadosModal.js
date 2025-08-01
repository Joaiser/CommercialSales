import { fetchTodosClientes, asignarPorcentajeCliente } from "../api/api.js";

export async function renderClientesAsignados(idComercial) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
<div class="modal fade" id="clientesAsignadosModal" tabindex="-1" aria-labelledby="clientesAsignadosModalLabel" aria-hidden="true">
  <style>
    #clientesAsignadosModal .modal-body {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 10px;
    }
    #clientesAsignadosModal .modal-body::-webkit-scrollbar {
      width: 8px;
    }
    #clientesAsignadosModal .modal-body::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.2);
      border-radius: 4px;
    }
  </style>

  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Clientes asignados al comercial ID ${idComercial}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <input type="text" id="buscadorClientes" class="form-control mb-3" placeholder="Buscar cliente por nombre o apellido..." />
        <div id="mensajeEstado"></div>
        <div id="clientesAsignadosLista">
          <p>Cargando clientes...</p>
        </div>
      </div>
    </div>
  </div>
</div>
`;

  const modalEl = wrapper.firstElementChild;
  document.body.appendChild(modalEl);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  const mensajeEstado = modalEl.querySelector('#mensajeEstado');

  function mostrarMensaje(texto, tipo = 'success') {
    if (texto.length > 200) {
      texto = texto.slice(0, 200) + '...';
    }
    mensajeEstado.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${texto}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
      </div>
    `;
    // Quitar mensaje tras x segundos
    setTimeout(() => {
      const alert = mensajeEstado.querySelector('.alert');
      if (alert) {
        const bsAlert = bootstrap.Alert.getInstance(alert);
        if (bsAlert) bsAlert.close();
        else alert.remove();
      }
    }, 8000);
  }

  try {
    const todosClientes = await fetchTodosClientes();
    const clientesDelComercial = todosClientes.filter(c => Number(c.id_comercial) === Number(idComercial));

    const listaContainer = modalEl.querySelector('#clientesAsignadosLista');
    const inputBuscador = modalEl.querySelector('#buscadorClientes');

    function renderLista(filtrados) {
      if (filtrados.length === 0) {
        listaContainer.innerHTML = '<p class="text-muted">No se encontraron coincidencias.</p>';
        return;
      }

      listaContainer.innerHTML = `
      <ul class="list-group">
        ${filtrados.map(c => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>${c.firstname} ${c.lastname} (ID: ${c.id_customer})</div>
            <div class="d-flex align-items-center">
              <input type="number" class="form-control form-control-sm me-2" placeholder="% comisión" min="0" max="100" style="width: 80px;" id="porcentaje-${c.id_customer}" />
              <button class="btn btn-primary btn-sm" data-id="${c.id_customer}">Asignar</button>
            </div>
          </li>
        `).join('')}
      </ul>`;

      listaContainer.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idCliente = btn.dataset.id;
          const input = modalEl.querySelector(`#porcentaje-${idCliente}`);
          const porcentaje = Number(input.value);

          if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
            mostrarMensaje("Introduce un porcentaje válido (0-100)", "danger");
            return;
          }

          try {
            const result = await asignarPorcentajeCliente(idCliente, porcentaje);
            if (result.success) {
              mostrarMensaje(`Porcentaje asignado correctamente al cliente ${idCliente}`, "success");
            } else {
              mostrarMensaje(`Error: ${result.error}`, "danger");
            }
          } catch (error) {
            // console.error("Error asignando porcentaje:", error);
            mostrarMensaje(`Error al asignar porcentaje: ${error.message}`, "danger");
          }
        });
      });
    }

    renderLista(clientesDelComercial);

    inputBuscador.addEventListener('input', e => {
      const query = e.target.value.toLowerCase().trim();

      const filtrados = clientesDelComercial.filter(c =>
        `${c.firstname} ${c.lastname}`.toLowerCase().includes(query)
      );

      renderLista(filtrados);
    });

  } catch (error) {
    modalEl.querySelector('#clientesAsignadosLista').innerHTML = `<p class="text-danger">Error al cargar los clientes: ${error.message}</p>`;
  }

  modalEl.addEventListener('hidden.bs.modal', () => {
    modalEl.remove();

    const currentHash = window.location.hash;
    const newHash = currentHash.replace(/\/asignarPorcentaje$/, '');

    if (newHash !== currentHash) {
      window.location.hash = newHash;
    }
  });
}
