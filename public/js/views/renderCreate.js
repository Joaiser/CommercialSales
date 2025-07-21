import { fetchTodosClientes, handleCreateComercial } from '../api/api.js'
import { renderCreate } from './createCommercialModal.js'

export async function renderCreateView() {
    console.log('[renderCreateView] Inicio'); // log de entrada

    try {
        const clientes = await fetchTodosClientes();
        console.log('[renderCreateView] Clientes recibidos:', clientes);  // VER qué recibes

        renderCreate(clientes, handleCreateComercial);
        console.log('[renderCreateView] renderCreate llamado');
    } catch (error) {
        console.error('[renderCreateView] Error al obtener clientes:', error);
        alert('Error al cargar los clientes');
    }
}
