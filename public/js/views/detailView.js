// views/detailView.js
import { fetchPorcentajeClientes } from '../api/api.js';

export async function renderDetail(root, comercial, onBack) {
  const datosPorcentaje = await fetchPorcentajeClientes(comercial.id_customer);
  const porcentaje = datosPorcentaje.porcentaje;
  const idClienteFinal = datosPorcentaje.id_customer;

  root.innerHTML = `
    <button id="btn-back" style="margin-bottom: 1rem;">← Volver</button>
    <div class="p-3 border rounded">
      <h3>Detalles del Comercial</h3>
      <p><strong>ID del Cliente:</strong> ${idClienteFinal}</p>
      <p><strong>Porcentaje actual:</strong> ${porcentaje}%</p>
      <button id="btn-productos" class="btn btn-info mt-2">Ver productos con porcentaje especial</button>
      <button id="btn-clientes-asignados" class="btn btn-secondary mt-2 ms-2">Ver clientes asignados</button>
    </div>
  `;

  root.querySelector('#btn-back').addEventListener('click', () => {
    window.location.hash = '#/';
  });

  root.querySelector('#btn-productos').addEventListener('click', () => {
    window.location.hash = `/productos/${idClienteFinal}`;
  });

  root.querySelector('#btn-clientes-asignados').addEventListener('click', () => {
    window.location.hash = `#/${idClienteFinal}/asignarPorcentaje`;
  });



}
