document.addEventListener('DOMContentLoaded', function () {
  /* -------------------------
     Helpers
     ------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const isInputLike = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');

  /* -------------------------
     Elementos principales
     ------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const navContainer = document.getElementById('navContainer');
  const menuOverlay = document.getElementById('menuOverlay'); // debe existir elemento .menu-overlay con id menuOverlay
  const modal = document.getElementById('contactModal');
  const closeBtn = modal ? modal.querySelector('.close') : null;
  const form = document.getElementById('contactForm');
  const btnConsultoria = document.querySelector('#contacto .btn-primary');

  /* Seguridad: comprobar elementos críticos (no abortar si faltan) */
  if (!menuOverlay) console.warn('Advertencia: #menuOverlay no encontrado. Asegúrate que exista un elemento con id="menuOverlay" y clase .menu-overlay.');
  if (!navContainer) console.warn('Advertencia: #navContainer no encontrado.');
  if (!menuToggle) console.warn('Advertencia: #menuToggle no encontrado.');
  if (!modal) console.info('Info: #contactModal no encontrado — el modal no funcionará hasta que exista.');
  if (!form) console.warn('Advertencia: #contactForm no encontrado — el envío no se activará.');

  /* -------------------------
     NAV (mobile) funciones
     ------------------------- */
  function openNav() {
    menuToggle?.classList.add('active');
    navContainer?.classList.add('active');
    menuOverlay?.classList.add('active');
    document.body.classList.add('nav-open');
    menuToggle?.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    menuToggle?.classList.remove('active');
    navContainer?.classList.remove('active');
    menuOverlay?.classList.remove('active');
    document.body.classList.remove('nav-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }

  // Toggle nav
  menuToggle?.addEventListener('click', function (e) {
    e.preventDefault();
    if (navContainer?.classList.contains('active')) closeNav();
    else openNav();
  }, { passive: false });

  // Click overlay cierra nav/modal
  menuOverlay?.addEventListener('click', function (e) {
    // Si el overlay está activo, cerrar nav (y si el modal usa overlay distinto, mantén separado)
    if (navContainer?.classList.contains('active')) closeNav();
  }, { passive: true });

  // Cerrar nav cuando se hace click en un enlace (mobile)
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeNav();
    }, { passive: true });
  });

  /* -------------------------
     Smooth scrolling para anchors
     ------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      // Ajusta offset según tu header fijo
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

      // Actualizar clase activa en navegación
      $$('.nav-link').forEach(link => link.classList.remove('active'));
      this.classList.add('active');

      // Cerrar nav en móviles
      if (window.innerWidth <= 768) closeNav();
    }, { passive: false });
  });

  /* -------------------------
     Intersection Observer (animaciones)
     ------------------------- */
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, observerOptions);

  document.querySelectorAll('section, .card, .service-item, .process-step').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  /* -------------------------
     Highlight nav al hacer scroll
     ------------------------- */
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    $$('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });

  /* -------------------------
     Clase body al cargar
     ------------------------- */
  window.addEventListener('load', () => document.body.classList.add('loaded'));

  /* -------------------------
     Cambio de título cuando oculta la pestaña
     ------------------------- */
  const originalTitle = document.title;
  document.addEventListener('visibilitychange', function () {
    document.title = (document.visibilityState === 'hidden') ? '¡Vuelve! Tu automatización te espera' : originalTitle;
  });

  /* -------------------------
     Modal: move to body, open/close robusto + caret fixes
     ------------------------- */
  function moveModalToBody() {
    if (!modal) return;
    if (modal.parentNode !== document.body) document.body.appendChild(modal);
  }

  function openModal() {
    if (!modal) return;
    moveModalToBody();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.classList.add('modal-open');

    // Focus en primer input y forzar selección para mostrar caret en iOS/Android
    const first = modal.querySelector('input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (first) {
      setTimeout(() => {
        try {
          first.focus({ preventScroll: false });
          if (typeof first.setSelectionRange === 'function') {
            const len = first.value ? first.value.length : 0;
            first.setSelectionRange(len, len);
          }
          first.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } catch (err) { /* ignorar errores de focus */ }
      }, 80);
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    // Opcional: restaurar foco al elemento que abrió el modal si lo deseas
  }

  // Abrir modal al pulsar botón de consultoría
  if (btnConsultoria) {
    btnConsultoria.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    }, { passive: false });
  }

  // Cerrar con X
  closeBtn?.addEventListener('click', function (e) {
    e.preventDefault();
    closeModal();
  }, { passive: false });

  // Cerrar haciendo click fuera del modal-content (si el backdrop es el modal)
  window.addEventListener('click', function (e) {
    if (modal && e.target === modal) closeModal();
  }, { passive: true });

  // Cerrar con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      // priorizar cerrar modal, luego nav
      if (modal && modal.classList.contains('open')) closeModal();
      else if (navContainer && navContainer.classList.contains('active')) closeNav();
    }
  });

  /* -------------------------
     visualViewport resize -> fix caret en iOS/Android
     ------------------------- */
  if ('visualViewport' in window) {
    let lastVVHeight = window.visualViewport.height;
    window.visualViewport.addEventListener('resize', () => {
      const vvh = window.visualViewport.height;
      const active = document.activeElement;

      // Si la altura disminuye notablemente y el foco está en un input dentro del modal -> re-scroll y setSelection
      if (vvh < lastVVHeight - 50 && active && modal && modal.classList.contains('open') && isInputLike(active)) {
        setTimeout(() => {
          try {
            active.scrollIntoView({ block: 'center', behavior: 'smooth' });
            if (typeof active.setSelectionRange === 'function') {
              const len = active.value ? active.value.length : 0;
              active.setSelectionRange(len, len);
            }
          } catch (err) { /* ignore */ }
        }, 60);
      }
      lastVVHeight = vvh;
    }, { passive: true });
  }

  /* -------------------------
     Envío del formulario (Telegram)
     ------------------------- */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Obtener campos por id (seguro)
      const nombreElem = document.getElementById('nombre');
      const correoElem = document.getElementById('correo');
      const telefonoElem = document.getElementById('telefono');
      const terminosElem = document.getElementById('terminos');

      const nombre = nombreElem ? nombreElem.value.trim() : '';
      const correo = correoElem ? correoElem.value.trim() : '';
      const telefonoRaw = telefonoElem ? telefonoElem.value.trim() : '';
      const terminos = terminosElem ? (terminosElem.checked ? 'Sí' : 'No') : 'No encontrado';

      // Formatear teléfono simple
      function formatearTelefono(raw) {
        if (!raw) return '';
        let dígitos = String(raw).replace(/\D+/g, '');
        dígitos = dígitos.replace(/^0+/, '');
        if (!dígitos.startsWith('57')) dígitos = '57' + dígitos;
        return dígitos;
      }
      const telefono = formatearTelefono(telefonoRaw);

      const objeto = {
        nombre,
        correo,
        telefono,
        terminos,
        origen: 'Formulario Modal - Fluiwork Agencia',
        enviadoEn: new Date().toISOString()
      };

      console.log('Payload que se enviará:', objeto);

      // Botón submit
      const submitBtn = form.querySelector('.btn-submit') || form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Enviar';
      if (submitBtn) {
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
      }

      // REEMPLAZA estos valores por los tuyos (por seguridad no dejes tokens públicos en producción)
      const TELEGRAM_BOT_TOKEN = 'TU_TELEGRAM_BOT_TOKEN_AQUI';
      const TELEGRAM_CHAT_ID = 'TU_CHAT_ID_AQUI';

      const mensaje = `Nuevo formulario recibido:\nNombre: ${objeto.nombre}\nCorreo: ${objeto.correo}\nTeléfono: ${objeto.telefono}\nAceptó términos: ${objeto.terminos}\nOrigen: ${objeto.origen}`;

      // Envío a Telegram
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: mensaje })
      })
      .then(async res => {
        if (!res.ok) {
          let txt = '';
          try { txt = await res.text(); } catch (e) { txt = 'no response text'; }
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && data.ok) {
          alert('¡Solicitud enviada correctamente! 🎉\nNos pondremos en contacto contigo pronto.');
          form.reset();
          closeModal();
        } else {
          throw new Error('Telegram devolvió error: ' + JSON.stringify(data));
        }
      })
      .catch(error => {
        console.error('Error enviando a Telegram:', error);
        alert('Ocurrió un error enviando el formulario. Revisa la consola para más detalles.');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      });
    });
  }

  /* -------------------------
     Fin DOMContentLoaded
     ------------------------- */
});
