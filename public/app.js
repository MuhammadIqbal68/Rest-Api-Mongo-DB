/**
 * Client JavaScript for Notes Manager Application
 * Includes JWT authentication: register, login, logout, token management.
 */

const API_BASE = '/api/notes';
const AUTH_BASE = '/api/auth';
const TOKEN_KEY = 'notes_auth_token';

// ============================================================
// Token Management (localStorage)
// ============================================================

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Returns headers object with Authorization bearer token.
 * Includes Content-Type for JSON requests.
 */
function authHeaders(includeContentType = true) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (includeContentType) headers['Content-Type'] = 'application/json';
  return headers;
}

// ============================================================
// Auth UI State
// ============================================================

const authOverlay = document.getElementById('auth-overlay');
const appRoot = document.getElementById('app-root');
const authError = document.getElementById('auth-error');
const authErrorText = document.getElementById('auth-error-text');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');

// ============================================================
// Auth Modal Controls
// ============================================================

function showApp(user) {
  // Hide auth overlay, show app
  authOverlay.classList.add('hidden');
  appRoot.classList.remove('app-hidden');

  // Update user info bar
  if (user) {
    userNameEl.textContent = user.username;
    userAvatarEl.textContent = user.username.charAt(0).toUpperCase();
  }
}

function showAuthModal() {
  authOverlay.classList.remove('hidden');
  appRoot.classList.add('app-hidden');
  hideAuthError();
}

function switchTab(tab) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  hideAuthError();

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

function showAuthError(message) {
  authErrorText.textContent = message;
  authError.classList.remove('hidden');
  // Reset animation
  authError.style.animation = 'none';
  authError.offsetHeight; // reflow
  authError.style.animation = '';
}

function hideAuthError() {
  authError.classList.add('hidden');
  authErrorText.textContent = '';
}

function setButtonLoading(btn, loading) {
  const label = btn.querySelector('.btn-label');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  if (loading) {
    label.classList.add('hidden');
    spinner.classList.remove('hidden');
  } else {
    label.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

// ============================================================
// Auth API Calls
// ============================================================

async function handleLogin(e) {
  e.preventDefault();
  hideAuthError();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  setButtonLoading(loginBtn, true);

  try {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok && data.token) {
      saveToken(data.token);
      loginForm.reset();
      showApp(data.user);
      fetchNotes();
      checkHealth();
    } else {
      showAuthError(data.message || 'Login failed. Please try again.');
    }
  } catch (err) {
    showAuthError('Unable to connect to the server. Please check your connection.');
  } finally {
    setButtonLoading(loginBtn, false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideAuthError();

  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  setButtonLoading(registerBtn, true);

  try {
    const res = await fetch(`${AUTH_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();

    if (res.ok && data.token) {
      saveToken(data.token);
      registerForm.reset();
      showApp(data.user);
      fetchNotes();
      checkHealth();
    } else {
      showAuthError(data.message || 'Registration failed. Please try again.');
    }
  } catch (err) {
    showAuthError('Unable to connect to the server. Please check your connection.');
  } finally {
    setButtonLoading(registerBtn, false);
  }
}

function handleLogout() {
  clearToken();
  editingNoteId = null;
  notesList.innerHTML = '';
  showAuthModal();
  switchTab('login');
}

// ============================================================
// Auth Guard — validate existing token on page load
// ============================================================

async function checkAuthOnLoad() {
  const token = getToken();

  if (!token) {
    showAuthModal();
    return;
  }

  try {
    // Verify token is still valid by fetching /api/auth/me
    const res = await fetch(`${AUTH_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      showApp(data.data);
      fetchNotes();
      checkHealth();
    } else {
      // Token invalid or expired — show login
      clearToken();
      showAuthModal();
    }
  } catch (err) {
    // Network error — still show auth modal
    clearToken();
    showAuthModal();
  }
}

// ============================================================
// Notes App State & DOM Elements
// ============================================================

let editingNoteId = null;

const statusText = document.getElementById('status-text');
const noteForm = document.getElementById('note-form');
const formHeading = document.getElementById('form-heading');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const testErrorBtn = document.getElementById('test-error-btn');

const noteIdInput = document.getElementById('note-id');
const titleInput = document.getElementById('note-title');
const categoryInput = document.getElementById('note-category');
const tagsInput = document.getElementById('note-tags');
const contentInput = document.getElementById('note-content');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const notesList = document.getElementById('notes-list');

const inspectorMeta = document.getElementById('inspector-meta');
const jsonOutput = document.getElementById('json-output');
const copyJsonBtn = document.getElementById('copy-json-btn');

// ============================================================
// Initialize
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Auth form listeners
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);

  // Notes app listeners
  noteForm.addEventListener('submit', handleFormSubmit);
  cancelEditBtn.addEventListener('click', resetForm);
  testErrorBtn.addEventListener('click', handleTestValidationError);

  searchInput.addEventListener('input', debounce(fetchNotes, 250));
  categoryFilter.addEventListener('change', fetchNotes);

  copyJsonBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(jsonOutput.textContent);
    copyJsonBtn.textContent = 'Copied!';
    setTimeout(() => copyJsonBtn.textContent = 'Copy Payload', 1500);
  });

  // Check for existing session on load
  checkAuthOnLoad();
});

// ============================================================
// Server Health Check
// ============================================================

async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    statusText.textContent = res.ok ? 'Server Running' : 'Server Error';
  } catch (err) {
    statusText.textContent = 'Disconnected';
  }
}

// ============================================================
// Helper: extract note ID
// ============================================================

function getNoteId(note) {
  return note.id || note._id;
}

// ============================================================
// Fetch Notes (GET) — authenticated
// ============================================================

async function fetchNotes() {
  const search = searchInput.value.trim();
  const category = categoryFilter.value;

  let url = API_BASE;
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if ([...params].length > 0) url += `?${params.toString()}`;

  try {
    const res = await fetch(url, { headers: authHeaders(false) });

    // Token expired mid-session
    if (res.status === 401) {
      clearToken();
      showAuthModal();
      return;
    }

    const data = await res.json();
    updateInspector('GET', url, res.status, res.statusText, data);

    if (data.success && Array.isArray(data.data)) {
      renderNotes(data.data);
    }
  } catch (err) {
    console.error('Fetch notes error:', err);
  }
}

// ============================================================
// Fetch Single Note (GET /:id)
// ============================================================

async function fetchSingleNote(id) {
  const url = `${API_BASE}/${id}`;
  try {
    const res = await fetch(url, { headers: authHeaders(false) });
    const data = await res.json();
    updateInspector('GET', url, res.status, res.statusText, data);
    return data;
  } catch (err) {
    console.error(`Fetch note ${id} error:`, err);
  }
}

// ============================================================
// Save / Update Note (POST / PUT)
// ============================================================

async function handleFormSubmit(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
  const content = contentInput.value.trim();

  const payload = { title, category, tags, content };
  const isEdit = !!editingNoteId;
  const url = isEdit ? `${API_BASE}/${editingNoteId}` : API_BASE;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    if (res.status === 401) {
      clearToken();
      showAuthModal();
      return;
    }

    const data = await res.json();
    updateInspector(method, url, res.status, res.statusText, data);

    if (res.ok) {
      resetForm();
      fetchNotes();
    }
  } catch (err) {
    console.error(`${method} error:`, err);
  }
}

// ============================================================
// Simulate 400 Bad Request
// ============================================================

async function handleTestValidationError() {
  const url = API_BASE;
  const payload = { title: '', content: 'Testing 400 input validation handler' };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    updateInspector('POST', url, res.status, res.statusText, data);
  } catch (err) {
    console.error('Validation test error:', err);
  }
}

// ============================================================
// Delete Note (DELETE /:id)
// ============================================================

async function deleteNote(id, title) {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

  const url = `${API_BASE}/${id}`;
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders(false)
    });

    if (res.status === 401) {
      clearToken();
      showAuthModal();
      return;
    }

    const data = await res.json();
    updateInspector('DELETE', url, res.status, res.statusText, data);

    if (res.ok) {
      if (editingNoteId === String(id)) resetForm();
      fetchNotes();
    }
  } catch (err) {
    console.error(`Delete error on ${id}:`, err);
  }
}

// ============================================================
// Edit Mode
// ============================================================

async function startEditNote(id) {
  const res = await fetchSingleNote(id);
  if (!res || !res.success) return;

  const note = res.data;
  const noteId = getNoteId(note);
  editingNoteId = noteId;
  noteIdInput.value = noteId;
  titleInput.value = note.title;
  categoryInput.value = note.category || 'Work';
  tagsInput.value = (note.tags || []).join(', ');
  contentInput.value = note.content || '';

  formHeading.textContent = 'Edit Note';
  submitBtn.textContent = 'Update Note';
  cancelEditBtn.classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// Reset Form
// ============================================================

function resetForm() {
  editingNoteId = null;
  noteForm.reset();
  noteIdInput.value = '';
  formHeading.textContent = 'Create Note';
  submitBtn.textContent = 'Save Note';
  cancelEditBtn.classList.add('hidden');
}

// ============================================================
// Render Note Cards
// ============================================================

function renderNotes(notes) {
  if (notes.length === 0) {
    notesList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
        <p style="font-weight: 500;">No notes found. Create your first note above!</p>
      </div>
    `;
    return;
  }

  notesList.innerHTML = notes.map(note => {
    const noteId = getNoteId(note);
    const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric'
    });

    const catClass = ['Work', 'Personal', 'Ideas', 'Study'].includes(note.category) ? note.category : 'General';
    const tagsHtml = (note.tags || []).map(t => `<span class="tag-item">#${escapeHtml(t)}</span>`).join(' ');

    return `
      <div class="note-card">
        <div>
          <div class="note-card-header">
            <h3 class="note-card-title">${escapeHtml(note.title)}</h3>
            <span class="cat-pill ${catClass}">${escapeHtml(note.category || 'General')}</span>
          </div>
          <p class="note-card-content">${escapeHtml(note.content || '')}</p>
          <div class="tags-container">${tagsHtml}</div>
        </div>
        <div class="note-card-footer">
          <span>${formattedDate}</span>
          <div class="actions-row">
            <button class="btn btn-action-edit" onclick="startEditNote('${noteId}')">Edit</button>
            <button class="btn btn-action-delete" onclick="deleteNote('${noteId}', '${escapeJsString(note.title)}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// Update Network Inspector
// ============================================================

function updateInspector(method, url, statusCode, statusText, data) {
  inspectorMeta.innerHTML = `
    <span class="method-badge ${method}">${method}</span>
    <span class="url-text">${url}</span>
    <span class="status-badge status-${statusCode}">${statusCode} ${statusText || ''}</span>
  `;
  jsonOutput.textContent = JSON.stringify(data, null, 2);
}

// ============================================================
// Utility Helpers
// ============================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeJsString(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
