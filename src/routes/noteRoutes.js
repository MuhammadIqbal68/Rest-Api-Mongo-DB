/**
 * Express Router for /api/notes
 */

const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { validateCreateNote, validateUpdateNote } = require('../middleware/validateNote');

// GET /api/notes - Retrieve all notes
router.get('/', noteController.getAllNotes);

// GET /api/notes/:id - Retrieve single note by ID
router.get('/:id', noteController.getNoteById);

// POST /api/notes - Create new note (with validation)
router.post('/', validateCreateNote, noteController.createNote);

// PUT /api/notes/:id - Update note by ID (with validation)
router.put('/:id', validateUpdateNote, noteController.updateNote);

// DELETE /api/notes/:id - Delete note by ID
router.delete('/:id', noteController.deleteNote);

module.exports = router;
