// =========================================================================
// CONFIGURACIÓN GLOBAL DE RUTAS
// =========================================================================
const BASE_REPO_URL = 'https://api.github.com/repos/blancapamtor/pruebaEdicionNataliareal/contents/NATABAILE%20pruebaedicion';

// Helper genérico para extraer campos del Frontmatter YAML en Markdown (Mejorado)
function getField(content, fieldName) {
  const regex = new RegExp(`^${fieldName}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\n\\r]*))`, 'm');
  const match = content.match(regex);
  if (match) {
    return (match[1] || match[2] || match[3] || '').trim();
  }
  return '';
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
  try {
    const resFeatured = await fetch(`${BASE_REPO_URL}/content/noticias_destacadas`);
    if (resFeatured.ok) {
      const filesFeatured = await resFeatured.json();
      featuredContainer.innerHTML = '';

      for (const file of filesFeatured) {
        if (file.name.endsWith('.md')) {
          const res = await fetch(file.download_url);
          const content = await res.text();

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
          break;
        }
      }
    }
  } catch (error) {
    console.error('Error cargando noticias destacadas:', error);
  }

  // 2. CARGAR NOTICIAS SECUNDARIAS (LATERALES)
  try {
    const resSecondary = await fetch(`${BASE_REPO_URL}/content/noticias_secundarias`);
    if (resSecondary.ok) {
      const filesSecondary = await resSecondary.json();
      secondaryContainer.innerHTML = '';

      for (const file of filesSecondary) {
        if (file.name.endsWith('.md')) {
          const res = await fetch(file.download_url);
          const content = await res.text();

          const tag = getField(content, 'tag') || 'CLASE GRATUITA';
          const statusTag = getField(content, 'status_tag');
          const title = getField(content, 'title');
          const subtitle = getField(content, 'subtitle');
          const dateStr = getField(content, 'date_str');
          const location = getField(content, 'location');
          const extraInfo = getField(content, 'extra_info');
          const buttonText = getField(content, 'button_text') || 'VER DETALLES';

          secondaryContainer.innerHTML += `
            <article class="news-card card-secondary">
              <div class="card-badge-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span class="badge badge-subtle">${tag}</span>
                ${statusTag ? `<span class="status-indicator" style="font-size: 13px; color: #6b7280; font-weight: 500;">${statusTag}</span>` : ''}
              </div>
              
              <h3 class="card-title" style="margin-bottom: 6px;">${title}</h3>
              
              <!-- Subtítulo con estilo destacado -->
              ${subtitle ? `<p class="card-subtitle-highlight" style="font-size: 15px; color: #1f2937; font-weight: 600; margin: 0 0 14px 0; line-height: 1.4;">${subtitle}</p>` : ''}
              
              ${dateStr ? `
              <div class="card-location" style="margin-bottom: 6px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <strong>${dateStr}</strong>
              </div>` : ''}

              ${location ? `
              <div class="card-location" style="margin-bottom: 6px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <strong>${location}</strong>
              </div>` : ''}

              <!-- Info extra con estilo discreto -->
              ${extraInfo ? `<p class="secondary-extra-info" style="font-size: 13px; color: #6b7280; font-weight: 500; margin-top: 10px;">${extraInfo}</p>` : ''}

              <a href="contacto.html" class="btn btn-cyan-outline" style="margin-top: 15px;">
                <span>${buttonText}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </article>
          `;
        }
      }
    }
  } catch (error) {
    console.error('Error cargando noticias secundarias:', error);
  }
}

// =========================================================================
// 3. RENDERIZADO DE CLASES Y TALLERES
// =========================================================================
async function renderClasses() {
  const container = document.getElementById('classes-container');
  if (!container) return;

  try {
    const response = await fetch(`${BASE_REPO_URL}/content/clases`);
    if (!response.ok) return;

    const files = await response.json();
    const classList = [];

    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const res = await fetch(file.download_url);
        const text = await res.text();

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

  } catch (error) {
    console.error('Error cargando clases:', error);
  }
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