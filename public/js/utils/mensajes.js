// utils/mensajes.js
export function mostrarMensaje(texto, tipo = 'success') {
  if (texto.length > 200) {
    texto = texto.slice(0, 200) + '...';
  }
  const mensajeEstado = document.querySelector('#mensajeEstado');
  if (!mensajeEstado) {
    console.warn('No existe el contenedor #mensajeEstado para mostrar mensajes');
    return;
  }
  mensajeEstado.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${texto}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
  setTimeout(() => {
    const alert = mensajeEstado.querySelector('.alert');
    if (alert) {
      const bsAlert = bootstrap.Alert.getInstance(alert);
      if (bsAlert) bsAlert.close();
      else alert.remove();
    }
  }, 8000);
}
