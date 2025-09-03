// router.js
import { mostrarMensaje } from './utils/mensajes.js';
// Función para inicializar el router y escuchar cambios en la URL (hash)

export function initRouter() {
  // Escuchamos cuando el hash de la URL cambia (usuario pulsa atrás o adelante, o cambia manualmente)
  window.addEventListener('hashchange', () => {
    // Obtiene la parte de la URL después del '#' con slice(1), que quita el hash
    const path = window.location.hash.slice(1);

    // Llama a la función que se encarga de mostrar la vista correcta según la ruta
    handleRoute(path);
  });

  // Al cargar la página por primera vez, también renderizamos la vista según el hash actual
  const initialPath = window.location.hash.slice(1);
  if (initialPath) {
    handleRoute(initialPath);
  } else {
    handleRoute('/');  // Ruta por defecto
  }
}

// Función para cambiar la ruta navegando a una nueva vista en la SPA
export function navigateTo(path) {
  window.location.hash = path; // Esto dispara 'hashchange'
}

let isNavigating = false;

// Función principal que carga y renderiza la vista adecuada según la ruta
export async function handleRoute(path) {
  const root = document.querySelector('#sales-root');

  // Ignoramos rutas inválidas
  if (!path.startsWith('/') && path !== '') return;

  isNavigating = true;
  root.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulación de carga

  // ==========================
  // Ruta raíz: lista de comerciales
  // ==========================
  if (path === '/' || path === '') {
    const { fetchComerciales } = await import('./api/api.js');
    const { renderList } = await import('./views/listView.js');

    // Obtenemos comerciales (la función de api.js se encarga del cache)
    const comerciales = await fetchComerciales();

    renderList(root, comerciales, id => navigateTo(`/${id}`));
    isNavigating = false;
    return;
  }

  // ==========================
  // Ruta detalle de comercial: /{id}
  // ==========================
  if (path.match(/^\/\d+$/)) {
    const id = path.split('/').pop();
    const { fetchComerciales } = await import('./api/api.js');
    const { renderDetail } = await import('./views/detailView.js');

    const comerciales = await fetchComerciales();
    const comercial = comerciales.find(c => c.id_customer == id);

    if (!comercial) {
      root.innerHTML = `<p style="color: red; padding: 1rem;">No se encontró el comercial con ID ${id}</p>`;
      isNavigating = false;
      return;
    }

    renderDetail(root, comercial, () => navigateTo('/'));
    isNavigating = false;
    return;
  }

  // ==========================
  // Ruta productos de cliente: /productos/{clienteId}
  // ==========================
  if (path.match(/^\/productos\/\d+$/)) {
    const clienteId = path.split('/').pop();
    const { fetchPorcentajeProductosCliente, guardarPorcentajeEspecial } = await import('./api/api.js');
    const { renderProductosConPorcentaje } = await import('./views/productListView.js');

    // Inicializamos cache global si no existe
    if (!window._cacheProductos) window._cacheProductos = {};

    // Solo llamamos al backend si no hay cache
    if (!window._cacheProductos[clienteId]) {
      window._cacheProductos[clienteId] = await fetchPorcentajeProductosCliente(clienteId);
    }
    const productos = window._cacheProductos[clienteId];

    const onSave = async (idProducto, nuevoPorcentaje) => {
      try {
        // Pasamos clienteId para que la función invalide cache correctamente
        await guardarPorcentajeEspecial({
          idProductoCliente: idProducto,
          porcentaje: nuevoPorcentaje,
          clienteId
        });

        // Actualizamos cache local inmediatamente
        window._cacheProductos[clienteId] = await fetchPorcentajeProductosCliente(clienteId);

        mostrarMensaje('Porcentaje guardado correctamente.');
      } catch (err) {
        mostrarMensaje('Hubo un error al guardar el porcentaje: ' + err.message, 'danger');
      }
    };

    renderProductosConPorcentaje(root, productos, () => navigateTo('/'), clienteId, onSave);
    isNavigating = false;
    return;
  }
  // ==========================
  // Crear comercial: /create
  // ==========================
  if (path === '/create') {
    const { fetchTodosClientes, handleCreateComercial } = await import('./api/api.js');
    const { renderCreate } = await import('./views/modals/createComercialModal/createCommercialModal.js');

    const clientes = await fetchTodosClientes();
    renderCreate(clientes, handleCreateComercial, async (data) => {
      await handleCreateComercial(data);

      // Invalidamos cache de comerciales para refrescar lista
      const { invalidateComercialesCache, invalidateClientesCache } = await import('./api/api.js');
      invalidateComercialesCache();
      invalidateClientesCache();

      navigateTo('/');
    });

    isNavigating = false;
    return;
  }

  // ==========================
  // Asignar porcentaje a comercial: /{id}/asignarPorcentaje
  // ==========================
  if (path.match(/^\/\d+\/asignarPorcentaje$/)) {
    const idComercial = path.split('/')[1];
    const { renderClientesAsignados } = await import('./views/modals/clientesAsignadosModal/clientesAsignadosModal.js');

    await renderClientesAsignados(idComercial);
    isNavigating = false;
    return;
  }

  // Página no encontrada
  if (!isNavigating) root.innerHTML = '<p>Página no encontrada</p>';
}