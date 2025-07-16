export function renderList(root, comerciales, onVerMas) {
  root.innerHTML = `
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse: collapse; text-align: center;">
      <thead>
          <tr>
            <th style="text-align: center;">Comercial ID</th>
            <th style="text-align: center;">Porcentaje</th>
            <th style="text-align: center;">Acciones</th>
          </tr>
        </thead>
      <tbody>
        ${comerciales.map(c => `
          <tr>
            <td>${c.id_customer}</td>
            <td>${c.porcentaje_general}%</td>
            <td>
              <button class="btn-ver" data-id="${c.id_customer}">Ver más</button>
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
