/**
 * SUSTAINX - Green Campus Challenge
 * School Profile & Score Progression Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  await window.SustainX.DataStore.initFirebase();
  const DataStore = window.SustainX.DataStore;
  const Utils = window.SustainX.Utils;

  // Read URL query parameter ?id=school-a
  const urlParams = new URLSearchParams(window.location.search);
  let schoolId = urlParams.get('id');

  // If no ID or invalid, default to the top-ranked school
  const allSchools = DataStore.getSchools(true);
  if (!schoolId || !DataStore.getSchoolById(schoolId)) {
    schoolId = allSchools.length > 0 ? allSchools[0].schoolId : 'school-a';
  }

  const profileData = DataStore.getSchoolProfileData(schoolId);
  if (!profileData) {
    document.body.innerHTML = `
      <div class="empty-state" style="margin-top: 10vh;">
        <div class="empty-title">School Not Found</div>
        <a href="schools.html" class="btn btn-primary">Back to Schools Directory</a>
      </div>
    `;
    return;
  }

  const { school, rank, totalGreenPoints, categoryBreakdown, monthlyProgression, recentEntries } = profileData;

  // 1. Populate Header & Hero Stats
  const nameEl = document.getElementById('schoolProfileName');
  const shortNameEl = document.getElementById('schoolProfileShortName');
  const descEl = document.getElementById('schoolProfileDesc');
  const logoEl = document.getElementById('schoolProfileLogo');
  const rankEl = document.getElementById('schoolProfileRank');
  const pointsEl = document.getElementById('schoolProfilePoints');
  const activitiesCountEl = document.getElementById('schoolProfileActivities');

  if (nameEl) nameEl.textContent = school.name;
  if (shortNameEl) shortNameEl.textContent = school.shortName;
  if (descEl) descEl.textContent = school.description;
  if (logoEl) {
    logoEl.src = school.logo;
    logoEl.alt = school.name;
  }
  if (rankEl) rankEl.textContent = `#${rank}`;
  if (pointsEl) pointsEl.textContent = Utils.formatNumber(totalGreenPoints);
  if (activitiesCountEl) activitiesCountEl.textContent = recentEntries.length;

  // 2. Render Category Breakdown with Animated Progress Bars
  const categoryBreakdownContainer = document.getElementById('categoryBreakdownContainer');
  if (categoryBreakdownContainer) {
    const maxCategoryPoints = 10000; // Reference ceiling for proportional representation
    
    categoryBreakdownContainer.innerHTML = DataStore.CATEGORIES.map(category => {
      const points = categoryBreakdown[category] || 0;
      const percentage = Math.min(Math.max((points / maxCategoryPoints) * 100, 0), 100);
      const isNegative = points < 0;

      return `
        <div class="progress-wrap">
          <div class="progress-info">
            <span class="progress-label" style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge ${Utils.getCategoryBadgeClass(category)}" style="font-size: 0.72rem;">${category}</span>
            </span>
            <span class="progress-val" style="color: ${isNegative ? 'var(--color-danger)' : 'var(--color-primary-green)'};">
              ${isNegative ? '' : '+'}${Utils.formatNumber(points)} PTS
            </span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" style="width: 0%; background: ${isNegative ? 'var(--color-danger)' : ''};" data-width="${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');

    // Trigger smooth fill animation
    setTimeout(() => {
      const bars = categoryBreakdownContainer.querySelectorAll('.progress-bar');
      bars.forEach(bar => {
        bar.style.width = bar.getAttribute('data-width');
      });
    }, 150);
  }

  // 3. Render Canvas Monthly Line Chart
  const chartCanvas = document.getElementById('progressionChart');
  if (chartCanvas && chartCanvas.getContext) {
    renderProgressionChart(chartCanvas, monthlyProgression);
  }

  function renderProgressionChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = 260 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 260;
    const padding = { top: 30, right: 35, bottom: 45, left: 55 };

    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Calculate cumulative points across months
    let cumulative = 0;
    const pointsData = data.map(item => {
      cumulative += item.points;
      return {
        month: item.month,
        monthly: item.points,
        cumulative: Math.max(cumulative, 0)
      };
    });

    const maxVal = Math.max(...pointsData.map(d => d.cumulative), 1000) * 1.25;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw horizontal grid lines
    ctx.strokeStyle = '#EDF3EF';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#879B90';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (graphHeight / gridLines) * i;
      const val = Math.round(maxVal - (maxVal / gridLines) * i);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(Utils.formatNumber(val), padding.left - 10, y + 4);
    }

    // Coordinates of points
    const stepX = graphWidth / (pointsData.length - 1);
    const coordinates = pointsData.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + graphHeight - (d.cumulative / maxVal) * graphHeight;
      return { x, y, ...d };
    });

    // Draw filled gradient area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(35, 139, 90, 0.35)');
    gradient.addColorStop(1, 'rgba(35, 139, 90, 0.01)');

    ctx.beginPath();
    ctx.moveTo(coordinates[0].x, height - padding.bottom);
    coordinates.forEach((pt, i) => {
      if (i === 0) {
        ctx.lineTo(pt.x, pt.y);
      } else {
        const prev = coordinates[i - 1];
        const cx = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
      }
    });
    ctx.lineTo(coordinates[coordinates.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw smooth line
    ctx.beginPath();
    coordinates.forEach((pt, i) => {
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        const prev = coordinates[i - 1];
        const cx = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
      }
    });
    ctx.strokeStyle = '#238B5A';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw points and month labels
    ctx.textAlign = 'center';
    coordinates.forEach(pt => {
      // Month label below axis
      ctx.fillStyle = '#56695F';
      ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
      ctx.fillText(pt.month, pt.x, height - 15);

      // Outer point glow
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#164A35';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#D6A84F';
      ctx.fill();

      // Point score text
      ctx.fillStyle = '#164A35';
      ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(Utils.formatNumber(pt.cumulative), pt.x, pt.y - 12);
    });
  }

  // 4. Render Recent Verified Score History
  const historyTableBody = document.getElementById('schoolHistoryTableBody');
  if (historyTableBody) {
    if (recentEntries.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state" style="padding: 2.5rem 1rem;">
              <p>Score updates will appear here once verified by the SustainX Green Audit Team.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      historyTableBody.innerHTML = recentEntries.map(entry => {
        const isPenalty = entry.points < 0;
        return `
          <tr>
            <td data-label="Date" style="color: var(--color-text-muted); font-size: 0.88rem;">
              ${Utils.formatDate(entry.date)}
            </td>
            <td data-label="Category">
              <span class="badge ${Utils.getCategoryBadgeClass(entry.category)}">${entry.category}</span>
            </td>
            <td data-label="Activity">
              <div style="font-weight: 600; color: var(--color-dark-forest); font-size: 0.92rem;">
                ${entry.activity}
              </div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.2rem;">
                ${entry.remarks}
              </div>
            </td>
            <td data-label="Points">
              <span style="font-weight: 800; font-size: 1rem; color: ${isPenalty ? 'var(--color-danger)' : 'var(--color-primary-green)'};">
                ${isPenalty ? '' : '+'}${Utils.formatNumber(entry.points)} PTS
              </span>
            </td>
            <td data-label="Status">
              <span class="badge badge-success">
                ✓ Verified
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 5. Recent Achievements
  const achievementsContainer = document.getElementById('achievementsList');
  if (achievementsContainer) {
    const achievements = [
      { icon: '🌿', title: 'Zero Single-Use Plastic Milestone', desc: '100% compliance during campus flagship festivals.' },
      { icon: '⚡', title: 'Renewable Engineering Showcase', desc: 'High innovation score for student-built solar prototypes.' },
      { icon: '♻️', title: 'Circular Inter-School Sharing Partner', desc: 'Lent lab and exhibition resources to peer university schools.' }
    ];

    achievementsContainer.innerHTML = achievements.map(ach => `
      <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: var(--color-bg-card-subtle); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle); margin-bottom: 0.85rem;">
        <div style="font-size: 1.5rem; background: #FFF; width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); flex-shrink: 0;">
          ${ach.icon}
        </div>
        <div>
          <div style="font-weight: 700; color: var(--color-dark-forest); font-size: 0.95rem;">${ach.title}</div>
          <div style="font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.4;">${ach.desc}</div>
        </div>
      </div>
    `).join('');
  }
});
