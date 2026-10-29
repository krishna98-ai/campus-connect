
import { useRef, useState } from "react";
import { X, Upload, FileText, Loader2, Image } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axiosInstance";
import { noteCategories } from "../../utils/helpers";

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "N/A"];

export default function UploadNoteModal({ onClose, onUploaded }) {
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    category: "Computer Science",
    semester: "1",
    tags: "",
    college: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });

    setErrors({
      ...errors,
      [field]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Title required";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "Subject required";
    }

    if (!file) {
      newErrors.file = "Please select a file";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    // 20 MB limit
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20MB)");
      return;
    }

    setFile(selectedFile);

    setErrors({
      ...errors,
      file: "",
    });

    // Use file name as default title
    if (!form.title) {
      const fileName = selectedFile.name.replace(/\.[^.]+$/, "");

      setForm({
        ...form,
        title: fileName,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      formData.append("file", file);

      const response = await api.post("/notes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Note uploaded successfully!");

      onUploaded?.(response.data.note);
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="my-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Upload Study Notes
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="btn-ghost rounded-lg p-1.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form */}
          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
            {/* File */}
            <div
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center ${
                file
                  ? "border-primary-400 bg-primary-50 dark:bg-primary-900/10"
                  : "border-slate-300 hover:border-primary-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
              } ${errors.file ? "border-red-400" : ""}`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  {file.type === "application/pdf" ? (
                    <FileText className="h-8 w-8 text-primary-500" />
                  ) : (
                    <Image className="h-8 w-8 text-primary-500" />
                  )}

                  <div className="max-w-xs text-left">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />

                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Click to upload PDF or image
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PDF, JPG, PNG · Max 20MB
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {errors.file && (
              <p className="text-xs text-red-500">
                {errors.file}
              </p>
            )}

            {/* Title */}
            <div>
              <label className="label">Title *</label>

              <input
                value={form.title}
                onChange={(event) =>
                  handleChange("title", event.target.value)
                }
                placeholder="e.g. Data Structures - Complete Notes"
                className={`input-field ${
                  errors.title
                    ? "border-red-400 focus:ring-red-400"
                    : ""
                }`}
              />

              {errors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="label">Subject *</label>

              <input
                value={form.subject}
                onChange={(event) =>
                  handleChange("subject", event.target.value)
                }
                placeholder="e.g. Data Structures & Algorithms"
                className={`input-field ${
                  errors.subject
                    ? "border-red-400 focus:ring-red-400"
                    : ""
                }`}
              />

              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.subject}
                </p>
              )}
            </div>

            {/* College */}
            <div>
              <label className="label">College (optional)</label>

              <input
                value={form.college}
                onChange={(event) =>
                  handleChange("college", event.target.value)
                }
                placeholder="Your college name"
                className="input-field"
              />
            </div>

            {/* Category + Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    handleChange("category", event.target.value)
                  }
                  className="input-field"
                >
                  {noteCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Semester</label>

                <select
                  value={form.semester}
                  onChange={(event) =>
                    handleChange("semester", event.target.value)
                  }
                  className="input-field"
                >
                  {semesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester === "N/A"
                        ? "N/A"
                        : `Semester ${semester}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                placeholder="Brief description of the notes..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="label">Tags (comma-separated)</label>

              <input
                value={form.tags}
                onChange={(event) =>
                  handleChange("tags", event.target.value)
                }
                placeholder="algorithms, sorting, recursion"
                className="input-field"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
