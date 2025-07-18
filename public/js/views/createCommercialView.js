export function renderCreate(_, onCreate) {
  // Crear un div temporal para insertar el modal
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="modal" id="crearComercialModal" tabindex="-1" aria-labelledby="crearComercialModalLabel" aria-hidden="true" style="display: none;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="crearComercialModalLabel">Crear Comercial</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <form id="create-comercial-form" class="modal-body">
            <div class="mb-3">
             <label for="inputIdComercial" class="form-label">ID Comercial</label>
              <input type="number" class="form-control" id="inputIdComercial" name="id_comercial" required />
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

  // Añadir al body directamente
  const modalEl = wrapper.firstElementChild;
  document.body.appendChild(modalEl);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  const form = modalEl.querySelector('#create-comercial-form');
  const msg = modalEl.querySelector('#msg');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      id_comercial: Number(formData.get('id_comercial')),
      porcentaje_general: parseFloat(formData.get('porcentaje_general')),
    };


    try {
      await onCreate(data);
      msg.textContent = 'Comercial creado con éxito.';
      msg.classList.remove('text-danger');
      msg.classList.add('text-success');

      setTimeout(() => {
        modal.hide();
        msg.textContent = '';
        window.location.hash = '/';
      }, 1500);
    } catch (error) {
      msg.textContent = 'Error al crear comercial: ' + error.message;
      msg.classList.remove('text-success');
      msg.classList.add('text-danger');
    }
  });

  // Limpieza del DOM al cerrar
  modalEl.addEventListener('hidden.bs.modal', () => {
    modalEl.remove();
  });
}
