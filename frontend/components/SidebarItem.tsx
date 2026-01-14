"use client";

export default function SidebarItem({
  active,
  title,
  subtitle,
  onClick,
}: {
  active?: boolean;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full text-left px-3 py-2 rounded-xl border transition " +
        (active
          ? "bg-white text-black border-white"
          : "bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-200")
      }
    >
      <div className="text-sm font-medium truncate">{title}</div>
      {subtitle && <div className="text-xs opacity-70 truncate">{subtitle}</div>}
    </button>
  );
}
