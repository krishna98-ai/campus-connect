
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Loader2,
  FileText,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axiosInstance";
import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/common/EmptyState";
import { formatRelative } from "../../utils/helpers";

export default function AdminReported() {
  const [data, setData] = useState({
    reportedPosts: [],
    reportedNotes: [],
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [tab, setTab] = useState("posts");

  useEffect(() => {
    const getReportedContent = async () => {
      try {
        const response = await api.get("/admin/reported");
        setData(response.data);
      } catch (error) {
        // Failed to load reported content
      } finally {
        setLoading(false);
      }
    };

    getReportedContent();
  }, []);

  const deletePost = async (postId) => {
    const confirmed = window.confirm("Delete this post?");

    if (!confirmed) {
      return;
    }

    setActionLoading((previous) => ({
      ...previous,
      [postId]: true,
    }));

    try {
      await api.delete(`/posts/${postId}`);

      setData((previous) => ({
        ...previous,
        reportedPosts: previous.reportedPosts.filter(
          (post) => post._id !== postId
        ),
      }));

      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [postId]: false,
      }));
    }
  };

  const deleteNote = async (noteId) => {
    const confirmed = window.confirm("Delete this note?");

    if (!confirmed) {
      return;
    }

    setActionLoading((previous) => ({
      ...previous,
      [noteId]: true,
    }));

    try {
      await api.delete(`/notes/${noteId}`);

      setData((previous) => ({
        ...previous,
        reportedNotes: previous.reportedNotes.filter(
          (note) => note._id !== noteId
        ),
      }));

      toast.success("Note deleted");
    } catch (error) {
      toast.error("Failed to delete note");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [noteId]: false,
      }));
    }
  };

  const dismissReport = (type, id) => {
    const loadingKey = `dismiss_${id}`;

    setActionLoading((previous) => ({
      ...previous,
      [loadingKey]: true,
    }));

    if (type === "post") {
      setData((previous) => ({
        ...previous,
        reportedPosts: previous.reportedPosts.filter(
          (post) => post._id !== id
        ),
      }));
    } else {
      setData((previous) => ({
        ...previous,
        reportedNotes: previous.reportedNotes.filter(
          (note) => note._id !== id
        ),
      }));
    }

    toast.success("Report dismissed");

    setActionLoading((previous) => ({
      ...previous,
      [loadingKey]: false,
    }));
  };

  const postCount = data.reportedPosts.length;
  const noteCount = data.reportedNotes.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reported Content
          </h1>

          <p className="text-sm text-slate-500">
            {postCount + noteCount} items need review
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card flex w-fit gap-1 p-1.5">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "posts"
              ? "bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-primary-400"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Posts

          {postCount > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {postCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("notes")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "notes"
              ? "bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-primary-400"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <FileText className="h-4 w-4" />
          Notes

          {noteCount > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {noteCount}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse space-y-3 p-5"
            >
              <div className="flex gap-3">
                <div className="skeleton h-10 w-10 rounded-full" />

                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-32 rounded" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
              </div>

              <div className="skeleton h-12 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Reported Posts */}
      {!loading && tab === "posts" && (
        <div className="card divide-y divide-slate-100 overflow-hidden dark:divide-slate-700">
          {postCount === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="No reported posts"
              description="All content looks clean!"
            />
          )}

          {data.reportedPosts.map((post) => (
            <div key={post._id} className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar user={post.author} size="sm" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {post.author?.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatRelative(post.createdAt)}
                    </p>
                  </div>
                </div>

                <span className="badge shrink-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {post.reportedBy?.length || 0} reports
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                <p className="line-clamp-4 text-sm text-slate-700 dark:text-slate-300">
                  {post.content}
                </p>
              </div>

              {post.reportedBy?.length > 0 && (
                <p className="text-xs text-slate-400">
                  Reported by:{" "}
                  {post.reportedBy
                    .map((user) => user.username || user)
                    .join(", ")}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    dismissReport("post", post._id)
                  }
                  disabled={
                    actionLoading[`dismiss_${post._id}`]
                  }
                  className="btn-secondary flex items-center gap-2 text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Dismiss
                </button>

                <button
                  type="button"
                  onClick={() => deletePost(post._id)}
                  disabled={actionLoading[post._id]}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                >
                  {actionLoading[post._id] ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}

                  Delete Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reported Notes */}
      {!loading && tab === "notes" && (
        <div className="card divide-y divide-slate-100 overflow-hidden dark:divide-slate-700">
          {noteCount === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="No reported notes"
              description="All notes look clean!"
            />
          )}

          {data.reportedNotes.map((note) => (
            <div key={note._id} className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar user={note.uploader} size="sm" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {note.uploader?.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatRelative(note.createdAt)}
                    </p>
                  </div>
                </div>

                <span className="badge shrink-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {note.reportedBy?.length || 0} reports
                </span>
              </div>

              <div className="space-y-1 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/50">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {note.title}
                </p>

                <p className="text-xs text-slate-500">
                  {note.subject} · {note.category}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    dismissReport("note", note._id)
                  }
                  disabled={
                    actionLoading[`dismiss_${note._id}`]
                  }
                  className="btn-secondary flex items-center gap-2 text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Dismiss
                </button>

                <button
                  type="button"
                  onClick={() => deleteNote(note._id)}
                  disabled={actionLoading[note._id]}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                >
                  {actionLoading[note._id] ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}

                  Delete Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
