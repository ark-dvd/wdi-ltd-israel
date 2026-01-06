// WDI Israel - Main JavaScript
// Data-driven site functionality with CMS support

// ===== Global Data Store =====
const WDI = {
  projects: [],
  team: [],
  services: [],
  clients: [],
  testimonials: []
};

// ===== Data Loading =====
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error(`Error loading ${path}:`, e);
  }
  return null;
}

// Load all JSON files from a folder using index file
async function loadFolderData(folderPath) {
  const indexData = await loadJSON(`${folderPath}/_index.json`);
  if (!indexData || !indexData.files) return [];

  const items = [];
  for (const file of indexData.files) {
    const data = await loadJSON(`${folderPath}/${file}`);
    if (data) {
      // Add id from filename if not present
      if (!data.id) {
        data.id = file.replace('.json', '');
      }
      items.push(data);
    }
  }
  return items;
}

async function initializeData() {
  // Load all data - prefer folder collections (CMS), fallback to combined files

  // Load team from folder first, fallback to combined file
  WDI.team = await loadFolderData('/data/team');
  if (!WDI.team.length) {
    const teamData = await loadJSON('/data/team.json');
    if (teamData && teamData.team) {
      WDI.team = teamData.team;
    }
  }

  // Load projects from folder first, fallback to combined file
  WDI.projects = await loadFolderData('/data/projects');
  if (!WDI.projects.length) {
    const projectsData = await loadJSON('/data/projects.json');
    if (projectsData && projectsData.projects) {
      WDI.projects = projectsData.projects;
    }
  }

  // Load clients from folder first, fallback to combined file
  WDI.clients = await loadFolderData('/data/clients-items');
  if (!WDI.clients.length) {
    const clientsData = await loadJSON('/data/clients.json');
    if (clientsData && clientsData.clients) {
      WDI.clients = clientsData.clients;
    }
  }

  // Load testimonials from folder first, fallback to combined file
  WDI.testimonials = await loadFolderData('/data/testimonials');
  if (!WDI.testimonials.length) {
    const clientsData = await loadJSON('/data/clients.json');
    if (clientsData && clientsData.testimonials) {
      WDI.testimonials = clientsData.testimonials;
    }
  }

  // Load services (single file only)
  const servicesData = await loadJSON('/data/services.json');
  if (servicesData && servicesData.services) {
    WDI.services = servicesData.services;
  }

  return WDI;
}

// ===== Header Scroll Effect =====
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
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

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      const projectCards = document.querySelectorAll('.project-card');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      projectCards.forEach(card => {
        const category = card.dataset.category;

        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ===== Render Projects =====
function renderProjects(container, projects, options = {}) {
  if (!container || !projects || !projects.length) return;
  
  const { limit, featured } = options;
  let filteredProjects = [...projects];
  
  if (featured) {
    filteredProjects = filteredProjects.filter(p => p.featured);
  }
  
  if (limit) {
    filteredProjects = filteredProjects.slice(0, limit);
  }
  
  container.innerHTML = filteredProjects.map(project => `
    <a href="/projects/${project.id}.html" class="project-card" data-category="${getCategoryId(project.category)}">
      <img src="${project.image || '/images/placeholder-project.jpg'}" alt="${project.title}" loading="lazy" 
           onerror="this.src='/images/placeholder-project.jpg'">
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
// Founders in separate row of 3, then admin, heads, team (sorted by last name)
function renderTeam(container, team, options = {}) {
  if (!container || !team || !team.length) return;

  // Helper function to get last name (second word in Hebrew name)
  const getLastName = (name) => {
    const parts = name.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : name;
  };

  // Helper to render a team card
  const renderCard = (member) => `
    <div class="team-card" data-category="${member.category || 'team'}">
      <div class="team-image">
        <img src="${member.image || '/images/placeholder-person.jpg'}" alt="${member.name}" loading="lazy"
             onerror="this.src='/images/placeholder-person.jpg'">
      </div>
      <h4>${member.name}</h4>
      <p class="team-role">${member.position || member.role}</p>
      ${member.linkedin ? `
        <a href="${member.linkedin}" target="_blank" rel="noopener" class="team-linkedin">
          <i class="fab fa-linkedin-in"></i>
        </a>
      ` : ''}
    </div>
  `;

  // Separate team members by category
  const founders = team.filter(m => m.category === 'founders').sort((a, b) => (a.order || 999) - (b.order || 999));
  const admin = team.filter(m => m.category === 'admin').sort((a, b) => (a.order || 999) - (b.order || 999));
  const heads = team.filter(m => m.category === 'heads').sort((a, b) => (a.order || 999) - (b.order || 999));
  const teamMembers = team.filter(m => m.category === 'team').sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name), 'he'));

  const { category, limit } = options;

  // If filtering by category, use simple grid
  if (category) {
    let filtered = team.filter(m => m.category === category);
    if (limit) filtered = filtered.slice(0, limit);
    container.innerHTML = filtered.map(renderCard).join('');
    return;
  }

  // Build sections: founders separate, then rest of team
  let html = '';

  // Founders section (separate row of 3)
  if (founders.length > 0) {
    html += `
      <div class="team-section team-founders">
        <h3 class="team-section-title">מייסדים ושותפים</h3>
        <div class="team-founders-grid">
          ${founders.map(renderCard).join('')}
        </div>
      </div>
    `;
  }

  // Rest of team (admin, heads, team members)
  const restOfTeam = [...admin, ...heads, ...teamMembers];
  if (restOfTeam.length > 0) {
    let teamToShow = limit ? restOfTeam.slice(0, limit - founders.length) : restOfTeam;
    html += `
      <div class="team-section team-members">
        <h3 class="team-section-title">הצוות</h3>
        <div class="team-members-grid">
          ${teamToShow.map(renderCard).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ===== Render Services =====
function renderServices(container, services) {
  if (!container || !services || !services.length) return;
  
  const sortedServices = [...services].sort((a, b) => (a.order || 999) - (b.order || 999));
  
  container.innerHTML = sortedServices.map(service => `
    <a href="/services/${service.id}.html" class="service-card">
      <div class="service-icon">
        <i class="fas fa-${service.icon || 'cog'}"></i>
      </div>
      <h4>${service.title}</h4>
      <p>${service.shortDescription}</p>
    </a>
  `).join('');
}

// ===== Render All Testimonials (Grid, not slider) =====
function renderTestimonials(container, testimonials) {
  if (!container || !testimonials || !testimonials.length) return;
  
  container.innerHTML = `
    <div class="testimonials-grid">
      ${testimonials.map(t => `
        <div class="testimonial-card">
          <div class="testimonial-quote-icon">
            <i class="fas fa-quote-right"></i>
          </div>
          <p class="testimonial-text">${t.quote}</p>
          <div class="testimonial-author-info">
            <strong>${t.author}</strong>
            <span>${t.position}</span>
            <span>${t.company}</span>
          </div>
          ${t.letterUrl ? `
            <a href="${t.letterUrl}" target="_blank" class="testimonial-letter-btn">
              <i class="fas fa-file-pdf"></i> צפייה במכתב ההמלצה
            </a>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// ===== Render Clients Logos =====
function renderClients(container, clients) {
  if (!container || !clients || !clients.length) return;
  
  container.innerHTML = clients.map(client => `
    <div class="client-logo">
      <img src="${client.logo}" alt="${client.name}" loading="lazy"
           onerror="this.style.opacity='0.3'">
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
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שולח...';
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
        submitBtn.innerHTML = originalText;
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
  if (testimonialsContainer) {
    renderTestimonials(testimonialsContainer, WDI.testimonials);
  }
  
  const clientsGrid = document.querySelector('#clients-grid');
  if (clientsGrid) {
    renderClients(clientsGrid, WDI.clients);
  }
});

// ===== Share Buttons =====
function createShareButtons(title, url) {
  const encodedUrl = encodeURIComponent(url || window.location.href);
  const encodedTitle = encodeURIComponent(title || document.title);

  return `
    <div class="share-buttons">
      <span class="share-buttons-label">שתף:</span>
      <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" target="_blank" rel="noopener" class="share-btn whatsapp" title="שתף בווטסאפ">
        <i class="fab fa-whatsapp"></i>
      </a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener" class="share-btn facebook" title="שתף בפייסבוק">
        <i class="fab fa-facebook-f"></i>
      </a>
      <a href="mailto:?subject=${encodedTitle}&body=${encodedUrl}" class="share-btn email" title="שלח במייל">
        <i class="fas fa-envelope"></i>
      </a>
    </div>
  `;
}

// ===== Export for use in other scripts =====
window.WDI = WDI;
window.renderProjects = renderProjects;
window.renderTeam = renderTeam;
window.renderServices = renderServices;
window.renderTestimonials = renderTestimonials;
window.renderClients = renderClients;
window.createShareButtons = createShareButtons;
