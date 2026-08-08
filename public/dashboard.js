const Dashboard = (function () {
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
      throw new Error('Request failed');
    }
    return res.json();
  }

  function formatStatus(status) {
    const statusMap = {
      'pending': { label: 'Pending', class: 'badge-warning' },
      'in_progress': { label: 'In Progress', class: 'badge-primary' },
      'resolved': { label: 'Resolved', class: 'badge-success' }
    };
    return statusMap[status] || { label: status, class: 'badge-secondary' };
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderEmptyState(message) {
    return `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <p>${message}</p>
      </div>
    `;
  }

  function renderComplaint(complaint) {
    const status = formatStatus(complaint.status);
    return `
      <div class="complaint-item">
        <div class="complaint-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="complaint-content">
          <div class="complaint-title">${complaint.title}</div>
          <div class="complaint-meta">
            <span>${complaint.category}</span>
            <span>•</span>
            <span>${formatDate(complaint.createdAt)}</span>
          </div>
        </div>
        <div class="complaint-status">
          <span class="badge ${status.class}">${status.label}</span>
        </div>
      </div>
    `;
  }

  async function loadStats() {
    try {
      const stats = await fetchWithAuth('/api/complaints/stats');
      document.getElementById('totalComplaints').textContent = stats.total || 0;
      document.getElementById('pendingComplaints').textContent = stats.pending || 0;
      document.getElementById('inProgressComplaints').textContent = stats.inProgress || 0;
      document.getElementById('resolvedComplaints').textContent = stats.resolved || 0;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async function loadRecentComplaints() {
    const container = document.getElementById('complaintList');
    
    try {
      const complaints = await fetchWithAuth('/api/complaints/recent?limit=5');
      
      if (!complaints || complaints.length === 0) {
        container.innerHTML = renderEmptyState('No complaints yet. File your first complaint to get started.');
        return;
      }

      container.innerHTML = complaints.map(renderComplaint).join('');
    } catch (error) {
      console.error('Failed to load complaints:', error);
      container.innerHTML = renderEmptyState('Failed to load complaints. Please try again.');
    }
  }

  function init() {
    loadStats();
    loadRecentComplaints();

    // New complaint button
    const newComplaintBtn = document.getElementById('newComplaintBtn');
    if (newComplaintBtn) {
      newComplaintBtn.addEventListener('click', () => {
        window.location.href = '/new-complaint';
      });
    }
  }

  return { init };
})();
