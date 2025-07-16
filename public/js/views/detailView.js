import { fetchPorcentajeClientes } from '../api/api.js';

export async function renderDetail(root, comercial, onBack) {
  const datosPorcentaje = await fetchPorcentajeClientes(comercial.id_customer);
  const porcentaje = datosPorcentaje.porcentaje;

  root.innerHTML = `
    <button id="btn-back" style="margin-bottom: 1rem;">← Volver</button>
    <div style="padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
      <h3>Detalles del Comercial</h3>
      <p><strong>ID del Cliente:</strong> ${datosPorcentaje.id_customer}</p>
      <p><strong>Porcentaje actual:</strong> ${porcentaje}%</p>
      <p style="color: grey;">(A la espera de datos de pedidos para calcular ganancias)</p>
    </div>
  `;

  root.querySelector('#btn-back').addEventListener('click', onBack);
}
