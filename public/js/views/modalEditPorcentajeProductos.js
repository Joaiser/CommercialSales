export function showEditPorcentajeModal({ idProducto, clienteId, porcentajeActual, onSave, onCancel }) {
  const overlay = document.createElement('div');
  overlay.style = `
    position: fixed; top:0; left:0; width:100vw; height:100vh;
    background-color: rgba(0,0,0,0.5);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
  `;

  const modal = document.createElement('div');
  modal.style = `
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    width: 320px;
    box-shadow: 0 0 10px rgba(0,0,0,0.25);
    font-family: Arial, sans-serif;
  `;

  modal.innerHTML = `
    <h3 style="margin-top:0;">Modificar Porcentaje</h3>
    <p>Producto ID: <strong>${idProducto}</strong></p>
    <p>Cliente ID: <strong>${clienteId}</strong></p>
    <label for="input-porcentaje">Porcentaje actual:</label>
    <input type="number" id="input-porcentaje" value="${porcentajeActual}" min="0" max="100" style="width: 100%; padding: 0.4rem; margin: 0.5rem 0; font-size: 1rem;" />
    <div style="display:flex; justify-content:flex-end; gap: 0.5rem;">
      <button id="btn-cancel" style="padding: 0.5rem 1rem; cursor:pointer;">Cancelar</button>
      <button id="btn-save" style="padding: 0.5rem 1rem; background-color:#0d6efd; color:white; border:none; cursor:pointer;">Guardar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  modal.querySelector('#input-porcentaje').focus();

  modal.querySelector('#btn-cancel').onclick = () => {
    document.body.removeChild(overlay);
    if (typeof onCancel === 'function') onCancel();
  };

  modal.querySelector('#btn-save').onclick = () => {
    const nuevoPorcentaje = Number(modal.querySelector('#input-porcentaje').value);
    if (isNaN(nuevoPorcentaje) || nuevoPorcentaje < 0 || nuevoPorcentaje > 100) {
      alert('Introduce un porcentaje válido entre 0 y 100.');
      return;
    }
    document.body.removeChild(overlay);
    if (typeof onSave === 'function') onSave(nuevoPorcentaje);
  };
}
