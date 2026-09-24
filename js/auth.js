/**
 * SUSTAINX - Green Campus Challenge
 * Authentication Controller (Client & Admin)
 */

document.addEventListener('DOMContentLoaded', () => {
  const DataStore = window.SustainX.DataStore;
  const Utils = window.SustainX.Utils;

  // --- Normal User Login Form ---
  const userLoginForm = document.getElementById('userLoginForm');
  if (userLoginForm) {
    userLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const errorDiv = document.getElementById('loginError');

      if (errorDiv) errorDiv.style.display = 'none';

      const result = DataStore.login(email, password);
      if (result.success) {
        Utils.showToast('Welcome Back!', `Signed in as ${result.user.name}`, 'success');
        setTimeout(() => {
          if (result.user.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
          } else {
            window.location.href = 'leaderboard.html';
          }
        }, 600);
      } else {
        if (errorDiv) {
          errorDiv.textContent = result.message || 'Invalid email or password.';
          errorDiv.style.display = 'block';
        } else {
          Utils.showToast('Login Failed', result.message, 'error');
        }
      }
    });

    // Demo quick-fill student
    const demoStudentBtn = document.getElementById('demoStudentBtn');
    if (demoStudentBtn) {
      demoStudentBtn.addEventListener('click', () => {
        document.getElementById('loginEmail').value = 'student@sustainx.edu';
        document.getElementById('loginPassword').value = 'student123';
        Utils.showToast('Demo Credentials Filled', 'Click "Log In" to proceed as student.', 'info');
      });
    }
  }

  // --- Normal User Sign Up Form ---
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    // Populate school options in dropdown
    const schoolSelect = document.getElementById('signupSchool');
    if (schoolSelect) {
      const schools = DataStore.getSchools(true);
      schools.forEach(school => {
        const opt = document.createElement('option');
        opt.value = school.schoolId;
        opt.textContent = `${school.name} (${school.shortName})`;
        schoolSelect.appendChild(opt);
      });
    }

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('signupConfirmPassword').value;
      const schoolId = document.getElementById('signupSchool').value;
      const errorDiv = document.getElementById('signupError');

      if (errorDiv) errorDiv.style.display = 'none';

      if (password !== confirmPassword) {
        if (errorDiv) {
          errorDiv.textContent = 'Passwords do not match.';
          errorDiv.style.display = 'block';
        }
        return;
      }

      if (password.length < 6) {
        if (errorDiv) {
          errorDiv.textContent = 'Password must be at least 6 characters.';
          errorDiv.style.display = 'block';
        }
        return;
      }

      const res = DataStore.signup({
        name,
        email,
        password,
        schoolId
      });

      if (res.success) {
        Utils.showToast('Account Created!', 'Welcome to SustainX Green Campus Challenge.', 'success');
        setTimeout(() => {
          window.location.href = 'leaderboard.html';
        }, 800);
      } else {
        if (errorDiv) {
          errorDiv.textContent = res.message;
          errorDiv.style.display = 'block';
        }
      }
    });
  }

  // --- Admin Login Form (/admin/login.html) ---
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;
      const errorDiv = document.getElementById('adminLoginError');

      if (errorDiv) errorDiv.style.display = 'none';

      const res = DataStore.login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') {
          Utils.showToast('Admin Authenticated', 'Access granted to SustainX Management Console.', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 600);
        } else {
          // If a student tries to log in through admin portal:
          DataStore.logout();
          if (errorDiv) {
            errorDiv.textContent = 'Access Denied: This account does not possess green audit administrative privileges.';
            errorDiv.style.display = 'block';
          }
        }
      } else {
        if (errorDiv) {
          errorDiv.textContent = 'Invalid administrator credentials.';
          errorDiv.style.display = 'block';
        }
      }
    });

    // Demo quick-fill admin
    const demoAdminBtn = document.getElementById('demoAdminBtn');
    if (demoAdminBtn) {
      demoAdminBtn.addEventListener('click', () => {
        document.getElementById('adminEmail').value = 'admin@sustainx.edu';
        document.getElementById('adminPassword').value = 'admin123';
        Utils.showToast('Audit Credentials Filled', 'Click "Admin Login" to proceed.', 'info');
      });
    }
  }

  // --- Forgot Password Modal Trigger ---
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password reset instructions will be dispatched to your university email address via Firebase Auth in production.');
    });
  }
});
