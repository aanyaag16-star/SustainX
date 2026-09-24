/**
 * SUSTAINX - Green Campus Challenge
 * Leaderboard Controller with Podium & Dynamic Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  const DataStore = window.SustainX.DataStore;
  const Utils = window.SustainX.Utils;

  // DOM Elements
  const podiumContainer = document.getElementById('leaderboardPodium');
  const tableBody = document.getElementById('leaderboardTableBody');
  const categoryFilterSelect = document.getElementById('categoryFilter');
  const monthFilterSelect = document.getElementById('monthFilter');
  const yearFilterSelect = document.getElementById('yearFilter');
  const searchInput = document.getElementById('schoolSearchInput');
  const lastUpdatedEl = document.getElementById('lastUpdatedTime');
  const categoryPillsContainer = document.getElementById('categoryPills');

  // Set Last Updated Timestamp
  if (lastUpdatedEl) {
    const now = new Date();
    lastUpdatedEl.textContent = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // Current State
  let currentFilters = {
    category: 'Overall',
    month: 'all',
    year: '2026-27',
    search: ''
  };

  function renderLeaderboard() {
    // Calculate dynamic scores from approved scoreEntries
    let leaderboard = DataStore.calculateLeaderboard(
      currentFilters.category,
      currentFilters.month,
      currentFilters.year
    );

    // Apply search filter if present
    if (currentFilters.search.trim()) {
      const q = currentFilters.search.toLowerCase();
      leaderboard = leaderboard.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q)
      );
    }

    renderPodium(leaderboard);
    renderTable(leaderboard);
  }

  // Render Top 3 Podium (2nd Place, 1st Place, 3rd Place)
  function renderPodium(leaderboard) {
    if (!podiumContainer) return;

    if (leaderboard.length < 3) {
      podiumContainer.innerHTML = `
        <div class="empty-state" style="padding: 2rem;">
          <p>Insufficient school data for podium preview under selected filters.</p>
        </div>
      `;
      return;
    }

    const first = leaderboard[0];
    const second = leaderboard[1];
    const third = leaderboard[2];

    podiumContainer.innerHTML = `
      <!-- 2nd Place -->
      <div class="podium-slot rank-2 animate-fade-up delay-100">
        <div class="podium-avatar-wrap">
          <img src="${second.logo}" alt="${second.name}" class="podium-avatar" />
          <div class="podium-medal-badge">🥈</div>
        </div>
        <div class="podium-card">
          <div>
            <div style="font-size: 0.78rem; font-weight: 800; color: var(--color-silver); letter-spacing: 0.05em; text-transform: uppercase;">
              2ND PLACE
            </div>
            <div class="podium-school-name">${second.shortName}</div>
            <p style="font-size: 0.78rem; line-height: 1.3;">${second.name}</p>
          </div>
          <div class="podium-score">${Utils.formatNumber(second.totalGreenPoints)} <span style="font-size:0.75rem; font-weight:600; color:var(--color-text-muted);">PTS</span></div>
          <div>
            <a href="school.html?id=${second.schoolId}" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 0.5rem; font-size: 0.78rem;">
              View Profile
            </a>
          </div>
        </div>
        <div class="podium-base" style="background: var(--color-silver);"></div>
      </div>

      <!-- 1st Place (Center & Tallest) -->
      <div class="podium-slot rank-1 animate-fade-up">
        <div style="margin-bottom: 0.5rem;">
          <span class="crown-icon" style="font-size: 1.75rem;">👑</span>
        </div>
        <div class="podium-avatar-wrap">
          <img src="${first.logo}" alt="${first.name}" class="podium-avatar" />
          <div class="podium-medal-badge">🥇</div>
        </div>
        <div class="podium-card">
          <div>
            <div style="font-size: 0.82rem; font-weight: 800; color: #B38600; letter-spacing: 0.06em; text-transform: uppercase;">
              CHAMPION / 1ST PLACE
            </div>
            <div class="podium-school-name" style="font-size: 1.18rem;">${first.shortName}</div>
            <p style="font-size: 0.82rem; line-height: 1.3;">${first.name}</p>
          </div>
          <div class="podium-score">${Utils.formatNumber(first.totalGreenPoints)} <span style="font-size:0.8rem; font-weight:600; color:#B38600;">PTS</span></div>
          <div>
            <a href="school.html?id=${first.schoolId}" class="btn btn-gold btn-sm" style="width: 100%; margin-top: 0.5rem; font-size: 0.82rem;">
              View Profile
            </a>
          </div>
        </div>
        <div class="podium-base"></div>
      </div>

      <!-- 3rd Place -->
      <div class="podium-slot rank-3 animate-fade-up delay-200">
        <div class="podium-avatar-wrap">
          <img src="${third.logo}" alt="${third.name}" class="podium-avatar" />
          <div class="podium-medal-badge">🥉</div>
        </div>
        <div class="podium-card">
          <div>
            <div style="font-size: 0.78rem; font-weight: 800; color: var(--color-bronze); letter-spacing: 0.05em; text-transform: uppercase;">
              3RD PLACE
            </div>
            <div class="podium-school-name">${third.shortName}</div>
            <p style="font-size: 0.78rem; line-height: 1.3;">${third.name}</p>
          </div>
          <div class="podium-score">${Utils.formatNumber(third.totalGreenPoints)} <span style="font-size:0.75rem; font-weight:600; color:var(--color-text-muted);">PTS</span></div>
          <div>
            <a href="school.html?id=${third.schoolId}" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 0.5rem; font-size: 0.78rem;">
              View Profile
            </a>
          </div>
        </div>
        <div class="podium-base" style="background: var(--color-bronze);"></div>
      </div>
    `;
  }

  // Render Table of Rankings
  function renderTable(leaderboard) {
    if (!tableBody) return;

    if (leaderboard.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <div class="empty-icon">🌱</div>
              <div class="empty-title">No Participating Schools Found</div>
              <p class="empty-desc">Try resetting your search query or adjusting your filters.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = leaderboard.map(school => {
      let rankBadgeClass = 'badge-info';
      let rankIcon = `#${school.rank}`;
      if (school.rank === 1) {
        rankBadgeClass = 'badge-gold';
        rankIcon = '🥇 #1';
      } else if (school.rank === 2) {
        rankBadgeClass = 'badge-info';
        rankIcon = '🥈 #2';
      } else if (school.rank === 3) {
        rankBadgeClass = 'badge-warning';
        rankIcon = '🥉 #3';
      }

      let changeColor = 'var(--color-text-muted)';
      if (school.change === '↑') changeColor = 'var(--color-success)';
      if (school.change === '↓') changeColor = 'var(--color-danger)';

      return `
        <tr class="hover-lift">
          <td data-label="Rank" style="font-weight: 800; font-size: 1.05rem;">
            <span class="badge ${rankBadgeClass}">${rankIcon}</span>
          </td>
          <td data-label="School">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <img src="${school.logo}" alt="${school.name}" style="width: 42px; height: 42px; border-radius: 10px; background: #FFF; border: 1px solid var(--color-border); padding: 3px;" />
              <div>
                <a href="school.html?id=${school.schoolId}" style="font-weight: 700; color: var(--color-dark-forest); font-size: 0.98rem; text-decoration: none;">
                  ${school.name}
                </a>
                <div style="font-size: 0.78rem; color: var(--color-text-muted);">${school.shortName} • ${school.approvedCount} verified activities</div>
              </div>
            </div>
          </td>
          <td data-label="Total Green Points">
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary-green);">
              ${Utils.formatNumber(school.totalGreenPoints)} <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-text-light);">PTS</span>
            </div>
          </td>
          <td data-label="Change">
            <div style="font-weight: 800; font-size: 1.1rem; color: ${changeColor}; display: flex; align-items: center; gap: 0.25rem;">
              <span>${school.change}</span>
            </div>
          </td>
          <td data-label="Actions" style="text-align: right;">
            <a href="school.html?id=${school.schoolId}" class="btn btn-secondary btn-sm">
              View Profile
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Category Filter Pill Buttons
  if (categoryPillsContainer) {
    const pills = categoryPillsContainer.querySelectorAll('.category-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilters.category = pill.dataset.category;
        if (categoryFilterSelect) categoryFilterSelect.value = currentFilters.category;
        renderLeaderboard();
      });
    });
  }

  // Filter Event Listeners
  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener('change', (e) => {
      currentFilters.category = e.target.value;
      // Sync pills
      if (categoryPillsContainer) {
        const pills = categoryPillsContainer.querySelectorAll('.category-pill');
        pills.forEach(p => {
          if (p.dataset.category === currentFilters.category) p.classList.add('active');
          else p.classList.remove('active');
        });
      }
      renderLeaderboard();
    });
  }

  if (monthFilterSelect) {
    monthFilterSelect.addEventListener('change', (e) => {
      currentFilters.month = e.target.value;
      renderLeaderboard();
    });
  }

  if (yearFilterSelect) {
    yearFilterSelect.addEventListener('change', (e) => {
      currentFilters.year = e.target.value;
      renderLeaderboard();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value;
      renderLeaderboard();
    });
  }

  // Initial Render
  renderLeaderboard();
});
