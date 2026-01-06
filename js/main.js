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

// Load all JSON files from a folder using _index.json
async function loadFolderData(folderPath) {
  const items = [];
  const indexData = await loadJSON(`${folderPath}/_index.json`);
  
  if (indexData && indexData.files && indexData.files.length > 0) {
    for (const file of indexData.files) {
      const data = await loadJSON(`${folderPath}/${file}`);
      if (data) {
        if (!data.id) {
          data.id = file.replace('.json', '');
        }
        items.push(data);
      }
    }
  }
  
  return items;
}

async function initializeData() {
  // Load team - folder first (CMS), fallback to combined file
  WDI.team = await loadFolderData('/data/team');
  if (!WDI.team.length) {
    const teamData = await loadJSON('/data/team.json');
    if (teamData && teamData.team) {
      WDI.team = teamData.team;
    }
  }

  // Load projects
  WDI.projects = await loadFolderData('/data/projects');
  if (!WDI.projects.length) {
    const projectsData = await loadJSON('/data/projects.json');
    if (projectsData && projectsData.projects) {
      WDI.projects = projectsData.projects;
    }
  }

  // Load clients
  WDI.clients = await loadFolderData('/data/clients-items');
  if (!WDI.clients.length) {
    const clientsData = await loadJSON('/data/clients.json');
    if (clientsData && clientsData.clients) {
      WDI.clients = clientsData.clients;
    }
  }

  // Load testimonials
  WDI.testimonials = await loadFolderData('/data/testimonials');
  if (!WDI.testimonials.length) {
    const clientsData = await loadJSON('/data/clients.json');
    if (clientsData && clientsData.testimonials) {
      WDI.testimonials = clientsData.testimonials;
    }
  }

  // Load services
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
    if (window.pageYOffset > 50) {
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

// ===== Render Team - Square images with hover overlay =====
function renderTeam(container, team) {
  if (!container || !team || !team.length) return;

  const getLastName = (name) => {
    const parts = name.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : name;
  };

  const getImagePath = (imagePath) => {
    if (!imagePath) return '/images/placeholder-person.jpg';
    if (imagePath.startsWith('/')) return imagePath;
    if (imagePath.startsWith('images/')) return '/' + imagePath;
    return imagePath;
  };

  // Build bio text for hover
  const buildBioText = (member) => {
    let bio = '';
    
    if (member.birthYear) {
      bio += `יליד ${member.birthYear}`;
      if (member.birthPlace) bio += `, ${member.birthPlace}`;
      bio += '. ';
    }
    
    if (member.residence) {
      bio += `מתגורר ב${member.residence}. `;
    }
    
    if (member.educationType) {
      bio += `${member.educationType}. `;
    }
    
    if (member.degrees && member.degrees.length > 0) {
      const degreeStrings = member.degrees.map(d => {
        const parts = [];
        if (d.institution) parts.push(d.institution);
        if (d.title) parts.push(d.title);
        if (d.degree) parts.push(d.degree);
        if (d.year) parts.push(d.year);
        return parts.filter(p => p).join(' ');
      }).filter(s => s);
      if (degreeStrings.length > 0) {
        bio += degreeStrings.join(', ') + '.';
      }
    }
    
    return bio;
  };

  // Render single team card with hover overlay
  const renderCard = (member) => {
    const bioText = buildBioText(member);
    const hasDetails = bioText || member.linkedin;
    
    return `
      <div class="team-card">
        <div class="team-card-image">
          <img src="${getImagePath(member.image)}" alt="${member.name}" onerror="this.src='/images/placeholder-person.jpg'">
          ${hasDetails ? `
            <div class="team-card-overlay">
              <h4>${member.name}</h4>
              <p class="team-card-position">${member.position}</p>
              ${bioText ? `<p class="team-card-bio">${bioText}</p>` : ''}
              ${member.linkedin ? `
                <a href="${member.linkedin}" target="_blank" class="team-card-linkedin" onclick="event.stopPropagation();">
                  <i class="fab fa-linkedin-in"></i> LinkedIn
                </a>
              ` : ''}
            </div>
          ` : ''}
        </div>
        <h3 class="team-card-name">${member.name}</h3>
        <p class="team-card-role">${member.position}</p>
      </div>
    `;
  };

  // Filter by category
  const founders = team.filter(m => m.category === 'founders').sort((a, b) => (a.order || 0) - (b.order || 0));
  const admin = team.filter(m => m.category === 'admin').sort((a, b) => (a.order || 0) - (b.order || 0));
  const heads = team.filter(m => m.category === 'heads').sort((a, b) => (a.order || 0) - (b.order || 0));
  const projectManagers = team.filter(m => m.category === 'team').sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name), 'he'));

  let html = '';

  if (founders.length > 0) {
    html += `
      <div class="team-section">
        <h2 class="team-section-title">הנהלה</h2>
        <div class="team-grid-new">
          ${founders.map(renderCard).join('')}
        </div>
      </div>
    `;
  }

  if (admin.length > 0) {
    html += `
      <div class="team-section">
        <h2 class="team-section-title">אדמיניסטרציה</h2>
        <div class="team-grid-new">
          ${admin.map(renderCard).join('')}
        </div>
      </div>
    `;
  }

  if (heads.length > 0) {
    html += `
      <div class="team-section">
        <h2 class="team-section-title">ראשי תחומים</h2>
        <div class="team-grid-new">
          ${heads.map(renderCard).join('')}
        </div>
      </div>
    `;
  }

  if (projectManagers.length > 0) {
    html += `
      <div class="team-section">
        <h2 class="team-section-title">מנהלי פרויקטים</h2>
        <div class="team-grid-new">
          ${projectManagers.map(renderCard).join('')}
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

// ===== Render Testimonials =====
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

// ===== Render Clients =====
function renderClients(container, clients) {
  if (!container || !clients || !clients.length) return;
  
  container.innerHTML = clients.map(client => `
    <div class="client-logo">
      <img src="${client.logo}" alt="${client.name}" loading="lazy" onerror="this.style.opacity='0.3'">
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
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
  initHeader();
  initMobileNav();
  initSmoothScroll();
  initScrollAnimations();
  initForms();
  
  await initializeData();
  
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

// ===== Exports =====
window.WDI = WDI;
window.renderProjects = renderProjects;
window.renderTeam = renderTeam;
window.renderServices = renderServices;
window.renderTestimonials = renderTestimonials;
window.renderClients = renderClients;
window.createShareButtons = createShareButtons;
