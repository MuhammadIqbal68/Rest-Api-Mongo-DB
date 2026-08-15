/**
 * In-Memory Data Store for Notes API
 * Features UUID-like helper and pre-populated seed data for immediate testing.
 */

let notes = [
  {
    id: "1",
    title: "Welcome to Notes API",
    content: "This is your first note! You can fetch, update, or delete it via REST endpoints.",
    category: "General",
    tags: ["welcome", "getting-started"],
    createdAt: new Date("2026-08-10T09:00:00Z").toISOString(),
    updatedAt: new Date("2026-08-10T09:00:00Z").toISOString()
  },
  {
    id: "2",
    title: "Node.js & Express Fundamentals",
    content: "Mastering routing, middleware, input validation, and proper HTTP status codes.",
    category: "Backend",
    tags: ["nodejs", "express", "api"],
    createdAt: new Date("2026-08-11T10:30:00Z").toISOString(),
    updatedAt: new Date("2026-08-11T10:30:00Z").toISOString()
  },
  {
    id: "3",
    title: "Postman Testing Guide",
    content: "Import the postman_collection.json file into Postman to test GET, POST, PUT, and DELETE routes.",
    category: "Testing",
    tags: ["postman", "crud", "http"],
    createdAt: new Date("2026-08-12T08:15:00Z").toISOString(),
    updatedAt: new Date("2026-08-12T08:15:00Z").toISOString()
  }
];

let nextId = 4;

/**
 * Get all notes, with optional filtering
 */
const getAll = ({ search, category }) => {
  let result = [...notes];

  if (category) {
    result = result.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q)
    );
  }

  return result;
};

/**
 * Get single note by ID
 */
const getById = (id) => {
  return notes.find(n => n.id === String(id)) || null;
};

/**
 * Create a new note
 */
const create = ({ title, content, category, tags }) => {
  const newNote = {
    id: String(nextId++),
    title: title.trim(),
    content: content ? content.trim() : "",
    category: category && category.trim() ? category.trim() : "General",
    tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.push(newNote);
  return newNote;
};

/**
 * Update an existing note
 */
const update = (id, { title, content, category, tags }) => {
  const index = notes.findIndex(n => n.id === String(id));
  if (index === -1) return null;

  const existing = notes[index];
  const updatedNote = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    content: content !== undefined ? content.trim() : existing.content,
    category: category !== undefined ? (category.trim() || "General") : existing.category,
    tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : existing.tags,
    updatedAt: new Date().toISOString()
  };

  notes[index] = updatedNote;
  return updatedNote;
};

/**
 * Delete a note by ID
 */
const remove = (id) => {
  const index = notes.findIndex(n => n.id === String(id));
  if (index === -1) return false;

  notes.splice(index, 1);
  return true;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
