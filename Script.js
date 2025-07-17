// === script.js ===
const ramos = [
  { codigo: 'CP03', nombre: 'Contabilidad Elemental', abre: ['CP07'] },
  { codigo: 'CP04', nombre: 'Matemática I', abre: ['CP08'] },
  { codigo: 'CP05', nombre: 'Administración I', abre: ['CP10'] },
  { codigo: 'CP06', nombre: 'Introducción a la Economía', abre: [] },
  { codigo: 'CP07', nombre: 'Contabilidad Básica', abre: ['CP11'] },
  { codigo: 'CP08', nombre: 'Matemática II', abre: ['CP12'] },
  { codigo: 'CP09', nombre: 'Ciencias Sociales', abre: ['CP13'] },
  { codigo: 'CP10', nombre: 'Administración II', abre: ['CP15-2'] },
  { codigo: 'CP11', nombre: 'Contabilidad Superior I', abre: ['CP16'] },
  { codigo: 'CP12', nombre: 'Estadística', abre: ['CP22'] },
  { codigo: 'CP13', nombre: 'Derecho Privado', abre: ['CP17'] },
  { codigo: 'CP14', nombre: 'Microeconomía', abre: ['CP18'] },
  { codigo: 'CP15-2', nombre: 'Tecnologías Información', abre: ['CP21'] },
  { codigo: 'CP16', nombre: 'Contabilidad Sup. II', abre: ['CP19'] },
  { codigo: 'CP17', nombre: 'Derecho Público', abre: ['CP23'] },
  { codigo: 'CP18', nombre: 'Macroeconomía', abre: ['CP20'] },
  { codigo: 'CP19', nombre: 'Contabilidad Sup. III', abre: ['CP25','CP27','CP33'] },
  { codigo: 'CP20', nombre: 'Finanzas Públicas', abre: ['CP28','CP34'] },
  { codigo: 'CP21', nombre: 'Sistemas Información', abre: [] },
  { codigo: 'CP22', nombre: 'Cálculo Financiero', abre: ['CP24'] },
  { codigo: 'CP23', nombre: 'Derecho Laboral', abre: ['CP29'] },
  { codigo: 'CP24', nombre: 'Admin. Financiera', abre: [] },
  { codigo: 'CP25', nombre: 'Costos', abre: ['CP30'] },
  { codigo: 'CP26', nombre: 'Historia Económica', abre: [] },
  { codigo: 'CP27', nombre: 'Análisis Estados', abre: [] },
  { codigo: 'CP28', nombre: 'Impuestos I', abre: ['CP31'] },
  { codigo: 'CP29', nombre: 'Derecho Societario', abre: ['CP32'] },
  { codigo: 'CP30', nombre: 'Contab. Gestión', abre: [] },
  { codigo: 'CP31', nombre: 'Impuestos II', abre: ['CP39','CP40'] },
  { codigo: 'CP32', nombre: 'Derecho Concursal', abre: ['CP37'] },
  { codigo: 'CP33', nombre: 'Auditoría I', abre: ['CP35'] },
  { codigo: 'CP34', nombre: 'Contab. Gubernamental', abre: [] },
  { codigo: 'CP35', nombre: 'Auditoría II', abre: ['CP39','CP40'] },
  { codigo: 'CP36', nombre: 'Metodología', abre: ['CP40'] },
  { codigo: 'CP37', nombre: 'Taller Jurídico', abre: [] },
  { codigo: 'CP38', nombre: 'Electiva I', abre: [] },
  { codigo: 'CP39', nombre: 'Práctica Profesional', abre: [] },
  { codigo: 'CP40', nombre: 'Seminario Contable', abre: [] },
  { codigo: 'CP41', nombre: 'Electiva II', abre: [] },
];

const estadoRamos = {};
const malla = document.getElementById('malla');

ramos.forEach(ramo => {
  estadoRamos[ramo.codigo] = { aprobado: false, bloqueado: ramo.abre.length > 0 };
});

function crearRamoHTML(ramo) {
  const div = document.createElement('div');
  div.className = 'ramo bloqueado';
  div.innerHTML = `<strong>${ramo.codigo}</strong><br>${ramo.nombre}`;
  div.id = ramo.codigo;
  div.addEventListener('click', () => toggleRamo(ramo));
  malla.appendChild(div);

  if (ramo.abre.length === 0) {
    div.classList.remove('bloqueado');
  }
}

function toggleRamo(ramo) {
  const div = document.getElementById(ramo.codigo);
  if (div.classList.contains('bloqueado') || estadoRamos[ramo.codigo].aprobado) return;

  div.classList.add('aprobado');
  estadoRamos[ramo.codigo].aprobado = true;

  ramos.forEach(r => {
    if (r.abre.includes(ramo.codigo)) return; // no desbloqueamos hacia atrás
    const requisitos = ramos.filter(pre => r.abre.includes(pre.codigo));
    if (requisitos.every(pre => estadoRamos[pre.codigo]?.aprobado)) {
      document.getElementById(r.codigo).classList.remove('bloqueado');
    }
  });
}

ramos.forEach(crearRamoHTML);
