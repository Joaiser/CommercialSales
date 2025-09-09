import { fetchProductos, crearProductoEspecial } from '../../../api/api.js';
import { mostrarMensaje } from '../../../utils/mensajes.js';

export function initCrearProductoModal({ root, clienteId, onProductoCreado }) {
  // Solo se crea una vez
  const modal = document.createElement('div');
  modal.style.cssText = `
    display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;
  `;
  modal.innerHTML = `
    <div style="background: #fff; padding: 1.5rem; border-radius: 0.375rem; width: 360px; max-width: 90%;">
      <h4>Crear Producto Especial</h4>
      <input type="text" id="input-buscar-producto" placeholder="Buscar producto..." style="width:100%; padding:0.4rem; margin-bottom:0.5rem;" />
      <div id="dropdown-productos" style="position: relative; margin-bottom: 0.75rem;"></div>
      <label>Porcentaje:<br/><input type="number" step="0.01" id="input-porcentaje" style="width: 100%; margin-bottom: 0.75rem;" /></label>
      <button id="btn-guardar-producto" style="background: #198754; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer; margin-right: 0.5rem;">Guardar</button>
      <button id="btn-cancelar-producto" style="background: #dc3545; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">Cancelar</button>
    </div>
  `;
  root.appendChild(modal);

  const dropdownContainer = modal.querySelector('#dropdown-productos');
  const inputBuscar = modal.querySelector('#input-buscar-producto');
  const listaDropdown = document.createElement('div');
  listaDropdown.style.cssText = `
    position: absolute; top: 100%; left: 0; right: 0;
    max-height: 200px; overflow-y: auto; background: #fff; border: 1px solid #ccc; border-radius: 0.25rem;
    z-index: 10; display: none;
  `;
  dropdownContainer.appendChild(listaDropdown);

  let productosFull = [];
  let seleccionado = null;
  let indiceActivo = -1;

  async function cargarProductos() {
    try {
      productosFull = (await fetchProductos()).map(p => ({
        id_product: p.id_product,
        id_product_attribute: p.id_product_attribute ?? '',
        name: p.name
      }));
    } catch (err) {
      listaDropdown.innerHTML = '<div style="padding:0.5rem;">Error al cargar productos</div>';
    }
  }

  function renderDropdown(lista) {
    listaDropdown.innerHTML = lista.length
      ? lista.map(p => `<div class="item-dropdown" style="padding:0.5rem; cursor:pointer;">${p.id_product} – ${p.name}${p.id_product_attribute ? ` (Attr: ${p.id_product_attribute})` : ''}</div>`).join('')
      : '<div style="padding:0.5rem;">No hay productos</div>';

    listaDropdown.querySelectorAll('.item-dropdown').forEach((item, index) => {
      item.addEventListener('click', () => {
        seleccionado = lista[index];
        inputBuscar.value = `${seleccionado.id_product} – ${seleccionado.name}${seleccionado.id_product_attribute ? ` (Attr: ${seleccionado.id_product_attribute})` : ''}`;
        listaDropdown.style.display = 'none';
      });
    });
  }

  function actualizarIndiceActivo(nuevoIndice) {
    const items = listaDropdown.querySelectorAll('.item-dropdown');
    items.forEach((item, i) => {
      item.style.background = i === nuevoIndice ? '#0d6efd' : '#fff';
      item.style.color = i === nuevoIndice ? '#fff' : '#000';
    });
    indiceActivo = nuevoIndice;

    // Scroll automático para que el item seleccionado siempre sea visible
    if (indiceActivo >= 0 && indiceActivo < items.length) {
      items[indiceActivo].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }


  inputBuscar.addEventListener('focus', async () => {
    if (!productosFull.length) await cargarProductos();
    renderDropdown(productosFull);
    listaDropdown.style.display = 'block';
    indiceActivo = -1;
  });

  inputBuscar.addEventListener('input', () => {
    const query = inputBuscar.value.toLowerCase();
    const filtrados = productosFull.filter(p => `${p.id_product} ${p.name} ${p.id_product_attribute}`.toLowerCase().includes(query));
    renderDropdown(filtrados);
    listaDropdown.style.display = 'block';
    indiceActivo = -1;
  });

  inputBuscar.addEventListener('keydown', e => {
    const items = listaDropdown.querySelectorAll('.item-dropdown');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      actualizarIndiceActivo(indiceActivo + 1 >= items.length ? 0 : indiceActivo + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      actualizarIndiceActivo(indiceActivo - 1 < 0 ? items.length - 1 : indiceActivo - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceActivo >= 0 && indiceActivo < items.length) {
        seleccionado = productosFull[indiceActivo];
        inputBuscar.value = `${seleccionado.id_product} – ${seleccionado.name}${seleccionado.id_product_attribute ? ` (Attr: ${seleccionado.id_product_attribute})` : ''}`;
        listaDropdown.style.display = 'none';
      }
    }
  });

  document.addEventListener('click', e => {
    if (!dropdownContainer.contains(e.target)) listaDropdown.style.display = 'none';
  });

  modal.querySelector('#btn-guardar-producto').addEventListener('click', async () => {
    if (!seleccionado) return mostrarMensaje('Debes seleccionar un producto válido', 'warning');
    const porcentaje = parseFloat(modal.querySelector('#input-porcentaje').value);
    if (isNaN(porcentaje)) return mostrarMensaje('Debes introducir un porcentaje válido', 'warning');

    try {
      await crearProductoEspecial({
        idProducto: Number(seleccionado.id_product),
        id_product_attribute: seleccionado.id_product_attribute || null,
        id_customer: clienteId,
        porcentaje
      });

      mostrarMensaje('Producto creado correctamente', 'success');
      modal.style.display = 'none';

      // Guardamos los datos antes de resetear seleccionado
      const productoCreado = {
        id_product: Number(seleccionado.id_product),
        id_product_attribute: seleccionado.id_product_attribute || null,
        porcentaje
      };

      // Limpiamos inputs
      inputBuscar.value = '';
      modal.querySelector('#input-porcentaje').value = '';
      seleccionado = null;

      // Llamamos al callback con los datos guardados
      onProductoCreado(productoCreado);

    } catch (err) {
      mostrarMensaje('Error al crear producto: ' + err.message, 'danger');
    }
  });

  modal.querySelector('#btn-cancelar-producto').addEventListener('click', () => {
    modal.style.display = 'none';
    inputBuscar.value = '';
    modal.querySelector('#input-porcentaje').value = '';
    seleccionado = null;
  });

  return {
    show: () => { modal.style.display = 'flex'; }
  };
}