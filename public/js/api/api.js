export async function fetchComerciales() {
    const res = await fetch('/module/zonacomerciales/datos?obtener');
    if (!res.ok) throw new Error('Error fetching comerciales');
    return res.json();
}

export async function fetchPedidosPorComercial(idComercial) {
    const res = await fetch(`/module/zonacomerciales/pedidos?id=${idComercial}`);
    if (!res.ok) throw new Error('Error fetching pedidos');
    return res.json();
}
