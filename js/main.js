// WDI Israel - Main JavaScript
// Data-driven site functionality

// ===== Global Data Store =====
const WDI = {
  projects: [],
  team: [],
  services: [],
  clients: null
};

// ===== Data Loading =====
async function loadData(dataFile) {
  try {
    const response = await fetch(`/data/${dataFile}.json`);
    if (!response.ok) throw new Error(`Failed to load ${dataFile}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${dataFile}:`, error);
    return null;
  }
}

async function initializeData() {
  const [projectsData, teamData, servicesData, clientsData] = await Promise.all([
    loadData('projects'),
    loadData('team'),
    loadData('services'),
    loadData('clients')
  ]);
  
  if (projectsData) WDI.projects = projectsData.projects;
  if (teamData) WDI.team = teamData.team;
  if (servicesData) WDI.services = servicesData.services;
  if (clientsData) WDI.clients = clientsData;
  
  return WDI;
}

// ===== Header Scroll Effect =====
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
}

// ===== Mobile Navigation =====
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');
  
  if (!toggle || !nav) return;
  
  toggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('active');
      toggle.classList.remove('active');
    }
  });
}

// ===== Projects Filter =====
function initProjectsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (!filterBtns.length) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter projects
      projectCards.forEach(card => {
        const category = card.dataset.category;
        
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => card.style.opacity = '1', 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => card.style.display = 'none', 300);
        }
      });
    });
  });
}

// ===== Render Projects =====
function renderProjects(container, projects, options = {}) {
  if (!container) return;
  
  const { limit, featured } = options;
  let filteredProjects = projects;
  
  if (featured) {
    filteredProjects = projects.filter(p => p.featured);
  }
  
  if (limit) {
    filteredProjects = filteredProjects.slice(0, limit);
  }
  
  container.innerHTML = filteredProjects.map(project => `
    <a href="/projects/${project.id}.html" class="project-card" data-category="${getCategoryId(project.category)}">
      <img src="${project.image}" alt="${project.title}" loading="lazy" 
           onerror="this.src='images/placeholder-project.jpg'">
      <div class="project-overlay">
        <span class="project-category">${project.category}</span>
        <h3>${project.title}</h3>
        <p class="project-client">${project.client}</p>
        <span class="project-link btn btn-outline">קרא עוד ←</span>
      </div>
    </a>
  `).join('');
}

function getCategoryId(categoryName) {
  const map = {
    'תעשייה ומסחר': 'industry',
    'תשתיות': 'infrastructure',
    'ממשלתי': 'government'
  };
  return map[categoryName] || 'other';
}

// ===== Render Team =====
function renderTeam(container, team, options = {}) {
  if (!container) return;
  
  const { category, limit } = options;
  let filteredTeam = team.sort((a, b) => a.order - b.order);
  
  if (category) {
    filteredTeam = filteredTeam.filter(m => m.category === category);
  }
  
  if (limit) {
    filteredTeam = filteredTeam.slice(0, limit);
  }
  
  container.innerHTML = filteredTeam.map(member => `
    <div class="team-card" data-category="${member.category}">
      <div class="team-image">
        <img src="${member.image}" alt="${member.name}" loading="lazy"
             onerror="this.src='images/placeholder-person.jpg'">
      </div>
      <h4>${member.name}</h4>
      <p class="team-role">${member.role}</p>
      ${member.bio ? `<p class="team-bio">${member.bio}</p>` : ''}
      ${member.linkedin ? `
        <a href="${member.linkedin}" target="_blank" rel="noopener" class="team-linkedin">
          <i class="fab fa-linkedin-in"></i>
        </a>
      ` : ''}
    </div>
  `).join('');
}

// ===== Render Services =====
function renderServices(container, services, options = {}) {
  if (!container) return;
  
  const sortedServices = services.sort((a, b) => a.order - b.order);
  
  container.innerHTML = sortedServices.map(service => `
    <a href="/services/${service.id}.html" class="service-card">
      <div class="service-icon">
        <i class="fas fa-${service.icon}"></i>
      </div>
      <h4>${service.title}</h4>
      <p>${service.shortDescription}</p>
    </a>
  `).join('');
}

// ===== Render Testimonials =====
function renderTestimonials(container, testimonials) {
  if (!container || !testimonials) return;
  
  let currentIndex = 0;
  
  function showTestimonial(index) {
    const t = testimonials[index];
    container.innerHTML = `
      <div class="testimonial-card">
        <p class="testimonial-quote">${t.quote}</p>
        <p class="testimonial-author">${t.author}</p>
        <p class="testimonial-position">${t.position}, ${t.company}</p>
        ${t.letterUrl ? `<a href="${t.letterUrl}" target="_blank" class="btn btn-secondary mt-20">לצפיה במכתב ההמלצה</a>` : ''}
      </div>
    `;
  }
  
  showTestimonial(currentIndex);
  
  // Auto rotate
  setInterval(() => {
    currentIndex = (currentIndex + 1) % testimonials.length;
    showTestimonial(currentIndex);
  }, 8000);
}

// ===== Render Clients Logos =====
function renderClients(container, clients) {
  if (!container || !clients) return;
  
  container.innerHTML = clients.map(client => `
    <div class="client-logo">
      <img src="${client.logo}" alt="${client.name}" loading="lazy">
    </div>
  `).join('');
}

// ===== Scroll Animations =====
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if (!animatedElements.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => observer.observe(el));
}

// ===== Form Handling =====
function initForms() {
  const forms = document.querySelectorAll('form[data-netlify="true"]');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'שולח...';
      submitBtn.disabled = true;
      
      try {
        const formData = new FormData(form);
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
        
        if (response.ok) {
          form.innerHTML = `
            <div class="form-success">
              <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--secondary); margin-bottom: 20px;"></i>
              <h3>תודה על פנייתך!</h3>
              <p>נחזור אליך בהקדם.</p>
            </div>
          `;
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('אירעה שגיאה. אנא נסה שוב.');
      }
    });
  });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize core functionality
  initHeader();
  initMobileNav();
  initSmoothScroll();
  initScrollAnimations();
  initForms();
  
  // Load data
  await initializeData();
  
  // Initialize data-driven components if containers exist
  const projectsGrid = document.querySelector('#projects-grid');
  if (projectsGrid) {
    renderProjects(projectsGrid, WDI.projects);
    initProjectsFilter();
  }
  
  const featuredProjects = document.querySelector('#featured-projects');
  if (featuredProjects) {
    renderProjects(featuredProjects, WDI.projects, { featured: true, limit: 6 });
  }
  
  const teamGrid = document.querySelector('#team-grid');
  if (teamGrid) {
    renderTeam(teamGrid, WDI.team);
  }
  
  const servicesGrid = document.querySelector('#services-grid');
  if (servicesGrid) {
    renderServices(servicesGrid, WDI.services);
  }
  
  const testimonialsContainer = document.querySelector('#testimonials');
  if (testimonialsContainer && WDI.clients) {
    renderTestimonials(testimonialsContainer, WDI.clients.testimonials);
  }
  
  const clientsGrid = document.querySelector('#clients-grid');
  if (clientsGrid && WDI.clients) {
    renderClients(clientsGrid, WDI.clients.clients);
  }
});

// ===== Export for use in other scripts =====
window.WDI = WDI;
window.renderProjects = renderProjects;
window.renderTeam = renderTeam;
window.renderServices = renderServices;
