// Toggle del menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const navContainer = document.getElementById('navContainer');
    const menuOverlay = document.getElementById('menuOverlay');

    menuToggle?.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navContainer.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      menuOverlay.style.display = navContainer.classList.contains('active') ? 'block' : 'none';
      document.body.classList.toggle('no-scroll', navContainer.classList.contains('active'));
    });

    menuOverlay?.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navContainer.classList.remove('active');
      menuOverlay.classList.remove('active');
      menuOverlay.style.display = 'none';
      document.body.classList.remove('no-scroll');
    });

    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          menuToggle.classList.remove('active');
          navContainer.classList.remove('active');
          menuOverlay.classList.remove('active');
          menuOverlay.style.display = 'none';
          document.body.classList.remove('no-scroll');
        }
      });
    });

    // Smooth scrolling mejorado
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Actualizar clase activa
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
          });
          this.classList.add('active');
        }
      });
    });

    // Intersection Observer para animaciones
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observar elementos para animaciones
    document.querySelectorAll('section, .card, .service-item, .process-step').forEach(element => {
      element.classList.add('fade-in');
      observer.observe(element);
    });

    // Highlight de navegación activa
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link');
      
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });
      
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });

    // Inicializar efectos cuando la página carga
    window.addEventListener('load', () => {
      // Añadir clase para animaciones iniciales
      document.body.classList.add('loaded');
    });

    // Cambiar el título de la página cuando el usuario cambia de pestaña
    let originalTitle = document.title;
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        document.title = '¡Vuelve! Tu automatización te espera';
      } else {
        document.title = originalTitle;
      }
    });

    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
      // Obtener elementos del DOM
      const modal = document.getElementById('contactModal');
      const closeBtn = document.querySelector('#contactModal .close');
      const form = document.getElementById('contactForm');

      // Buscar el botón de consultoría (si existe)
      const btnConsultoria = document.querySelector('#contacto .btn-primary');

      // Si falta algún elemento crítico lo reportamos, pero NO hacemos return (evita detener todo)
      if (!modal) console.warn('Modal #contactModal no encontrado');
      if (!closeBtn) console.warn('Botón close dentro de #contactModal no encontrado');
      if (!form) {
        console.error('Formulario #contactForm no encontrado — los envíos no funcionarán');
        return; // aquí sí detenemos porque sin form no hay submit
      }

      // Adjuntar evento para abrir modal sólo si el botón existe
      if (btnConsultoria) {
        btnConsultoria.addEventListener('click', function(e) {
          e.preventDefault();
          if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
          }
        });
      } else {
        console.info('No se encontró #contacto .btn-primary — abre el modal manualmente para probar.');
      }

      // Cerrar modal con la X (si existe)
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        });
      }

      // Cerrar modal al hacer clic fuera de él
      window.addEventListener('click', function(e) {
        if (modal && e.target === modal) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });

      // Función para sanear y formatear teléfono
      function formatearTelefono(raw) {
        if (!raw) return '';
        let dígitos = String(raw).replace(/\D+/g, '');
        dígitos = dígitos.replace(/^0+/, '');
        if (!dígitos.startsWith('57')) {
          dígitos = '57' + dígitos;
        }
        return dígitos;
      }

      // Manejar envío del formulario
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Tomar valores DIRECTAMENTE por id
        const nombreElem = document.getElementById('nombre');
        const correoElem = document.getElementById('correo');
        const telefonoElem = document.getElementById('telefono');
        const terminosElem = document.getElementById('terminos');

        const nombre = nombreElem ? nombreElem.value.trim() : '';
        const correo = correoElem ? correoElem.value.trim() : '';
        const telefono = telefonoElem ? formatearTelefono(telefonoElem.value.trim()) : '';
        const terminos = terminosElem ? (terminosElem.checked ? 'Sí' : 'No') : 'No encontrado';

        const objeto = {
          nombre,
          correo,
          telefono,
          terminos,
          origen: 'Formulario Modal - Fluiwork Agencia',
          enviadoEn: new Date().toISOString()
        };

        // Mostrar payload en consola para verificar que los datos se capturan correctamente
        console.log('Payload que se va a enviar:', objeto);

        // Deshabilitar botón durante el envío
        const submitBtn = form.querySelector('.btn-submit') || form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Enviar';
        if (submitBtn) {
          submitBtn.textContent = 'Enviando...';
          submitBtn.disabled = true;
        }

        /* ---------------------------
           OPCIÓN A: ENVÍO DIRECTO A TELEGRAM (ACTIVO)
           --------------------------- */

        // REEMPLAZA estos valores sólo para pruebas locales:
        const TELEGRAM_BOT_TOKEN = '8231769372:AAGhuEPGtMHB6EXBMeGLbcBqxrRGSdEvADc';   // <-- reemplaza con tu token solo en pruebas
        const TELEGRAM_CHAT_ID  = '-1003126498742';     // <-- reemplaza con tu chat id

        // Construir mensaje legible con los campos
        const mensaje = `Nuevo formulario recibido:\nNombre: ${objeto.nombre}\nCorreo: ${objeto.correo}\nTeléfono: ${objeto.telefono}\nAceptó términos: ${objeto.terminos}\nOrigen: ${objeto.origen}`;

        console.log('Mensaje a Telegram:', mensaje);

        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: mensaje
            // parse_mode: 'HTML' // opcional
          })
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
            if (modal) {
              modal.style.display = 'none';
              document.body.style.overflow = 'auto';
            }
          } else {
            throw new Error('Telegram devolvió error: ' + JSON.stringify(data));
          }
        })
        .catch(error => {
          console.error('Error enviando a Telegram:', error);
          alert('Ocurrió un error enviando el formulario. Revisa la consola para más detalles.');

          // BLOQUE COMENTADO: envío al webhook (n8n) — lo dejamos comentado como pediste.
          /*
          fetch('https://pruebadeenvios.app.n8n.cloud/webhook-test/4400e876-1d50-4f84-8acf-3c2e57a6366f', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objeto)
          })
          .then(respuesta => {
            if (!respuesta.ok) throw new Error("Error al enviar datos al webhook");
            return respuesta.text();
          })
          .then(data => {
            alert('¡Solicitud enviada correctamente via webhook! 🎉');
            form.reset();
            if (modal) {
              modal.style.display = 'none';
              document.body.style.overflow = 'auto';
            }
          })
          .catch(err => {
            console.error('Error enviando al webhook comentado:', err);
            alert('También falló el webhook. Por favor intenta más tarde.');
          });
          */
        })
        .finally(() => {
          // Restaurar botón
          if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }
        });
      });

      // Cerrar modal con tecla Escape 
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });
    });
