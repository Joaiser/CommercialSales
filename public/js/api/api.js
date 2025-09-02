export async function fetchComerciales() {
  const res = await fetch('/module/zonacomerciales/datos?obtener');
  if (!res.ok) throw new Error('Error fetching comerciales');
  return res.json();
}

export async function fetchPorcentajeClientes(idComercial) {
  const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeClientesDelComercial=${idComercial}`);

  // console.log('STATUS:', res.status);
  // console.log('HEADERS:', [...res.headers.entries()]);

  const rawText = await res.text();
  // console.log('[RAW RESPONSE]', rawText);

  if (!rawText) {
    return { id_customer: idComercial, porcentaje: 0 };
  }

  try {
    const data = JSON.parse(rawText);
    return data;
  } catch (error) {
    // console.error('Error al parsear JSON:', rawText);
    throw new Error('La respuesta no es JSON válido: ' + rawText);
  }
}


export async function handleCreateComercial(data, method = 'POST') {
  const payload = {
    id_customer: data.id_comercial,
    porcentaje: data.porcentaje_general,
    addcomercial: 1
  };

  const formBody = new URLSearchParams(payload).toString();

  const res = await fetch('/module/zonacomerciales/datos', {
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody
  });

  let responseData;

  try {
    responseData = await res.json();
  } catch (err) {
    throw new Error(`Respuesta no válida del servidor: ${err.message}`);
  }

  if (!res.ok && !responseData?.success) {
    throw new Error(`Error al crear comercial: ${res.status}`);
  }

  return responseData;
}

export async function deleteComercial(idComercial) {
  const formData = new URLSearchParams();
  formData.append('deleteComercial', idComercial);

  const response = await fetch('/module/zonacomerciales/datos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error('Error borrando comercial');
  }

  const data = await response.text();
  if (data !== 'deleted') {
    throw new Error('Error borrando comercial: respuesta inesperada');
  }

  return data;
}




export async function fetchTodosClientes() {
  const res = await fetch('/module/zonacomerciales/datos?sacarTodosLosClientes=1');
  if (!res.ok) throw new Error('Error fetching clientes');
  const data = await res.json();
  return data.map(cliente => ({
    id_customer: cliente.id_customer,
    firstname: cliente.firstname,
    lastname: cliente.lastname,
    id_comercial: cliente.id_comercial
  }));
}
export async function asignarPorcentajeCliente(idCliente, porcentaje) {
  const params = new URLSearchParams();
  params.append('id_customer', idCliente);
  params.append('porcentaje', porcentaje);
  params.append('addcliente', 1);

  const res = await fetch('/module/zonacomerciales/datos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    credentials: 'include',
  });

  const text = await res.text();

  // Intentamos parsear JSON sí o sí (porque ahora el backend devuelve JSON con info error)
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      success: false,
      error: `Respuesta no JSON del servidor: ${text.substring(0, 200)}...`
    };
  }

  if (!res.ok) {
    // Aquí retornamos el JSON con detalles del error que el backend manda
    return {
      success: false,
      error: data.message || `Error HTTP ${res.status}: respuesta inesperada`,
      details: data
    };
  }

  return data;
}

export async function fetchPorcentajeProductosCliente(idCliente) {
  const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeProductosClientes=${idCliente}`);

  const rawText = await res.text();

  //console.log('[DEBUG] Respuesta raw del backend:', rawText); 

  if (!rawText) return [];

  try {
    const data = JSON.parse(rawText);
    return data;
  } catch (error) {
    console.error('[ERROR] Al parsear JSON:', error);
    throw new Error('Respuesta inválida');
  }
}


export async function guardarPorcentajeEspecial({ idProductoCliente, porcentaje }) {
  try {
    const formData = new FormData();
    formData.append('modificarPorcentajeProductoAsignadoAunCliente', '1');
    formData.append('idProductoCliente', idProductoCliente);
    formData.append('porcentaje', porcentaje);

    const response = await fetch('/module/zonacomerciales/datos', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error al guardar el porcentaje: ${response.status} - ${text}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error en guardarPorcentajeEspecial:', error);
    throw error;
  }
}



export async function deleteCliente(id_customer) {
  const formData = new FormData();
  formData.append('deleteCliente_c', id_customer);

  const res = await fetch('/module/zonacomerciales/datos', {
    method: 'POST',
    body: formData
  });

  const text = await res.text();

  if (!res.ok || !text.includes('deleted')) {
    throw new Error('Error al borrar en el backend');
  }

  return text;
}



export async function deleteProductoEspecial({ idProductClienteId }) {
  const params = new URLSearchParams();
  params.append('id_productocliente', idProductClienteId);
  params.append('borrarPorcentajeProductoAsignadoAunCliente', 1);
  //console.log(idProductClienteId, 'params:', params.toString());


  const response = await fetch('/module/zonacomerciales/datos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Error eliminando producto: ${text}`);
  }

  try {
    const json = JSON.parse(text);
    if (!json.success) throw new Error('No se pudo eliminar');
    return json;
  } catch {
    throw new Error('Respuesta no válida del servidor');
  }
}



export async function crearProductoEspecial({ idProducto, id_product_attribute, id_customer, porcentaje }) {
  const formData = new FormData();
  formData.append('crearPorcentajeProductoAsignadoAunCliente', 1);
  formData.append('idProducto', idProducto);
  formData.append('id_product_attribute', id_product_attribute);
  formData.append('id_customer', id_customer);
  formData.append('porcentaje', porcentaje);

  const response = await fetch('/module/zonacomerciales/datos', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const text = await response.text();

  try {
    const data = JSON.parse(text);
    if (!response.ok || !data.success) {
      throw new Error(data.message || `Error HTTP ${response.status}`);
    }
    return data;
  } catch {
    throw new Error(`Respuesta no válida del servidor: ${text}`);
  }
}

export async function enviarInformeAlBackend(id, fecha_inicio, fecha_fin, esHistoricoCompleto) {
  const formData = new FormData();
  formData.append('crearInformeComercial', 1);
  formData.append('id_customer', id);

  if (esHistoricoCompleto) {
    formData.append('historico_completo', 1);
  } else {
    formData.append('fecha_inicio', fecha_inicio);
    formData.append('fecha_fin', fecha_fin);
    formData.append('historico_completo', 0);
  }

  const response = await fetch(`/module/zonacomerciales/informe?comercial=${id}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const text = await response.text();

  // Solo mostramos el mensaje del servidor, sin intentar parsear JSON
  console.log('Respuesta del servidor:', text);
  return text;
}
