export async function fetchComerciales() {
  const res = await fetch('/module/zonacomerciales/datos?obtener');
  if (!res.ok) throw new Error('Error fetching comerciales');
  return res.json();
}

export async function fetchPorcentajeClientes(idComercial) {
  const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeClientesDelComercial=${idComercial}`);

  console.log('STATUS:', res.status);
  console.log('HEADERS:', [...res.headers.entries()]);

  const rawText = await res.text();
  console.log('[RAW RESPONSE]', rawText);

  if (!rawText) {
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
    responseData = await res.json(); // intenta parsear el JSON, aunque sea 500
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
  // Aquí podrías filtrar para que solo devuelva lo que quieres, si quieres
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
  if (!rawText) return [];

  try {
    const data = JSON.parse(rawText);
    return data;
  } catch (error) {
    console.error('Error al parsear JSON:', rawText);
    throw new Error('Respuesta inválida');
  }
}

export async function guardarPorcentajeEspecial({ idProducto, clienteId, porcentaje }) {
  try {
    const response = await fetch('/modules/tu_modulo/ajax/save-porcentaje.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idProducto, clienteId, porcentaje }),
    });

    if (!response.ok) {
      throw new Error('Error al guardar el porcentaje');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en guardarPorcentajeEspecial:', error);
    throw error;
  }
}

export async function deleteCliente(idCliente) {
  const formData = new URLSearchParams();
  formData.append('deleteCliente', idCliente);

  console.log('[deleteCliente] Enviando:', formData.toString());

  const response = await fetch('/module/zonacomerciales/datos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const text = await response.text();
  console.log('[deleteCliente] Respuesta cruda:', text);

  if (!response.ok) {
    throw new Error('Error al borrar cliente');
  }

  if (text !== 'deleted') {
    throw new Error('Error inesperado al borrar cliente: ' + text);
  }

  return text;
}
