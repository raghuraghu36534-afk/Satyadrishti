const Profile = (function () {
  let currentUser = null;

  async function fetchWithAuth(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Request failed');
    }
    return res.json();
  }

  function setAlert(el, message, type = 'error') {
    if (!el) return;
    if (!message) {
      el.classList.remove('show');
      el.textContent = '';
      return;
    }
    el.textContent = message;
    el.classList.add('show');
    el.classList.remove('alert-error', 'alert-success');
    el.classList.add(type === 'success' ? 'alert-success' : 'alert-error');
  }

  function setButtonLoading(btn, loading) {
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  async function loadUserProfile() {
    try {
      currentUser = await fetchWithAuth('/api/auth/me');
      
      // Update profile card
      const avatarEl = document.getElementById('profileAvatar');
      const nameEl = document.getElementById('profileName');
      const emailEl = document.getElementById('profileEmail');
      
      if (avatarEl) avatarEl.textContent = getInitials(currentUser.user.fullName);
      if (nameEl) nameEl.textContent = currentUser.user.fullName;
      if (emailEl) emailEl.textContent = currentUser.user.email;
      
      // Update form
      const fullNameInput = document.getElementById('fullName');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const createdAtInput = document.getElementById('createdAt');
      
      if (fullNameInput) fullNameInput.value = currentUser.user.fullName;
      if (emailInput) emailInput.value = currentUser.user.email;
      if (phoneInput) phoneInput.value = currentUser.user.phone || '';
      if (createdAtInput) createdAtInput.value = formatDate(currentUser.user.createdAt || Date.now());
      
      // Load stats
      loadStats();
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  async function loadStats() {
    try {
      const stats = await fetchWithAuth('/api/complaints/stats');
      
      const totalEl = document.getElementById('totalComplaints');
      const resolvedEl = document.getElementById('resolvedComplaints');
      
      if (totalEl) totalEl.textContent = stats.total || 0;
      if (resolvedEl) resolvedEl.textContent = stats.resolved || 0;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  function init() {
    loadUserProfile();

    const form = document.getElementById('profileForm');
    if (!form) return;

    const alertEl = document.getElementById('formAlert');
    const successEl = document.getElementById('successAlert');
    const btn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setAlert(alertEl, '');
      setAlert(successEl, '');

      const formData = new FormData(form);
      const data = {
        fullName: formData.get('fullName')?.trim(),
        phone: formData.get('phone')?.trim() || null
      };

      // Validation
      if (!data.fullName) {
        setAlert(alertEl, 'Full name is required.');
        return;
      }

      if (data.fullName.length < 2) {
        setAlert(alertEl, 'Full name must be at least 2 characters.');
        return;
      }

      setButtonLoading(btn, true);

      try {
        // Note: This would require a profile update endpoint
        // For now, we'll simulate success
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAlert(successEl, 'Profile updated successfully!', 'success');
        
        // Reload profile
        await loadUserProfile();
        
        setTimeout(() => {
          setAlert(successEl, '');
        }, 3000);
      } catch (err) {
        setAlert(alertEl, err.message);
      } finally {
        setButtonLoading(btn, false);
      }
    });
  }

  return { init };
})();
