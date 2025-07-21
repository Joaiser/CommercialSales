// router.js

// Función para inicializar el router y escuchar cambios en la URL (hash)
export function initRouter() {
    // Escuchamos cuando el hash de la URL cambia (usuario pulsa atrás o adelante, o cambia manualmente)
    window.addEventListener('hashchange', () => {
        // Obtiene la parte de la URL después del '#' con slice(1), que quita el hash. Entonces, obtenemos, la url quitando el hash (hash) sin el símbolo '#'
        // El hash(#) no se envia al servidor, con lo cual, el servidor no recibe nada a partir del #, solo lo anterior, por lo que tenemos una SPA
        // Por ejemplo, para URL: https://example.com/#/123, path será "/123"
        const path = window.location.hash.slice(1);

        // Llama a la función que se encarga de mostrar la vista correcta según la ruta
        handleRoute(path);
    });

    // Al cargar la página por primera vez, también renderizamos la vista según el hash actual
    const initialPath = window.location.hash.slice(1); // Si no hay hash, será cadena vacía
    if (initialPath) {
        handleRoute(initialPath);
    } else {
        handleRoute('/');  // O la ruta por defecto que quieras
    }
}

// Función para cambiar la ruta navegando a una nueva vista en la SPA
export function navigateTo(path) {
    // Cambia el hash de la URL (esto añade una nueva entrada en el historial)
    // Esto provoca que el navegador dispare el evento 'hashchange'
    window.location.hash = path;
}

let isNavigating = false;

// Función principal que carga y renderiza la vista adecuada según la ruta
export async function handleRoute(path) {
    console.log('handleRoute path:', path);

    const root = document.querySelector('#sales-root');

    // Ignoramos rutas que no vienen del hash (por seguridad)
    if (!path.startsWith('/') && path !== '') {
        console.warn('Ruta inválida ignorada:', path);
        return;
    }

    isNavigating = true;
    root.innerHTML = '<p>Cargando...</p>'; // Mensaje mientras carga
    await new Promise(resolve => setTimeout(resolve, 150))

    // Si la ruta es la raíz ('' o '/'), mostramos la lista de comerciales
    if (path === '/' || path === '') {
        // Importamos funciones bajo demanda para optimizar carga
        const { fetchComerciales } = await import('./api/api.js');
        const { renderList } = await import('./views/listView.js');

        // Obtenemos los comerciales vía API
        const comerciales = await fetchComerciales();

        // Renderizamos la lista, pasando la función que navega a detalle al hacer clic
        renderList(root, comerciales, id => navigateTo(`/${id}`));
        isNavigating = false;
        return;

    } else if (path.match(/^\/\d+$/)) { // Si la ruta es /{id} donde id es número
        const id = path.split('/').pop();

        const { fetchComerciales } = await import('./api/api.js');
        const { renderDetail } = await import('./views/detailView.js');

        // Obtenemos la info del comercial
        const comerciales = await fetchComerciales();
        const comercial = comerciales.find(c => c.id_customer == id);

        // Renderizamos la vista detalle con botón para volver (que navegará a '/')
        renderDetail(root, comercial, () => navigateTo('/'));
        isNavigating = false;
        return;

    } else if (path.match(/^\/productos\/\d+$/)) {
        const clienteId = path.split('/').pop();

        const { fetchProductosConPorcentaje } = await import('./api/api.js');
        const { renderProductosConPorcentaje } = await import('./views/productListView.js');

        const productos = await fetchProductosConPorcentaje(clienteId);
        renderProductosConPorcentaje(root, productos, () => navigateTo(`/`));

        isNavigating = false;
        return;
    } else if (path === '/create') {
        const { fetchTodosClientes } = await import('./api/api.js');
        const { renderCreate } = await import('./views/createCommercialModal.js');

        const clientes = await fetchTodosClientes();

        // Aquí deberías pasar el contenedor donde poner el modal, por ejemplo body o un div modal-root
        renderCreate(clientes, async (data) => {
            const { createComercial } = await import('./api/api.js');
            await createComercial(data);
            // tras crear, navegar a lista
            navigateTo('/');
        });

        isNavigating = false;
        return;
    }




    if (!isNavigating) {
        root.innerHTML = '<p>Página no encontrada</p>'
    }
}
