export async function fetchComerciales() {
    const res = await fetch('/module/zonacomerciales/datos?obtener');
    if (!res.ok) throw new Error('Error fetching comerciales');
    return res.json();
}

export async function fetchPorcentajeClientes(idComercial) {
    console.log('[fetchPorcentajeClientes] idComercial:', idComercial);
    const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeClientesDelComercial=${idComercial}`);
    if (!res.ok) throw new Error('Error fetching porcentaje de clientes');
    const data = await res.json();
    console.log('[fetchPorcentajeClientes] response:', data);
    return data;
}

export async function fetchProductosConPorcentaje(clienteId) {
    console.log('[fetchProductosConPorcentaje] clienteId:', clienteId);
    const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeProductosClientes=${clienteId}`);
    if (!res.ok) throw new Error('Error fetching productos especiales');
    const data = await res.json();
    console.log('[fetchProductosConPorcentaje] response:', data);
    return data;
}


export async function createComercial(comercial) {
    const res = await fetch('/module/zonacomerciales/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(comercial),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear comercial');
    }

    return res.json();
}


