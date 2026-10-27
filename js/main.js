/* ============================================================
   VOZ CÍVICA 11 — JavaScript Global (ES6)
   Revista Escolar Digital | Grado 11 | Colombia 2026
   ============================================================ */

'use strict';

/* ── 1. UTILIDADES GENERALES ─────────────────────────────── */

/**
 * Selecciona un elemento del DOM de forma segura.
 * @param {string} selector - Selector CSS
 * @param {Element} [ctx=document] - Contexto de búsqueda
 * @returns {Element|null}
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Selecciona todos los elementos del DOM de forma segura.
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
const $$ = (selector, ctx = document) => ctx.querySelectorAll(selector);


/* ── 2. NAVBAR — RESALTADO DE PÁGINA ACTIVA ─────────────── */

/**
 * Detecta la página actual y marca el enlace de navegación como activo.
 */
function marcarNavActivo() {
  const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
  $$('.navbar-revista .nav-link').forEach(enlace => {
    const href = enlace.getAttribute('href');
    if (href === paginaActual) {
      enlace.classList.add('active');
      enlace.setAttribute('aria-current', 'page');
    }
  });
}


/* ── 3. ANIMACIONES DE ENTRADA (IntersectionObserver) ─────── */

/**
 * Observa los elementos con clase .animacion-entrada y
 * les agrega .visible cuando entran al viewport.
 */
function iniciarAnimacionesEntrada() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.animacion-entrada').forEach(el => observer.observe(el));
}


/* ── 4. TEST INTERACTIVO: MITO vs. REALIDAD ─────────────── */

/**
 * Inicializa todos los tests de Mito vs. Realidad en la página.
 * Cada pregunta tiene: data-respuesta="mito" | data-respuesta="realidad"
 * y un párrafo .resultado-test con data-tipo="mito" | data-tipo="realidad"
 */
function iniciarTestMitoRealidad() {
  const formularios = $$('.form-test-mito');

  formularios.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const seleccion = form.querySelector('input[type="radio"]:checked');
      const resultados = form.querySelectorAll('.resultado-test');

      // Ocultar todos los resultados previos
      resultados.forEach(r => { r.style.display = 'none'; });

      if (!seleccion) {
        mostrarAlerta(form, '⚠️ Por favor selecciona una opción antes de continuar.', 'warning');
        return;
      }

      const respuestaCorrecta = form.dataset.respuesta;
      const respuestaUsuario  = seleccion.value;
      const esCorrecta = respuestaUsuario === respuestaCorrecta;

      const resultadoEl = form.querySelector(`.resultado-test[data-tipo="${respuestaCorrecta}"]`);
      if (resultadoEl) resultadoEl.style.display = 'block';

      // Deshabilitar opciones después de responder
      form.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);
      form.querySelector('button[type="submit"]').disabled = true;

      // Feedback visual en labels
      form.querySelectorAll('.opciones label').forEach(label => {
        const input = label.querySelector('input');
        if (input && input.value === respuestaCorrecta) {
          label.style.borderColor = 'var(--color-success)';
          label.style.background  = '#f0fdf4';
        } else if (input && input.checked && !esCorrecta) {
          label.style.borderColor = 'var(--color-danger)';
          label.style.background  = '#fef2f2';
        }
      });
    });
  });
}


/* ── 5. CHECKLIST ECOLÓGICA INTERACTIVA ──────────────────── */

/**
 * Inicializa la checklist de reto ecológico de 7 días.
 * Persiste el estado en localStorage.
 */
function iniciarChecklistEco() {
  const lista = $('#checklist-eco');
  if (!lista) return;

  const items = lista.querySelectorAll('li[data-dia]');
  const barraEl = $('#barra-progreso-eco');
  const contadorEl = $('#contador-eco');
  const STORAGE_KEY = 'vozCivica11_checklist';

  // Cargar estado guardado
  const estadoGuardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  items.forEach(item => {
    const dia = item.dataset.dia;
    if (estadoGuardado[dia]) item.classList.add('completado');

    item.addEventListener('click', () => {
      item.classList.toggle('completado');
      estadoGuardado[dia] = item.classList.contains('completado');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoGuardado));

      const icono = item.querySelector('.check-icon');
      if (icono) {
        icono.textContent = item.classList.contains('completado') ? '✅' : '⬜';
      }

      actualizarProgresoChecklist(items, barraEl, contadorEl);
    });
  });

  // Botón de reinicio
  const btnReiniciar = $('#btn-reiniciar-eco');
  if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
      items.forEach(item => {
        item.classList.remove('completado');
        const icono = item.querySelector('.check-icon');
        if (icono) icono.textContent = '⬜';
      });
      localStorage.removeItem(STORAGE_KEY);
      actualizarProgresoChecklist(items, barraEl, contadorEl);
    });
  }

  actualizarProgresoChecklist(items, barraEl, contadorEl);
}

/**
 * Actualiza la barra de progreso y el contador de la checklist.
 */
function actualizarProgresoChecklist(items, barraEl, contadorEl) {
  const total = items.length;
  const completados = [...items].filter(i => i.classList.contains('completado')).length;
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;

  if (barraEl) barraEl.style.width = `${porcentaje}%`;
  if (contadorEl) contadorEl.textContent = `${completados} / ${total} días completados (${porcentaje}%)`;
}


/* ── 6. GRÁFICO DE BULLYING (Chart.js) ───────────────────── */

/**
 * Renderiza el gráfico de resultados de encuesta de bullying.
 * Se llama desde infancia.html después de cargar Chart.js.
 * @param {Object} datos - { labels: [], valores: [] }
 */
function renderizarGraficoBullying(datos) {
  const canvas = $('#graficoBullying');
  if (!canvas || typeof Chart === 'undefined') return;

  // Destruir instancia previa si existe (hot-reload seguro)
  if (canvas._chartInstance) canvas._chartInstance.destroy();

  canvas._chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: datos.labels,
      datasets: [{
        label: 'N.° de estudiantes',
        data: datos.valores,
        backgroundColor: [
          'rgba(30,58,138,.75)',
          'rgba(13,148,136,.75)',
          'rgba(245,158,11,.75)',
          'rgba(220,38,38,.75)',
          'rgba(124,58,237,.75)',
        ],
        borderColor: [
          '#1e3a8a', '#0d9488', '#f59e0b', '#dc2626', '#7c3aed'
        ],
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Encuesta sobre Convivencia Escolar — 52 Estudiantes (2026)',
          font: { size: 14, weight: 'bold' },
          color: '#1e3a8a',
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} estudiantes`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 52,
          ticks: { stepSize: 5 },
          title: { display: true, text: 'N.° de estudiantes', font: { size: 12 } }
        },
        x: {
          title: { display: true, text: 'Tipo de situación', font: { size: 12 } }
        }
      }
    }
  });
}


/* ── 7. MODAL DE PÓSTER PREVENCIÓN ───────────────────────── */

/**
 * Inicializa el botón de descarga del póster de prevención.
 * Abre el modal si existe, o muestra un alert informativo.
 */
function iniciarPosterPrevencion() {
  const btnPoster = $('#btn-poster');
  if (!btnPoster) return;

  btnPoster.addEventListener('click', () => {
    const modalEl = $('#modalPoster');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  });
}


/* ── 8. ACORDEÓN MITO VS. REALIDAD (ambiente.html) ──────── */

/**
 * Agrega un contador de ítems expandidos en el acordeón
 * de Código de Policía.
 */
function iniciarAcordeonPolicia() {
  const acordeon = $('#acordeon-policia');
  if (!acordeon) return;

  const botones = acordeon.querySelectorAll('.accordion-button');
  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      // Feedback accesible: anuncia el estado al lector
      const expandido = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-label',
        `${btn.textContent.trim()} — ${expandido ? 'contraído' : 'expandido'}`
      );
    });
  });
}


/* ── 9. MOSTRAR ALERTA TEMPORAL ─────────────────────────── */

/**
 * Inserta una alerta de Bootstrap dentro de un contenedor y la
 * elimina automáticamente tras 4 segundos.
 * @param {Element} contenedor
 * @param {string}  mensaje
 * @param {string}  [tipo='info'] - Bootstrap: success | danger | warning | info
 */
function mostrarAlerta(contenedor, mensaje, tipo = 'info') {
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo} alert-dismissible fade show mt-2`;
  alerta.role = 'alert';
  alerta.innerHTML = `${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>`;
  contenedor.appendChild(alerta);
  setTimeout(() => alerta.remove(), 4000);
}


/* ── 10. AÑO DINÁMICO EN EL FOOTER ──────────────────────── */

function actualizarAnoFooter() {
  const spanAno = $('#ano-footer');
  if (spanAno) spanAno.textContent = new Date().getFullYear();
}


/* ── 11. INICIALIZACIÓN GLOBAL ───────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  marcarNavActivo();
  iniciarAnimacionesEntrada();
  iniciarTestMitoRealidad();
  iniciarChecklistEco();
  iniciarPosterPrevencion();
  iniciarAcordeonPolicia();
  actualizarAnoFooter();

  console.log('%c📰 Voz Cívica 11 — Revista Escolar Digital',
    'color:#1e3a8a; font-size:16px; font-weight:bold;');
  console.log('%cProyecto Final Grado 11 | Colombia 2026',
    'color:#0d9488; font-size:12px;');
});
