/**
 * Client JavaScript for Notes Manager Application
 */

const API_BASE = '/api/notes';

// State
let editingNoteId = null;

// DOM Elements
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  fetchNotes();
  setupListeners();
});

function setupListeners() {
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
}

// Server Health Check
async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      statusText.textContent = 'Server Running';
    } else {
      statusText.textContent = 'Server Error';
    }
  } catch (err) {
    statusText.textContent = 'Disconnected';
  }
}

// Fetch Notes (GET)
async function fetchNotes() {
  const search = searchInput.value.trim();
  const category = categoryFilter.value;

  let url = API_BASE;
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);

  if ([...params].length > 0) {
    url += `?${params.toString()}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    updateInspector('GET', url, res.status, res.statusText, data);

    if (data.success && Array.isArray(data.data)) {
      renderNotes(data.data);
    }
  } catch (err) {
    console.error('Fetch notes error:', err);
  }
}

// Fetch Single Note (GET /:id)
async function fetchSingleNote(id) {
  const url = `${API_BASE}/${id}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    updateInspector('GET', url, res.status, res.statusText, data);
    return data;
  } catch (err) {
    console.error(`Fetch note ${id} error:`, err);
  }
}

// Save / Update Note (POST / PUT)
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

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

// Simulate 400 Bad Request
async function handleTestValidationError() {
  const url = API_BASE;
  const payload = { title: "", content: "Testing 400 input validation handler" };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    updateInspector('POST', url, res.status, res.statusText, data);
  } catch (err) {
    console.error('Validation test error:', err);
  }
}

// Delete Note (DELETE /:id)
async function deleteNote(id, title) {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

  const url = `${API_BASE}/${id}`;
  try {
    const res = await fetch(url, { method: 'DELETE' });
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

// Edit Mode
async function startEditNote(id) {
  const res = await fetchSingleNote(id);
  if (!res || !res.success) return;

  const note = res.data;
  editingNoteId = note.id;
  noteIdInput.value = note.id;
  titleInput.value = note.title;
  categoryInput.value = note.category || 'Work';
  tagsInput.value = (note.tags || []).join(', ');
  contentInput.value = note.content || '';

  formHeading.textContent = `Edit Note #${note.id}`;
  submitBtn.textContent = 'Update Note';
  cancelEditBtn.classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset Form
function resetForm() {
  editingNoteId = null;
  noteForm.reset();
  noteIdInput.value = '';
  formHeading.textContent = 'Create Note';
  submitBtn.textContent = 'Save Note';
  cancelEditBtn.classList.add('hidden');
}

// Render Note Cards
function renderNotes(notes) {
  if (notes.length === 0) {
    notesList.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: white; border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
        <p style="font-weight: 500;">No notes found matching criteria.</p>
      </div>
    `;
    return;
  }

  notesList.innerHTML = notes.map(note => {
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
            <button class="btn btn-action-edit" onclick="startEditNote('${note.id}')">Edit</button>
            <button class="btn btn-action-delete" onclick="deleteNote('${note.id}', '${escapeJsString(note.title)}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Update Network Inspector
function updateInspector(method, url, statusCode, statusText, data) {
  inspectorMeta.innerHTML = `
    <span class="method-badge ${method}">${method}</span>
    <span class="url-text">${url}</span>
    <span class="status-badge status-${statusCode}">${statusCode} ${statusText || ''}</span>
  `;

  jsonOutput.textContent = JSON.stringify(data, null, 2);
}

// Helpers
function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
