import { fetchPorcentajeClientes } from '../api/api.js';

export async function renderDetail(root, comercial, onBack) {
  console.log("Obteniendo porcentaje para cliente:", comercial.id_customer);

  const datosPorcentaje = await fetchPorcentajeClientes(comercial.id_customer);

  console.log("Respuesta recibida:", datosPorcentaje);

  const porcentaje = datosPorcentaje.porcentaje;
  const idClienteFinal = datosPorcentaje.id_customer;

  root.innerHTML = `
    <button id="btn-back" style="margin-bottom: 1rem;">← Volver</button>
    <div style="padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
      <h3>Detalles del Comercial</h3>
      <p><strong>ID del Cliente:</strong> ${idClienteFinal}</p>
      <p><strong>Porcentaje actual:</strong> ${porcentaje}%</p>
      <p style="color: grey; display: none;">(A la espera de datos de pedidos para calcular ganancias)</p>
      <button id="btn-productos" style="margin-top:1rem;">Ver productos con porcentaje especial</button>
    </div>
  `;

  root.querySelector('#btn-back').addEventListener('click', onBack);
  root.querySelector('#btn-productos').addEventListener('click', () => {
    window.location.hash = `/productos/${idClienteFinal}`;
  });
}
