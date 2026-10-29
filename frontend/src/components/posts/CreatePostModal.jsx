import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Image, Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

import { createPost } from "../../store/postsSlice";
import Avatar from "../common/Avatar";
import { postCategories } from "../../utils/helpers";

export default function CreatePostModal({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const fileRef = useRef(null);

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImages = (event) => {
    const selectedFiles = Array.from(event.target.files).slice(0, 4);

    setImages(selectedFiles);

    const imagePreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file),
    );

    setPreviews(imagePreviews);
  };

  const removeImage = (index) => {
    setImages((previousImages) => previousImages.filter((_, i) => i !== index));

    setPreviews((previousPreviews) =>
      previousPreviews.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      toast.error("Post content is required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("content", content.trim());
      formData.append("category", category);

      if (tags.trim()) {
        formData.append("tags", tags.trim());
      }

      images.forEach((image) => {
        formData.append("images", image);
      });

      const result = await dispatch(createPost(formData));

      if (createPost.fulfilled.match(result)) {
        toast.success("Post created!");

        onCreated?.(result.payload);
        onClose();
      } else {
        toast.error(result.payload || "Failed to create post");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Create a post
            </h3>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Share something with your campus community
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto px-5 py-5">
            {/* User */}
            <div className="mb-5 flex items-center gap-3">
              <Avatar user={user} size="sm" />

              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name}
                </p>

                {/* Category */}
                <div className="relative mt-1">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="appearance-none rounded-md border border-slate-200 bg-slate-50 py-1 pl-2 pr-6 text-xs font-medium text-slate-600 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {postCategories.map((categoryName) => (
                      <option key={categoryName} value={categoryName}>
                        {categoryName}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="What's on your mind?"
                rows={5}
                maxLength={2000}
                autoFocus
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-[15px] leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />

              <div className="mt-1.5 flex justify-end">
                <span className="text-[11px] text-slate-400">
                  {content.length}/2000
                </span>
              </div>
            </div>

            {/* Image previews */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <img
                      src={preview}
                      alt=""
                      className="h-36 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-slate-950/70 text-white hover:bg-slate-950"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            <div className="mt-4">
              <input
                type="text"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="Add tags, e.g. technology, study, campus"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Upload images */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-primary-500 shadow-sm dark:bg-slate-700">
                  <Image className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Add images
                  </p>

                  <p className="text-[11px] text-slate-400">Up to 4 images</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Choose files
              </button>

              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImages}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3.5 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
