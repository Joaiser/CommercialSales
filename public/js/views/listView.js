import { navigateTo } from '../router.js';
import { deleteComercial } from '../api/api.js';
import { mostrarMensaje } from '../utils/mensajes.js';
import { abrirInformeModal } from './modals/listViewModals/listViewModals.js';

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
      window.open('/module/zonacomerciales/comerciales', '_blank');
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
      abrirInformeModal(e.target.dataset.id);
    }
  });
}
