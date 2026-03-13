/* ═══════════════════════════════════════
   WDI Neot Hovav W2E — Main JS
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initDropdowns();
  initActiveNav();
  initFadeUp();
  initMobileMenu();
});

/* ─── Navbar scroll effect ─── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function checkScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
}

/* ─── Dropdown menus ─── */
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.nav-dropdown-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dd.classList.contains('open');

      // Close all dropdowns
      dropdowns.forEach(d => d.classList.remove('open'));

      // Toggle clicked one
      if (!isOpen) {
        dd.classList.add('open');
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', () => {
    dropdowns.forEach(d => d.classList.remove('open'));
  });

  // Prevent menu click from closing
  document.querySelectorAll('.nav-dropdown-menu').forEach(menu => {
    menu.addEventListener('click', (e) => {
      // Let links navigate normally
    });
  });
}

/* ─── Active nav highlight ─── */
function initActiveNav() {
  const path = window.location.pathname;
  const links = document.querySelectorAll('.nav-dropdown-menu a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Normalize paths for comparison
    const linkPath = new URL(href, window.location.origin).pathname;
    const currentPath = path.endsWith('/') ? path + 'index.html' : path;
    const normalizedLink = linkPath.endsWith('/') ? linkPath + 'index.html' : linkPath;

    if (currentPath === normalizedLink ||
        path === linkPath ||
        (path.endsWith('/') && linkPath === path + 'index.html') ||
        (linkPath.endsWith('/') && path === linkPath + 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ─── Fade-up on scroll ─── */
function initFadeUp() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ─── Mobile menu ─── */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('mobile-open');
    toggle.classList.toggle('active');
  });
}
