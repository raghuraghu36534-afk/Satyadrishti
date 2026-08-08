const NewComplaint = (function () {
  let selectedFile = null;

  async function fetchWithAuth(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers
        // Don't set Content-Type for FormData - let the browser set it with boundary
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

  function validateFile(file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only image files (JPEG, PNG, GIF, WebP) are allowed.';
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit.';
    }

    return null;
  }

  function showImagePreview(file) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImage = document.getElementById('imagePreview');
    
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.src = '';
      previewContainer.style.display = 'none';
    }
  }

  function initFileUpload() {
    const fileInput = document.getElementById('evidenceImage');
    const removeBtn = document.getElementById('removeImageBtn');
    
    if (!fileInput) return;

    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      if (file) {
        const error = validateFile(file);
        if (error) {
          setAlert(document.getElementById('formAlert'), error);
          fileInput.value = '';
          selectedFile = null;
          showImagePreview(null);
          return;
        }
        
        selectedFile = file;
        showImagePreview(file);
        setAlert(document.getElementById('formAlert'), '');
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        fileInput.value = '';
        selectedFile = null;
        showImagePreview(null);
      });
    }
  }

  function init() {
    const form = document.getElementById('complaintForm');
    if (!form) return;

    const alertEl = document.getElementById('formAlert');
    const btn = document.getElementById('submitBtn');

    initFileUpload();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setAlert(alertEl, '');

      const formData = new FormData(form);
      
      // Get form fields
      const title = formData.get('title')?.trim();
      const description = formData.get('description')?.trim();
      const category = formData.get('category');
      const location = formData.get('location')?.trim() || null;

      // Validation
      if (!title) {
        setAlert(alertEl, 'Please enter a complaint title.');
        return;
      }

      if (title.length < 5) {
        setAlert(alertEl, 'Title must be at least 5 characters long.');
        return;
      }

      if (!description) {
        setAlert(alertEl, 'Please provide a description.');
        return;
      }

      if (description.length < 20) {
        setAlert(alertEl, 'Description must be at least 20 characters long.');
        return;
      }

      if (!category) {
        setAlert(alertEl, 'Please select a category.');
        return;
      }

      setButtonLoading(btn, true);

      try {
        // Create FormData for multipart/form-data upload
        const submitData = new FormData();
        submitData.append('title', title);
        submitData.append('description', description);
        submitData.append('category', category);
        if (location) {
          submitData.append('location', location);
        }
        if (selectedFile) {
          submitData.append('evidenceImage', selectedFile);
        }

        const response = await fetchWithAuth('/api/complaints', {
          method: 'POST',
          body: submitData
        });

        // Display AI priority result
        if (response.aiPriority) {
          displayAIPriorityResult(response);
        }

        setAlert(alertEl, 'Complaint submitted successfully! Redirecting...', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } catch (err) {
        setAlert(alertEl, err.message);
        setButtonLoading(btn, false);
      }
    });
  }

  return { init };
})();
