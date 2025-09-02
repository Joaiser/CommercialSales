import { enviarInformeAlBackend } from '../../../api/api.js';
import { mostrarMensaje } from '../../../utils/mensajes.js';

// --- FUNCIONES PÚBLICAS ---
export function abrirInformeModal(customerId) {
  const modalEl = crearModal(customerId);
  document.body.appendChild(modalEl);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  setupModalListeners(modal, modalEl, customerId);
}

// --- FUNCIONES INTERNAS ---
function crearModal(customerId) {
  const modalHtml = `
    <div class="modal fade" id="crearInformeModal-${customerId}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Generar Informe - Comercial #${customerId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
      <div class="d-flex justify-content-between align-items-center">
        <button type="button" class="btn btn-outline-primary" id="btn-historico-${customerId}">
          Informe Histórico Completo
        </button>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="submit" class="btn btn-success">Generar Informe</button>
        </div>
      </div>
    </form>
  `;
}

function setupModalListeners(modal, modalEl, customerId) {
  // Botón histórico completo
  const btnHistorico = document.getElementById(`btn-historico-${customerId}`);
  if (btnHistorico) {
    btnHistorico.addEventListener('click', () => handleHistoricalReport(modal, customerId));
  }

  // Submit del formulario
  const form = document.getElementById(`form-informe-${customerId}`);
  if (form) {
    form.addEventListener('submit', (e) => handleFormSubmit(e, modal, customerId));
  }

  // Limpieza al cerrar
  modalEl.addEventListener('hidden.bs.modal', () => cleanupModal(modal, modalEl));
}

async function handleHistoricalReport(modal, customerId) {
  try {
    await enviarInformeAlBackend(customerId, null, null, true);
    mostrarMensaje('Informe histórico generado correctamente');
    modal.hide();
  } catch (error) {
    mostrarMensaje('Error al generar el informe histórico', 'danger');
    console.error(error);
  }
}

async function handleFormSubmit(e, modal, customerId) {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    await enviarInformeAlBackend(
      customerId,
      formData.get('fecha_inicio'),
      formData.get('fecha_fin'),
      false
    );
    mostrarMensaje('Informe generado correctamente');
    modal.hide();
  } catch (error) {
    mostrarMensaje('Error al generar el informe', 'danger');
    console.error(error);
  }
}

function cleanupModal(modal, modalEl) {
  modal.dispose();
  document.body.removeChild(modalEl);
}
