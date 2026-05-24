import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Loader2, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { updateProfile } from '../store/authSlice';
import Avatar from '../components/common/Avatar';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Other'];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const fileRef = useRef(null);
  const [tab, setTab] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    college: user?.college || '',
    department: user?.department || '',
    year: user?.year || '',
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image too large (max 2MB)'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(profile).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v); });
    if (avatarFile) fd.append('avatar', avatarFile);
    const result = await dispatch(updateProfile(fd));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated!');
      setAvatarFile(null);
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  const validatePassword = () => {
    const e = {};
    if (!passwords.currentPassword) e.currentPassword = 'Enter current password';
    if (!passwords.newPassword) e.newPassword = 'Enter new password';
    else if (passwords.newPassword.length < 8) e.newPassword = 'At least 8 characters';
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(passwords.newPassword)) e.newPassword = 'Include uppercase and number';
    if (passwords.newPassword !== passwords.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setPwErrors(e);
    return !Object.keys(e).length;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setPwLoading(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setPwLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 card p-1.5">
        {[{ id: 'profile', label: 'Profile', icon: User }, { id: 'security', label: 'Security', icon: Lock }].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card p-6 space-y-6">
          {/* Avatar upload */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarPreview
                ? <img src={avatarPreview} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-800" />
                : <Avatar user={user} size="xl" />
              }
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">JPG, PNG up to 2MB</p>
              {avatarFile && <p className="text-xs text-primary-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> New image selected</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'name', label: 'Full Name', placeholder: 'Your full name' },
              { id: 'college', label: 'College / University', placeholder: 'Your institution' },
              { id: 'department', label: 'Department', placeholder: 'e.g. Computer Science' },
            ].map(({ id, label, placeholder }) => (
              <div key={id}>
                <label className="label">{label}</label>
                <input
                  type="text"
                  value={profile[id]}
                  onChange={(e) => setProfile({ ...profile, [id]: e.target.value })}
                  placeholder={placeholder}
                  className="input-field"
                />
              </div>
            ))}

            <div>
              <label className="label">Year of Study</label>
              <select value={profile.year} onChange={(e) => setProfile({ ...profile, year: e.target.value })} className="input-field">
                <option value="">Select year</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              rows={3}
              maxLength={200}
              className="input-field resize-none"
            />
            <p className="text-right text-xs text-slate-400 mt-1">{profile.bio.length}/200</p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePasswordChange} className="card p-6 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Change Password</h3>
            <p className="text-sm text-slate-500">Choose a strong password you haven't used before.</p>
          </div>

          {[
            { id: 'currentPassword', label: 'Current Password', placeholder: 'Your current password' },
            { id: 'newPassword', label: 'New Password', placeholder: 'Min 8 chars, 1 uppercase, 1 number' },
            { id: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(({ id, label, placeholder }) => (
            <div key={id}>
              <label className="label">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passwords[id]}
                  onChange={(e) => { setPasswords({ ...passwords, [id]: e.target.value }); setPwErrors({ ...pwErrors, [id]: '' }); }}
                  placeholder={placeholder}
                  className={`input-field pl-10 pr-10 ${pwErrors[id] ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {id === 'currentPassword' && (
                  <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {pwErrors[id] && <p className="text-red-500 text-xs mt-1">{pwErrors[id]}</p>}
            </div>
          ))}

          <div className="flex justify-end">
            <button type="submit" disabled={pwLoading} className="btn-primary">
              {pwLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Change Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
