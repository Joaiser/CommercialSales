export async function fetchComerciales() {
    const res = await fetch('/module/zonacomerciales/datos?obtener');
    if (!res.ok) throw new Error('Error fetching comerciales');
    return res.json();
}

export async function fetchPorcentajeClientes(idComercial) {
    const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeClientesDelComercial=${idComercial}`);
    if (!res.ok) throw new Error('Error fetching porcentaje de clientes');
    return res.json();
}