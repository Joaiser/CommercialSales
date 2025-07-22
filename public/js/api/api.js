export async function fetchComerciales() {
    const res = await fetch('/module/zonacomerciales/datos?obtener');
    if (!res.ok) throw new Error('Error fetching comerciales');
    return res.json();
}

export async function fetchPorcentajeClientes(idComercial) {
    const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeClientesDelComercial=${idComercial}`);
    const rawText = await res.text();

    console.log('[RAW RESPONSE]', rawText);

    if (!rawText) {
        // Si el backend no devuelve nada, devuelve algo por defecto
        return { id_customer: idComercial, porcentaje: 0 };
    }

    try {
        const data = JSON.parse(rawText);
        return data;
    } catch (error) {
        console.error('Error al parsear JSON:', rawText);
        throw new Error('La respuesta no es JSON válido: ' + rawText);
    }
}



export async function fetchProductosConPorcentaje(clienteId) {
    console.log('[fetchProductosConPorcentaje] clienteId:', clienteId);
    const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeProductosClientes=${clienteId}`);
    if (!res.ok) throw new Error('Error fetching productos especiales');
    const data = await res.json();
    console.log('[fetchProductosConPorcentaje] response:', data);
    return data;
}


export async function handleCreateComercial(data) {
    // data: { id_comercial: Number, porcentaje_general: Number }
    // Aquí conviertes los campos a lo que espera la API: id_customer y porcentaje
    const payload = {
        id_customer: data.id_comercial,
        porcentaje: data.porcentaje_general,
    };

    const res = await fetch('/module/zonacomerciales/datos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        // Opcional: puedes sacar el texto del error para más info
        const errorText = await res.text();
        throw new Error(`Error al crear comercial: ${res.status} - ${errorText}`);
    }

    const result = await res.json(); // o res.text() dependiendo del backend
    return result;
}


export async function fetchTodosClientes() {
    const res = await fetch('/module/zonacomerciales/datos?sacarTodosLosClientes=1');
    if (!res.ok) throw new Error('Error fetching clientes');
    const data = await res.json();
    // Aquí podrías filtrar para que solo devuelva lo que quieres, si quieres
    return data.map(cliente => ({
        id_customer: cliente.id_customer,
        firstname: cliente.firstname,
        lastname: cliente.lastname,
        id_comercial: cliente.id_comercial
    }));
}


