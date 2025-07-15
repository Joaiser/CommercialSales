// router.js

// Función para inicializar el router y escuchar cambios en la URL (hash)
export function initRouter() {
    // Escuchamos cuando el hash de la URL cambia (usuario pulsa atrás o adelante, o cambia manualmente)
    window.addEventListener('hashchange', () => {
        // Obtiene la parte de la URL después del '#' (hash) sin el símbolo '#'
        // Por ejemplo, para URL: https://example.com/#/123, path será "/123"
        const path = window.location.hash.slice(1);

        // Llama a la función que se encarga de mostrar la vista correcta según la ruta
        handleRoute(path);
    });

    // Al cargar la página por primera vez, también renderizamos la vista según el hash actual
    const initialPath = window.location.hash.slice(1); // Si no hay hash, será cadena vacía
    handleRoute(initialPath || '/'); // Si no hay hash, carga la ruta raíz '/'
}

// Función para cambiar la ruta navegando a una nueva vista en la SPA
export function navigateTo(path) {
    // Cambia el hash de la URL (esto añade una nueva entrada en el historial)
    // Esto provoca que el navegador dispare el evento 'hashchange'
    window.location.hash = path;
}

// Función principal que carga y renderiza la vista adecuada según la ruta
export async function handleRoute(path) {
    const root = document.querySelector('#sales-root');
    root.innerHTML = '<p>Cargando...</p>'; // Mensaje mientras carga

    // Si la ruta es la raíz ('' o '/'), mostramos la lista de comerciales
    if (path === '/' || path === '') {
        // Importamos funciones bajo demanda para optimizar carga
        const { fetchComerciales } = await import('./api/api.js');
        const { renderList } = await import('./views/listView.js');

        // Obtenemos los comerciales vía API
        const comerciales = await fetchComerciales();

        // Renderizamos la lista, pasando la función que navega a detalle al hacer clic
        renderList(root, comerciales, id => navigateTo(`/${id}`));

    } else if (path.match(/^\/\d+$/)) { // Si la ruta es /{id} donde id es número
        const id = path.split('/').pop();

        const { fetchComerciales, fetchPedidosPorComercial } = await import('./api/api.js');
        const { renderDetail } = await import('./views/detailView.js');

        // Obtenemos la info del comercial y sus pedidos
        const comerciales = await fetchComerciales();
        const comercial = comerciales.find(c => c.id_customer == id);

        const pedidos = await fetchPedidosPorComercial(id);

        // Renderizamos la vista detalle con botón para volver (que navegará a '/')
        renderDetail(root, comercial, pedidos, () => navigateTo('/'));

    } else {
        // Ruta no reconocida => mostramos mensaje de error
        root.innerHTML = '<p>Página no encontrada</p>';
    }
}
