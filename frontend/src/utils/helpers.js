import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export const formatTime = (date) => {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
};

export const formatRelative = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatFullDate = (date) =>
  format(new Date(date), 'MMMM d, yyyy');

export const truncate = (str, n = 100) =>
  str?.length > n ? str.slice(0, n) + '…' : str;

export const getFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const categoryColors = {
  Mathematics: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Physics: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Chemistry: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Biology: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Computer Science': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Engineering: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Literature: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  History: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Economics: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  Psychology: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Law: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export const postCategories = [
  'General', 'Academic', 'Events', 'Jobs', 'Housing', 'Lost & Found', 'Sports', 'Tech', 'Other',
];

export const noteCategories = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Engineering', 'Business', 'Literature', 'History', 'Economics',
  'Psychology', 'Law', 'Medicine', 'Arts', 'Other',
];
