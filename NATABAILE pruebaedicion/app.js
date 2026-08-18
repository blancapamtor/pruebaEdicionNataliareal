// =========================================================================
// CONFIGURACIÓN GLOBAL DE RUTAS
// =========================================================================
const BASE_REPO_URL = 'https://api.github.com/repos/blancapamtor/pruebaEdicionNataliareal/contents/NATABAILE%20pruebaedicion';

// Helper genérico para extraer campos del Frontmatter YAML en Markdown
function getField(content, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*"?([^"\\n]+)"?`);
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

// =========================================================================
// 1. ACTUALIZAR BADGE DE MES Y AÑO EN AGENDA
// =========================================================================
function updateDateBadge() {
  const badgeElement = document.getElementById('current-month-badge');
  if (!badgeElement) return;

  const fechaActual = new Date();
  
  // Obtenemos el nombre del mes en español
  let mes = fechaActual.toLocaleDateString('es-ES', { month: 'long' });
  const anio = fechaActual.getFullYear();

  // Ponemos la primera letra del mes en mayúscula
  mes = mes.charAt(0).toUpperCase() + mes.slice(1);

  // Formato final: "Agosto 2026"
  badgeElement.textContent = `${mes} ${anio}`;
}

// =========================================================================
// 2. RENDERIZADO DE NOTICIAS Y AGENDA
// =========================================================================
async function renderNews() {
  const featuredContainer = document.getElementById('featured-news-container');
  const secondaryContainer = document.getElementById('secondary-news-container');

  if (!featuredContainer || !secondaryContainer) return;

  try {
    const response = await fetch(`${BASE_REPO_URL}/content/noticias`);
    if (!response.ok) return;

    const files = await response.json();

    featuredContainer.innerHTML = '';
    secondaryContainer.innerHTML = '';
    let hasFeatured = false;

    for (const file of files) {
      if (file.name.endsWith('.md') || file.name.endsWith('.json')) {
        const res = await fetch(file.download_url);
        const content = await res.text();

        const title = getField(content, 'title');
        const badge = getField(content, 'badge');
        const metaInfo = getField(content, 'meta_info');
        const isFeatured = getField(content, 'featured') === 'true';
        const image = getField(content, 'image') || 'assets/imagenes/base.jpg';
        const organizer = getField(content, 'organizer');
        const info = getField(content, 'info');
        const phone = getField(content, 'phone');

        // Noticia Principal (Columna Izquierda)
        if (isFeatured && !hasFeatured) {
          hasFeatured = true;
          featuredContainer.innerHTML = `
            <article class="news-card card-featured">
              <div class="card-media">
                <img src="${image}" alt="${title}" class="media-img" />
                <span class="badge badge-accent">${badge}</span>
              </div>
              <div class="card-content">
                <div class="card-meta">
                  <span class="meta-day">${metaInfo}</span>
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
                  ${phone ? `
                  <li>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>Info & Reservas: <a href="tel:${phone}">${phone}</a></span>
                  </li>` : ''}
                </ul>

                <div class="card-actions">
                  <a href="contacto.html" class="btn btn-dark">Más Información</a>
                </div>
              </div>
            </article>
          `;
        } else {
          // Noticias Secundarias (Columna Derecha)
          secondaryContainer.innerHTML += `
            <article class="news-card card-secondary">
              <div class="card-badge-row">
                <span class="badge badge-subtle">${badge}</span>
                <span class="status-indicator">${metaInfo}</span>
              </div>
              
              <h3 class="card-title">${title}</h3>
              
              <div class="card-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <strong>${organizer}</strong>
                  <p>${info}</p>
                </div>
              </div>

              <a href="contacto.html" class="btn btn-cyan-outline">
                <span>Escríbeme</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </article>
          `;
        }
      }
    }
  } catch (error) {
    console.error('Error cargando noticias:', error);
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

        // Parse de bloques de 'schedules'
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

    // Ordenar por el atributo 'order'
    classList.sort((a, b) => a.order - b.order);

    // Pintar HTML de las clases
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
// 4. BANNER INTERACTIVO (TYPEIT HUMANO Y FLUIDO)
// =========================================================================
function initQuoteBanner() {
  const banner = document.getElementById('quoteBanner');
  const quoteTarget = document.getElementById('typeitQuote');

  if (!banner || !quoteTarget) return;

  let typeitInstance = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Comprueba si el usuario ha llegado escroleando a la sección
      if (entry.isIntersecting) {
        banner.classList.add('is-visible');

        if (!typeitInstance && typeof TypeIt !== 'undefined') {
          typeitInstance = new TypeIt('#typeitQuote', {
            speed: 50,           // Velocidad fluida y cómoda
            lifeLike: true,      // Micro-variaciones humanas entre teclas
            cursorChar: '|',
            // Quitado: waitUntilVisible (lo gestiona el IntersectionObserver)
          })
          .type("Un espacio para soltarte y disfrutarr")
          .pause(180)            // Micro-pausa de duda
          .delete(1)             // Borra la 'r' extra
          .type(" el proceso,")
          .pause(450)            // Pausa natural tras la coma
          .break({ delay: 300 }) // Salto a la segunda línea
          .type("donde bailar sin presiones.")
          .pause(1000)           // Mantiene la frase lista
          .exec(async () => {
            const cursor = banner.querySelector('.ti-cursor');
            if (cursor) cursor.style.opacity = '0.3';
          })
          .go();
        }

        // Una vez ejecutado, dejamos de observar para que no se repita
        observer.unobserve(banner);
      }
    });
  }, { 
    threshold: 0.4 // 0.4 significa que arrancará cuando el 40% del banner sea visible al hacer scroll
  });

  observer.observe(banner);
}

// =========================================================================
// INICIALIZACIÓN UNIFICADA AL CARGAR EL DOM
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  updateDateBadge();
  renderNews();
  renderClasses();
  initQuoteBanner();
});