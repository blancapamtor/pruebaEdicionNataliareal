// =========================================================================
// CARGA DE CONTENIDOS DESDE ARCHIVOS JSON LOCALES
// =========================================================================

async function loadJSONContent(fileName) {
  try {
    const response = await fetch(`./content/${fileName}.json?v=${Date.now()}`);
    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
  } catch (error) {
    console.error(`Error cargando ./content/${fileName}.json:`, error);
  }
  return [];
}

// =========================================================================
// 1. MENÚ RESPONSIVE DESPLEGABLE EN MÓVIL
// =========================================================================
function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navbar = document.getElementById('navbar');

  if (hamburgerBtn && navbar) {
    const navLinks = navbar.querySelectorAll('a');

    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navbar.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navbar.classList.remove('active');
      });
    });
  }
}

// =========================================================================
// 2. BADGE DE MES Y AÑO EN AGENDA
// =========================================================================
function updateDateBadge() {
  const badgeElement = document.getElementById('current-month-badge');
  if (!badgeElement) return;

  const fechaActual = new Date();
  let mes = fechaActual.toLocaleDateString('es-ES', { month: 'long' });
  const anio = fechaActual.getFullYear();
  mes = mes.charAt(0).toUpperCase() + mes.slice(1);

  badgeElement.textContent = `${mes} ${anio}`;
}

// =========================================================================
// 3. RENDERIZADO DE NOTICIAS (DESDE JSON LOCAL)
// =========================================================================
async function renderNews() {
  const featuredContainer = document.getElementById('featured-news-container');
  const secondaryContainer = document.getElementById('secondary-news-container');

  if (!featuredContainer || !secondaryContainer) return;

  // --- 🌟 NOTICIA DESTACADA ---
  const noticiasDestacadas = await loadJSONContent('noticias_destacadas');
  if (noticiasDestacadas.length > 0) {
    const item = noticiasDestacadas[0]; // Carga la última/primera noticia
    
    let longText = item.body || '';
    if (longText) {
      longText = longText
        .replace(/([^\n])\n([^\n\-\*•])/g, '$1 $2')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/\n/g, '<br>');
    }

    featuredContainer.innerHTML = `
      <article class="news-card card-featured">
        <div class="card-media">
          <img src="${item.image || 'assets/imagenes/base.jpg'}" alt="${item.title || ''}" class="media-img" />
          <span class="badge badge-accent">${item.tag || 'NOTICIA'}</span>
        </div>
        <div class="card-content">
          ${item.frequency ? `<div class="card-meta"><span class="meta-day">${item.frequency}</span></div>` : ''}
          <h3 class="card-title">${item.title || ''}</h3>
          ${item.subtitle ? `<p class="card-subtitle-highlight" style="font-size: 1rem; color: #1f2937; font-weight: 700; margin: 4px 0 12px 0;">${item.subtitle}</p>` : ''}
          
          <ul class="card-details" style="list-style: none; padding: 0; margin-bottom: 12px;">
            ${item.organizer ? `
            <li style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <span>Organiza: <strong>${item.organizer}</strong></span>
            </li>` : ''}

            ${item.location ? `
            <li style="display: flex; align-items: center; gap: 6px; color: #00b4d8; font-weight: 700; margin-bottom: 6px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${item.location}</span>
            </li>` : ''}

            ${item.extra_info ? `<li style="margin-top: 4px; font-size: 0.9rem; color: #475569;"><span>${item.extra_info}</span></li>` : ''}
          </ul>

          <div class="card-actions">
            <button class="btn btn-dark js-trigger-expand-featured" type="button" style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; border: none; cursor: pointer;">
              <span class="btn-label">MÁS INFORMACIÓN</span>
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16" style="transition: transform 0.2s ease;">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>

          <div class="expanded-content-featured" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.3);">
            ${longText ? `<div class="news-body-text" style="font-size: 0.9rem; line-height: 1.6; text-align: left;"><p>${longText}</p></div>` : ''}
          </div>
        </div>
      </article>
    `;

    const featCard = featuredContainer.querySelector('.card-featured');
    const featBtn = featCard.querySelector('.js-trigger-expand-featured');
    const featContent = featCard.querySelector('.expanded-content-featured');
    const featLabel = featCard.querySelector('.btn-label');
    const featIcon = featCard.querySelector('.btn-icon');

    if (featBtn && featContent) {
      featBtn.addEventListener('click', () => {
        const isOpening = featContent.style.display === 'none' || !featContent.style.display;
        if (isOpening) {
          featContent.style.display = 'block';
          featLabel.textContent = 'MENOS INFORMACIÓN';
          featIcon.style.transform = 'rotate(180deg)';
        } else {
          featContent.style.display = 'none';
          featLabel.textContent = 'MÁS INFORMACIÓN';
          featIcon.style.transform = 'rotate(0deg)';
        }
      });
    }
  }

  // --- 📄 NOTICIAS SECUNDARIAS ---
  const noticiasSecundarias = await loadJSONContent('noticias_secundarias');
  secondaryContainer.innerHTML = '';

  noticiasSecundarias.forEach(item => {
    let longText = item.body || '';
    if (longText) {
      longText = longText
        .replace(/([^\n])\n([^\n\-\*•])/g, '$1 $2')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/\n/g, '<br>');
    }

    secondaryContainer.innerHTML += `
      <article class="news-card card-secondary">
        <div class="card-badge-row">
          <span class="badge badge-subtle">${item.tag || 'CLASE GRATUITA'}</span>
          ${item.status_tag ? `<span class="status-indicator">${item.status_tag}</span>` : ''}
        </div>

        <h3 class="card-title">${item.title || 'INICIACIÓN AL BAILE'}</h3>
        ${item.subtitle ? `<p class="card-subtitle-highlight" style="font-size: 0.95rem; color: #1f2937; font-weight: 600; margin: 0 0 12px 0;">${item.subtitle}</p>` : ''}

        ${item.location || item.date_str ? `
        <div class="card-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div>
            ${item.location ? `<strong>${item.location}</strong>` : ''}
            ${item.date_str ? `<p>${item.date_str}</p>` : ''}
          </div>
        </div>` : ''}

        ${item.extra_info ? `<p class="secondary-extra-info" style="font-size: 0.85rem; color: #5a6e82; margin: 0 0 16px 0;">${item.extra_info}</p>` : ''}

        <button class="btn-cyan-outline js-trigger-expand" type="button">
          <span class="btn-label">MÁS INFORMACIÓN</span>
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16" style="transition: transform 0.2s ease;">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        <div class="expanded-content" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0;">
          ${longText ? `<div class="news-body-text" style="font-size: 0.9rem; line-height: 1.6; color: #374151; text-align: left;"><p>${longText}</p></div>` : ''}
        </div>
      </article>
    `;
  });

  const allCards = secondaryContainer.querySelectorAll('.news-card');
  allCards.forEach(card => {
    const triggerBtn = card.querySelector('.js-trigger-expand');
    const expandedContent = card.querySelector('.expanded-content');
    const label = card.querySelector('.btn-label');
    const icon = card.querySelector('.btn-icon');

    if (triggerBtn && expandedContent) {
      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpening = expandedContent.style.display === 'none' || !expandedContent.style.display;

        if (isOpening) {
          expandedContent.style.display = 'block';
          if (label) label.textContent = 'MENOS INFORMACIÓN';
          if (icon) icon.style.transform = 'rotate(180deg)';
          card.classList.add('is-expanded');
        } else {
          expandedContent.style.display = 'none';
          if (label) label.textContent = 'MÁS INFORMACIÓN';
          if (icon) icon.style.transform = 'rotate(0deg)';
          card.classList.remove('is-expanded');
        }
      });
    }
  });
}

// =========================================================================
// 4. RENDERIZADO DE GALERÍA MULTIMEDIA (DESDE JSON LOCAL)
// =========================================================================
async function renderGallery() {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  const items = await loadJSONContent('galeria');

  if (items && items.length > 0) {
    container.innerHTML = items.map(item => {
      const src = item.file_url || item.image;
      if (!src) return '';

      const isVideo = item.media_type === 'video' || src.match(/\.(mp4|webm|mov|ogg)$/i);
      const layoutClass = item.layout_type || 'item-1';
      const title = item.title || 'Tango Natalia Vicente';
      const captionText = item.caption || '';

      return `
        <figure class="gallery-item ${layoutClass}">
          ${isVideo ? `
            <video src="${src}" autoplay loop muted playsinline controlslist="nodownload"></video>
          ` : `
            <img src="${src}" alt="${title}" loading="lazy">
          `}
          ${captionText ? `<figcaption class="gallery-caption">${captionText}</figcaption>` : ''}
        </figure>
      `;
    }).join('');
  } else {
    container.innerHTML = '<p style="text-align: center; color: #64748b;">No hay multimedia disponible.</p>';
  }
}

// =========================================================================
// 5. RENDERIZADO DE CLASES Y TALLERES (DESDE JSON LOCAL)
// =========================================================================
async function renderClasses() {
  const container = document.getElementById('classes-container');
  if (!container) return;

  const classList = await loadJSONContent('clases');

  if (!classList || classList.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">No se pudieron cargar las clases.</p>';
    return;
  }

  // Ordenar por el campo "order"
  classList.sort((a, b) => (parseInt(a.order) || 1) - (parseInt(b.order) || 1));

  container.innerHTML = classList.map(item => `
    <article class="class-card">
      <div class="card-top">
        <span class="level-badge">${item.badge || ''}</span>
        <h3 class="card-title">${item.title || ''}</h3>

        <div class="schedule-block">
          ${(item.schedules || []).map(s => `
            <div style="margin-bottom: 20px;">
              ${s.sub_title ? `
                <h4 style="font-size: 0.95rem; font-weight: 800; color: #1e293b; letter-spacing: 0.05em; text-transform: uppercase; margin: 20px 0 10px 0;">
                  ${s.sub_title}
                </h4>
              ` : ''}
              
              <details class="schedule-item">
                <summary>
                  <div class="summary-header">
                    ${s.city ? `
                      <span class="city-tag" style="display: block; color: #00b4d8; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.05em; margin-bottom: 6px; text-transform: uppercase;">
                        ${s.city}
                      </span>
                    ` : ''}
                    
                    ${(s.time_slots || []).map(ts => `
                      <div class="schedule-meta" style="margin-bottom: 4px; font-size: 0.95rem; color: #1e293b;">
                        <strong>${ts.day || ''}</strong>
                        ${ts.time_slot ? `<span> · ${ts.time_slot}</span>` : ''}
                        ${ts.meta_extra ? `<span style="color: #6b7280; font-weight: normal;"> (${ts.meta_extra})</span>` : ''}
                      </div>
                    `).join('')}

                    ${s.address ? `
                      <small class="schedule-address" style="display: flex; align-items: center; gap: 4px; color: #6b7280; margin-top: 6px; font-size: 0.85rem;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${s.address}
                      </small>
                    ` : ''}
                  </div>
                  <div class="toggle-icon"></div>
                </summary>
                
                <div class="item-extra-info" style="padding-top: 10px; border-top: 1px dashed #e2e8f0; margin-top: 8px;">
                  ${s.description ? `
                    <div style="font-size: 0.88rem; color: #334155; line-height: 1.5; white-space: pre-line; margin-bottom: 8px; text-align: left;">
                      ${s.description}
                    </div>
                  ` : ''}
                  ${s.map_link ? `
                    <a href="${s.map_link}" target="_blank" rel="noopener noreferrer" class="location-link" style="display: inline-block; color: #00b4d8; font-weight: 600; text-decoration: none; font-size: 0.85rem; margin-top: 4px;">
                      📍 Ver ubicación en mapa
                    </a>
                  ` : ''}
                </div>
              </details>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card-bottom" style="margin-top: auto; padding-top: 15px;">
        <a href="contacto.html" class="btn">¡APÚNTATE!</a>
      </div>
    </article>
  `).join('');
}

// =========================================================================
// 6. BANNER INTERACTIVO
// =========================================================================
function initQuoteBanner() {
  const banner = document.getElementById('quoteBanner');
  const quoteTarget = document.getElementById('typeitQuote');

  if (!banner || !quoteTarget) return;

  let typeitInstance = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        banner.classList.add('is-visible');

        if (typeof TypeIt !== 'undefined' && !typeitInstance) {
          quoteTarget.innerHTML = '';

          typeitInstance = new TypeIt('#typeitQuote', {
            lifeLike: false,
            speed: 0,
            cursorChar: '|',
          })
          .type("U").pause(40)
          .type("n").pause(15)
          .type(" ").pause(22)
          .type("e").pause(28)
          .type("s").pause(12)
          .type("p").pause(20)
          .type("a").pause(38)
          .type("c").pause(15)
          .type("i").pause(22)
          .type("o").pause(12)
          .type(" ").pause(18)
          .type("p").pause(16)
          .type("a").pause(20)
          .type("r").pause(16)
          .type("a").pause(10)
          .type(" ").pause(26)
          .type("s").pause(14)
          .type("o").pause(24)
          .type("l").pause(32)
          .type("t").pause(15)
          .type("a").pause(11)
          .type("r").pause(20)
          .type("t").pause(16)
          .type("e").pause(18)
          .type(" ").pause(26)
          .type("y").pause(10)
          .type(" ").pause(22)
          .type("d").pause(26)
          .type("i").pause(20)
          .type("s").pause(24)
          .type("f").pause(26)
          .type("r").pause(18)
          .type("u").pause(30)
          .type("t").pause(26)
          .type("a").pause(10)
          .type("r").pause(12)
          .type(" ").pause(28)
          .type("e").pause(25)
          .type("l").pause(10)
          .type(" ").pause(24)
          .type("p").pause(20)
          .type("r").pause(10)
          .type("o").pause(30)
          .type("c").pause(15)
          .type("e").pause(30)
          .type("s").pause(16)
          .type("o").pause(55)
          .type(",").pause(16)
          .break({ delay: 35 })
          .type("d").pause(16)
          .type("o").pause(20)
          .type("n").pause(16)
          .type("d").pause(15)
          .type("e").pause(14)
          .type(" ").pause(45)
          .type("b").pause(20)
          .type("a").pause(24)
          .type("i").pause(26)
          .type("l").pause(16)
          .type("a").pause(26)
          .type("r").pause(10)
          .type(" ").pause(26)
          .type("s").pause(15)
          .type("i").pause(25)
          .type("n").pause(14)
          .type(" ").pause(28)
          .type("p").pause(16)
          .type("r").pause(22)
          .type("e").pause(28)
          .type("s").pause(10)
          .type("i").pause(20)
          .type("o").pause(16)
          .type("n").pause(15)
          .type("e").pause(30)
          .type("s").pause(26)
          .type(".").pause(110)
          .exec(async () => {
            const cursor = banner.querySelector('.ti-cursor');
            if (cursor) cursor.style.opacity = '0.3';
          })
          .go();

          observer.unobserve(banner);
        }
      }
    });

  }, { threshold: 0.3 });

  observer.observe(banner);
}


// =========================================================================
// INICIALIZACIÓN GENERAL DE LA WEB
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  updateDateBadge();
  renderNews();
  renderGallery();
  renderClasses();
  initQuoteBanner();
});