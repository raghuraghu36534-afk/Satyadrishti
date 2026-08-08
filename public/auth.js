const SatyaAuth = (function () {
  function setAlert(el, message, type = 'error') {
    if (!el) return;
    if (!message) {
      el.classList.remove('show');
      el.textContent = '';
      el.className = 'auth-alert';
      return;
    }
    el.textContent = message;
    el.classList.add('show');
    el.classList.add(type === 'success' ? 'auth-alert-success' : 'auth-alert-error');
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

  async function postJSON(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Something went wrong. Try again.');
    return body;
  }

  function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    const alertEl = document.getElementById('authAlert');
    const btn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setAlert(alertEl, '');
      
      const email = form.email.value.trim();
      const password = form.password.value;
      
      if (!email || !password) {
        setAlert(alertEl, 'Please fill in all fields.');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setAlert(alertEl, 'Please enter a valid email address.');
        return;
      }
      
      setButtonLoading(btn, true);
      
      try {
        await postJSON('/api/auth/login', { email, password });
        window.location.href = '/dashboard';
      } catch (err) {
        setAlert(alertEl, err.message);
        setButtonLoading(btn, false);
      }
    });
  }

  function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    const alertEl = document.getElementById('authAlert');
    const btn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setAlert(alertEl, '');
      
      const fullName = form.fullName.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;

      if (!fullName || !email || !password) {
        setAlert(alertEl, 'Please fill in all required fields.');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setAlert(alertEl, 'Please enter a valid email address.');
        return;
      }
      
      if (password.length < 8) {
        setAlert(alertEl, 'Password must be at least 8 characters.');
        return;
      }
      
      if (password !== confirmPassword) {
        setAlert(alertEl, 'Passwords do not match.');
        return;
      }
      
      setButtonLoading(btn, true);
      
      try {
        await postJSON('/api/auth/register', { fullName, email, password, phone });
        setAlert(alertEl, 'Account created successfully! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } catch (err) {
        setAlert(alertEl, err.message);
        setButtonLoading(btn, false);
      }
    });
  }

  async function guardDashboard() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      const body = await res.json();
      
      const nameEl = document.getElementById('userName');
      const emailEl = document.getElementById('userEmail');
      const nameTitleEl = document.getElementById('userNameTitle');
      const phoneEl = document.getElementById('userPhone');
      const createdAtEl = document.getElementById('userCreatedAt');
      
      if (nameEl) nameEl.textContent = body.user.fullName;
      if (nameTitleEl) nameTitleEl.textContent = body.user.fullName.split(' ')[0];
      if (emailEl) emailEl.textContent = body.user.email;
      if (phoneEl) phoneEl.textContent = body.user.phone || '—';
      if (createdAtEl) {
        const date = new Date(body.user.createdAt || Date.now());
        createdAtEl.textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch {
      window.location.href = '/login';
    }
  }

  function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } finally {
        window.location.href = '/login';
      }
    });
  }

  return { initLoginForm, initRegisterForm, guardDashboard, initLogout };
})();
