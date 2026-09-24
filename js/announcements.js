/**
 * SUSTAINX - Green Campus Challenge
 * Public Announcements Feed Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const DataStore = window.SustainX.DataStore;
  const Utils = window.SustainX.Utils;

  const announcementsContainer = document.getElementById('announcementsContainer');
  const searchInput = document.getElementById('announcementSearch');
  const categoryFilter = document.getElementById('announcementCategoryFilter');

  let currentSearch = '';
  let currentCategory = 'all';

  function renderAnnouncements() {
    if (!announcementsContainer) return;

    let list = DataStore.getAnnouncements(true);

    if (currentCategory !== 'all') {
      list = list.filter(a => a.category.toLowerCase() === currentCategory.toLowerCase());
    }

    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }

    if (list.length === 0) {
      announcementsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🌱</div>
          <div class="empty-title">No announcements yet 🌱</div>
          <p class="empty-desc">Check back soon for upcoming audits, guideline advisories, and competition updates.</p>
        </div>
      `;
      return;
    }

    announcementsContainer.innerHTML = list.map(item => `
      <div class="card hover-lift" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span class="badge badge-info">${item.category}</span>
            <span style="font-size: 0.82rem; color: var(--color-text-muted);">${Utils.formatDate(item.date)}</span>
          </div>
          <h3 style="font-size: 1.25rem; margin-bottom: 0.85rem; line-height: 1.35; color: var(--color-dark-forest);">
            ${item.title}
          </h3>
          <p style="font-size: 0.92rem; line-height: 1.6; color: var(--color-text-muted); margin-bottom: 1.5rem;">
            ${item.description}
          </p>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--color-border-subtle); padding-top: 1rem; font-size: 0.82rem; color: var(--color-text-light);">
          <span>By: <strong>${item.createdBy}</strong></span>
          <span style="display: flex; align-items: center; gap: 0.35rem; color: var(--color-primary-green); font-weight: 700;">
            Official Notice ✓
          </span>
        </div>
      </div>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderAnnouncements();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      renderAnnouncements();
    });
  }

  renderAnnouncements();
});
