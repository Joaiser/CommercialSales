import { enviarInformeAlBackend } from '../../../api/api.js';
import { navigateTo } from '../../../router.js';
import { mostrarMensaje } from '../../../utils/mensajes.js';

// --- FUNCIONES PÚBLICAS ---
export function abrirInformeModal(customerId) {
  // Esta función ya NO debe crear el modal
  // Solo debe devolver la ruta para que el router lo maneje
  return `/informe/${customerId}`;
}

// Función que el router llamará para crear y mostrar el modal
export function crearModalInforme(customerId) {
  const modalEl = crearModal(customerId);
  const modal = new bootstrap.Modal(modalEl);
  setupModalListeners(modal, modalEl, customerId);
  return modalEl;
}

// --- FUNCIONES INTERNAS ---
function crearModal(customerId) {
  const modalHtml = `
    <div class="modal fade" id="crearInformeModal-${customerId}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Generar Informe - Comercial #${customerId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            ${generarFormularioModal(customerId)}
          </div>
        </div>
      </div>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  return tempDiv.firstElementChild;
}

function generarFormularioModal(customerId) {
  return `
    <form id="form-informe-${customerId}">
      <div class="mb-3">
        <label class="form-label">Fecha de Inicio</label>
        <input type="date" class="form-control" name="fecha_inicio" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Fecha de Fin</label>
        <input type="date" class="form-control" name="fecha_fin" required>
      </div>
      <div class="d-flex justify-content-between align-items-center gap-2">
        <button type="button" class="btn btn-outline-primary" id="btn-historico-${customerId}">
          Informe Histórico Completo
        </button>
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-success">Descargar informe</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        </div>
      </div>
    </form>
  `;
}

function setupModalListeners(modal, modalEl, customerId) {
  const btnHistorico = modalEl.querySelector(`#btn-historico-${customerId}`);
  const form = modalEl.querySelector(`#form-informe-${customerId}`);

  const cerrarYVolver = () => {
    // Esperamos un microtick para que Bootstrap termine
    setTimeout(() => {
      const instance = bootstrap.Modal.getInstance(modalEl);
      if (instance) instance.dispose();
      if (document.body.contains(modalEl)) document.body.removeChild(modalEl);
      // Solo navegamos si seguimos en la ruta del modal
      if (window.location.hash.slice(1) === `/informe/${customerId}`) {
        navigateTo('/');
      }
    }, 0);
  };

  if (btnHistorico) {
    btnHistorico.addEventListener('click', async () => {
      try {
        await enviarInformeAlBackend(customerId, null, null, true);
        removeFocusInsideModal(modalEl);
        mostrarMensaje('Informe histórico generado correctamente', 'success');
        modal.hide(); // Esto disparará hidden.bs.modal → cerrarYVolver
      } catch (err) {
        mostrarMensaje('Error al generar el informe histórico', 'danger');
        console.error(err);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const formData = new FormData(form);
      const fecha_inicio = formData.get('fecha_inicio');
      const fecha_fin = formData.get('fecha_fin');

      try {
        await enviarInformeAlBackend(customerId, fecha_inicio, fecha_fin, false);
        removeFocusInsideModal(modalEl);
        mostrarMensaje('Informe generado correctamente', 'success');
        modal.hide(); // Esto disparará hidden.bs.modal → cerrarYVolver
      } catch (err) {
        mostrarMensaje('Error al generar el informe', 'danger');
        console.error(err);
      }
    });
  }

  // Listener único para cuando el modal se cierre
  modalEl.addEventListener('hidden.bs.modal', cerrarYVolver);

  // Mostramos el modal después de setear listeners
  modal.show();
}



function cleanupModal(modal, modalEl) {
  modal.dispose();
  document.body.removeChild(modalEl);
}

function removeFocusInsideModal(modalEl) {
  const focused = modalEl.querySelector(':focus');
  if (focused) focused.blur();
}
