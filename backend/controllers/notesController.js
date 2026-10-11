import Note from "../models/Note.js";

import {
  sendSuccess,
  createError,
  sendPaginated,
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/apiResponse.js";

import { cloudinary } from "../config/cloudinary.js";
// @desc    Upload note
// @route   POST /api/notes
// @access  Private
export const  uploadNote = async (req, res, next) => {
  try {
    if (!req.file) return next(createError("Please upload a file", 400));

    const { title, description, subject, category, semester, tags, college } =
      req.body;

    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";

    const note = await Note.create({
      uploader: req.user.id,
      title,
      description,
      subject,
      category: category || "Other",
      semester: semester || "N/A",
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      college: college || req.user.college || "",
      file: {
        public_id: req.file.filename,
        url: req.file.path,
        fileType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      },
    });

    await note.populate("uploader", "name username avatar college");
    sendSuccess(res, 201, "Note uploaded successfully", { note });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notes (with filters/pagination)
// @route   GET /api/notes
// @access  Public
export const getNotes = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { category, semester, search, sort = "recent" } = req.query;

    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (semester && semester !== "All") filter.semester = semester;
    if (search) filter.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === "popular") sortOption = { downloads: -1 };
    if (sort === "liked") sortOption = { "likes.length": -1 };

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate("uploader", "name username avatar college")
        .lean(),
      Note.countDocuments(filter),
    ]);

    sendPaginated(
      res,
      200,
      "Notes fetched",
      notes,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Public
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate(
      "uploader",
      "name username avatar college bio",
    );
    if (!note) return next(createError("Note not found", 404));

    sendSuccess(res, 200, "Note fetched", { note });
  } catch (error) {
    next(error);
  }
};

// @desc    Download note (increment counter)
// @route   PUT /api/notes/:id/download
// @access  Private
 export const downloadNote = async (req, res, next) => {
   try {
     const note = await Note.findByIdAndUpdate(
       req.params.id,
       { $inc: { downloads: 1 } },
       { new: true },
     );
     if (!note) return next(createError("Note not found", 404));

     sendSuccess(res, 200, "Download tracked", { fileUrl: note.file.url });
   } catch (error) {
     next(error);
   }
 };

// @desc    Like/unlike note
// @route   PUT /api/notes/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return next(createError("Note not found", 404));

    const userId = req.user.id;
    const isLiked = note.likes.includes(userId);

    if (isLiked) {
      note.likes = note.likes.filter((id) => id.toString() !== userId);
    } else {
      note.likes.push(userId);
    }

    await note.save();
    sendSuccess(res, 200, isLiked ? "Note unliked" : "Note liked", {
      liked: !isLiked,
      likeCount: note.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private (owner/admin)
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return next(createError("Note not found", 404));

    if (note.uploader.toString() !== req.user.id && req.user.role !== "admin") {
      return next(createError("Not authorized to delete this note", 403));
    }

    await cloudinary.uploader.destroy(note.file.public_id, {
      resource_type: "auto",
    });

    await note.deleteOne();
    sendSuccess(res, 200, "Note deleted");
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private (owner)
export const updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) return next(createError("Note not found", 404));

    if (note.uploader.toString() !== req.user.id) {
      return next(createError("Not authorized to update this note", 403));
    }

    const allowedUpdates = [
      "title",
      "description",
      "subject",
      "category",
      "semester",
      "tags",
      "college",
    ];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] =
          field === "tags"
            ? req.body[field].split(",").map((t) => t.trim())
            : req.body[field];
      }
    });

    note = await Note.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("uploader", "name username avatar");

    sendSuccess(res, 200, "Note updated", { note });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notes stats by category
// @route   GET /api/notes/stats
// @access  Private (admin)
export const getNotesStats = async (req, res, next) => {
  try {
    const stats = await Note.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalDownloads: { $sum: "$downloads" },
          avgLikes: { $avg: { $size: "$likes" } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    sendSuccess(res, 200, "Notes stats fetched", { stats });
  } catch (error) {
    next(error);
  }
};
