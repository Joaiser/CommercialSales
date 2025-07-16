export function renderList(root, comerciales, onVerMas) {
  root.innerHTML = `
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse: collapse;">
      <thead>
        <tr><th>Comercial ID</th><th>Porcentaje</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        ${comerciales.map(c => `
          <tr>
            <td>${c.id_customer}</td>
            <td>${c.porcentaje_general}%</td>
            <td style="display:flex; align-items:center; justify-content:center;">
              <button class="btn-ver" data-id="${c.id_customer}">Ver más</button>
              <!-- <button class="btn-mod" data-id="${c.id_customer}">Modificar</button> -->
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  root.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', () => onVerMas(btn.dataset.id));
  });

  // Comentamos por ahora hasta usar onModificar de forma formal
  // root.querySelectorAll('.btn-mod').forEach(btn => {
  //     btn.addEventListener('click', () => onModificar(btn.dataset.id));
  // });
}
