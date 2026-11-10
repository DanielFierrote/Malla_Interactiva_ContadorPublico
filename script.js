document.addEventListener('DOMContentLoaded', function () {
    const CLAVE_ESTADO = 'estadoMaterias';   // misma clave que la versión anterior: tu progreso se mantiene
    const CLAVE_DATOS = 'mallaDatos';
    const CLAVE_GUIA = 'mallaGuia';
    const CLAVE_NOTAS = 'notasMaterias';

    const malla = document.getElementById('malla');
    const puedeHover = window.matchMedia('(hover: hover)').matches;

    const CLAVE_FECHA = 'mallaActualizado';
    const CLAVE_GH = 'mallaGitHub';

    let datos, estadoMaterias, notas;
    cargarTodo();
    let github = leer(CLAVE_GH, null) || configGitHubPorDefecto();
    let timerGitHub = null;
    let subiendo = false, pendienteSubir = false;
    let guiaActiva = leer(CLAVE_GUIA, true);
    let marcada = null;          // materia resaltada por la guía

    /* ================= Utilidades ================= */

    function leer(clave, porDefecto) {
        try {
            const v = localStorage.getItem(clave);
            return v === null ? porDefecto : JSON.parse(v);
        } catch (e) { return porDefecto; }
    }
    function escribir(clave, valor) {
        try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { }
    }
    function esc(t) {
        return String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function copiar(o) { return JSON.parse(JSON.stringify(o)); }

    // Usa lo guardado en este navegador, salvo que datos.js (GitHub) sea más nuevo.
    function cargarTodo() {
        const base = window.MALLA_DATOS ? copiar(window.MALLA_DATOS) : { titulo: 'Mi carrera', anios: [] };
        const fechaLocal = leer(CLAVE_FECHA, 0);
        const localDatos = leer(CLAVE_DATOS, null);
        if ((base.actualizado || 0) > fechaLocal) {
            datos = base;
            estadoMaterias = { ...(base.estado || {}) };
            notas = { ...(base.notas || {}) };
            escribir(CLAVE_FECHA, base.actualizado || 0);
            try { localStorage.removeItem(CLAVE_DATOS); } catch (e) { }
            escribir(CLAVE_ESTADO, estadoMaterias);
            escribir(CLAVE_NOTAS, notas);
        } else {
            datos = localDatos && Array.isArray(localDatos.anios) ? localDatos : base;
            estadoMaterias = leer(CLAVE_ESTADO, null) || { ...(base.estado || {}) };
            notas = leer(CLAVE_NOTAS, null) || { ...(base.notas || {}) };
        }
    }
    function marcarCambio() {
        const ahora = Date.now();
        datos.actualizado = ahora;
        escribir(CLAVE_FECHA, ahora);
        if (github.auto && github.token) programarGitHub(4000);
    }
    function guardarDatos() {
        escribir(CLAVE_DATOS, datos);
        marcarCambio();
    }
    function guardarEstado() { escribir(CLAVE_ESTADO, estadoMaterias); escribir(CLAVE_DATOS, datos); marcarCambio(); }
    function guardarNotas() { escribir(CLAVE_NOTAS, notas); escribir(CLAVE_DATOS, datos); marcarCambio(); }
    function textoNota(n) { return String(Math.round(n * 100) / 100).replace('.', ','); }

    function todasLasMaterias() {
        const lista = [];
        datos.anios.forEach(a => a.cuatrimestres.forEach(c => c.materias.forEach(m => lista.push(m))));
        return lista;
    }
    function buscarMateria(codigo) { return todasLasMaterias().find(m => m.codigo === codigo); }
    function ubicacionDe(codigo) {
        for (const a of datos.anios) for (const c of a.cuatrimestres) {
            const i = c.materias.findIndex(m => m.codigo === codigo);
            if (i >= 0) return { anio: a, cuatri: c, indice: i };
        }
        return null;
    }
    function habilitaA(codigo) {
        return todasLasMaterias().filter(m => (m.requiere || []).includes(codigo)).map(m => m.codigo);
    }

    /* ================= Malla ================= */

    function dibujarMalla() {
        document.getElementById('titulo').textContent = datos.titulo;
        document.title = 'Malla Interactiva ' + datos.titulo;
        malla.innerHTML = datos.anios.map(a => `
            <div class="modulo">
                <h2>${esc(a.nombre)}</h2>
                ${a.cuatrimestres.map(c => `
                    <div class="cuatrimestre">
                        <h3>${esc(c.nombre)}</h3>
                        ${c.materias.map(m => `<div class="materia" data-codigo="${esc(m.codigo)}">${esc(m.nombre)} (${esc(m.codigo)})<span class="nota-materia"></span></div>`).join('')}
                    </div>`).join('')}
            </div>`).join('');
        actualizarDesbloqueos();
        actualizarProgreso();
        if (marcada) resaltar(marcada);
    }

    function actualizarDesbloqueos() {
        const materias = todasLasMaterias();
        materias.forEach(m => {
            const req = m.requiere || [];
            let e = estadoMaterias[m.codigo] || 'bloqueada';
            const cumplidas = req.every(r => estadoMaterias[r] === 'aprobada');
            if (e !== 'aprobada') e = cumplidas ? 'desbloqueada' : 'bloqueada';
            estadoMaterias[m.codigo] = e;
        });
        malla.querySelectorAll('.materia').forEach(div => {
            div.classList.remove('bloqueada', 'desbloqueada', 'aprobada');
            div.classList.add(estadoMaterias[div.dataset.codigo]);
            const n = notas[div.dataset.codigo];
            div.querySelector('.nota-materia').textContent =
                estadoMaterias[div.dataset.codigo] === 'aprobada' && n != null ? textoNota(n) : '';
        });
    }

    function actualizarProgreso() {
        const materias = todasLasMaterias();
        const aprobadas = materias.filter(m => estadoMaterias[m.codigo] === 'aprobada').length;
        const porcentaje = materias.length ? ((aprobadas / materias.length) * 100).toFixed(1) : '0.0';
        document.getElementById('porcentaje').innerText = `${porcentaje}%`;
        const valores = materias.filter(m => estadoMaterias[m.codigo] === 'aprobada' && notas[m.codigo] != null).map(m => notas[m.codigo]);
        const prom = document.getElementById('promedio');
        prom.hidden = !valores.length;
        if (valores.length) document.getElementById('promedio-valor').innerText = textoNota(valores.reduce((a, b) => a + b, 0) / valores.length);
    }

    // Click: una materia disponible pasa a aprobada; una aprobada vuelve a disponible.
    malla.addEventListener('click', function (ev) {
        const div = ev.target.closest('.materia');
        if (!div) return;
        const codigo = div.dataset.codigo;

        // En el celu, con la guía activa, el primer toque muestra las correlativas y el segundo marca la materia
        if (guiaActiva && !puedeHover && marcada !== codigo) {
            resaltar(codigo);
            return;
        }

        const e = estadoMaterias[codigo];
        if (e === 'bloqueada') {
            div.classList.remove('sacudir'); void div.offsetWidth; div.classList.add('sacudir');
            if (guiaActiva) resaltar(codigo);
            return;
        }
        estadoMaterias[codigo] = e === 'aprobada' ? 'desbloqueada' : 'aprobada';
        actualizarDesbloqueos();
        actualizarProgreso();
        guardarEstado();
        if (guiaActiva) resaltar(codigo);
    });

    /* ================= Guía de correlativas ================= */

    function resaltar(codigo) {
        marcada = codigo;
        malla.querySelectorAll('.materia').forEach(d => d.classList.remove('foco', 'req', 'abre'));
        if (!codigo || !guiaActiva) { malla.classList.remove('con-guia'); marcada = null; return; }
        const m = buscarMateria(codigo);
        if (!m) return;
        malla.classList.add('con-guia');
        const marcar = (c, clase) => { const d = malla.querySelector(`.materia[data-codigo="${CSS.escape(c)}"]`); if (d) d.classList.add(clase); };
        marcar(codigo, 'foco');
        (m.requiere || []).forEach(c => marcar(c, 'req'));
        habilitaA(codigo).forEach(c => marcar(c, 'abre'));
    }

    if (puedeHover) {
        malla.addEventListener('mouseover', ev => {
            if (!guiaActiva) return;
            const div = ev.target.closest('.materia');
            if (div) resaltar(div.dataset.codigo);
        });
        malla.addEventListener('mouseleave', () => resaltar(null));
    } else {
        document.addEventListener('click', ev => { if (!ev.target.closest('.materia')) resaltar(null); });
    }

    const btnGuia = document.getElementById('btn-guia');
    function pintarBotonGuia() {
        btnGuia.setAttribute('aria-pressed', guiaActiva);
        btnGuia.textContent = 'Guía de correlativas: ' + (guiaActiva ? 'activada' : 'desactivada');
        btnGuia.classList.toggle('apagado', !guiaActiva);
        document.getElementById('ayuda-guia').hidden = !guiaActiva;
    }
    btnGuia.addEventListener('click', () => {
        guiaActiva = !guiaActiva;
        escribir(CLAVE_GUIA, guiaActiva);
        resaltar(null);
        pintarBotonGuia();
    });

    /* ================= Administrar ================= */

    const capa = document.getElementById('admin');
    const contenido = document.getElementById('admin-contenido');
    let corrAbierta = null;   // materia cuyo listado de correlativas está abierto

    document.getElementById('btn-admin').addEventListener('click', abrirAdmin);
    document.getElementById('admin-cerrar').addEventListener('click', cerrarAdmin);
    capa.addEventListener('mousedown', ev => { if (ev.target === capa) cerrarAdmin(); });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !capa.hidden) cerrarAdmin(); });

    function abrirAdmin() {
        capa.hidden = false;
        document.body.classList.add('sin-scroll');
        dibujarAdmin();
    }
    function cerrarAdmin() {
        capa.hidden = true;
        document.body.classList.remove('sin-scroll');
        corrAbierta = null;
    }

    function cambio() {
        guardarDatos();
        dibujarMalla();
        dibujarAdmin();
    }

    function dibujarAdmin() {
        const scroll = contenido.scrollTop;
        const destinos = [];
        datos.anios.forEach((a, ai) => a.cuatrimestres.forEach((c, ci) => destinos.push({ v: ai + '-' + ci, t: a.nombre + ' · ' + c.nombre })));

        contenido.innerHTML = `
            <section class="admin-seccion">
                <h3>General</h3>
                <label class="etiqueta" for="ad-titulo">Nombre de la carrera</label>
                <input class="campo" id="ad-titulo" value="${esc(datos.titulo)}">
            </section>

            <section class="admin-seccion">
                <h3>Años, cuatrimestres y materias</h3>
                <p class="nota">Cambiá nombres y códigos escribiendo encima. Con ↑ ↓ ordenás, con “Mover a” la pasás a otro cuatrimestre.</p>
                ${datos.anios.map((a, ai) => `
                    <div class="ad-anio">
                        <div class="fila">
                            <input class="campo campo-anio" data-anio="${ai}" value="${esc(a.nombre)}" aria-label="Nombre del año">
                            <button type="button" class="btn-icono" data-acc="anio-subir" data-a="${ai}" ${ai === 0 ? 'disabled' : ''} aria-label="Subir año">↑</button>
                            <button type="button" class="btn-icono" data-acc="anio-bajar" data-a="${ai}" ${ai === datos.anios.length - 1 ? 'disabled' : ''} aria-label="Bajar año">↓</button>
                            <button type="button" class="btn-icono btn-borrar" data-acc="anio-borrar" data-a="${ai}" aria-label="Borrar año">🗑</button>
                        </div>
                        ${a.cuatrimestres.map((c, ci) => `
                            <div class="ad-cuatri">
                                <div class="fila">
                                    <input class="campo campo-cuatri" data-anio="${ai}" data-cuatri="${ci}" value="${esc(c.nombre)}" aria-label="Nombre del cuatrimestre">
                                    <button type="button" class="btn-icono btn-borrar" data-acc="cuatri-borrar" data-a="${ai}" data-c="${ci}" aria-label="Borrar cuatrimestre">🗑</button>
                                </div>
                                ${c.materias.map((m, mi) => filaMateria(m, ai, ci, mi, c.materias.length, destinos)).join('')}
                                <button type="button" class="btn-agregar" data-acc="materia-nueva" data-a="${ai}" data-c="${ci}">+ Agregar materia</button>
                            </div>`).join('')}
                        <button type="button" class="btn-agregar" data-acc="cuatri-nuevo" data-a="${ai}">+ Agregar cuatrimestre</button>
                    </div>`).join('')}
                <button type="button" data-acc="anio-nuevo">+ Agregar año</button>
            </section>

            <section class="admin-seccion">
                <h3>Mis notas</h3>
                ${seccionNotas()}
            </section>

            <section class="admin-seccion">
                <h3>Guardar en GitHub</h3>
                <p class="nota">Con esto, lo que cambiás se sube a tu página de GitHub y se ve igual en cualquier compu o celu (tarda 1 o 2 minutos en aparecer). Se configura una vez en cada dispositivo.</p>
                <div class="ad-github">
                    <label class="etiqueta" for="gh-usuario">Usuario de GitHub</label>
                    <input class="campo" id="gh-usuario" value="${esc(github.usuario)}" placeholder="ej: juanperez" autocomplete="off">
                    <label class="etiqueta" for="gh-repo">Nombre del repositorio</label>
                    <input class="campo" id="gh-repo" value="${esc(github.repo)}" placeholder="ej: malla" autocomplete="off">
                    <label class="etiqueta" for="gh-token">Token de acceso</label>
                    <input class="campo" id="gh-token" type="password" value="${esc(github.token)}" placeholder="github_pat_…" autocomplete="off">
                </div>
                <label class="check"><input type="checkbox" id="gh-auto" ${github.auto ? 'checked' : ''}> Guardar en GitHub automáticamente cada vez que cambio algo</label>
                <div class="fila">
                    <button type="button" data-acc="gh-guardar">Guardar en GitHub ahora</button>
                    <button type="button" class="btn-suave" data-acc="exportar">Descargar datos.js</button>
                    <label class="boton-archivo">Cargar un datos.js<input type="file" id="ad-importar" accept=".js,.json" hidden></label>
                </div>
                <p class="nota" id="ad-mensaje" role="status"></p>
            </section>

            <section class="admin-seccion">
                <h3>Empezar de nuevo</h3>
                <div class="fila">
                    <button type="button" class="btn-suave" data-acc="reiniciar-progreso">Desmarcar todas las materias y notas</button>
                    <button type="button" class="btn-suave" data-acc="descartar">Descartar cambios y volver a datos.js</button>
                </div>
            </section>`;
        contenido.scrollTop = scroll;
    }

    function seccionNotas() {
        const aprobadas = todasLasMaterias().filter(m => estadoMaterias[m.codigo] === 'aprobada');
        if (!aprobadas.length) return '<p class="nota">Cuando apruebes materias (haciendo clic en la malla), aparecen acá para cargarles la nota.</p>';
        return '<p class="nota">Solo aparecen las materias aprobadas. La nota se ve en la malla y se usa para el promedio.</p>' +
            '<div class="ad-notas">' + aprobadas.map(m => `
                <label class="fila-nota">
                    <span>${esc(m.nombre)} <small>(${esc(m.codigo)})</small></span>
                    <input class="campo campo-nota" type="number" min="1" max="10" step="0.01" inputmode="decimal"
                        data-cod="${esc(m.codigo)}" value="${notas[m.codigo] != null ? notas[m.codigo] : ''}" placeholder="—">
                </label>`).join('') + '</div>';
    }

    function filaMateria(m, ai, ci, mi, total, destinos) {
        const req = m.requiere || [];
        const abierta = corrAbierta === m.codigo;
        return `
            <div class="ad-materia">
                <div class="fila fila-materia">
                    <input class="campo campo-nombre" data-cod="${esc(m.codigo)}" value="${esc(m.nombre)}" aria-label="Nombre de la materia">
                    <input class="campo campo-codigo" data-cod="${esc(m.codigo)}" value="${esc(m.codigo)}" aria-label="Código">
                    <button type="button" class="btn-suave btn-corr${abierta ? ' activo' : ''}" data-acc="corr" data-cod="${esc(m.codigo)}">Correlativas (${req.length})</button>
                    <select class="campo campo-mover" data-cod="${esc(m.codigo)}" aria-label="Mover a">
                        <option value="">Mover a…</option>
                        ${destinos.map(d => `<option value="${d.v}" ${d.v === ai + '-' + ci ? 'disabled' : ''}>${esc(d.t)}</option>`).join('')}
                    </select>
                    <button type="button" class="btn-icono" data-acc="mat-subir" data-cod="${esc(m.codigo)}" ${mi === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
                    <button type="button" class="btn-icono" data-acc="mat-bajar" data-cod="${esc(m.codigo)}" ${mi === total - 1 ? 'disabled' : ''} aria-label="Bajar">↓</button>
                    <button type="button" class="btn-icono btn-borrar" data-acc="mat-borrar" data-cod="${esc(m.codigo)}" aria-label="Borrar materia">🗑</button>
                </div>
                ${abierta ? listaCorrelativas(m) : ''}
            </div>`;
    }

    function listaCorrelativas(m) {
        const req = m.requiere || [];
        return `<div class="ad-corr">
            <p class="nota">Tildá lo que necesitás aprobar para poder cursar <b>${esc(m.nombre)}</b>:</p>
            ${datos.anios.map(a => {
                const items = [];
                a.cuatrimestres.forEach(c => c.materias.forEach(x => { if (x.codigo !== m.codigo) items.push(x); }));
                if (!items.length) return '';
                return `<p class="ad-corr-anio">${esc(a.nombre)}</p>` + items.map(x => `
                    <label class="check"><input type="checkbox" data-acc="corr-check" data-cod="${esc(m.codigo)}" value="${esc(x.codigo)}" ${req.includes(x.codigo) ? 'checked' : ''}> ${esc(x.nombre)} (${esc(x.codigo)})</label>`).join('');
            }).join('')}
        </div>`;
    }

    function dependeDe(a, b, visto = new Set()) {
        if (visto.has(a)) return false;
        visto.add(a);
        const m = buscarMateria(a);
        return !!m && (m.requiere || []).some(r => r === b || dependeDe(r, b, visto));
    }

    function mensaje(t) { const el = document.getElementById('ad-mensaje'); if (el) el.textContent = t; }

    // Cambios en los campos de texto (se guardan al salir del campo)
    contenido.addEventListener('change', ev => {
        const t = ev.target;
        if (t.id === 'gh-usuario' || t.id === 'gh-repo' || t.id === 'gh-token' || t.id === 'gh-auto') {
            github.usuario = document.getElementById('gh-usuario').value.trim();
            github.repo = document.getElementById('gh-repo').value.trim();
            github.token = document.getElementById('gh-token').value.trim();
            github.auto = document.getElementById('gh-auto').checked;
            escribir(CLAVE_GH, github);
            return;
        }
        if (t.id === 'ad-titulo') { datos.titulo = t.value.trim() || 'Mi carrera'; return cambio(); }
        if (t.classList.contains('campo-anio')) { datos.anios[t.dataset.anio].nombre = t.value.trim() || 'Año'; return cambio(); }
        if (t.classList.contains('campo-cuatri')) { datos.anios[t.dataset.anio].cuatrimestres[t.dataset.cuatri].nombre = t.value.trim(); return cambio(); }
        if (t.classList.contains('campo-nota')) {
            const v = t.value.replace(',', '.').trim();
            if (v === '' || isNaN(Number(v))) delete notas[t.dataset.cod];
            else notas[t.dataset.cod] = Math.min(10, Math.max(1, Number(v)));
            guardarNotas();
            return dibujarMalla();
        }
        if (t.classList.contains('campo-nombre')) { buscarMateria(t.dataset.cod).nombre = t.value.trim() || 'Materia'; return cambio(); }
        if (t.classList.contains('campo-codigo')) return cambiarCodigo(t.dataset.cod, t.value.trim(), t);
        if (t.classList.contains('campo-mover') && t.value) {
            const [ai, ci] = t.value.split('-').map(Number);
            const u = ubicacionDe(t.dataset.cod);
            const [m] = u.cuatri.materias.splice(u.indice, 1);
            datos.anios[ai].cuatrimestres[ci].materias.push(m);
            return cambio();
        }
        if (t.dataset.acc === 'corr-check') {
            const m = buscarMateria(t.dataset.cod);
            m.requiere = m.requiere || [];
            if (t.checked) {
                if (dependeDe(t.value, m.codigo)) {
                    t.checked = false;
                    alert(`No se puede: ${buscarMateria(t.value).nombre} ya depende de ${m.nombre}.`);
                    return;
                }
                m.requiere.push(t.value);
            } else {
                m.requiere = m.requiere.filter(r => r !== t.value);
            }
            return cambio();
        }
        if (t.id === 'ad-importar' && t.files[0]) {
            const lector = new FileReader();
            lector.onload = () => importar(String(lector.result));
            lector.readAsText(t.files[0]);
        }
    });

    function cambiarCodigo(viejo, nuevo, input) {
        if (!nuevo) { input.value = viejo; return; }
        if (nuevo === viejo) return;
        if (buscarMateria(nuevo)) { alert(`Ya existe una materia con el código ${nuevo}.`); input.value = viejo; return; }
        buscarMateria(viejo).codigo = nuevo;
        todasLasMaterias().forEach(m => { m.requiere = (m.requiere || []).map(r => r === viejo ? nuevo : r); });
        if (estadoMaterias[viejo]) { estadoMaterias[nuevo] = estadoMaterias[viejo]; delete estadoMaterias[viejo]; guardarEstado(); }
        if (notas[viejo] != null) { notas[nuevo] = notas[viejo]; delete notas[viejo]; guardarNotas(); }
        if (corrAbierta === viejo) corrAbierta = nuevo;
        cambio();
    }

    // Botones
    contenido.addEventListener('click', ev => {
        const b = ev.target.closest('button[data-acc]');
        if (!b) return;
        const acc = b.dataset.acc;
        const ai = Number(b.dataset.a), ci = Number(b.dataset.c);
        const u = b.dataset.cod ? ubicacionDe(b.dataset.cod) : null;

        switch (acc) {
            case 'anio-nuevo':
                datos.anios.push({ nombre: 'Nuevo año', cuatrimestres: [{ nombre: 'Primer Cuatrimestre', materias: [] }, { nombre: 'Segundo Cuatrimestre', materias: [] }] });
                return cambio();
            case 'anio-subir': case 'anio-bajar': {
                const j = ai + (acc === 'anio-subir' ? -1 : 1);
                [datos.anios[ai], datos.anios[j]] = [datos.anios[j], datos.anios[ai]];
                return cambio();
            }
            case 'anio-borrar': {
                const a = datos.anios[ai];
                const n = a.cuatrimestres.reduce((s, c) => s + c.materias.length, 0);
                if (!confirm(`¿Borrar "${a.nombre}"${n ? ` y sus ${n} materias` : ''}?`)) return;
                a.cuatrimestres.forEach(c => c.materias.forEach(m => quitarReferencias(m.codigo)));
                datos.anios.splice(ai, 1);
                return cambio();
            }
            case 'cuatri-nuevo':
                datos.anios[ai].cuatrimestres.push({ nombre: 'Nuevo cuatrimestre', materias: [] });
                return cambio();
            case 'cuatri-borrar': {
                const c = datos.anios[ai].cuatrimestres[ci];
                if (!confirm(`¿Borrar "${c.nombre}"${c.materias.length ? ` y sus ${c.materias.length} materias` : ''}?`)) return;
                c.materias.forEach(m => quitarReferencias(m.codigo));
                datos.anios[ai].cuatrimestres.splice(ci, 1);
                return cambio();
            }
            case 'materia-nueva': {
                let n = todasLasMaterias().length + 1, cod;
                do { cod = 'NUEVA' + n++; } while (buscarMateria(cod));
                datos.anios[ai].cuatrimestres[ci].materias.push({ codigo: cod, nombre: 'Nueva materia', requiere: [] });
                cambio();
                const campo = contenido.querySelector(`.campo-nombre[data-cod="${cod}"]`);
                if (campo) { campo.focus(); campo.select(); }
                return;
            }
            case 'mat-subir': case 'mat-bajar': {
                const j = u.indice + (acc === 'mat-subir' ? -1 : 1);
                const l = u.cuatri.materias;
                [l[u.indice], l[j]] = [l[j], l[u.indice]];
                return cambio();
            }
            case 'mat-borrar': {
                const m = u.cuatri.materias[u.indice];
                if (!confirm(`¿Borrar "${m.nombre}"?`)) return;
                u.cuatri.materias.splice(u.indice, 1);
                quitarReferencias(m.codigo);
                return cambio();
            }
            case 'corr':
                corrAbierta = corrAbierta === b.dataset.cod ? null : b.dataset.cod;
                return dibujarAdmin();

            case 'exportar': return exportar();
            case 'gh-guardar': return subirAGitHub(true);
            case 'reiniciar-progreso':
                if (!confirm('¿Desmarcar todas las materias aprobadas y borrar las notas?')) return;
                estadoMaterias = {}; notas = {}; guardarEstado(); guardarNotas(); dibujarMalla(); mensaje('Listo, empezaste de cero.');
                return;
            case 'descartar':
                if (!confirm('¿Descartar lo que editaste en este navegador y volver a lo que dice datos.js?')) return;
                [CLAVE_DATOS, CLAVE_ESTADO, CLAVE_NOTAS, CLAVE_FECHA].forEach(k => { try { localStorage.removeItem(k); } catch (e) { } });
                cargarTodo(); corrAbierta = null;
                dibujarMalla(); dibujarAdmin();
                return;
        }
    });

    function quitarReferencias(codigo) {
        todasLasMaterias().forEach(m => { m.requiere = (m.requiere || []).filter(r => r !== codigo); });
        delete estadoMaterias[codigo];
        delete notas[codigo];
        guardarEstado();
        guardarNotas();
    }

    function textoDatosJs() {
        const salida = copiar(datos);
        salida.estado = {};
        salida.notas = {};
        Object.keys(estadoMaterias).forEach(c => {
            if (estadoMaterias[c] !== 'aprobada') return;
            salida.estado[c] = 'aprobada';
            if (notas[c] != null) salida.notas[c] = notas[c];
        });
        return '// Datos de la malla. Se actualiza desde "Administrar" en la página.\n' +
            'window.MALLA_DATOS = ' + JSON.stringify(salida, null, 2) + ';\n';
    }

    function exportar() {
        const url = URL.createObjectURL(new Blob([textoDatosJs()], { type: 'text/javascript' }));
        const a = document.createElement('a');
        a.href = url; a.download = 'datos.js';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 3000);
        mensaje('Se descargó datos.js.');
    }

    /* ================= Guardar en GitHub ================= */

    function configGitHubPorDefecto() {
        // Si la página está en usuario.github.io/repo, se completa sola
        const c = { usuario: '', repo: '', rama: 'main', token: '', auto: true };
        const m = location.hostname.match(/^([^.]+)\.github\.io$/i);
        if (m) {
            c.usuario = m[1];
            const primera = location.pathname.split('/').filter(Boolean)[0];
            c.repo = primera && !/\.html?$/i.test(primera) ? primera : m[1] + '.github.io';
        }
        return c;
    }

    function avisoGitHub(texto, tipo) {
        const el = document.getElementById('estado-github');
        el.textContent = texto;
        el.className = 'estado-github ' + (tipo || '');
        el.hidden = !texto;
        mensaje(texto);
    }

    function programarGitHub(ms) {
        clearTimeout(timerGitHub);
        avisoGitHub('Cambios sin subir a GitHub…', 'pendiente');
        timerGitHub = setTimeout(() => subirAGitHub(false), ms);
    }

    function base64(texto) {
        const bytes = new TextEncoder().encode(texto);
        let bin = '';
        bytes.forEach(b => { bin += String.fromCharCode(b); });
        return btoa(bin);
    }

    async function subirAGitHub(manual) {
        clearTimeout(timerGitHub);
        if (!github.usuario || !github.repo || !github.token) {
            if (manual) avisoGitHub('Completá usuario, repositorio y token para poder guardar en GitHub.', 'error');
            return;
        }
        if (subiendo) { pendienteSubir = true; return; }
        subiendo = true;
        avisoGitHub('Guardando en GitHub…', 'pendiente');
        const url = `https://api.github.com/repos/${encodeURIComponent(github.usuario)}/${encodeURIComponent(github.repo)}/contents/datos.js`;
        const cabeceras = {
            'Authorization': 'Bearer ' + github.token,
            'Accept': 'application/vnd.github+json'
        };
        try {
            for (let intento = 0; intento < 2; intento++) {
                let sha;
                const r1 = await fetch(url + '?ref=' + encodeURIComponent(github.rama || 'main') + '&t=' + Date.now(), { headers: cabeceras, cache: 'no-store' });
                if (r1.ok) sha = (await r1.json()).sha;
                else if (r1.status !== 404) throw r1;
                const r2 = await fetch(url, {
                    method: 'PUT',
                    headers: cabeceras,
                    body: JSON.stringify({
                        message: 'Actualizo la malla',
                        content: base64(textoDatosJs()),
                        branch: github.rama || 'main',
                        sha
                    })
                });
                if (r2.ok) {
                    avisoGitHub('Guardado en GitHub ✓ (en 1 o 2 minutos se ve en todos lados)', 'ok');
                    break;
                }
                if (r2.status === 409 && intento === 0) continue;  // cambió mientras tanto: reintenta
                throw r2;
            }
        } catch (e) {
            const st = e && e.status;
            let t = 'No se pudo guardar en GitHub. Revisá la conexión a internet.';
            if (st === 401) t = 'GitHub no aceptó el token. Puede estar mal copiado o vencido.';
            else if (st === 403) t = 'El token no tiene permiso para escribir en ese repositorio.';
            else if (st === 404) t = 'No encuentro ese repositorio. Revisá el usuario y el nombre del repositorio.';
            avisoGitHub(t, 'error');
        }
        subiendo = false;
        if (pendienteSubir) { pendienteSubir = false; subirAGitHub(false); }
    }

    function importar(texto) {
        try {
            const json = texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1);
            const nuevo = JSON.parse(json);
            if (!Array.isArray(nuevo.anios)) throw new Error();
            if (!confirm('¿Reemplazar la malla actual por la del archivo?')) return;
            datos = nuevo;
            if (nuevo.estado) { estadoMaterias = { ...nuevo.estado }; guardarEstado(); }
            if (nuevo.notas) { notas = { ...nuevo.notas }; guardarNotas(); }
            corrAbierta = null;
            cambio();
            mensaje('Malla cargada.');
        } catch (e) {
            mensaje('Ese archivo no es un datos.js válido.');
        }
    }

    /* ================= Arranque ================= */

    pintarBotonGuia();
    dibujarMalla();
    escribir(CLAVE_ESTADO, estadoMaterias);
});
