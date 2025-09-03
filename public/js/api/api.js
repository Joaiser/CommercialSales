import { cache } from '../cache/cache.js';

export async function fetchComerciales() {
  // Si ya tenemos cache, la devolvemos
  if (cache.comerciales) return cache.comerciales;

  const res = await fetch('/module/zonacomerciales/datos?obtener');
  if (!res.ok) throw new Error('Error fetching comerciales');

  const data = await res.json();

  // Guardamos en cache centralizado
  cache.comerciales = data;

  return data;
}

// Si necesitamos forzar refresco de cache
export function invalidateComercialesCache() {
  cache.comerciales = null;
}

export async function fetchPorcentajeClientes(idComercial) {
  // Si ya tenemos cache, la devolvemos
  if (cache.porcentajeClientes[idComercial]) {
    return cache.porcentajeClientes[idComercial];
  }

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
    cache.porcentajeClientes[idComercial] = data; // Guardamos en cache
    return data;
  } catch (error) {
    // console.error('Error al parsear JSON:', rawText);
    throw new Error('La respuesta no es JSON válido: ' + rawText);
  }
}

// Si necesitas forzar refresco de cache de porcentajes
export function invalidatePorcentajeClientesCache(idComercial = null) {
  if (idComercial) {
    delete cache.porcentajeClientes[idComercial];
  } else {
    cache.porcentajeClientes = {};
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

  cache.comerciales = null;
  invalidatePorcentajeClientesCache();

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

  cache.comerciales = null;
  invalidatePorcentajeClientesCache();

  return data;
}




export async function fetchTodosClientes() {
  if (cache.clientes) return cache.clientes;
  const res = await fetch('/module/zonacomerciales/datos?sacarTodosLosClientes=1');
  if (!res.ok) throw new Error('Error fetching clientes');
  const data = await res.json();
  const clientesFiltrados = data.map(cliente => ({
    id_customer: cliente.id_customer,
    firstname: cliente.firstname,
    lastname: cliente.lastname,
    id_comercial: cliente.id_comercial
  }));

  cache.clientes = data;
  return clientesFiltrados;
}

// Funcion para invalidar el cache de clientes
export function invalidateClientesCache() {
  cache.clientes = null;
  cache.porcentajeClientes = {};
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

  //actualizamos el cache de clientes
  if (cache.clientes) {
    const clienteIndex = cache.clientes.findIndex(c => c.id_customer === idCliente);
    if (clienteIndex !== -1) {
      cache.clientes[clienteIndex].porcentaje = porcentaje;
    }
  }

  //Actualizamos cache de porcentajeClientes por idComercial
  for (const idComercial in cache.porcentajeClientes) {
    const clientes = cache.porcentajeClientes[idComercial];
    if (Array.isArray(clientes)) {
      const cliIndex = clientes.findIndex(c => c.id_customer === idCliente);
      if (cliIndex !== -1) {
        clientes[cliIndex].porcentaje = porcentaje;
      }
    } else if (clientes?.id_customer === idCliente) {
      cache.porcentajeClientes[idComercial].porcentaje = porcentaje;
    }
  }


  return data;
}

export async function fetchPorcentajeProductosCliente(idCliente) {
  //si ya tenemos cache, lo devolvemos
  if (cache.productosPorCliente[idCliente]) {
    return cache.productosPorCliente[idCliente];
  }

  const res = await fetch(`/module/zonacomerciales/datos?sacarPorcentajeProductosClientes=${idCliente}`);

  const rawText = await res.text();

  //console.log('[DEBUG] Respuesta raw del backend:', rawText); 

  if (!rawText) return [];

  let data;

  try {
    data = JSON.parse(rawText);
  } catch (error) {
    // console.error('[ERROR] Al parsear JSON:', error);
    throw new Error('Respuesta inválida');
  }
  cache.productosPorCliente[idCliente] = data; // Guardamos en cache

  return data;
}

// Función para invalidar cache de productos de un cliente específico o todos
export function invalidateProductosPorClienteCache(idCliente = null) {
  if (idCliente) {
    delete cache.productosPorCliente[idCliente];
  } else {
    cache.productosPorCliente = {};
  }
}


export async function guardarPorcentajeEspecial({ idProductoCliente, porcentaje, clienteId = null }) {
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
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Invalidamos cache solo si nos pasaron clienteId
    if (clienteId) invalidateProductosPorClienteCache(clienteId);

    return data;
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

  //limpiamos cache
  invalidateClientesCache();
  invalidatePorcentajeClientesCache(id_customer);

  return text;
}



export async function deleteProductoEspecial({ idProductClienteId, clienteId }) {
  const params = new URLSearchParams();
  params.append('id_productocliente', idProductClienteId);
  params.append('borrarPorcentajeProductoAsignadoAunCliente', 1);

  const response = await fetch('/module/zonacomerciales/datos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const text = await response.text();

  // Si no es OK, lanzar error
  if (!response.ok) {
    throw new Error(`Error eliminando producto: ${text}`);
  }

  // Intentamos parsear JSON, pero si no es JSON, devolvemos el texto
  try {
    const json = JSON.parse(text);
    if (!json.success) throw new Error(json.message || 'No se pudo eliminar');
    if (clienteId) invalidateProductosPorClienteCache(clienteId);
    return json;
  } catch {
    // Solo log para debug, devolvemos éxito si llegamos aquí y la respuesta no es JSON
    console.warn('Respuesta del servidor no es JSON, se devuelve texto:', text);
    return { success: true, message: text };
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
    invalidateProductosPorClienteCache(id_customer);
    return data;
  } catch {
    throw new Error(`Respuesta no válida del servidor: ${text}`);
  }
}

export async function enviarInformeAlBackend(id, fecha_inicio, fecha_fin, esHistoricoCompleto) {
  const formData = new FormData();
  formData.append('crearInformeComercial', 1);
  formData.append('comercial', id);

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

  const text = await response.text(); // 👈 aquí tenemos HTML con info

  // Log informativo para debug
  console.log("Respuesta del backend:", text);

  // Intentamos extraer la ruta del PDF del HTML que devolvió el backend
  const match = text.match(/<code>([^<]+\.pdf)<\/code>/i);
  if (!match) {
    console.error("No se encontró la ruta del PDF en la respuesta");
    throw new Error("No se encontró la ruta del PDF en la respuesta");
  }

  const pdfPath = match[1];
  const pdfUrl = pdfPath.replace('/var/www/vhosts/test3.salamandraluz.net/httpdocs', '');

  // Ahora sí, descargamos el PDF
  const pdfResponse = await fetch(pdfUrl, { method: 'GET', credentials: 'include' });
  if (!pdfResponse.ok) {
    throw new Error('Error al descargar PDF');
  }

  const blob = await pdfResponse.blob();

  // Crear enlace temporal para descargar
  const urlBlob = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlBlob;
  a.download = `informe_comercial_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(urlBlob);

  console.log('Informe PDF descargado correctamente.');
}
