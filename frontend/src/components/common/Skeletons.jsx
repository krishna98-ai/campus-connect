export function PostSkeleton() {
  return (
    <div className="card p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-4/5 rounded" />
        <div className="skeleton h-3.5 w-3/5 rounded" />
      </div>
      <div className="skeleton h-48 w-full rounded-xl" />
      <div className="flex gap-4">
        <div className="skeleton h-8 w-16 rounded-lg" />
        <div className="skeleton h-8 w-16 rounded-lg" />
        <div className="skeleton h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function NoteSkeleton() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="skeleton h-36 w-full rounded-xl" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-t-xl" />
      <div className="px-6 pb-6 pt-0 space-y-4">
        <div className="flex items-end justify-between -mt-10">
          <div className="skeleton w-20 h-20 rounded-full border-4 border-white dark:border-slate-800" />
          <div className="skeleton h-9 w-24 rounded-lg mt-2" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-3.5 w-24 rounded" />
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-28 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
      <div className="skeleton h-8 w-20 rounded-lg" />
    </div>
  );
}
