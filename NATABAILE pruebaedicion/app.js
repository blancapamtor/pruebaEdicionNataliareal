// =========================================================================
// CONFIGURACIÓN DECAP CMS & GITHUB
// =========================================================================
const REPO_OWNER = 'blancapamtor';
const REPO_NAME = 'pruebaEdicionNataliareal';
const BASE_FOLDER = 'NATABAILE pruebaedicion/content';

// Extrae el valor de un campo YAML del archivo Markdown
function getField(content, fieldName) {
  const regex = new RegExp(`^${fieldName}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\n\\r]*))`, 'm');
  const match = content.match(regex);
  if (match) {
    return (match[1] || match[2] || match[3] || '').trim();
  }
  return '';
}

// 1. Obtiene los nombres de los archivos .md de una carpeta en GitHub API
async function getFolderFiles(folderName) {
  const time = Date.now();
  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(BASE_FOLDER)}/${folderName}?v=${time}`;

  try {
    const res = await fetch(githubApiUrl);
    
    if (res.status === 403) {
      console.warn('⚠️ Límite de peticiones alcanzado. Espera unos minutos o recarga la red.');
      return [];
    }

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
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

// 2. Lee el contenido texto del archivo .md desde Raw GitHub
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
// 1. BADGE DE MES Y AÑO EN AGENDA
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
// 2. RENDERIZADO DE NOTICIAS (DESTACADA Y SECUNDARIAS UNIFICADAS)
// =========================================================================
async function renderNews() {
  const featuredContainer = document.getElementById('featured-news-container');
  const secondaryContainer = document.getElementById('secondary-news-container');

  if (!featuredContainer || !secondaryContainer) return;

  // --- 🌟 NOTICIA DESTACADA ---
  const archivosDestacados = (await getFolderFiles('noticias_destacadas')).reverse();

  for (const fileName of archivosDestacados) {
    const content = await loadMarkdown('noticias_destacadas', fileName);
    if (content) {
      featuredContainer.innerHTML = '';

      const tag = getField(content, 'tag') || 'NOTICIA';
      const frequency = getField(content, 'frequency');
      const title = getField(content, 'title');
      const subtitle = getField(content, 'subtitle');
      const location = getField(content, 'location');
      const image = getField(content, 'image') || 'assets/imagenes/base.jpg';
      const organizer = getField(content, 'organizer');
      const extraInfo = getField(content, 'extra_info');

      // Formateo de párrafos en el cuerpo
      const bodyMatch = content.split(/---[\r\n]+/);
      let longText = bodyMatch.length >= 3 ? bodyMatch.slice(2).join('---').trim() : '';
      if (longText) {
        longText = longText
          .replace(/([^\n])\n([^\n\-\*•])/g, '$1 $2')
          .replace(/\n{2,}/g, '</p><p>')
          .replace(/\n/g, '<br>');
      }

      featuredContainer.innerHTML = `
        <article class="news-card card-featured">
          <div class="card-media">
            <img src="${image}" alt="${title}" class="media-img" />
            <span class="badge badge-accent">${tag}</span>
          </div>
          <div class="card-content">
            ${frequency ? `<div class="card-meta"><span class="meta-day">${frequency}</span></div>` : ''}
            <h3 class="card-title">${title}</h3>
            ${subtitle ? `<p class="card-subtitle-highlight" style="font-size: 1rem; color: #1f2937; font-weight: 700; margin: 4px 0 12px 0;">${subtitle}</p>` : ''}
            
            <ul class="card-details" style="list-style: none; padding: 0; margin-bottom: 12px;">
              ${organizer ? `
              <li style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                <span>Organiza: <strong>${organizer}</strong></span>
              </li>` : ''}

              ${location ? `
              <li style="display: flex; align-items: center; gap: 6px; color: #00b4d8; font-weight: 700; margin-bottom: 6px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${location}</span>
              </li>` : ''}

              ${extraInfo ? `<li style="margin-top: 4px; font-size: 0.9rem; color: #475569;"><span>${extraInfo}</span></li>` : ''}
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

      break; 
    }
  }

  // --- 📄 NOTICIAS SECUNDARIAS ---
  const archivosSecundarios = await getFolderFiles('noticias_secundarias');
  secondaryContainer.innerHTML = '';

  for (const fileName of archivosSecundarios) {
    const rawContent = await loadMarkdown('noticias_secundarias', fileName);
    if (rawContent) {
      const tag = getField(rawContent, 'tag') || 'CLASE GRATUITA';
      const statusTag = getField(rawContent, 'status_tag');
      const title = getField(rawContent, 'title') || 'INICIACIÓN AL BAILE';
      const subtitle = getField(rawContent, 'subtitle');
      const dateStr = getField(rawContent, 'date_str');
      const location = getField(rawContent, 'location');
      const extraInfo = getField(rawContent, 'extra_info');

      const bodyMatch = rawContent.split(/---[\r\n]+/);
      let longText = bodyMatch.length >= 3 ? bodyMatch.slice(2).join('---').trim() : '';
      if (longText) {
        longText = longText
          .replace(/([^\n])\n([^\n\-\*•])/g, '$1 $2')
          .replace(/\n{2,}/g, '</p><p>')
          .replace(/\n/g, '<br>');
      }

      secondaryContainer.innerHTML += `
        <article class="news-card card-secondary">
          <div class="card-badge-row">
            <span class="badge badge-subtle">${tag}</span>
            ${statusTag ? `<span class="status-indicator">${statusTag}</span>` : ''}
          </div>

          <h3 class="card-title">${title}</h3>
          ${subtitle ? `<p class="card-subtitle-highlight" style="font-size: 0.95rem; color: #1f2937; font-weight: 600; margin: 0 0 12px 0;">${subtitle}</p>` : ''}

          ${location || dateStr ? `
          <div class="card-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              ${location ? `<strong>${location}</strong>` : ''}
              ${dateStr ? `<p>${dateStr}</p>` : ''}
            </div>
          </div>` : ''}

          ${extraInfo ? `<p class="secondary-extra-info" style="font-size: 0.85rem; color: #5a6e82; margin: 0 0 16px 0;">${extraInfo}</p>` : ''}

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
    }
  }

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

// ==========================================
    // 5. PREVISUALIZACIÓN DE GALERÍA MULTIMEDIA (SIN FILTROS)
    // ==========================================
    const GalleryPreview = createClass({
      render: function() {
        const entry = this.props.entry;
        const itemsData = entry.getIn(['data', 'items']);
        const items = itemsData ? itemsData.toJS() : [];

        const getAsset = this.props.getAsset;

        return h('section', { className: 'multimedia-section', style: { padding: '30px 15px', background: '#ffffff', minHeight: '100vh' } },
          h('div', { className: 'container' },
            h('h2', { className: 'section-title', style: { marginBottom: '25px', textAlign: 'center' } }, 'VISTA PREVIA DE GALERÍA'),
            
            h('div', { className: 'gallery-grid' },
              items.map((item, index) => {
                if (!item.image) return null;

                const imageUrl = getAsset(item.image);
                const layoutClass = item.layout_type || 'item-1';
                const altText = item.title || 'Foto Galería Natalia Vicente';

                return h('div', { 
                  key: index, 
                  className: 'gallery-item ' + layoutClass,
                  // Reseteamos cualquier contenedor para evitar overlays o sombras
                  style: { 
                    overflow: 'hidden', 
                    filter: 'none', 
                    opacity: 1, 
                    boxShadow: 'none', 
                    background: 'transparent' 
                  } 
                },
                  h('img', { 
                    src: imageUrl, 
                    alt: altText,
                    // Estilos forzados para anular filtros CSS de la web (grayscale, brightness, etc.)
                    style: { 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      display: 'block',
                      filter: 'none !important',
                      webkitFilter: 'none !important',
                      mixBlendMode: 'normal !important',
                      opacity: '1 !important',
                      transition: 'none !important'
                    } 
                  })
                );
              })
            )
          )
        );
      }
    });

// =========================================================================
// 4. RENDERIZADO DE CLASES Y TALLERES
// =========================================================================
async function renderClasses() {
  const container = document.getElementById('classes-container');
  if (!container) return;

  const archivosClases = await getFolderFiles('clases');
  const classList = [];

  for (const fileName of archivosClases) {
    const text = await loadMarkdown('clases', fileName);
    if (!text) continue;

    const title = getField(text, 'title');
    const badge = getField(text, 'badge');
    const order = parseInt(getField(text, 'order')) || 1;

    const schedules = [];
    const schedulesMatch = text.match(/schedules:([\s\S]*?)(?=\n[a-z_]+:|\n---|$)/i);

    if (schedulesMatch && schedulesMatch[1]) {
      const rawBlocks = schedulesMatch[1].split(/\n\s*-\s+(?=(?:sub_title|city|time_slots|address):)/i).filter(b => b.trim());

      rawBlocks.forEach(block => {
        const getVal = (key) => {
          const match = block.match(new RegExp(`${key}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\n\\r]*))`, 'i'));
          return match ? (match[1] || match[2] || match[3] || '').trim() : '';
        };

        const sub_title = getVal('sub_title');
        const city = getVal('city');
        const address = getVal('address');
        const map_link = getVal('map_link');

        let description = '';
        const descMatch = block.match(/description:\s*(?:>[-+]?|\|[-+]?)?\s*([\s\S]*?)(?=\n\s*(?:map_link|address|city|sub_title|time_slots):|$)/i);
        if (descMatch && descMatch[1]) {
          description = descMatch[1]
            .replace(/^["']|["']$/g, '')
            .replace(/^>\-?|^\|/g, '')
            .trim()
            .replace(/([^\n])\n([^\n\-\*•])/g, '$1 $2')
            .replace(/\n{3,}/g, '\n\n');
        }

        const timeSlots = [];
        const timeSlotsMatch = block.match(/time_slots:([\s\S]*?)(?=\n\s*(?:address|description|map_link|city|sub_title):|$)/i);

        if (timeSlotsMatch && timeSlotsMatch[1]) {
          const rawSlots = timeSlotsMatch[1].split(/\n\s*-\s+/).filter(s => s.trim());
          rawSlots.forEach(sBlock => {
            const getSlotVal = (key) => {
              const match = sBlock.match(new RegExp(`${key}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\n\\r]*))`, 'i'));
              return match ? (match[1] || match[2] || match[3] || '').trim() : '';
            };
            const day = getSlotVal('day');
            const time_slot = getSlotVal('time_slot');
            const meta_extra = getSlotVal('meta_extra');
            if (day || time_slot) {
              timeSlots.push({ day, time_slot, meta_extra });
            }
          });
        }

        if (timeSlots.length === 0) {
          const day = getVal('day');
          const time_slot = getVal('time_slot') || getVal('horario');
          const meta_extra = getVal('meta_extra');
          if (day || time_slot) {
            timeSlots.push({ day, time_slot, meta_extra });
          }
        }

        if (timeSlots.length > 0 || city || address) {
          schedules.push({ sub_title, city, timeSlots, address, description, map_link });
        }
      });
    }

    classList.push({ title, badge, order, schedules });
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
                    
                    ${s.timeSlots.map(ts => `
                      <div class="schedule-meta" style="margin-bottom: 4px; font-size: 0.95rem; color: #1e293b;">
                        <strong>${ts.day}</strong>
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
// 5. BANNER INTERACTIVO
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
          .type("U").pause(144)
          .type("n").pause(44)
          .type(" ").pause(72)
          .type("e").pause(96)
          .type("s").pause(40)
          .type("p").pause(64)
          .type("a").pause(132)
          .type("c").pause(48)
          .type("i").pause(68)
          .type("o").pause(40)
          .type(" ").pause(60)
          .type("p").pause(56)
          .type("a").pause(64)
          .type("r").pause(56)
          .type("a").pause(28)
          .type(" ").pause(88)
          .type("s").pause(44)
          .type("o").pause(80)
          .type("l").pause(112)
          .type("t").pause(52)
          .type("a").pause(36)
          .type("r").pause(64)
          .type("t").pause(56)
          .type("e").pause(60)
          .type(" ").pause(92)
          .type("y").pause(32)
          .type(" ").pause(76)
          .type("d").pause(88)
          .type("i").pause(68)
          .type("s").pause(80)
          .type("f").pause(88)
          .type("r").pause(60)
          .type("u").pause(100)
          .type("t").pause(88)
          .type("a").pause(32)
          .type("r").pause(40)
          .type(" ").pause(96)
          .type("e").pause(84)
          .type("l").pause(32)
          .type(" ").pause(80)
          .type("p").pause(64)
          .type("r").pause(32)
          .type("o").pause(104)
          .type("c").pause(48)
          .type("e").pause(104)
          .type("s").pause(56)
          .type("o").pause(192)
          .type(",").pause(56)
          .break({ delay: 120 })
          .type("d").pause(56)
          .type("o").pause(72)
          .type("n").pause(56)
          .type("d").pause(52)
          .type("e").pause(44)
          .type(" ").pause(148)
          .type("b").pause(72)
          .type("a").pause(80)
          .type("i").pause(92)
          .type("l").pause(56)
          .type("a").pause(92)
          .type("r").pause(32)
          .type(" ").pause(92)
          .type("s").pause(52)
          .type("i").pause(84)
          .type("n").pause(44)
          .type(" ").pause(96)
          .type("p").pause(56)
          .type("r").pause(76)
          .type("e").pause(96)
          .type("s").pause(32)
          .type("i").pause(64)
          .type("o").pause(56)
          .type("n").pause(48)
          .type("e").pause(100)
          .type("s").pause(92)
          .type(".").pause(400)
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
  updateDateBadge();
  renderNews();
  renderGallery();
  renderClasses();
  initQuoteBanner();
});