/**
 * Notes Controller
 * Encapsulates CRUD business logic using Mongoose for MongoDB operations.
 * All operations are scoped to the authenticated user (req.user._id).
 */

const Note = require('../models/Note');

/**
 * @route   GET /api/notes
 * @desc    Retrieve all notes belonging to the authenticated user
 *          Supports optional ?search= and ?category= filters
 * @access  Protected
 */
const getAllNotes = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    // Always filter by the requesting user's ID
    const filter = { owner: req.user._id };

    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/notes/:id
 * @desc    Retrieve a single note by ID (must belong to authenticated user)
 * @access  Protected
 */
const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await Note.findOne({ _id: id, owner: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Note with ID '${id}' was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/notes
 * @desc    Create a new note for the authenticated user
 * @access  Protected
 */
const createNote = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;

    const newNote = await Note.create({
      title,
      content: content || '',
      category: category && category.trim() ? category.trim() : 'General',
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      owner: req.user._id  // Assign note to the authenticated user
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Note created successfully.',
      data: newNote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notes/:id
 * @desc    Update an existing note by ID (must belong to authenticated user)
 * @access  Protected
 */
const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (category !== undefined) updateFields.category = category.trim() || 'General';
    if (tags !== undefined) updateFields.tags = Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [];

    // Ensure the note belongs to the requesting user
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updateFields,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Note with ID '${id}' was not found for update.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Note updated successfully.',
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notes/:id
 * @desc    Remove a note by ID (must belong to authenticated user)
 * @access  Protected
 */
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure the note belongs to the requesting user
    const deleted = await Note.findOneAndDelete({ _id: id, owner: req.user._id });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: 'Not Found',
        message: `Note with ID '${id}' was not found for deletion.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Note with ID '${id}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};
