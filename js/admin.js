/**
 * SUSTAINX - Green Campus Challenge
 * Administrator Controller & Management Engine
 */

document.addEventListener('DOMContentLoaded', async () => {
  await window.SustainX.DataStore.initFirebase();
  const DataStore = window.SustainX.DataStore;
  const Utils = window.SustainX.Utils;

  // -------------------------------------------------------------------------
  // 1. Strict Role Authorization Guard
  // -------------------------------------------------------------------------
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const currentUser = DataStore.getCurrentUser();

  if (!isLoginPage) {
    if (!currentUser) {
      window.location.href = '../login.html';
      return;
    }
  }

  // Admin Topbar / User Display
  const adminUserNameEl = document.getElementById('adminUserName');
  if (adminUserNameEl && currentUser) {
    adminUserNameEl.textContent = currentUser.name;
  }

  // Logout Handlers
  const logoutButtons = document.querySelectorAll('.admin-logout-btn, #adminLogout');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await DataStore.logout();
      window.location.href = '../login.html';
    });
  });

  // Mobile sidebar drawer toggle
  const sidebarToggle = document.getElementById('adminSidebarToggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  // -------------------------------------------------------------------------
  // 2. Dashboard Page View (`/admin/dashboard.html`)
  // -------------------------------------------------------------------------
  const dashboardKpiContainer = document.getElementById('dashboardKpis');
  if (dashboardKpiContainer) {
    const stats = DataStore.getPlatformStats();
    
    // KPI Numbers
    const kpiSchools = document.getElementById('kpiTotalSchools');
    const kpiEntries = document.getElementById('kpiTotalEntries');
    const kpiPoints = document.getElementById('kpiTotalPoints');
    const kpiLeader = document.getElementById('kpiCurrentLeader');

    if (kpiSchools) kpiSchools.textContent = stats.totalSchools;
    if (kpiEntries) kpiEntries.textContent = stats.totalEntries;
    if (kpiPoints) kpiPoints.textContent = Utils.formatNumber(stats.totalGreenPoints);
    if (kpiLeader) {
      kpiLeader.textContent = stats.currentLeader ? `${stats.currentLeader.shortName} (${Utils.formatNumber(stats.currentLeader.totalGreenPoints)} pts)` : 'None';
    }

    // Dashboard Leaderboard Table
    const dashLeaderboardTable = document.getElementById('dashLeaderboardTable');
    if (dashLeaderboardTable) {
      const leaderboard = DataStore.calculateLeaderboard('Overall', 'all');
      dashLeaderboardTable.innerHTML = leaderboard.slice(0, 5).map(s => `
        <tr>
          <td><span class="badge ${s.rank === 1 ? 'badge-gold' : 'badge-info'}">#${s.rank}</span></td>
          <td style="font-weight: 700; color: var(--color-dark-forest);">${s.name}</td>
          <td style="font-weight: 800; color: var(--color-primary-green);">${Utils.formatNumber(s.totalGreenPoints)} PTS</td>
          <td>${s.change}</td>
          <td><a href="../school.html?id=${s.schoolId}" target="_blank" class="btn btn-secondary btn-sm">Preview</a></td>
        </tr>
      `).join('');
    }

    // Recent Score Updates
    const dashRecentScores = document.getElementById('dashRecentScores');
    if (dashRecentScores) {
      const recent = DataStore.getScoreEntries().slice(0, 5);
      dashRecentScores.innerHTML = recent.map(entry => {
        const school = DataStore.getSchoolById(entry.schoolId);
        const isPenalty = entry.points < 0;
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0; border-bottom: 1px solid var(--color-border-subtle);">
            <div>
              <div style="font-weight: 700; color: var(--color-dark-forest); font-size: 0.92rem;">
                ${school ? school.shortName : entry.schoolId}: ${entry.activity}
              </div>
              <div style="font-size: 0.78rem; color: var(--color-text-muted);">
                ${entry.category} • ${Utils.formatDate(entry.date)} • ${entry.verifiedBy}
              </div>
            </div>
            <div style="font-weight: 800; font-size: 0.95rem; color: ${isPenalty ? 'var(--color-danger)' : 'var(--color-primary-green)'};">
              ${isPenalty ? '' : '+'}${Utils.formatNumber(entry.points)} PTS
            </div>
          </div>
        `;
      }).join('');
    }

    // Quick reset demo data trigger
    const resetDemoBtn = document.getElementById('resetDemoDataBtn');
    if (resetDemoBtn) {
      resetDemoBtn.addEventListener('click', () => {
        if (confirm('Reset all schools, scores, and announcements back to initial demo data?')) {
          DataStore.resetDemoData();
          Utils.showToast('Reset Complete', 'Default demo dataset reloaded.', 'success');
          setTimeout(() => window.location.reload(), 600);
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3. Update Scores Form View (`/admin/scores.html`)
  // -------------------------------------------------------------------------
  const scoreEntryForm = document.getElementById('scoreEntryForm');
  if (scoreEntryForm) {
    const schoolSelect = document.getElementById('scoreSchoolSelect');
    const categorySelect = document.getElementById('scoreCategorySelect');
    const activityPresetSelect = document.getElementById('scoreActivityPreset');
    const activityInput = document.getElementById('scoreActivityInput');
    const pointsInput = document.getElementById('scorePointsInput');
    const dateInput = document.getElementById('scoreDateInput');

    // Default today's date
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Populate Schools
    if (schoolSelect) {
      const schools = DataStore.getSchools(false);
      schoolSelect.innerHTML = `<option value="">-- Choose School --</option>` + schools.map(s => `
        <option value="${s.schoolId}">${s.name} (${s.shortName}) ${s.active ? '' : '[Inactive]'}</option>
      `).join('');
    }

    // Preset Rubrics Mapping per SustainX Guidelines
    const PRESETS = {
      'Sustainable Events': [
        { label: 'Plastic-Free Event Tag (+5000)', points: 5000, desc: 'Zero single-use plastic bottles, cloth banners, reusable crockery.' },
        { label: 'Handing Over Plastic/Waste to SustainX (+2000)', points: 2000, desc: 'Direct dry waste handover and certified segregation.' },
        { label: 'Less Amount of Waste Generated (+1000)', points: 1000, desc: 'Waste minimisation protocols observed.' },
        { label: 'Some Reusable Plastic Used (+500)', points: 500, desc: 'Durable multi-use containers permitted.' },
        { label: 'Heavy Plastic Usage Penalty (-2000)', points: -2000, desc: 'Violation: disposable cups/bottles/plastic flex banners found.' }
      ],
      'Reuse & Resource Sharing': [
        { label: 'Borrowing Materials from Another School (+1000)', points: 1000, desc: 'Inter-school shared utilization of props, stage or gear.' },
        { label: 'Allocating / Lending Materials (+1500)', points: 1500, desc: 'Supplied assets to sister school without rental cost.' },
        { label: 'Reusing Materials for Same School Event (+1000)', points: 1000, desc: 'Repurposed existing stage/signage setups.' },
        { label: 'Throwing Reusable Materials in Bins (-2000)', points: -2000, desc: 'Penalty: intact reusable resources discarded.' }
      ],
      'Waste Collection Drive': [
        { label: 'High Collection Tier (+1200)', points: 1200, desc: 'High volume collection with min 2 volunteers and recycling slips.' },
        { label: 'Medium Collection Tier (+700)', points: 700, desc: 'Moderate collection targets verified.' },
        { label: 'Low Collection Tier (+300)', points: 300, desc: 'Baseline minimum drive fulfilled.' },
        { label: 'No Collection / Missed Drive Penalty (-300)', points: -300, desc: 'Zero collection organized during scheduled cycle.' }
      ],
      'Sustainability Participation': [
        { label: 'Above 30% Student Participation (+3000)', points: 3000, desc: 'Over 30% of total eligible students engaged.' },
        { label: '20% to 30% Participation (+2750)', points: 2750, desc: 'Strong campus-wide turnout.' },
        { label: '15% to 20% Participation (+2500)', points: 2500, desc: '15-20% verified turnout.' },
        { label: '10% to 15% Participation (+2250)', points: 2250, desc: '10-15% verified turnout.' },
        { label: '5% to 10% Participation (+2100)', points: 2100, desc: '5-10% verified turnout.' },
        { label: '2% to 5% Participation (+1000)', points: 1000, desc: '2-5% verified turnout.' },
        { label: 'Winning Team School Bonus (+2500)', points: 2500, desc: 'Host school of first-place competition winner.' },
        { label: 'No Participation Penalty (-500)', points: -500, desc: 'Zero student turnout in mandatory competition.' }
      ],
      'Innovation Bonus': [
        { label: 'High-Impact Practical Prototype (Audit Approved)', points: 3500, desc: 'e.g. Solar composter, AI smart bins, or water harvest system.' },
        { label: 'Campus Circular Economy Initiative (Audit Approved)', points: 2000, desc: 'e.g. Paperless exam workflow, upcycled furniture lab.' }
      ]
    };

    function updatePresets() {
      const selectedCategory = categorySelect.value;
      const presets = PRESETS[selectedCategory] || [];
      activityPresetSelect.innerHTML = `<option value="">-- Custom or Select Guideline Preset --</option>` + presets.map((p, idx) => `
        <option value="${idx}">${p.label}</option>
      `).join('');
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', updatePresets);
      updatePresets();
    }

    if (activityPresetSelect) {
      activityPresetSelect.addEventListener('change', (e) => {
        const selectedCategory = categorySelect.value;
        const presets = PRESETS[selectedCategory] || [];
        const index = e.target.value;
        if (index !== '' && presets[index]) {
          const item = presets[index];
          activityInput.value = item.label.replace(/\s\([+-]?\d+\)/, '');
          pointsInput.value = item.points;
          const remarksEl = document.getElementById('scoreRemarksInput');
          if (remarksEl && !remarksEl.value) {
            remarksEl.value = item.desc;
          }
        }
      });
    }

    scoreEntryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const schoolId = schoolSelect.value;
      const category = categorySelect.value;
      const activity = activityInput.value.trim();
      const points = parseInt(pointsInput.value, 10);
      const date = dateInput.value;
      const remarks = document.getElementById('scoreRemarksInput').value.trim();
      const evidenceUrl = document.getElementById('scoreEvidenceInput') ? document.getElementById('scoreEvidenceInput').value.trim() : '';
      const verificationStatus = document.getElementById('scoreStatusSelect').value;

      if (!schoolId) {
        alert('Please select a school.');
        return;
      }

      if (!activity) {
        alert('Please enter or select an activity.');
        return;
      }

      if (isNaN(points)) {
        alert('Please enter valid points.');
        return;
      }

      const dateObj = new Date(date);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[dateObj.getMonth()] || 'September';

      const entry = await DataStore.addScoreEntry({
        schoolId,
        category,
        activity,
        points,
        date,
        month,
        academicYear: '2026-27',
        remarks,
        evidenceUrl,
        verificationStatus
      });

      Utils.showToast('Score Recorded', `${points >= 0 ? '+' : ''}${points} points added for ${schoolId}.`, 'success');
      scoreEntryForm.reset();
      dateInput.value = new Date().toISOString().split('T')[0];
      updatePresets();

      // Refresh recent table if on page
      if (typeof renderHistoryTable === 'function') {
        renderHistoryTable();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 4. Score History View (`/admin/history.html`)
  // -------------------------------------------------------------------------
  const historyTable = document.getElementById('adminHistoryTableBody');
  if (historyTable) {
    const filterSchool = document.getElementById('historyFilterSchool');
    const filterCategory = document.getElementById('historyFilterCategory');
    const filterMonth = document.getElementById('historyFilterMonth');
    const filterPointsType = document.getElementById('historyFilterPointsType');

    // Populate filter school options
    if (filterSchool) {
      const schools = DataStore.getSchools(false);
      filterSchool.innerHTML = `<option value="all">All Schools</option>` + schools.map(s => `
        <option value="${s.schoolId}">${s.shortName}</option>
      `).join('');
    }

    function renderHistory() {
      const filters = {
        schoolId: filterSchool ? filterSchool.value : 'all',
        category: filterCategory ? filterCategory.value : 'all',
        month: filterMonth ? filterMonth.value : 'all',
        pointsType: filterPointsType ? filterPointsType.value : 'all'
      };

      const entries = DataStore.getScoreEntries(filters);

      if (entries.length === 0) {
        historyTable.innerHTML = `
          <tr>
            <td colspan="8">
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-title">No Score Entries Found</div>
                <p class="empty-desc">No entries match the specified filter criteria.</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      historyTable.innerHTML = entries.map(entry => {
        const school = DataStore.getSchoolById(entry.schoolId);
        const isPenalty = entry.points < 0;
        let statusBadge = 'badge-success';
        if (entry.verificationStatus === 'pending') statusBadge = 'badge-warning';
        if (entry.verificationStatus === 'rejected') statusBadge = 'badge-danger';

        return `
          <tr>
            <td data-label="Date" style="white-space: nowrap; font-size: 0.88rem;">${Utils.formatDate(entry.date)}</td>
            <td data-label="School">
              <strong>${school ? school.shortName : entry.schoolId}</strong>
            </td>
            <td data-label="Category">
              <span class="badge ${Utils.getCategoryBadgeClass(entry.category)}">${entry.category}</span>
            </td>
            <td data-label="Activity">
              <div style="font-weight: 600; color: var(--color-dark-forest);">${entry.activity}</div>
              <div style="font-size: 0.78rem; color: var(--color-text-muted);">${entry.remarks || 'No remarks'}</div>
            </td>
            <td data-label="Points">
              <span style="font-weight: 800; font-size: 1.05rem; color: ${isPenalty ? 'var(--color-danger)' : 'var(--color-primary-green)'};">
                ${isPenalty ? '' : '+'}${Utils.formatNumber(entry.points)} PTS
              </span>
            </td>
            <td data-label="Verification">
              <span class="badge ${statusBadge}">${entry.verificationStatus.toUpperCase()}</span>
            </td>
            <td data-label="Auditor" style="font-size: 0.82rem; color: var(--color-text-muted);">${entry.verifiedBy}</td>
            <td data-label="Actions">
              <button class="btn btn-sm" style="color: var(--color-danger); padding: 0.3rem 0.6rem;" onclick="window.deleteScoreItem('${entry.scoreId}')">
                Delete
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    window.deleteScoreItem = async function(scoreId) {
      if (confirm('Are you sure you want to delete this score entry? The school leaderboard total will automatically recalculate.')) {
        await DataStore.deleteScoreEntry(scoreId);
        Utils.showToast('Score Deleted', 'The score entry has been removed.', 'info');
        renderHistory();
      }
    };

    [filterSchool, filterCategory, filterMonth, filterPointsType].forEach(el => {
      if (el) el.addEventListener('change', renderHistory);
    });

    renderHistory();
  }

  // -------------------------------------------------------------------------
  // 5. Manage Schools View (`/admin/schools.html`)
  // -------------------------------------------------------------------------
  const adminSchoolsTable = document.getElementById('adminSchoolsTableBody');
  if (adminSchoolsTable) {
    function renderAdminSchools() {
      const schools = DataStore.getSchools(false); // include inactive
      const leaderboard = DataStore.calculateLeaderboard('Overall', 'all');

      adminSchoolsTable.innerHTML = schools.map(s => {
        const ranked = leaderboard.find(l => l.schoolId === s.schoolId);
        const totalPoints = ranked ? ranked.totalGreenPoints : 0;
        const currentRank = ranked ? `#${ranked.rank}` : '-';

        return `
          <tr>
            <td data-label="Logo">
              <img src="../${s.logo}" alt="${s.name}" style="width: 44px; height: 44px; border-radius: 10px; background: #FFF; border: 1px solid var(--color-border); padding: 3px;" />
            </td>
            <td data-label="School Name">
              <div style="font-weight: 700; color: var(--color-dark-forest);">${s.name}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">${s.shortName} • ID: ${s.schoolId}</div>
            </td>
            <td data-label="Rank & Points">
              <span class="badge badge-info">${currentRank}</span>
              <span style="font-weight: 800; color: var(--color-primary-green); margin-left: 0.5rem;">${Utils.formatNumber(totalPoints)} PTS</span>
            </td>
            <td data-label="Status">
              <span class="badge ${s.active ? 'badge-success' : 'badge-danger'}">
                ${s.active ? 'ACTIVE' : 'DEACTIVATED'}
              </span>
            </td>
            <td data-label="Actions">
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary btn-sm" onclick="window.editSchoolModal('${s.schoolId}')">Edit</button>
                <button class="btn btn-sm ${s.active ? 'btn-secondary' : 'btn-primary'}" onclick="window.toggleSchool('${s.schoolId}')">
                  ${s.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    window.toggleSchool = async function(schoolId) {
      const updated = await DataStore.toggleSchoolStatus(schoolId);
      if (updated) {
        Utils.showToast('Status Updated', `${updated.shortName} is now ${updated.active ? 'Active' : 'Deactivated'}.`, 'info');
        renderAdminSchools();
      }
    };

    window.editSchoolModal = function(schoolId) {
      const s = DataStore.getSchoolById(schoolId);
      if (!s) return;
      document.getElementById('modalSchoolId').value = s.schoolId;
      document.getElementById('modalSchoolName').value = s.name;
      document.getElementById('modalSchoolShortName').value = s.shortName;
      document.getElementById('modalSchoolDesc').value = s.description || '';
      Utils.openModal('schoolModal');
    };

    // Save/Add School in Modal
    const schoolForm = document.getElementById('schoolForm');
    if (schoolForm) {
      schoolForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('modalSchoolId').value;
        const name = document.getElementById('modalSchoolName').value.trim();
        const shortName = document.getElementById('modalSchoolShortName').value.trim();
        const description = document.getElementById('modalSchoolDesc').value.trim();

        if (id) {
          await DataStore.updateSchool(id, { name, shortName, description });
          Utils.showToast('School Updated', `${name} updated successfully.`, 'success');
        } else {
          const newId = 'school-' + shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
          await DataStore.addSchool({
            schoolId: newId,
            name,
            shortName,
            description,
            logo: 'assets/logos/school-a.svg',
            active: true
          });
          Utils.showToast('School Added', `${name} added to competition.`, 'success');
        }

        Utils.closeModal('schoolModal');
        renderAdminSchools();
      });
    }

    const openAddSchoolBtn = document.getElementById('openAddSchoolBtn');
    if (openAddSchoolBtn) {
      openAddSchoolBtn.addEventListener('click', () => {
        document.getElementById('modalSchoolId').value = '';
        document.getElementById('modalSchoolName').value = '';
        document.getElementById('modalSchoolShortName').value = '';
        document.getElementById('modalSchoolDesc').value = '';
        Utils.openModal('schoolModal');
      });
    }

    renderAdminSchools();
  }

  // -------------------------------------------------------------------------
  // 6. Manage Announcements View (`/admin/announcements.html`)
  // -------------------------------------------------------------------------
  const adminAnnouncementsTable = document.getElementById('adminAnnouncementsTableBody');
  if (adminAnnouncementsTable) {
    function renderAdminAnnouncements() {
      const announcements = DataStore.getAnnouncements(false);
      adminAnnouncementsTable.innerHTML = announcements.map(a => `
        <tr>
          <td data-label="Date" style="white-space: nowrap; font-size: 0.88rem;">${Utils.formatDate(a.date)}</td>
          <td data-label="Title">
            <div style="font-weight: 700; color: var(--color-dark-forest);">${a.title}</div>
            <div style="font-size: 0.82rem; color: var(--color-text-muted);">${a.description.substring(0, 100)}...</div>
          </td>
          <td data-label="Category"><span class="badge badge-info">${a.category}</span></td>
          <td data-label="Status">
            <span class="badge ${a.published ? 'badge-success' : 'badge-warning'}">
              ${a.published ? 'PUBLISHED' : 'DRAFT'}
            </span>
          </td>
          <td data-label="Actions">
            <button class="btn btn-sm" style="color: var(--color-danger); padding: 0.3rem 0.6rem;" onclick="window.deleteAnn('${a.announcementId}')">
              Delete
            </button>
          </td>
        </tr>
      `).join('');
    }

    window.deleteAnn = async function(id) {
      if (confirm('Delete this announcement?')) {
        await DataStore.deleteAnnouncement(id);
        Utils.showToast('Announcement Removed', 'Deleted from public portal.', 'info');
        renderAdminAnnouncements();
      }
    };

    const addAnnForm = document.getElementById('addAnnouncementForm');
    if (addAnnForm) {
      addAnnForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('annTitle').value.trim();
        const category = document.getElementById('annCategory').value;
        const description = document.getElementById('annDescription').value.trim();

        await DataStore.addAnnouncement({
          title,
          category,
          description,
          published: true
        });

        Utils.showToast('Announcement Published', 'Live on announcements page.', 'success');
        addAnnForm.reset();
        renderAdminAnnouncements();
      });
    }

    renderAdminAnnouncements();
  }
});
