/**
 * Notes Controller
 * Encapsulates CRUD business logic and HTTP response formatting.
 */

const notesStore = require('../data/notesStore');

/**
 * @route   GET /api/notes
 * @desc    Retrieve all notes (supports optional ?search= and ?category= filters)
 * @access  Public
 */
const getAllNotes = (req, res) => {
  const { search, category } = req.query;
  const notes = notesStore.getAll({ search, category });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    count: notes.length,
    data: notes
  });
};

/**
 * @route   GET /api/notes/:id
 * @desc    Retrieve a single note by ID
 * @access  Public
 */
const getNoteById = (req, res) => {
  const { id } = req.params;
  const note = notesStore.getById(id);

  if (!note) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message: `Note with ID '${id}' was not found.`
    });
  }

  return res.status(200).json({
    success: true,
    statusCode: 200,
    data: note
  });
};

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @access  Public
 */
const createNote = (req, res) => {
  const { title, content, category, tags } = req.body;

  const newNote = notesStore.create({ title, content, category, tags });

  return res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Note created successfully.",
    data: newNote
  });
};

/**
 * @route   PUT /api/notes/:id
 * @desc    Update an existing note by ID
 * @access  Public
 */
const updateNote = (req, res) => {
  const { id } = req.params;
  const { title, content, category, tags } = req.body;

  const updatedNote = notesStore.update(id, { title, content, category, tags });

  if (!updatedNote) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message: `Note with ID '${id}' was not found for update.`
    });
  }

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Note updated successfully.",
    data: updatedNote
  });
};

/**
 * @route   DELETE /api/notes/:id
 * @desc    Remove a note by ID
 * @access  Public
 */
const deleteNote = (req, res) => {
  const { id } = req.params;

  const deleted = notesStore.remove(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      error: "Not Found",
      message: `Note with ID '${id}' was not found for deletion.`
    });
  }

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: `Note with ID '${id}' deleted successfully.`
  });
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};
