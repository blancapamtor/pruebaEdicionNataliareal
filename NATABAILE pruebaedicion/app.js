// =========================================================================
// CONFIGURACIÓN DÉCAP CMS & GITHUB (100% AUTOMÁTICO DESDE EL PANEL)
// =========================================================================
const REPO_OWNER = 'blancapamtor';
const REPO_NAME = 'pruebaEdicionNataliareal';
const BASE_FOLDER = 'NATABAILE pruebaedicion/content';

// Helper genérico para extraer campos del Frontmatter YAML en Markdown
function getField(content, fieldName) {
  const regex = new RegExp(`^${fieldName}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\n\\r]*))`, 'm');
  const match = content.match(regex);
  if (match) {
    return (match[1] || match[2] || match[3] || '').trim();
  }
  return '';
}

// 1. Lee automáticamente TODOS los archivos .md creados por Decap CMS desde GitHub API
async function getFolderFiles(folderName) {
  const time = Date.now();
  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(BASE_FOLDER)}/${folderName}?v=${time}`;

  try {
    const res = await fetch(githubApiUrl);
    
    if (res.status === 403) {
      console.warn('⚠️ Límite de la API de GitHub alcanzado temporalmente. Espera unos minutos.');
      return [];
    }

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filtra para coger ÚNICAMENTE los archivos .md generados por el Panel
        return data
          .filter(file => file.name.endsWith('.md'))
          .map(file => file.name);
      }
    }
  } catch (err) {
    console.error(`Error leyendo la carpeta ${folderName}:`, err);
  }

  return [];
}

// 2. Carga el texto del archivo .md desde Raw GitHub
async function loadMarkdown(folder, filename) {
  const time = Date.now();
  try {
    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${encodeURIComponent(BASE_FOLDER)}/${folder}/${filename}?v=${time}`;
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) return await rawRes.text();
  } catch (e) {}

  return null;
}

// =========================================================================
// 1. ACTUALIZAR BADGE DE MES Y AÑO EN AGENDA
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
// 2. RENDERIZADO DE NOTICIAS Y AGENDA
// =========================================================================
async function renderNews() {
  const featuredContainer = document.getElementById('featured-news-container');
  const secondaryContainer = document.getElementById('secondary-news-container');

  if (!featuredContainer || !secondaryContainer) return;

  // 1. CARGAR NOTICIA DESTACADA (AZUL)
  const archivosDestacados = await getFolderFiles('noticias_destacadas');

  for (const fileName of archivosDestacados) {
    const content = await loadMarkdown('noticias_destacadas', fileName);
    if (content) {
      featuredContainer.innerHTML = '';

      const tag = getField(content, 'tag') || 'NOTICIA';
      const frequency = getField(content, 'frequency');
      const title = getField(content, 'title');
      const image = getField(content, 'image') || 'assets/imagenes/base.jpg';
      const organizer = getField(content, 'organizer');
      const extraInfo = getField(content, 'extra_info');
      const buttonText = getField(content, 'button_text') || 'MÁS INFORMACIÓN';
      const buttonLink = getField(content, 'button_link') || 'contacto.html';

      featuredContainer.innerHTML = `
        <article class="news-card card-featured">
          <div class="card-media">
            <img src="${image}" alt="${title}" class="media-img" />
            <span class="badge badge-accent">${tag}</span>
          </div>
          <div class="card-content">
            <div class="card-meta">
              <span class="meta-day">${frequency}</span>
            </div>
            <h3 class="card-title">${title}</h3>
            
            <ul class="card-details">
              ${organizer ? `
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                <span>Organiza: <strong>${organizer}</strong></span>
              </li>` : ''}
              ${extraInfo ? `
              <li>
                <span>${extraInfo}</span>
              </li>` : ''}
            </ul>

            <div class="card-actions">
              <a href="${buttonLink}" class="btn btn-dark">${buttonText}</a>
            </div>
          </div>
        </article>
      `;
      break; // Muestra la noticia publicada
    }
  }

  // 2. CARGAR NOTICIAS SECUNDARIAS (CON DESPLEGABLE)
  const archivosSecundarios = await getFolderFiles('noticias_secundarias');
  secondaryContainer.innerHTML = '';

  for (const fileName of archivosSecundarios) {
    const rawContent = await loadMarkdown('noticias_secundarias', fileName);
    if (rawContent) {
      const tag = getField(rawContent, 'tag') || 'CLASE GRATUITA';
      const statusTag = getField(rawContent, 'status_tag');
      const title = getField(rawContent, 'title');
      const subtitle = getField(rawContent, 'subtitle');
      const dateStr = getField(rawContent, 'date_str');
      const location = getField(rawContent, 'location');
      const extraInfo = getField(rawContent, 'extra_info');
      const buttonText = getField(rawContent, 'button_text') || 'MÁS INFORMACIÓN';

      // Extraer el texto largo (cuerpo en Markdown)
      const bodyMatch = rawContent.split(/---[\r\n]+/);
      const longText = bodyMatch.length >= 3 ? bodyMatch.slice(2).join('---').trim() : '';

      secondaryContainer.innerHTML += `
        <article class="news-card card-secondary">
          <div class="card-badge-row">
            <span class="badge badge-subtle">${tag}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${statusTag ? `<span class="status-indicator">${statusTag}</span>` : ''}
              <!-- Botón X para cerrar -->
              <button class="card-close-btn" aria-label="Cerrar detalles">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Título y Subtítulo -->
          <h3 class="card-title">${title}</h3>
          ${subtitle ? `<p class="card-subtitle-highlight" style="font-size: 0.95rem; color: #1f2937; font-weight: 600; margin: 0 0 12px 0; line-height: 1.4;">${subtitle}</p>` : ''}

          <!-- Ubicación y Fecha -->
          ${location ? `
          <div class="card-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <strong>${location}</strong>
              ${dateStr ? `<p>${dateStr}</p>` : ''}
            </div>
          </div>` : ''}

          ${extraInfo ? `<p class="secondary-extra-info" style="font-size: 0.85rem; color: #5a6e82; margin: 0 0 16px 0;">${extraInfo}</p>` : ''}

          <!-- Botón principal de apertura -->
          <button class="btn-cyan-outline js-trigger-expand" type="button">
            <span>${buttonText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <!-- ÁREA DESPLEGABLE: Solo muestra el texto largo -->
          <div class="expanded-content">
            ${longText ? `<div class="news-body-text" style="font-size: 0.9rem; line-height: 1.6; color: #374151;">${longText.replace(/\n/g, '<br>')}</div>` : ''}
          </div>
        </article>
      `;
    }
  }

  // LÓGICA DE INTERACCIÓN DE TARJETAS
  const allCards = secondaryContainer.querySelectorAll('.news-card');

  allCards.forEach(card => {
    const triggerBtn = card.querySelector('.js-trigger-expand');
    const closeBtn = card.querySelector('.card-close-btn');

    const expandCard = () => {
      allCards.forEach(c => {
        if (c === card) {
          c.classList.add('is-expanded');
        } else {
          c.classList.add('is-hidden');
        }
      });
    };

    if (triggerBtn) {
      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        expandCard();
      });
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-close-btn') || e.target.closest('a')) return;
      if (!card.classList.contains('is-expanded')) {
        expandCard();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        allCards.forEach(c => {
          c.classList.remove('is-expanded', 'is-hidden');
        });
      });
    }
  });
}

// =========================================================================
// 3. RENDERIZADO DE CLASES Y TALLERES
// =========================================================================
async function renderClasses() {
  const container = document.getElementById('classes-container');
  if (!container) return;

  const archivosClases = await getFolderFiles('clases');
  const classList = [];

  for (const fileName of archivosClases) {
    const text = await loadMarkdown('clases', fileName);
    if (text) {
      const title = getField(text, 'title');
      const badge = getField(text, 'badge');
      const order = parseInt(getField(text, 'order')) || 99;

      const schedules = [];
      const schedulesBlockMatch = text.match(/schedules:([\s\S]*?)(?=\n[a-z_]+:|$)/i);

      if (schedulesBlockMatch) {
        const rawBlocks = schedulesBlockMatch[1].split('\n  - ').filter(b => b.trim());

        rawBlocks.forEach(rawItem => {
          const subTitle = getField(rawItem, 'sub_title');
          const city = getField(rawItem, 'city');
          const day = getField(rawItem, 'day');
          const timeSlot = getField(rawItem, 'time_slot');
          const metaExtra = getField(rawItem, 'meta_extra');
          const address = getField(rawItem, 'address');
          const description = getField(rawItem, 'description');
          const mapLink = getField(rawItem, 'map_link');

          schedules.push({ subTitle, city, day, timeSlot, metaExtra, address, description, mapLink });
        });
      }

      classList.push({ title, badge, order, schedules });
    }
  }

  classList.sort((a, b) => a.order - b.order);

  container.innerHTML = classList.map(item => `
    <article class="class-card">
      <div class="card-top">
        <span class="level-badge">${item.badge}</span>
        <h3 class="card-title">${item.title}</h3>

        <div class="schedule-block">
          ${item.schedules.map(s => `
            <div style="margin-bottom: 20px;">
              ${s.subTitle ? `<h4 class="card-title" style="font-size: 1.2rem; margin-top: 15px; margin-bottom: 10px;">${s.subTitle}</h4>` : ''}
              
              <details class="schedule-item">
                <summary>
                  <div class="summary-header">
                    ${s.city ? `<span class="city-tag">${s.city}</span>` : ''}
                    <div class="schedule-meta">
                      <strong>${s.day}</strong>
                      ${s.timeSlot ? `<span> · ${s.timeSlot}</span>` : ''}
                      ${s.metaExtra ? `<em> (${s.metaExtra})</em>` : ''}
                    </div>
                    ${s.address ? `
                      <small class="schedule-address">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${s.address}
                      </small>
                    ` : ''}
                  </div>
                  
                  <div class="toggle-icon"></div>
                </summary>
                
                <div class="item-extra-info">
                  ${s.description ? `<p>${s.description}</p>` : ''}
                  ${s.mapLink ? `<a href="${s.mapLink}" target="_blank" rel="noopener noreferrer" class="location-link">📍 Ver ubicación en mapa</a>` : ''}
                </div>
              </details>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card-bottom">
        <a href="contacto.html" class="btn">¡APÚNTATE!</a>
      </div>
    </article>
  `).join('');
}

// =========================================================================
// 4. BANNER INTERACTIVO
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

        if (!typeitInstance && typeof TypeIt !== 'undefined') {
          typeitInstance = new TypeIt('#typeitQuote', {
            speed: 50,
            lifeLike: true,
            cursorChar: '|',
          })
          .type("Un espacio para soltarte y disfrutarr")
          .pause(180)
          .delete(1)
          .type(" el proceso,")
          .pause(450)
          .break({ delay: 300 })
          .type("donde bailar sin presiones.")
          .pause(1000)
          .exec(async () => {
            const cursor = banner.querySelector('.ti-cursor');
            if (cursor) cursor.style.opacity = '0.3';
          })
          .go();
        }

        observer.unobserve(banner);
      }
    });
  }, { 
    threshold: 0.4 
  });

  observer.observe(banner);
}

// =========================================================================
// INICIALIZACIÓN UNIFICADA
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  updateDateBadge();
  renderNews();
  renderClasses();
  initQuoteBanner();
});