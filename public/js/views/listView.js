import { navigateTo } from '../router.js';
import { deleteComercial, enviarInformeAlBackend } from '../api/api.js';
import { mostrarMensaje } from '../utils/mensajes.js';

export function renderList(root, comerciales, onVerMas) {
  if (!(root instanceof HTMLElement)) {
    console.error("renderList: root no es un elemento del DOM", root);
    return;
  }

  root.innerHTML = generateHTML(comerciales);
  setupEventListeners(root, comerciales, onVerMas);
}

// --- FUNCIONES AUXILIARES ---

function generateHTML(comerciales) {
  return `
    <div style="display: flex; gap: 16px;">
      <button class="btn btn-primary mb-3" id="btn-crear-comercial">
        Crear Comercial
      </button>
      <button class="btn btn-primary mb-3" id="btn-ver-ventas">
        Ver ventas comerciales
      </button>
    </div>

    <table class="table table-striped table-bordered table-hover text-center">
      <thead class="table-dark">
        <tr>
          <th class="text-center">Comercial ID</th>
          <th class="text-center">Porcentaje</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${comerciales.map(generateTableRow).join('')}
      </tbody>
    </table>
  `;
}

function generateTableRow(c) {
  return `
    <tr>
      <td>${c.id_customer}</td>
      <td>${c.porcentaje_general}%</td>
      <td>
        <button class="btn-ver btn btn-sm btn-info" data-id="${c.id_customer}">Ver más</button>
        <button class="btn-borrar btn btn-sm btn-danger" data-id="${c.id_customer}">Borrar</button>
        <button class="btn-crear-informe btn btn-sm btn-success" 
          data-id="${c.id_customer}" style="margin-left: 0.5rem;">
          Crear Informe
        </button>
      </td>
    </tr>
  `;
}

function setupEventListeners(root, comerciales, onVerMas) {
  setupViewMoreListeners(root, onVerMas);
  setupActionButtons(root);
  setupDeleteListeners(root);
  setupCreateReportListeners(root);
}

function setupViewMoreListeners(root, onVerMas) {
  root.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', () => onVerMas(btn.dataset.id));
  });
}

function setupActionButtons(root) {
  // Botón Ver Ventas
  const btnVerVentas = root.querySelector('#btn-ver-ventas');
  if (btnVerVentas) {
    btnVerVentas.addEventListener('click', () => {
      window.open('https://test2.salamandraluz.net/module/zonacomerciales/comerciales', '_blank');
    });
  }

  // Botón Crear Comercial
  const btnCrear = root.querySelector('#btn-crear-comercial');
  if (btnCrear) {
    btnCrear.addEventListener('click', () => navigateTo('/create'));
  }
}

function setupDeleteListeners(root) {
  root.querySelectorAll('.btn-borrar').forEach(btn => {
    btn.addEventListener('click', async () => handleDeleteComercial(btn));
  });
}

async function handleDeleteComercial(btn) {
  const id = btn.dataset.id;
  if (!confirm(`¿Seguro que quieres borrar el comercial ID ${id}?`)) return;

  try {
    await deleteComercial(id);
    mostrarMensaje('Comercial borrado correctamente');
    btn.closest('tr')?.remove();
  } catch (err) {
    mostrarMensaje('Error al borrar el comercial', 'danger');
    console.error(err);
  }
}

function setupCreateReportListeners(root) {
  root.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-crear-informe')) {
      openModal(e.target.dataset.id);
    }
  });
}

// --- MODAL FUNCTIONS ---

function openModal(customerId) {
  const modalEl = createModalElement(customerId);
  document.body.appendChild(modalEl);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  setupModalEventListeners(modal, modalEl, customerId);
}

function createModalElement(customerId) {
  const modalHtml = `
    <div class="modal fade" id="crearInformeModal-${customerId}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Generar Informe - Comercial #${customerId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${generateModalForm(customerId)}
          </div>
        </div>
      </div>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  return tempDiv.firstElementChild;
}

function generateModalForm(customerId) {
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

function setupModalEventListeners(modal, modalEl, customerId) {
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