/**
 * SUSTAINX - Green Campus Challenge
 * Utility & UI Helper Library
 */

(function(window) {
  'use strict';

  const Utils = {
    // Selector shortcuts
    $: (selector, scope = document) => scope.querySelector(selector),
    $$: (selector, scope = document) => [...scope.querySelectorAll(selector)],

    // Number formatter with commas (e.g., 12,450)
    formatNumber: function(num) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      return Number(num).toLocaleString('en-US');
    },

    // Date formatter (e.g., "Sep 22, 2026")
    formatDate: function(dateString) {
      if (!dateString) return 'Recent';
      try {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
        return dateString;
      }
    },

    // Animated number counter
    animateCounter: function(el, targetValue, duration = 1200) {
      if (!el) return;
      const start = 0;
      const target = parseInt(targetValue, 10) || 0;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing curve: easeOutQuad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(start + (target - start) * eased);
        el.textContent = Utils.formatNumber(current);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = Utils.formatNumber(target);
        }
      }

      requestAnimationFrame(update);
    },

    // Toast notification
    showToast: function(title, message, type = 'success') {
      let container = document.getElementById('sustainx-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'sustainx-toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <div style="font-weight: 800; font-size: 1.1rem; color: var(--color-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'primary-green'})">
          ${iconMap[type] || 'ℹ'}
        </div>
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          <div class="toast-msg">${message}</div>
        </div>
      `;

      container.appendChild(toast);
      // Trigger entrance
      requestAnimationFrame(() => toast.classList.add('show'));

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    },

    // Floating leaves background generator for hero
    initFloatingLeaves: function(containerId = 'floating-leaves') {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = '';
      const leafCount = 12;
      const leafSvg = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#238B5A" opacity="0.65">
          <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20Z" style="display:none"/>
          <path d="M17 8C11 8 7 12 7 18C13 18 17 14 17 8Z" fill="#238B5A"/>
          <path d="M7 18L10 15" stroke="#164A35" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `;

      for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement('div');
        leaf.className = `floating-leaf leaf-anim-${(i % 5) + 1}`;
        leaf.innerHTML = leafSvg;
        leaf.style.left = `${Math.random() * 95}%`;
        leaf.style.top = `${Math.random() * 20}%`;
        const scale = 0.6 + Math.random() * 0.7;
        leaf.style.transform = `scale(${scale})`;
        leaf.style.animationDelay = `${(i * 1.6)}s`;
        leaf.style.animationDuration = `${14 + (i * 2)}s`;
        container.appendChild(leaf);
      }
    },

    // Modal dialog controls
    openModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    },

    closeModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    },

    // Category styling & badge helpers
    getCategoryBadgeClass: function(category) {
      switch (category) {
        case 'Sustainable Events': return 'badge-success';
        case 'Reuse & Resource Sharing': return 'badge-info';
        case 'Waste Collection Drive': return 'badge-warning';
        case 'Sustainability Participation': return 'badge-gold';
        case 'Innovation Bonus': return 'badge-success';
        default: return 'badge-info';
      }
    },

    // Navbar state initializer
    initNavbar: function() {
      const hamburger = document.querySelector('.hamburger-btn');
      const navMenu = document.querySelector('.nav-menu');
      if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
          hamburger.classList.toggle('active');
          navMenu.classList.toggle('show');
        });
      }

      // Sticky navbar scroll styling
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        window.addEventListener('scroll', () => {
          if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        }, { passive: true });
      }

      // Sync active state from current pathname
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
          link.classList.add('active');
        }
      });

      // Update Nav for Logged In User
      this.syncUserNavState();
    },

    syncUserNavState: function() {
      const user = window.SustainX && window.SustainX.DataStore ? window.SustainX.DataStore.getCurrentUser() : null;
      const navActions = document.querySelector('.nav-actions');
      if (!navActions) return;

      if (user) {
        const isAdmin = user.role === 'admin';
        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
        
        navActions.innerHTML = `
          <div class="user-menu-wrap">
            <button class="user-badge-btn" id="userMenuBtn" aria-label="User profile">
              <span class="user-avatar-circle">${initials}</span>
              <span>${user.name.split(' ')[0]}</span>
              <span class="badge ${isAdmin ? 'badge-gold' : 'badge-info'}" style="font-size:0.7rem; padding:0.15rem 0.45rem;">
                ${isAdmin ? 'ADMIN' : 'STUDENT'}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="user-dropdown" id="userDropdown">
              <div class="user-dropdown-header">
                <div class="user-dropdown-name">${user.name}</div>
                <div class="user-dropdown-email">${user.email}</div>
              </div>
              ${isAdmin ? `
                <a href="admin/dashboard.html" class="user-dropdown-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                  Admin Dashboard
                </a>
              ` : ''}
              <a href="#" id="navLogoutBtn" class="user-dropdown-link" style="color: var(--color-danger);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Log Out
              </a>
            </div>
          </div>
        `;

        const userBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        if (userBtn && userDropdown) {
          userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
          });

          document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
              userDropdown.classList.remove('show');
            }
          });
        }

        const logoutBtn = document.getElementById('navLogoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.SustainX.DataStore.logout();
            Utils.showToast('Logged Out', 'You have been signed out safely.', 'info');
            setTimeout(() => {
              window.location.reload();
            }, 500);
          });
        }
      }
    },

    // Skeleton loader renderer
    renderSkeleton: function(container, count = 3, type = 'card') {
      if (!container) return;
      let html = '';
      for (let i = 0; i < count; i++) {
        if (type === 'row') {
          html += `
            <div class="skeleton-row">
              <div class="skeleton skeleton-avatar" style="width: 36px; height: 36px;"></div>
              <div style="flex: 1;">
                <div class="skeleton skeleton-text" style="width: 45%;"></div>
                <div class="skeleton skeleton-text" style="width: 25%; margin-bottom: 0;"></div>
              </div>
              <div class="skeleton skeleton-text" style="width: 60px;"></div>
            </div>
          `;
        } else {
          html += `
            <div class="card" style="margin-bottom: 1rem;">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text" style="width: 85%;"></div>
              <div class="skeleton skeleton-text" style="width: 65%;"></div>
            </div>
          `;
        }
      }
      container.innerHTML = html;
    }
  };

  window.SustainX = window.SustainX || {};
  window.SustainX.Utils = Utils;

  // Initialize common UI on DOM ready
  document.addEventListener('DOMContentLoaded', async () => {
  await window.SustainX.DataStore.initFirebase();
    Utils.initNavbar();
  });

})(window);
