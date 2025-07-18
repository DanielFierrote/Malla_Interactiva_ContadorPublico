document.addEventListener('DOMContentLoaded', function () {
    const materias = document.querySelectorAll('.materia');
    const correlativas = {};
    const estadoMaterias = {};

    // Cargar estado desde localStorage
    const guardado = JSON.parse(localStorage.getItem('estadoMaterias') || '{}');

    // Mapeo de correlativas (abre)
    materias.forEach(m => {
        const codigo = m.dataset.codigo;
        const abre = m.dataset.abre;
        estadoMaterias[codigo] = guardado[codigo] || 'bloqueada';

        if (abre) {
            abre.split(',').forEach(dest => {
                const limpio = dest.trim();
                if (!correlativas[limpio]) correlativas[limpio] = [];
                correlativas[limpio].push(codigo);
            });
        }
    });

    function aplicarEstadoInicial() {
        materias.forEach(m => {
            const codigo = m.dataset.codigo;
            m.classList.remove('bloqueada', 'desbloqueada', 'aprobada');
            m.classList.add(estadoMaterias[codigo]);
        });
    }

    // Click para cambiar estado
    materias.forEach(m => {
        m.addEventListener('click', function () {
            const codigo = m.dataset.codigo;
            cambiarEstado(m, codigo);
            actualizarDesbloqueos();
            actualizarProgreso();
            guardarEstado();
        });
    });

    function cambiarEstado(m, codigo) {
        if (estadoMaterias[codigo] === 'bloqueada') {
            estadoMaterias[codigo] = 'desbloqueada';
        } else if (estadoMaterias[codigo] === 'desbloqueada') {
            estadoMaterias[codigo] = 'aprobada';
        } else {
            estadoMaterias[codigo] = 'bloqueada';
        }
        m.classList.remove('bloqueada', 'desbloqueada', 'aprobada');
        m.classList.add(estadoMaterias[codigo]);
    }

    function actualizarDesbloqueos() {
        materias.forEach(m => {
            const codigo = m.dataset.codigo;
            const requisitos = correlativas[codigo];
            if (!requisitos) return;

            const aprobadas = requisitos.every(req => estadoMaterias[req] === 'aprobada');

            if (aprobadas && estadoMaterias[codigo] === 'bloqueada') {
                estadoMaterias[codigo] = 'desbloqueada';
            } else if (!aprobadas && estadoMaterias[codigo] === 'desbloqueada') {
                estadoMaterias[codigo] = 'bloqueada';
            }

            m.classList.remove('bloqueada', 'desbloqueada', 'aprobada');
            m.classList.add(estadoMaterias[codigo]);
        });
    }

    function actualizarProgreso() {
        const total = materias.length;
        const aprobadas = Object.values(estadoMaterias).filter(e => e === 'aprobada').length;
        const porcentaje = ((aprobadas / total) * 100).toFixed(1);
        document.getElementById('porcentaje').innerText = `${porcentaje}%`;
    }

    function guardarEstado() {
        localStorage.setItem('estadoMaterias', JSON.stringify(estadoMaterias));
    }

    aplicarEstadoInicial();
    actualizarDesbloqueos();
    actualizarProgreso();
});
