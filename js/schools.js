/**
 * SUSTAINX - Green Campus Challenge
 * Participating Schools Directory Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  await window.SustainX.DataStore.initFirebase();
  const DataStore = window.SustainX.DataStore;
  const Utils = window.SustainX.Utils;

  const schoolsGrid = document.getElementById('schoolsGrid');
  const searchInput = document.getElementById('schoolSearch');
  const sortSelect = document.getElementById('schoolSort');
  const schoolCountEl = document.getElementById('schoolCountDisplay');

  let currentSearch = '';
  let currentSort = 'rank'; // 'rank', 'score', 'name'

  function renderSchools() {
    if (!schoolsGrid) return;

    // Retrieve leaderboard with calculated total points and rankings
    let schools = DataStore.calculateLeaderboard('Overall', 'all');

    // Filter by search query
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase();
      schools = schools.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // Sort schools
    if (currentSort === 'rank') {
      schools.sort((a, b) => a.rank - b.rank);
    } else if (currentSort === 'score') {
      schools.sort((a, b) => b.totalGreenPoints - a.totalGreenPoints);
    } else if (currentSort === 'name') {
      schools.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (schoolCountEl) {
      schoolCountEl.textContent = `${schools.length} participating school${schools.length === 1 ? '' : 's'}`;
    }

    if (schools.length === 0) {
      schoolsGrid.innerHTML = `
        <div style="grid-column: 1 / -1;">
          <div class="empty-state">
            <div class="empty-icon">🏫</div>
            <div class="empty-title">No Schools Match Your Criteria</div>
            <p class="empty-desc">Check your spelling or reset the search query to see all participating institutions.</p>
          </div>
        </div>
      `;
      return;
    }

    schoolsGrid.innerHTML = schools.map(school => {
      let rankPill = `<span class="badge badge-info">Rank #${school.rank}</span>`;
      if (school.rank === 1) rankPill = `<span class="badge badge-gold">🥇 Rank #1 Champion</span>`;
      else if (school.rank === 2) rankPill = `<span class="badge badge-info">🥈 Rank #2</span>`;
      else if (school.rank === 3) rankPill = `<span class="badge badge-warning">🥉 Rank #3</span>`;

      return `
        <div class="card hover-lift" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem;">
              <img src="${school.logo}" alt="${school.name}" style="width: 58px; height: 58px; border-radius: 14px; background: #FFF; border: 1.5px solid var(--color-border); padding: 4px; object-fit: contain;" />
              <div>${rankPill}</div>
            </div>
            
            <h3 style="font-size: 1.2rem; margin-bottom: 0.35rem; line-height: 1.35;">${school.name}</h3>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary-green); margin-bottom: 0.85rem;">
              ${school.shortName}
            </div>
            <p style="font-size: 0.88rem; line-height: 1.5; margin-bottom: 1.25rem; color: var(--color-text-muted);">
              ${school.description || 'Active participant in the SustainX green campus initiative.'}
            </p>
          </div>

          <div>
            <div style="background: var(--color-bg-card-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-text-light); letter-spacing: 0.04em;">Total Green Points</div>
                <div style="font-size: 1.35rem; font-weight: 800; color: var(--color-dark-forest);">
                  ${Utils.formatNumber(school.totalGreenPoints)} <span style="font-size: 0.78rem; font-weight: 600; color: var(--color-primary-green);">PTS</span>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-text-light); letter-spacing: 0.04em;">Activities</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-dark-forest);">${school.approvedCount}</div>
              </div>
            </div>

            <a href="school.html?id=${school.schoolId}" class="btn btn-primary" style="width: 100%;">
              View Full School Profile
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderSchools();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderSchools();
    });
  }

  renderSchools();
});
