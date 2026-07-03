document.addEventListener('DOMContentLoaded', () => {

  /* Scroll progress bar + header shrink + back-to-top */
  const progressBar = document.getElementById('progressBar');
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    header.classList.toggle('scrolled', scrollTop > 20);
    backToTop.classList.toggle('visible', scrollTop > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Mobile nav */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navMenu.classList.toggle('mobile-open', open);
  });

  document.querySelectorAll('#navLinks a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('mobile-open');
    });
  });

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* Animated stat counters */
  const stats = document.querySelectorAll('.stat-num');
  let statsAnimated = false;
  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    stats.forEach(stat => {
      const target = parseFloat(stat.dataset.target);
      const decimals = parseInt(stat.dataset.decimal || '0', 10);
      const divisor = decimals ? decimals : 1;
      const finalValue = decimals ? target / decimals : target;
      const duration = 1600;
      const startTime = performance.now();
      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = finalValue * eased;
        stat.textContent = decimals ? current.toFixed(1) : Math.round(current);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  const statsSection = document.getElementById('stats');
  if (statsSection) {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        animateStats();
        obs.disconnect();
      }
    }, { threshold: 0.4 }).observe(statsSection);
  }

  /* In-store / Mobile pricing toggle */
  const locationSwitch = document.getElementById('locationSwitch');
  const labelInStore = document.getElementById('labelInStore');
  const labelMobile = document.getElementById('labelMobile');

  locationSwitch.addEventListener('click', () => {
    const isMobile = document.body.classList.toggle('mobile-pricing');
    locationSwitch.setAttribute('aria-checked', String(isMobile));
    labelInStore.classList.toggle('active', !isMobile);
    labelMobile.classList.toggle('active', isMobile);
  });

  /* Testimonial carousel */
  const track = document.getElementById('carouselTrack');
  const slides = track ? Array.from(track.children) : [];
  const dotsWrap = document.getElementById('carouselDots');
  let current = 0;
  let carouselTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAutoplay() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => goTo(current + 1), 6000);
  }

  document.getElementById('nextReview').addEventListener('click', () => { goTo(current + 1); startAutoplay(); });
  document.getElementById('prevReview').addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
  startAutoplay();

  /* FAQ accordion */
  document.querySelectorAll('.accordion-item').forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-body').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
    });
  });

  /* Service card "Book This" prefill */
  document.querySelectorAll('[data-service]').forEach(el => {
    el.addEventListener('click', () => {
      const service = el.dataset.service;
      const select = document.getElementById('service');
      const optionExists = Array.from(select.options).some(o => o.value === service);
      if (optionExists) select.value = service;
    });
  });

  /* Booking form: location toggle shows/hides address */
  const addressGroup = document.getElementById('addressGroup');
  const addressInput = document.getElementById('address');
  document.querySelectorAll('input[name="location"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const mobile = document.querySelector('input[name="location"]:checked').value === 'Mobile';
      addressGroup.classList.toggle('hidden', !mobile);
      addressInput.required = mobile;
    });
  });

  /* Set min date to today */
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  /* Booking form validation + submit */
  const form = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');
  const successPanel = document.getElementById('successPanel');
  const successService = document.getElementById('successService');

  function showError(input, message) {
    input.classList.add('invalid');
    const msgEl = input.closest('.form-group')?.querySelector('.error-msg');
    if (msgEl) msgEl.textContent = message;
  }
  function clearError(input) {
    input.classList.remove('invalid');
    const msgEl = input.closest('.form-group')?.querySelector('.error-msg');
    if (msgEl) msgEl.textContent = '';
  }

  form.addEventListener('input', (e) => {
    if (e.target.matches('input, select, textarea')) clearError(e.target);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const requiredFields = [
      { el: document.getElementById('name'), msg: 'Please enter your name.' },
      { el: document.getElementById('phone'), msg: 'Please enter a phone number.' },
      { el: document.getElementById('email'), msg: 'Please enter a valid email.' },
      { el: document.getElementById('service'), msg: 'Please choose a service.' },
      { el: document.getElementById('date'), msg: 'Please pick a date.' },
      { el: document.getElementById('time'), msg: 'Please pick a time.' },
    ];

    requiredFields.forEach(({ el, msg }) => {
      if (!el.value.trim()) { showError(el, msg); valid = false; }
    });

    const emailInput = document.getElementById('email');
    if (emailInput.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      showError(emailInput, 'Please enter a valid email.');
      valid = false;
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput.value.trim() && phoneInput.value.replace(/\D/g, '').length < 7) {
      showError(phoneInput, 'Please enter a valid phone number.');
      valid = false;
    }

    const locationValue = document.querySelector('input[name="location"]:checked').value;
    if (locationValue === 'Mobile' && !addressInput.value.trim()) {
      showError(addressInput, 'Please enter your address for mobile service.');
      valid = false;
    }

    if (!valid) {
      form.querySelector('.invalid')?.focus();
      return;
    }

    submitBtn.classList.add('loading');

    const data = {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      vehicle: document.getElementById('vehicle').value.trim(),
      service: document.getElementById('service').value,
      location: locationValue,
      address: addressInput.value.trim(),
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      notes: document.getElementById('notes').value.trim(),
    };

    // Keep a local record of the request on this device.
    try {
      const stored = JSON.parse(localStorage.getItem('dadModeBookings') || '[]');
      stored.push({ ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem('dadModeBookings', JSON.stringify(stored));
    } catch (err) { /* localStorage unavailable, ignore */ }

    setTimeout(() => {
      submitBtn.classList.remove('loading');

      const bodyLines = [
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        `Email: ${data.email}`,
        `Vehicle: ${data.vehicle || 'N/A'}`,
        `Service: ${data.service}`,
        `Location: ${data.location}${data.location === 'Mobile' ? ' - ' + data.address : ''}`,
        `Preferred Date: ${data.date}`,
        `Preferred Time: ${data.time}`,
        `Notes: ${data.notes || 'None'}`,
      ].join('\n');

      const mailto = `mailto:hello@dadmodedetailing.com?subject=${encodeURIComponent('New Booking Request: ' + data.service)}&body=${encodeURIComponent(bodyLines)}`;
      window.location.href = mailto;

      successService.textContent = data.service;
      form.style.display = 'none';
      successPanel.classList.add('visible');
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 700);
  });

  document.getElementById('bookAnotherBtn').addEventListener('click', () => {
    successPanel.classList.remove('visible');
    form.reset();
    form.style.display = 'block';
    addressGroup.classList.add('hidden');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
  });

});
