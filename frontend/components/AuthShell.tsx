export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-zinc-400 mt-1 text-sm">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
