/* ==========================================================================
   INOBARIX — Landing page
   JavaScript vanilla: navegación, reveal on scroll, WhatsApp y formulario
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIGURACIÓN — reemplazar con los datos reales
     ------------------------------------------------------------------------ */

  // Número de WhatsApp del negocio, en formato internacional sin '+', espacios ni guiones.
  const WHATSAPP_NUMBER = '5492944824554';

  // Mensaje prellenado que se abre junto con el chat de WhatsApp.
  const WHATSAPP_MESSAGE = 'Hola! Quiero más información sobre el plugin de Suscripciones y Pagos Recurrentes con Mercado Pago para WooCommerce.';

  // Endpoint donde se envía el formulario de leads: FormSubmit (https://formsubmit.co),
  // un servicio gratuito que reenvía el contenido del formulario por email sin necesidad
  // de backend propio. Configurado para entregar las consultas a inobarixweb@gmail.com.
  //
  // IMPORTANTE — activación única: la primera vez que alguien envíe el formulario,
  // FormSubmit le manda un email de confirmación a inobarixweb@gmail.com. Hay que abrir
  // ese email y confirmar para que, de ahí en más, todas las consultas lleguen a la bandeja.
  //
  // Para usar otro servicio (Formspree, Getform, un webhook propio, etc.) simplemente
  // reemplazá esta URL por la que te den — el resto del código no necesita cambios.
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/inobarixweb@gmail.com';

  /* ------------------------------------------------------------------------
     WHATSAPP — arma el link con número y mensaje configurados arriba
     ------------------------------------------------------------------------ */
  function buildWhatsAppUrl() {
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodedMessage;
  }

  function initWhatsApp() {
    const url = buildWhatsAppUrl();
    const floatBtn = document.getElementById('whatsapp-float');
    const inlineLink = document.getElementById('whatsapp-inline-link');

    if (floatBtn) floatBtn.setAttribute('href', url);
    if (inlineLink) inlineLink.setAttribute('href', url);
  }

  /* ------------------------------------------------------------------------
     HEADER — estado "scrolled" para el fondo translúcido
     ------------------------------------------------------------------------ */
  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;

    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------------
     NAV MOBILE — menú hamburguesa accesible
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function openNav() {
      toggle.setAttribute('aria-expanded', 'true');
      nav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    // Cierra el menú al elegir un link (mejora la navegación en mobile)
    nav.querySelectorAll('[data-nav-link]').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Cierra con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
        toggle.focus();
      }
    });

    // Si se agranda a desktop con el menú abierto, lo reseteamos
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) closeNav();
    });
  }

  /* ------------------------------------------------------------------------
     REVEAL ON SCROLL — microinteracción sutil vía IntersectionObserver
     ------------------------------------------------------------------------ */
  function initScrollReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     CARRUSEL DE MÓDULOS — 1 columna / 1 fila, avanza cada 3s, accesible
     ------------------------------------------------------------------------ */
  function initModuleCarousel() {
    const carousel = document.getElementById('module-carousel');
    const track = document.getElementById('module-carousel-track');
    const dotsContainer = document.getElementById('module-carousel-dots');
    const liveRegion = document.getElementById('module-carousel-live');
    if (!carousel || !track || !dotsContainer) return;

    const slides = Array.from(track.children);
    if (!slides.length) return;

    const AUTOPLAY_MS = 3000;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let index = 0;
    let timer = null;

    slides.forEach(function (slide, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.setAttribute('aria-controls', slide.id);
      dot.setAttribute('aria-label', 'Ver módulo: ' + slide.dataset.title);
      dot.addEventListener('click', function () { goTo(i, true); });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      if (liveRegion) {
        liveRegion.textContent = 'Módulo ' + (index + 1) + ' de ' + slides.length + ': ' + slides[index].dataset.title;
      }
    }

    function goTo(newIndex, userInitiated) {
      index = (newIndex + slides.length) % slides.length;
      render();
      if (userInitiated) restartAutoplay();
    }

    function next() {
      goTo(index + 1);
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      timer = setInterval(next, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function restartAutoplay() {
      startAutoplay();
    }

    // Pausa al pasar el mouse o al enfocar con teclado; sigue al salir.
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoplay(); else startAutoplay();
    });

    render();
    startAutoplay();
  }

  /* ------------------------------------------------------------------------
     FOOTER — año actual
     ------------------------------------------------------------------------ */
  function initFooterYear() {
    const el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------------
     FORMULARIO DE LEADS — validación accesible + envío configurable
     ------------------------------------------------------------------------ */
  function initLeadForm() {
    const form = document.getElementById('lead-form-el');
    if (!form) return;

    const statusEl = document.getElementById('form-status');

    const fields = {
      name: { el: document.getElementById('name'), errorEl: document.getElementById('error-name'), validate: validateRequiredText },
      email: { el: document.getElementById('email'), errorEl: document.getElementById('error-email'), validate: validateEmail },
      phone: { el: document.getElementById('phone'), errorEl: document.getElementById('error-phone'), validate: validatePhone },
      consent: { el: document.getElementById('consent'), errorEl: document.getElementById('error-consent'), validate: validateConsent }
    };

    function validateRequiredText(value) {
      return value.trim().length >= 2;
    }

    function validateEmail(value) {
      // Validación simple y suficiente para el cliente; el back-end/servicio final debe re-validar.
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function validatePhone(value) {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 8;
    }

    function validateConsent(checked) {
      return checked === true;
    }

    function setFieldError(field, hasError) {
      if (!field.el || !field.errorEl) return;
      field.el.setAttribute('aria-invalid', hasError ? 'true' : 'false');
      field.errorEl.classList.toggle('is-visible', hasError);
    }

    function validateField(key) {
      const field = fields[key];
      if (!field || !field.el) return true;

      const value = field.el.type === 'checkbox' ? field.el.checked : field.el.value;
      const isValid = field.validate(value);
      setFieldError(field, !isValid);
      return isValid;
    }

    function validateAll() {
      let isValid = true;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key)) isValid = false;
      });
      return isValid;
    }

    // Validación en vivo al salir del campo
    Object.keys(fields).forEach(function (key) {
      const field = fields[key];
      if (!field.el) return;
      const eventName = field.el.type === 'checkbox' ? 'change' : 'blur';
      field.el.addEventListener(eventName, function () { validateField(key); });
    });

    function showStatus(type, message) {
      if (!statusEl) return;
      statusEl.className = 'form-status is-visible ' + type;
      const icon = type === 'success'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="16"/></svg>';
      statusEl.innerHTML = icon + '<span>' + message + '</span>';
    }

    function resetStatus() {
      if (!statusEl) return;
      statusEl.className = 'form-status';
      statusEl.innerHTML = '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      resetStatus();

      if (!validateAll()) {
        showStatus('error', 'Revisá los campos marcados antes de enviar el formulario.');
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      const payload = {
        Nombre: fields.name.el.value.trim(),
        Email: fields.email.el.value.trim(),
        WhatsApp: fields.phone.el.value.trim(),
        'URL de la tienda': document.getElementById('store-url').value.trim() || '(no especificada)',
        Mensaje: document.getElementById('message').value.trim() || '(sin mensaje)',
        // Campos especiales de FormSubmit: definen asunto y formato del email recibido.
        _subject: 'Nueva consulta desde la landing — Inobarix',
        _template: 'table',
        _captcha: 'false'
      };

      if (!FORM_ENDPOINT) {
        // Sin endpoint configurado: no se envía nada a ningún servidor.
        // Simulamos el estado de éxito para no romper la demo/preview.
        setTimeout(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
          showStatus('success', '¡Listo! (Modo demo: configurá FORM_ENDPOINT en js/main.js para recibir estos datos de verdad). Te contactaríamos en menos de 24 hs hábiles.');
          form.reset();
        }, 500);
        return;
      }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Error en el envío');
          showStatus('success', '¡Gracias! Recibimos tu consulta y te vamos a contactar a la brevedad.');
          form.reset();
        })
        .catch(function () {
          showStatus('error', 'No pudimos enviar el formulario. Probá de nuevo o escribinos por WhatsApp.');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
    });
  }

  /* ------------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initWhatsApp();
    initHeaderScroll();
    initMobileNav();
    initScrollReveal();
    initModuleCarousel();
    initFooterYear();
    initLeadForm();
  });
})();
