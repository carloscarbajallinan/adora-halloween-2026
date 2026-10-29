
// Track current slide per product in catalog: 0 = character, 1 = arrangement
const cardSlideStates = {};

window.switchCardSlide = function(productId, slideIdx, evt) {
  if (evt) evt.stopPropagation();
  cardSlideStates[productId] = slideIdx;
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  const img = document.getElementById('card-img-' + productId);
  const card = document.querySelector('.card[data-id="' + productId + '"]');
  if (img) {
    img.src = (slideIdx === 0 && product.hasCharacter) ? product.characterImg : product.imageLocal;
    img.onerror = () => { img.src = product.imageOnline; };
  }
  if (card) {
    const tabs = card.querySelectorAll('.card-tab-btn');
    tabs.forEach((tab, i) => tab.classList.toggle('active', i === slideIdx));
  }
};

window.stepCardSlide = function(productId, delta, evt) {
  if (evt) evt.stopPropagation();
  const curr = cardSlideStates[productId] || 0;
  const next = curr === 0 ? 1 : 0;
  window.switchCardSlide(productId, next, evt);
};

window.switchModalTab = function(tab) {
  if (!state.activeModalProduct) return;
  const p = state.activeModalProduct;
  const modalImg = document.getElementById('modal-img');
  const btnChar = document.getElementById('modal-tab-char');
  const btnArr = document.getElementById('modal-tab-arr');
  if (tab === 'char' && p.hasCharacter) {
    modalImg.src = p.characterImg;
    if (btnChar) btnChar.classList.add('active');
    if (btnArr) btnArr.classList.remove('active');
  } else {
    modalImg.src = p.imageLocal;
    modalImg.onerror = () => { modalImg.src = p.imageOnline; };
    if (btnChar) btnChar.classList.remove('active');
    if (btnArr) btnArr.classList.add('active');
  }
};

// ==========================================================================
// ADORA — Halloween & Pop Culture 2026 Interactive Voting Engine
// ==========================================================================
const PRODUCTS_DATA = window.ADORA_PRODUCTS || [];

// Application State
const state = {
  products: [],
  userVotes: new Set(),
  activeFilter: 'all',
  searchQuery: '',
  sortBy: 'votes-desc',
  activeModalProduct: null
};

// Initialize State
function initApp() {
  // Load saved votes from localStorage
  try {
    const savedVotes = localStorage.getItem('adora_user_votes');
    if (savedVotes) {
      state.userVotes = new Set(JSON.parse(savedVotes));
    }
    
    // Load community vote counts from localStorage (or fallback to seed votes)
    const savedVoteCounts = localStorage.getItem('adora_vote_counts');
    const voteCountsMap = savedVoteCounts ? JSON.parse(savedVoteCounts) : {};

    state.products = PRODUCTS_DATA.map(p => {
      const storedCount = voteCountsMap[p.id];
      const initialVotes = storedCount !== undefined ? storedCount : p.votes;
      return {
        ...p,
        votes: initialVotes
      };
    });
  } catch (e) {
    state.products = [...PRODUCTS_DATA];
  }

  // Setup DOM Event Listeners
  setupEventListeners();

  // Initial Render
  renderPodium();
  renderCatalog();
  createAmbientParticles();
  updateWhatsAppButton();
}

// Event Listeners
function setupEventListeners() {
  // Search Input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderCatalog();
    });
  }

  // Sort Select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderCatalog();
    });
  }

  // Category Filter Pills
  const filterPills = document.querySelectorAll('.pill-btn');
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFilter = pill.dataset.filter;
      renderCatalog();
    });
  });

  // Dialog Close Button
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const dialog = document.getElementById('detail-modal');
  if (modalCloseBtn && dialog) {
    modalCloseBtn.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  }

  // Modal Vote Button
  const modalVoteBtn = document.getElementById('modal-vote-btn');
  if (modalVoteBtn) {
    modalVoteBtn.addEventListener('click', () => {
      if (state.activeModalProduct) {
        toggleVote(state.activeModalProduct.id);
        updateModalContent(state.activeModalProduct);
      }
    });
  }
}

// Toggle Vote Function
function toggleVote(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const hasVoted = state.userVotes.has(productId);

  if (hasVoted) {
    state.userVotes.delete(productId);
    product.votes = Math.max(0, product.votes - 1);
  } else {
    state.userVotes.add(productId);
    product.votes += 1;
    triggerConfetti(productId);
  }

  // Save to localStorage
  try {
    localStorage.setItem('adora_user_votes', JSON.stringify(Array.from(state.userVotes)));
    const countsMap = {};
    state.products.forEach(p => { countsMap[p.id] = p.votes; });
    localStorage.setItem('adora_vote_counts', JSON.stringify(countsMap));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  // Update UI Elements
  updateCardUI(productId);
  renderPodium();
  updateWhatsAppButton();
}

// Update single card UI without re-rendering whole list
function updateCardUI(productId) {
  const card = document.querySelector(`.card[data-id="${productId}"]`);
  if (!card) return;

  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const voteBtn = card.querySelector('.vote-btn');
  const voteCount = card.querySelector('.vote-count-pill');
  const hasVoted = state.userVotes.has(productId);

  if (voteBtn && voteCount) {
    voteBtn.classList.toggle('voted', hasVoted);
    voteBtn.innerHTML = `
      <span class="vote-icon">${hasVoted ? '🎃' : '🖤'}</span>
      <span>${hasVoted ? 'Votado' : 'Votar'}</span>
      <span class="vote-count-pill">${product.votes}</span>
    `;
  }
}

// Trigger subtle heart/pumpkin burst animation
function triggerConfetti(productId) {
  const card = document.querySelector(`.card[data-id="${productId}"]`);
  if (!card) return;

  const burst = document.createElement('div');
  burst.textContent = '🎃';
  burst.style.position = 'absolute';
  burst.style.fontSize = '2rem';
  burst.style.left = '50%';
  burst.style.top = '40%';
  burst.style.transform = 'translate(-50%, -50%) scale(0.5)';
  burst.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  burst.style.opacity = '1';
  burst.style.pointerEvents = 'none';
  burst.style.zIndex = '10';

  card.appendChild(burst);

  setTimeout(() => {
    burst.style.transform = 'translate(-50%, -100%) scale(2)';
    burst.style.opacity = '0';
  }, 20);

  setTimeout(() => {
    burst.remove();
  }, 650);
}

// Filter and Sort Logic
function getFilteredAndSortedProducts() {
  return state.products
    .filter(p => {
      // Category Filter
      if (state.activeFilter !== 'all') {
        if (state.activeFilter === 'halloween' && p.categoryTag !== 'Halloween Tradicional') return false;
        if (state.activeFilter === 'harrypotter' && p.categoryTag !== 'Harry Potter') return false;
        if (state.activeFilter === 'anime' && p.categoryTag !== 'Anime & Shonen') return false;
        if (state.activeFilter === 'gothic' && p.categoryTag !== 'Gótico & Terror') return false;
        if (state.activeFilter === 'pop' && p.categoryTag !== 'Pop Culture & Gaming') return false;
        if (state.activeFilter === 'retro' && p.categoryTag !== 'Retro & Dúos') return false;
      }

      // Search Query
      if (state.searchQuery) {
        const query = state.searchQuery;
        const matchName = p.name.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        const matchRecipe = p.recipe.toLowerCase().includes(query);
        const matchPersona = (p.persona || '').toLowerCase().includes(query);
        const matchCategory = p.categoryTag.toLowerCase().includes(query);
        return matchName || matchSku || matchRecipe || matchPersona || matchCategory;
      }

      return true;
    })
    .sort((a, b) => {
      switch (state.sortBy) {
        case 'votes-desc':
          return b.votes - a.votes;
        case 'price-asc':
          return parseFloat(a.pvp) - parseFloat(b.pvp);
        case 'price-desc':
          return parseFloat(b.pvp) - parseFloat(a.pvp);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
}

// Render Catalog Grid
function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  const items = getFilteredAndSortedProducts();

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🥀</div>
        <h3>No se encontraron ramos con esos criterios</h3>
        <p>Prueba buscando con otro personaje o restableciendo los filtros de categoría.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(product => {
    const hasVoted = state.userVotes.has(product.id);
    return `
      <article class="card" data-id="${product.id}">
        <div class="card-media-wrapper" style="position:relative;">
          <span class="card-badge badge-${product.badgeColor}">${product.categoryTag}</span>
          <span class="card-sku">${product.sku}</span>

          ${product.hasCharacter ? `
            <div class="card-carousel-controls" onclick="event.stopPropagation()">
              <button type="button" class="card-tab-btn ${(cardSlideStates[product.id] === 0 || cardSlideStates[product.id] === undefined) ? 'active' : ''}" onclick="window.switchCardSlide('${product.id}', 0, event)">👤 Personaje</button>
              <button type="button" class="card-tab-btn ${cardSlideStates[product.id] === 1 ? 'active' : ''}" onclick="window.switchCardSlide('${product.id}', 1, event)">💐 Ramo</button>
            </div>
            <div class="card-carousel-arrow prev" onclick="window.stepCardSlide('${product.id}', -1, event)">&#8249;</div>
            <div class="card-carousel-arrow next" onclick="window.stepCardSlide('${product.id}', 1, event)">&#8250;</div>
          ` : `
            <div class="card-carousel-controls" onclick="event.stopPropagation()">
              <span class="card-tab-btn active" style="background:rgba(245,158,11,0.2); color:#fbbf24;">💐 Ramo Floral</span>
            </div>
          `}

          <img 
            id="card-img-${product.id}"
            class="card-img" 
            src="${(product.hasCharacter && (cardSlideStates[product.id] === 0 || cardSlideStates[product.id] === undefined)) ? product.characterImg : product.imageLocal}" 
            alt="${product.name}" 
            loading="lazy"
            onclick="window.openDetailModal('${product.id}')"
            onerror="this.onerror=null; this.src='${product.imageOnline}';"
          />
        </div>
        
        <header class="card-header">
          <div class="card-collection">${product.collection}</div>
          <h3 class="card-title">${product.name}</h3>
        </header>
        
        <div class="card-content">
          <p class="card-recipe">🌿 ${product.recipe}</p>
          <div class="card-pricing">
            <span class="price-currency">S/</span>
            <span class="price-value">${product.pvp}</span>
            <span class="price-label">PVP Sugerido</span>
          </div>
        </div>
        
        <footer class="card-footer">
          <button 
            type="button" 
            class="vote-btn ${hasVoted ? 'voted' : ''}" 
            onclick="window.handleVoteClick('${product.id}')"
            aria-label="Votar por ${product.name}"
          >
            <span class="vote-icon">${hasVoted ? '🎃' : '🖤'}</span>
            <span>${hasVoted ? 'Votado' : 'Votar'}</span>
            <span class="vote-count-pill">${product.votes}</span>
          </button>
          
          <button 
            type="button" 
            class="view-btn" 
            onclick="window.openDetailModal('${product.id}')" 
            title="Ver detalles botánicos"
          >
            🔍
          </button>
        </footer>
      </article>
    `;
  }).join('');
}

// Render Top 3 Podium
function renderPodium() {
  const podiumContainer = document.getElementById('podium-bar');
  if (!podiumContainer) return;

  const top3 = [...state.products].sort((a, b) => b.votes - a.votes).slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  podiumContainer.innerHTML = top3.map((p, idx) => `
    <div class="podium-pill" onclick="window.openDetailModal('${p.id}')">
      <span class="podium-rank">${medals[idx]}</span>
      <span class="podium-name">${p.name.split('(')[0].trim()}</span>
      <span class="podium-votes">🎃 ${p.votes}</span>
    </div>
  `).join('');
}

// Modal View
window.openDetailModal = function(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.activeModalProduct = product;
  updateModalContent(product);

  const dialog = document.getElementById('detail-modal');
  if (dialog) dialog.showModal();
};

function updateModalContent(product) {
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalRecipe = document.getElementById('modal-recipe');
  const modalPersona = document.getElementById('modal-persona');
  const modalPrice = document.getElementById('modal-price');
  const modalVoteBtn = document.getElementById('modal-vote-btn');

  const modalTogglePills = document.getElementById('modal-toggle-pills');
  if (modalTogglePills) {
    if (product.hasCharacter) {
      modalTogglePills.style.display = 'flex';
      window.switchModalTab('char');
    } else {
      modalTogglePills.style.display = 'none';
      window.switchModalTab('arr');
    }
  }

  if (modalImg) {
    modalImg.src = product.imageLocal;
    modalImg.onerror = () => { modalImg.src = product.imageOnline; };
  }
  if (modalTitle) modalTitle.textContent = product.name;
  if (modalSubtitle) modalSubtitle.textContent = `${product.sku} • ${product.collection} (Colección ADORA 2026)`;
  if (modalRecipe) modalRecipe.textContent = product.recipe;
  if (modalPersona) modalPersona.textContent = product.persona || 'Público selecto amante del diseño botánico.';
  if (modalPrice) modalPrice.textContent = `S/ ${product.pvp}`;

  const hasVoted = state.userVotes.has(product.id);
  if (modalVoteBtn) {
    modalVoteBtn.innerHTML = hasVoted ? '🎃 Quitar Voto de Mis Favoritos' : '🎃 Votar por este Ramo';
    modalVoteBtn.style.background = hasVoted 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'linear-gradient(135deg, var(--accent-pumpkin), #b53805)';
  }

  // Inject dynamic delivery & WhatsApp checkout module
  const deliveryContainer = document.getElementById('modal-delivery-container');
  if (deliveryContainer && typeof window.injectDeliverySection === 'function') {
    window.injectDeliverySection(deliveryContainer, product);
  }
}

// Global click handler for vote button
window.handleVoteClick = function(productId) {
  toggleVote(productId);
};

// WhatsApp Sharing
function updateWhatsAppButton() {
  const waBtn = document.getElementById('whatsapp-share-btn');
  if (!waBtn) return;

  const votedIds = Array.from(state.userVotes);
  const votedItems = state.products.filter(p => votedIds.includes(p.id));

  let msg = '¡Hola Carlos! Acabo de revisar las 49 propuestas de ADORA Florería para este Halloween 2026 🎃💐.\n\n';

  if (votedItems.length > 0) {
    msg += 'Mis ramos favoritos por los que voto para que los lances sí o sí son:\n';
    votedItems.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.name}* (${item.sku}) - S/ ${item.pvp}\n`;
    });
    msg += '\n¡Están increíbles! Espero que lances estos para hacerte mi pedido 🙌';
  } else {
    msg += '¡El catálogo completo de 49 ramos está espectacular! Te comparto mis comentarios pronto.';
  }

  const encoded = encodeURIComponent(msg);
  waBtn.href = `https://wa.me/51975369266?text=${encoded}`;
}

// Ambient Floating Particles
function createAmbientParticles() {
  const container = document.getElementById('ambient-particles');
  if (!container) return;

  const colors = ['#f36b21', '#e2b765', '#9d4edd', '#d90429'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 3;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 14}s`;
    p.style.animationDuration = `${Math.random() * 12 + 10}s`;
    container.appendChild(p);
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initApp);
