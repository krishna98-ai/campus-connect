import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Image, Loader2, ChevronDown } from 'lucide-react';
import { createPost } from '../../store/postsSlice';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';
import { postCategories } from '../../utils/helpers';

export default function CreatePostModal({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { toast.error('Post content is required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content.trim());
      fd.append('category', category);
      if (tags.trim()) fd.append('tags', tags.trim());
      images.forEach((img) => fd.append('images', img));

      const result = await dispatch(createPost(fd));
      if (createPost.fulfilled.match(result)) {
        toast.success('Post created!');
        onCreated?.(result.payload);
        onClose();
      } else {
        toast.error(result.payload || 'Failed to create post');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Create Post</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {/* Author info */}
            <div className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{user?.name}</p>
                <div className="relative inline-block">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 border-none rounded-lg pr-5 pl-2 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-400"
                  >
                    {postCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              maxLength={2000}
              className="input-field resize-none text-base"
              autoFocus
            />
            <div className="text-right text-xs text-slate-400">{content.length}/2000</div>

            {/* Image previews */}
            {previews.length > 0 && (
              <div className={`grid gap-2 ${previews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-full h-32 object-cover rounded-xl" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags: technology, study, campus (comma-separated)"
              className="input-field text-sm"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost p-2 rounded-lg" title="Add images">
                <Image className="w-5 h-5 text-primary-500" />
              </button>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
              <span className="text-xs text-slate-400">Up to 4 images</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading || !content.trim()} className="btn-primary">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
