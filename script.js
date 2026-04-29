const API_URL = 'https://sheetdb.io/api/v1/rdiowj5s1vjd2';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80';

// Global State
let dataList = [];
let activeTab = 'Prompts';
let searchQuery = '';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');
const trendingSection = document.getElementById('trendingSection');
const latestSection = document.getElementById('latestSection');
const trendingGrid = document.getElementById('trendingGrid');
const latestGrid = document.getElementById('latestGrid');
const statTotal = document.getElementById('statTotal');
const statTrending = document.getElementById('statTrending');
const heroCount = document.getElementById('heroCount');
const trendingCount = document.getElementById('trendingCount');
const latestCount = document.getElementById('latestCount');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const tabNameElements = document.querySelectorAll('.activeTabName');
const latestHeadingText = document.getElementById('latestHeadingText');

// Initialization
document.getElementById('year').textContent = new Date().getFullYear();

// Event Listeners
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  render();
});

filterTabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    filterTabs.forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    activeTab = e.target.dataset.tab;
    
    tabNameElements.forEach(el => el.textContent = activeTab);
    render();
  });
});

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Fetch Data
async function fetchData() {
  trendingGrid.innerHTML = generateSkeletons(3);
  latestGrid.innerHTML = generateSkeletons(6);

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    
    if (Array.isArray(data) && data.length > 0) {
      dataList = data.map((item, index) => ({
        id: item.id || String(index + 1),
        title: item.Title || item.title || 'Untitled',
        prompt: item.Prompt || item.prompt || '',
        imageURL: item.ImageURL || item.imageURL || '',
        trending: String(item.Trending || item.trending).toLowerCase() === 'true',
        date: item.Date || item.date || '',
        type: (item.Type || item.type || 'Prompt').toLowerCase(),
        link: item.Link || item.link || '#'
      })).filter(p => p.title.trim() !== '' || p.prompt.trim() !== '');
      
      dataList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  // Update Stats
  statTotal.textContent = dataList.length;
  statTrending.textContent = dataList.filter(d => d.trending).length;
  heroCount.textContent = dataList.filter(d => d.type === 'prompt').length;

  render();
}

function getFilteredData() {
  return dataList.filter(item => {
    let matchesTab = false;
    if (activeTab === 'Prompts') matchesTab = item.type === 'prompt';
    if (activeTab === 'Affiliates') matchesTab = item.type === 'affiliate' || item.type === 'affiliates';
    if (activeTab === 'Jobs') matchesTab = item.type === 'job' || item.type === 'jobs';

    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery) || 
      item.prompt.toLowerCase().includes(searchQuery);

    return matchesTab && matchesSearch;
  });
}

// Render Logic
function render() {
  const filteredData = getFilteredData();
  const trendingItems = filteredData.filter(item => item.trending);
  const latestItems = filteredData.filter(item => !item.trending);
  
  const isSearching = searchQuery.trim().length > 0;

  if (isSearching) {
    trendingSection.style.display = 'none';
    latestHeadingText.innerHTML = `🔎 Results for "${searchQuery}"`;
    latestCount.textContent = `${filteredData.length} items`;
    renderGrid(latestGrid, filteredData, 'l');
  } else {
    trendingSection.style.display = 'block';
    latestHeadingText.innerHTML = `✨ Latest <span class="activeTabName">${activeTab}</span>`;
    
    trendingCount.textContent = `${trendingItems.length} items`;
    latestCount.textContent = `${latestItems.length} items`;

    renderGrid(trendingGrid, trendingItems, 't', 4);
    renderGrid(latestGrid, latestItems, 'l', 6);
  }
}

function renderGrid(gridElement, items, prefix, adInterval = null) {
  if (items.length === 0) {
    gridElement.innerHTML = `
      <div class="empty-state">
        <div class="emoji">${prefix === 't' ? '🔥' : '😕'}</div>
        <h3>No ${prefix === 't' ? 'trending ' : ''}${activeTab.toLowerCase()} found</h3>
      </div>
    `;
    return;
  }

  let html = '';
  let adCount = 0;
  items.forEach((item, i) => {
    html += generateCardHTML(item);
    if (adInterval && (i + 1) % adInterval === 0) {
      adCount++;
      html += `
        <div class="ad-banner" style="padding: 0; min-height: auto; overflow: hidden; background: transparent; border: none;">
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-format="fluid"
               data-ad-layout-key="-fb+5w+4e-db+86"
               data-ad-client="ca-pub-YOUR_ADSENSE_ID"
               data-ad-slot="YOUR_AD_SLOT"></ins>
        </div>
      `;
    }
  });

  gridElement.innerHTML = html;

  // Initialize the injected AdSense ads
  try {
    for (let i = 0; i < adCount; i++) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  } catch (e) {
    console.error("AdSense error:", e);
  }
}

function generateCardHTML(item) {
  const isPrompt = item.type === 'prompt';
  const isJob = item.type === 'job' || item.type === 'jobs';
  const isAffiliate = item.type === 'affiliate' || item.type === 'affiliates';
  
  const icon = isJob ? '💼' : isAffiliate ? '🛒' : '🎨';
  const footerIcon = isJob ? '💼' : isAffiliate ? '🛒' : '📅';

  let buttonsHTML = '';
  if (isPrompt) {
    buttonsHTML = `
      <a href="https://chat.openai.com/image" target="_blank" rel="noopener noreferrer" class="btn-try">⚡ Try it</a>
      <button class="btn-copy" onclick="copyPrompt('${item.id}', this)" data-prompt="${escapeHtml(item.prompt)}">📋 Copy</button>
    `;
  } else if (isJob) {
    buttonsHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn-copy">💼 Apply Now</a>`;
  } else if (isAffiliate) {
    buttonsHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn-copy">🛒 View Deal</a>`;
  }

  return `
    <article class="card">
      <div class="card-img-wrapper">
        <div class="card-img-placeholder">
          ${icon}<span>Loading…</span>
        </div>
        <img 
          src="${item.imageURL || FALLBACK_IMG}" 
          alt="${escapeHtml(item.title)}" 
          class="card-img" 
          loading="lazy"
          onload="this.style.opacity = 1"
          onerror="this.src='${FALLBACK_IMG}'; this.style.opacity = 1"
          style="opacity: 0; transition: opacity 0.4s ease; position: relative; z-index: 1;"
        />
        ${item.trending ? `<span class="trending-badge" style="z-index: 2;">🔥 Trending</span>` : ''}
      </div>

      <div class="card-body">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        ${item.prompt ? `
          <div class="card-prompt-wrapper">
            <p class="card-prompt" id="prompt-${item.id}">${escapeHtml(item.prompt)}</p>
            <button class="expand-btn" onclick="toggleExpand('${item.id}', this)">▼ Show more</button>
          </div>
        ` : ''}
        
        <div class="card-footer">
          <span class="card-date">${footerIcon} ${formatDate(item.date)}</span>
          <div style="display: flex; gap: 8px; align-items: center;">
            ${buttonsHTML}
          </div>
        </div>
      </div>
    </article>
  `;
}

function generateSkeletons(count) {
  return Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');
}

// Interactivity Handlers (global)
window.toggleExpand = function(id, btn) {
  const promptEl = document.getElementById(`prompt-${id}`);
  if (promptEl.classList.contains('expanded')) {
    promptEl.classList.remove('expanded');
    btn.textContent = '▼ Show more';
  } else {
    promptEl.classList.add('expanded');
    btn.textContent = '▲ Show less';
  }
};

window.copyPrompt = function(id, btn) {
  const text = btn.getAttribute('data-prompt');
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Copied';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '📋 Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
};

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

// Start app
fetchData();
