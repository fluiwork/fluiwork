// Toggle del menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const navContainer = document.getElementById('navContainer');
    const menuOverlay = document.getElementById('menuOverlay');
    
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navContainer.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      document.body.classList.toggle('no-scroll', navContainer.classList.contains('active'));
    });
    
    menuOverlay.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navContainer.classList.remove('active');
      menuOverlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          menuToggle.classList.remove('active');
          navContainer.classList.remove('active');
          menuOverlay.classList.remove('active');
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
  
  // Buscar el botón de consultoría de forma más específica
  const btnConsultoria = document.querySelector('#contacto .btn-primary');
  
  // Verificar que todos los elementos existan
  if (!modal || !closeBtn || !form || !btnConsultoria) {
    console.error('Algunos elementos del modal no se encontraron');
    return;
  }

  // Función para sanear y formatear teléfono
  function formatearTelefono(raw) {
    // 1) Eliminar todo lo que no sea dígito
    let dígitos = raw.replace(/\D+/g, '');
    // 2) Quitar ceros a la izquierda
    dígitos = dígitos.replace(/^0+/, '');
    // 3) Anteponer '57' si no está
    if (!dígitos.startsWith('57')) {
      dígitos = '57' + dígitos;
    }
    return dígitos;
  }

  // Abrir modal cuando se haga clic en el botón
  btnConsultoria.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  // Cerrar modal con la X
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  // Cerrar modal al hacer clic fuera de él
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // Manejar envío del formulario
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Capturar los datos del formulario
    const datos = new FormData(form);
    const objeto = {};
    datos.forEach((valor, clave) => {
      // Detectar campos de teléfono por nombre
      if (/tel|phone/i.test(clave)) {
        objeto[clave] = formatearTelefono(valor);
      } else {
        objeto[clave] = valor;
      }
    });
    
    // Deshabilitar botón durante el envío
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Enviar al webhook
    fetch('https://pruebadeenvios.app.n8n.cloud/webhook-test/4400e876-1d50-4f84-8acf-3c2e57a6366f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objeto)
    })
    .then(respuesta => {
      if (!respuesta.ok) throw new Error("Error al enviar datos");
      return respuesta.text();
    })
    .then(data => {
      alert('¡Solicitud enviada correctamente! 🎉\nNos pondremos en contacto contigo pronto.');
      form.reset();
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    })
    .catch(error => {
      alert('Error al enviar la solicitud. Por favor, intenta nuevamente. ❌');
      console.error(error);
    })
    .finally(() => {
      // Restaurar botón
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });

  // Cerrar modal con tecla Escape 
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
});