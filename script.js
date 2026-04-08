/* =====================================================
   JEANNIE PEZAN | COLDWELL BANKER — COMPLETE SCRIPT
   ===================================================== */

'use strict';

/* =====================================================
   NAVBAR — SCROLL EFFECT
   ===================================================== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* =====================================================
   HAMBURGER MENU TOGGLE
   ===================================================== */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

/* =====================================================
   ACTIVE NAV LINK TRACKING ON SCROLL
   ===================================================== */
(function initActiveNavTracking() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const sectionIds = Array.from(sections).map(function (s) { return s.id; });

  function updateActiveLink() {
    const scrollPos = window.scrollY + 100;
    let current = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();

/* =====================================================
   SCROLL-TO-TOP BUTTON
   ===================================================== */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* =====================================================
   SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ===================================================== */
(function initSmoothScroll() {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const navHeight = 80;
    const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetPos, behavior: 'smooth' });
  });
})();

/* =====================================================
   SEARCH TAB SWITCHING (BUY / SELL)
   ===================================================== */
(function initSearchTabs() {
  const tabs = document.querySelectorAll('.search-tab');
  if (!tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      const searchInput = document.getElementById('heroSearch');
      if (searchInput) {
        if (tab.dataset.tab === 'sell') {
          searchInput.placeholder = 'Enter your home address to get a valuation…';
        } else {
          searchInput.placeholder = 'Enter city, zip, or neighborhood…';
        }
      }
    });
  });
})();

/* =====================================================
   HANDLE SEARCH
   ===================================================== */
function handleSearch() {
  const input = document.getElementById('heroSearch');
  const activeTab = document.querySelector('.search-tab.active');
  const isSell = activeTab && activeTab.dataset.tab === 'sell';

  if (isSell) {
    const valInput = document.getElementById('valuationInput');
    if (valInput && input && input.value.trim()) {
      valInput.value = input.value.trim();
    }
    const valSection = document.getElementById('valuation');
    if (valSection) {
      const navHeight = 80;
      const targetPos = valSection.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  } else {
    const listingsSection = document.getElementById('listings');
    if (listingsSection) {
      const navHeight = 80;
      const targetPos = listingsSection.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  }
}

// Allow Enter key on hero search input
(function initSearchEnterKey() {
  const input = document.getElementById('heroSearch');
  if (!input) return;
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  });
})();

/* =====================================================
   ANIMATED COUNTERS
   ===================================================== */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  let countersStarted = false;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(function (counter) {
          animateCounter(counter);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
})();

/* =====================================================
   LISTING FILTER BUTTONS
   ===================================================== */
(function initListingFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const listingCards = document.querySelectorAll('.listing-card');
  if (!filterBtns.length || !listingCards.length) return;

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      listingCards.forEach(function (card) {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else {
          const category = card.dataset.category;
          if (category === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        }
      });
    });
  });
})();

/* =====================================================
   LISTING SAVE / HEART BUTTON TOGGLE
   ===================================================== */
(function initSaveButtons() {
  const saveButtons = document.querySelectorAll('.listing-save');
  if (!saveButtons.length) return;

  saveButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const isSaved = btn.classList.toggle('saved');
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isSaved ? 'fas fa-heart' : 'far fa-heart';
      }
      btn.setAttribute('aria-label', isSaved ? 'Unsave listing' : 'Save listing');

      if (isSaved) {
        showToast('Listing saved to your favorites!');
      } else {
        showToast('Listing removed from favorites.');
      }
    });
  });
})();

/* =====================================================
   TESTIMONIALS CAROUSEL
   ===================================================== */
(function initTestimonials() {
  const track   = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const dotsContainer = document.getElementById('testimonialDots');

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const cards = track.querySelectorAll('.testimonial-card');
  if (!cards.length) return;

  let current = 0;
  let autoplayTimer = null;
  const total = cards.length;

  function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.dataset.index = i;
      dot.addEventListener('click', function () {
        goToTestimonial(parseInt(dot.dataset.index, 10));
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function goToTestimonial(index) {
    current = (index + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';

    // Update dots
    const dots = dotsContainer.querySelectorAll('.testimonial-dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function resetAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () {
      goToTestimonial(current + 1);
    }, 5000);
  }

  prevBtn.addEventListener('click', function () {
    goToTestimonial(current - 1);
    resetAutoplay();
  });

  nextBtn.addEventListener('click', function () {
    goToTestimonial(current + 1);
    resetAutoplay();
  });

  // Pause autoplay on hover
  track.addEventListener('mouseenter', function () {
    if (autoplayTimer) clearInterval(autoplayTimer);
  });
  track.addEventListener('mouseleave', function () {
    resetAutoplay();
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX   = 0;

  track.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToTestimonial(current + 1);
      } else {
        goToTestimonial(current - 1);
      }
      resetAutoplay();
    }
  }, { passive: true });

  createDots();
  resetAutoplay();
})();

/* =====================================================
   HOME VALUATION HANDLER
   ===================================================== */
function handleValuation() {
  const input = document.getElementById('valuationInput');
  if (!input) return;

  const address = input.value.trim();
  if (!address) {
    input.focus();
    input.style.borderColor = '#e53e3e';
    setTimeout(function () {
      input.style.borderColor = '';
    }, 2000);
    showToast('Please enter your home address to continue.');
    return;
  }

  showToast('Thanks! We\'ll deliver your free home estimate within 24 hours.');
  input.value = '';
}

// Enter key on valuation input
(function initValuationEnterKey() {
  const input = document.getElementById('valuationInput');
  if (!input) return;
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValuation();
    }
  });
})();

/* =====================================================
   CONTACT FORM SUBMISSION
   ===================================================== */
function handleSubmit(e) {
  e.preventDefault();

  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form || !submitBtn) return;

  // Simple validation
  const required = form.querySelectorAll('[required]');
  let valid = true;

  required.forEach(function (field) {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#e53e3e';
      valid = false;
    }
  });

  if (!valid) {
    showToast('Please fill in all required fields.');
    // Scroll to first invalid field
    const firstInvalid = form.querySelector('[required]:placeholder-shown, [required][value=""]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Show loading state
  const btnText    = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  if (btnText)    btnText.style.display    = 'none';
  if (btnLoading) btnLoading.style.display = 'inline-flex';
  submitBtn.disabled = true;

  // Simulate async submission
  setTimeout(function () {
    // Reset loading state
    if (btnText)    btnText.style.display    = '';
    if (btnLoading) btnLoading.style.display = 'none';
    submitBtn.disabled = false;

    // Reset form
    form.reset();

    // Remove any red borders
    required.forEach(function (field) {
      field.style.borderColor = '';
    });

    showToast('Message sent! Jeannie will be in touch within a few hours.');
  }, 1800);
}

/* =====================================================
   SHOW TOAST NOTIFICATION
   ===================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Clear any existing timer
  if (toast._hideTimer) {
    clearTimeout(toast._hideTimer);
    toast.classList.remove('show');
  }

  toast.textContent = message;

  // Use rAF to ensure transition fires after display
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });
  });

  toast._hideTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 4000);
}

/* =====================================================
   SCROLL REVEAL WITH INTERSECTION OBSERVER
   ===================================================== */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // Stagger children if they share a parent
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'))
          : [];
        const index = siblings.indexOf(entry.target);
        const delay = index > 0 ? index * 80 : 0;

        setTimeout(function () {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();

/* =====================================================
   EXPOSE GLOBAL FUNCTIONS (called from HTML onclick)
   ===================================================== */
window.handleSearch     = handleSearch;
window.handleValuation  = handleValuation;
window.handleSubmit     = handleSubmit;
window.showToast        = showToast;
