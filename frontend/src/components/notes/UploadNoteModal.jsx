import { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2, Image } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { noteCategories } from '../../utils/helpers';

const semesters = ['1', '2', '3', '4', '5', '6', '7', '8', 'N/A'];

export default function UploadNoteModal({ onClose, onUploaded }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', subject: '', category: 'Computer Science',
    semester: '1', tags: '', college: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm({ ...form, [k]: v }); setErrors({ ...errors, [k]: '' }); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.subject.trim()) e.subject = 'Subject required';
    if (!file) e.file = 'Please select a file';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast.error('File too large (max 20MB)'); return; }
    setFile(f);
    setErrors({ ...errors, file: '' });
    if (!form.title) setForm((p) => ({ ...p, title: f.name.replace(/\.[^.]+$/, '') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('file', file);
      const res = await api.post('/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Note uploaded successfully!');
      onUploaded?.(res.data.note);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Upload Study Notes</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* File drop */}
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                file ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              } ${errors.file ? 'border-red-400' : ''}`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  {file.type === 'application/pdf' ? <FileText className="w-8 h-8 text-primary-500" /> : <Image className="w-8 h-8 text-primary-500" />}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload PDF or image</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG · Max 20MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile} />
            {errors.file && <p className="text-red-500 text-xs">{errors.file}</p>}

            {[
              { key: 'title', label: 'Title *', placeholder: 'e.g. Data Structures - Complete Notes' },
              { key: 'subject', label: 'Subject *', placeholder: 'e.g. Data Structures & Algorithms' },
              { key: 'college', label: 'College (optional)', placeholder: 'Your college name' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={`input-field ${errors[key] ? 'border-red-400 focus:ring-red-400' : ''}`} />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
                  {noteCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Semester</label>
                <select value={form.semester} onChange={(e) => set('semester', e.target.value)} className="input-field">
                  {semesters.map((s) => <option key={s} value={s}>{s === 'N/A' ? 'N/A' : `Semester ${s}`}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of the notes..." rows={2} className="input-field resize-none" />
            </div>

            <div>
              <label className="label">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="algorithms, sorting, recursion" className="input-field" />
            </div>
          </div>

          <div className="flex gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
