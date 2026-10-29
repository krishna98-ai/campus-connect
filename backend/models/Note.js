import mongoose from "mongoose";

const notesSchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Computer Science",
        "Engineering",
        "Business",
        "Literature",
        "History",
        "Economics",
        "Psychology",
        "Law",
        "Medicine",
        "Arts",
        "Other",
      ],
      default: "Other",
    },
    semester: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8", "N/A"],
      default: "N/A",
    },
    file: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
      fileType: { type: String, enum: ["pdf", "image"], required: true },
      fileName: String,
      fileSize: Number,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    downloads: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    college: { type: String, trim: true, default: "" },
    isVerified: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

notesSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

notesSchema.index({
  title: "text",
  description: "text",
  subject: "text",
  tags: "text",
});
notesSchema.index({ category: 1, createdAt: -1 });
notesSchema.index({ uploader: 1 });

const Note = mongoose.model("Note", notesSchema);

export default Note;
