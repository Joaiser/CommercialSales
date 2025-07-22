import { navigateTo } from "../router.js";

export function renderCreate(clientes, onCreate) {
  // Crear un div temporal para insertar el modal
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="modal" id="crearComercialModal" tabindex="-1" aria-labelledby="crearComercialModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="crearComercialModalLabel">Crear Comercial</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <form id="create-comercial-form" class="modal-body">
            <div class="mb-3">
              <label for="searchCliente" class="form-label">Buscar Cliente</label>
              <input type="text" id="searchCliente" class="form-control" placeholder="Escribe para buscar..." autocomplete="off" />
            </div>
            <div class="mb-3">
              <label for="selectCliente" class="form-label">Selecciona Cliente</label>
              <select id="selectCliente" name="id_comercial" class="form-select" size="6" required>
                ${clientes.map(c => `<option value="${c.id_customer}">${c.firstname} ${c.lastname}</option>`).join('')}
              </select>
            </div>
            <div class="mb-3">
              <label for="inputPorcentaje" class="form-label">Porcentaje General (%)</label>
              <input type="number" step="0.01" class="form-control" id="inputPorcentaje" name="porcentaje_general" required />
            </div>
            <div id="msg" class="text-center mt-2"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear Comercial</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const modalEl = wrapper.firstElementChild;
  document.body.appendChild(modalEl);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  const form = modalEl.querySelector('#create-comercial-form');
  const msg = modalEl.querySelector('#msg');

  // Filtro rápido para el select
  const searchInput = modalEl.querySelector('#searchCliente');
  const selectCliente = modalEl.querySelector('#selectCliente');

  searchInput.addEventListener('input', () => {
    const filtro = searchInput.value.toLowerCase();
    const opciones = selectCliente.options;

    for (let i = 0; i < opciones.length; i++) {
      const texto = opciones[i].text.toLowerCase();
      opciones[i].style.display = texto.includes(filtro) ? '' : 'none';
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Aquí toma la opción seleccionada visible
    const selectedOption = selectCliente.options[selectCliente.selectedIndex];
    if (!selectedOption) {
      msg.textContent = 'Selecciona un cliente válido.';
      msg.classList.add('text-danger');
      return;
    }

    const formData = new FormData(form);
    const data = {
      id_comercial: Number(selectedOption.value),
      porcentaje_general: parseFloat(formData.get('porcentaje_general')),
    };

    try {
      const response = await onCreate(data);

      if (response.success) {
        msg.textContent = 'Comercial creado con éxito.';
        msg.classList.remove('text-danger');
        msg.classList.add('text-success');

        setTimeout(() => {
          modal.hide();
          msg.textContent = '';
          window.location.hash = '/';
        }, 1500);
      } else {
        throw new Error("El servidor no confirmó la creación.");
      }

    } catch (error) {
      msg.textContent = 'Error al crear comercial: ' + error.message;
      msg.classList.remove('text-success');
      msg.classList.add('text-danger');
    }
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    modalEl.remove();
    navigateTo('/');
  });
}
