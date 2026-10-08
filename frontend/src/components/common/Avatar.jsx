const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

function getInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Avatar({ user, size = "md", className = "" }) {
  const sizeClass = sizes[size] || sizes.md;

  if (user?.avatar?.url) {
    return (
      <img
        src={user.avatar.url}
        alt={user.name || "User"}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold shrink-0 ${className}`}
    >
      {getInitials(user?.name)}
    </div>
  );
}
