/**
 * EliteK9s — script.js
 * Hamburger menu, mobile nav, scroll animations, hero slider, smooth nav
 */

(function () {
  'use strict';

  /* ================================================
     HELPERS
  ================================================ */
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  /* ================================================
     MOBILE NAVIGATION
  ================================================ */
  const hamburgerBtn = $('#hamburger-btn');
  const mobileNav = $('#mobile-nav');
  const mobileOverlay = $('#mobile-overlay');
  const closeBtn = $('#mobile-close-btn');
  const mobileLinks = $$('.mobile-nav__link');

  function openMenu() {
    mobileNav.classList.add('is-open');
    mobileOverlay.classList.add('is-visible');
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileNav.classList.remove('is-open');
    mobileOverlay.classList.remove('is-visible');
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function () {
      const isOpen = mobileNav.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMenu);
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('is-open')) {
      closeMenu();
    }
  });

  /* ================================================
     ACTIVE NAV LINK ON SCROLL (Intersection Observer)
  ================================================ */
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link');
  const mobNavLinks = $$('.mobile-nav__link');

  const navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          navLinks.forEach(function (link) {
            link.classList.toggle(
              'nav__link--active',
              link.getAttribute('href') === '#' + id
            );
          });

          mobNavLinks.forEach(function (link) {
            link.classList.toggle(
              'mobile-nav__link--active',
              link.getAttribute('href') === '#' + id
            );
          });
        }
      });
    },
    {
      threshold: 0.25,
      rootMargin: '-80px 0px -40% 0px',
    }
  );

  sections.forEach(function (section) {
    navObserver.observe(section);
  });

  /* ================================================
     SMOOTH SCROLL FOR ALL ANCHOR LINKS
  ================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')
          ? document.querySelector('.header').offsetHeight
          : 0;
        const topBarHeight = document.querySelector('.top-bar')
          ? document.querySelector('.top-bar').offsetHeight
          : 0;
        const offset = headerHeight + topBarHeight + 10;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  /* ================================================
     HERO SLIDER — Auto-advance + dots + arrows
  ================================================ */
  const slides = $$('.hero__slide');
  const dots = $$('.hero__dot');
  const prevBtn = $('#hero-prev');
  const nextBtn = $('#hero-next');
  const heroSection = $('.hero');
  const SLIDE_INTERVAL = 6000; // 6 seconds
  let currentSlide = 0;
  let sliderTimer = null;

  function restartKenBurns(slide) {
    /* Re-trigger Ken Burns by briefly removing the active class from the bg */
    const bg = slide.querySelector('.hero__bg--zoom');
    if (!bg) return;
    bg.style.animation = 'none';
    /* Force reflow */
    void bg.offsetWidth;
    bg.style.animation = '';
  }

  function restartProgressBar() {
    /* Restart the ::after animation by cloning the hero element */
    if (!heroSection) return;
    heroSection.style.animation = 'none';
    void heroSection.offsetWidth;
    heroSection.style.animation = '';
  }

  function goToSlide(index) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('hero__slide--active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('hero__dot--active', i === index);
    });

    restartKenBurns(slides[index]);
    restartProgressBar();
    currentSlide = index;
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function prevSlide() {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }

  function startSlider() {
    if (slides.length > 1) {
      sliderTimer = setInterval(nextSlide, SLIDE_INTERVAL);
    }
  }

  function stopSlider() {
    clearInterval(sliderTimer);
  }

  function resetSlider() {
    stopSlider();
    startSlider();
  }

  /* Dots */
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      goToSlide(index);
      resetSlider();
    });
  });

  /* Arrows */
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      prevSlide();
      resetSlider();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      nextSlide();
      resetSlider();
    });
  }

  /* Pause on hover */
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopSlider);
    heroSection.addEventListener('mouseleave', startSlider);
  }

  /* Keyboard support */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { prevSlide(); resetSlider(); }
    if (e.key === 'ArrowRight') { nextSlide(); resetSlider(); }
  });

  /* Touch swipe support */
  let touchStartX = 0;
  if (heroSection) {
    heroSection.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    heroSection.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
        resetSlider();
      }
    }, { passive: true });
  }

  startSlider();

  /* ================================================
     SCROLL FADE-IN ANIMATION
  ================================================ */
  const fadeElements = $$('.about__card, .service-card, .why-card, .program-card, .pillar, .about-detail__content-col, .k9-solutions__content, .contact__info, .contact__form');

  fadeElements.forEach(function (el) {
    el.classList.add('fade-in');
  });

  const fadeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  fadeElements.forEach(function (el) {
    fadeObserver.observe(el);
  });

  /* Stagger grid children */
  const staggerGroups = [
    '.about__grid',
    '.services__grid',
    '.why-us__grid',
    '.programs__grid',
    '.approach-pillars',
  ];

  staggerGroups.forEach(function (groupSelector) {
    const group = $(groupSelector);
    if (!group) return;
    const children = group.children;
    Array.from(children).forEach(function (child, i) {
      child.style.transitionDelay = (i * 80) + 'ms';
    });
  });

  /* ================================================
     CONTACT FORM (validation + submit feedback)
  ================================================ */
  const contactForm = $('#contact-form');
  const submitBtn = $('#contact-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = $('#form-name').value.trim();
      const email = $('#form-email').value.trim();
      const message = $('#form-message').value.trim();

      if (!name || !email || !message) {
        showFormMessage('Please fill in all required fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
      }

      /* Simulate successful submission */
      submitBtn.textContent = 'SENDING…';
      submitBtn.disabled = true;

      setTimeout(function () {
        showFormMessage('Thank you! We\'ll be in touch within 24 hours to schedule your free evaluation.', 'success');
        contactForm.reset();
        submitBtn.textContent = 'SEND MESSAGE ›';
        submitBtn.disabled = false;
      }, 1200);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFormMessage(text, type) {
    let msg = $('#form-message-feedback');
    if (!msg) {
      msg = document.createElement('p');
      msg.id = 'form-message-feedback';
      contactForm.appendChild(msg);
    }
    msg.textContent = text;
    msg.style.cssText = [
      'text-align: center',
      'font-size: 0.88rem',
      'font-weight: 600',
      'margin-top: 14px',
      'padding: 12px 16px',
      'border-radius: 4px',
      type === 'success'
        ? 'color: #166534; background: #dcfce7; border: 1px solid #bbf7d0'
        : 'color: #991b1b; background: #fee2e2; border: 1px solid #fecaca',
    ].join(';');

    setTimeout(function () {
      if (msg) msg.remove();
    }, 6000);
  }

  /* ================================================
     STICKY HEADER SHADOW ON SCROLL
  ================================================ */
  const header = $('.header');

  window.addEventListener('scroll', function () {
    if (!header) return;
    if (window.scrollY > 20) {
      header.style.boxShadow = '0 4px 24px rgba(26,37,64,0.18)';
    } else {
      header.style.boxShadow = '0 2px 12px rgba(26,37,64,0.12)';
    }
  }, { passive: true });

  /* ================================================
     FAQ ACCORDION
  ================================================ */
  const faqQuestions = $$('.faq__question');

  faqQuestions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);

      /* Close all other items first */
      faqQuestions.forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          const otherId = otherBtn.getAttribute('aria-controls');
          const otherAnswer = document.getElementById(otherId);
          otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      /* Toggle clicked item */
      btn.setAttribute('aria-expanded', String(!expanded));
      if (answer) {
        answer.hidden = expanded;
      }
    });
  });

  /* ================================================
     ANIMATED STATS COUNTER
  ================================================ */
  const statNumbers = $$('.stat-item__number[data-target]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const step = 16;
    const steps = Math.ceil(duration / step);
    const increment = target / steps;
    let current = 0;
    let count = 0;

    const timer = setInterval(function () {
      count++;
      current = Math.min(Math.round(increment * count), target);
      el.textContent = current.toLocaleString();
      if (current >= target) {
        clearInterval(timer);
        el.textContent = target.toLocaleString();
      }
    }, step);
  }

  const statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(function (el) {
    statsObserver.observe(el);
  });

})();
