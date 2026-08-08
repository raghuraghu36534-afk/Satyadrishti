const MyComplaints = (function () {
  let allComplaints = [];
  let currentFilter = 'all';

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
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatPriority(priority) {
    const priorityMap = {
      'low': { label: 'Low', class: 'badge-secondary' },
      'medium': { label: 'Medium', class: 'badge-primary' },
      'high': { label: 'High', class: 'badge-danger' }
    };
    return priorityMap[priority] || { label: priority, class: 'badge-secondary' };
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
    const priority = formatPriority(complaint.priority);
    
    return `
      <div class="complaint-card" data-status="${complaint.status}">
        <div class="complaint-header">
          <div>
            <h3 class="complaint-title">${complaint.title}</h3>
            <div class="complaint-id">ID: ${complaint.id}</div>
          </div>
          <div style="display: flex; gap: var(--spacing-sm);">
            <span class="badge ${status.class}">${status.label}</span>
            <span class="badge ${priority.class}">${priority.label}</span>
          </div>
        </div>
        
        <p class="complaint-body">${complaint.description}</p>
        
        ${complaint.evidenceImage ? `
          <div style="margin: var(--spacing-md) 0;">
            <label style="font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); margin-bottom: var(--spacing-xs); display: block;">Evidence Image:</label>
            <img 
              src="${complaint.evidenceImage}" 
              alt="Evidence" 
              style="max-width: 100%; max-height: 200px; border-radius: var(--radius-md); border: 1px solid var(--border); cursor: pointer;"
              onclick="window.open('${complaint.evidenceImage}', '_blank')"
              title="Click to view full size"
            >
          </div>
        ` : ''}
        
        <div class="complaint-meta">
          <div class="complaint-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${formatDate(complaint.createdAt)}
          </div>
          <div class="complaint-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21h18"/>
              <path d="M5 21V7l8-4 8 4v14"/>
              <path d="M17 21v-8.5a1.5 1.5 0 0 0-3 0V21"/>
            </svg>
            ${complaint.category}
          </div>
          ${complaint.location ? `
            <div class="complaint-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              ${complaint.location}
            </div>
          ` : ''}
        </div>
        
        <div class="complaint-actions">
          <button class="btn btn-outline btn-sm" onclick="MyComplaints.viewDetails('${complaint.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View Details
          </button>
          ${complaint.status !== 'resolved' ? `
            <button class="btn btn-outline btn-sm" onclick="MyComplaints.updateStatus('${complaint.id}', 'resolved')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Mark Resolved
            </button>
          ` : ''}
          <button class="btn btn-danger btn-sm" onclick="MyComplaints.deleteComplaint('${complaint.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `;
  }

  function filterComplaints() {
    const filtered = currentFilter === 'all' 
      ? allComplaints 
      : allComplaints.filter(c => c.status === currentFilter);
    
    const container = document.getElementById('complaintsGrid');
    
    if (!filtered || filtered.length === 0) {
      container.innerHTML = renderEmptyState(
        currentFilter === 'all' 
          ? 'No complaints yet. File your first complaint to get started.' 
          : `No ${currentFilter.replace('_', ' ')} complaints found.`
      );
      return;
    }

    container.innerHTML = filtered.map(renderComplaint).join('');
  }

  async function loadComplaints() {
    try {
      allComplaints = await fetchWithAuth('/api/complaints');
      filterComplaints();
    } catch (error) {
      console.error('Failed to load complaints:', error);
      document.getElementById('complaintsGrid').innerHTML = renderEmptyState('Failed to load complaints. Please try again.');
    }
  }

  function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        filterComplaints();
      });
    });
  }

  async function updateStatus(id, status) {
    if (!confirm('Are you sure you want to mark this complaint as resolved?')) {
      return;
    }

    try {
      await fetchWithAuth(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      
      // Reload complaints
      await loadComplaints();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update complaint status. Please try again.');
    }
  }

  async function deleteComplaint(id) {
    if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    try {
      await fetchWithAuth(`/api/complaints/${id}`, {
        method: 'DELETE'
      });
      
      // Reload complaints
      await loadComplaints();
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      alert('Failed to delete complaint. Please try again.');
    }
  }

  function viewDetails(id) {
    // For now, just show an alert. In a full implementation, this would open a modal or detail page
    const complaint = allComplaints.find(c => c.id === id);
    if (complaint) {
      let details = `Title: ${complaint.title}\n\n`;
      details += `Description: ${complaint.description}\n\n`;
      details += `Category: ${complaint.category}\n`;
      details += `Status: ${complaint.status}\n`;
      details += `Priority: ${complaint.priority}\n`;
      details += `Location: ${complaint.location || 'N/A'}\n`;
      details += `Evidence Image: ${complaint.evidenceImage ? 'Yes' : 'None'}\n`;
      details += `Created: ${formatDate(complaint.createdAt)}`;
      
      alert(details);
      
      // If there's an evidence image, also open it in a new tab
      if (complaint.evidenceImage) {
        window.open(complaint.evidenceImage, '_blank');
      }
    }
  }

  function init() {
    loadComplaints();
    initFilters();
  }

  return { 
    init, 
    updateStatus, 
    deleteComplaint, 
    viewDetails 
  };
})();
