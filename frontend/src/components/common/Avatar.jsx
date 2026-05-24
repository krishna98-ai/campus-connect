const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

const colors = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-teal-500',
];

function getColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (user?.avatar?.url) {
    return (
      <img
        src={user.avatar.url}
        alt={user.name}
        className={`${sizeClass} rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-slate-800 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${getColor(user?.name)} rounded-full flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-white dark:ring-slate-800 ${className}`}
    >
      {initials}
    </div>
  );
}
