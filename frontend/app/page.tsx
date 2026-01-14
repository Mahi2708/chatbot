export default function Home() {
  return (
    <main className="min-h-screen px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between py-10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              CP
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Chatbot Platform</h1>
          </div>

          <nav className="flex gap-3">
            <a
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
              href="/login"
            >
              Login
            </a>
            <a
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-medium"
              href="/register"
            >
              Get Started
            </a>
          </nav>
        </header>

        {/* Hero */}
        <section className="py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Build and manage AI agents for your projects.
            </h2>

            <p className="mt-5 text-zinc-300 text-lg">
              Organize agents, store prompts, and chat with powerful LLM-backed assistants — all in one
              clean platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200"
                href="/register"
              >
                Create an account
              </a>

              <a
                className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
                href="/dashboard"
              >
                Go to dashboard
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ["Projects", "Organize agents by team/product."],
                ["Prompts", "Manage system & instruction prompts."],
                ["Chat", "Fast responses + history persistence."],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5"
                >
                  <div className="font-semibold">{title}</div>
                  <div className="text-zinc-400 mt-2 text-sm">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 shadow-xl">
            <div className="text-sm text-zinc-400">Live Preview</div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                <div className="text-xs text-zinc-400">Agent</div>
                <div className="text-sm mt-1">How can I help you today?</div>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 ml-10">
                <div className="text-xs text-zinc-400">You</div>
                <div className="text-sm mt-1">Create an onboarding checklist for my product.</div>
              </div>

              <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                <div className="text-xs text-zinc-400">Agent</div>
                <div className="text-sm mt-1">
                  Sure — here’s a structured onboarding checklist...
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-zinc-500">
              Minimal UI inspired by ChatGPT.
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-zinc-500 text-sm">
          © {new Date().getFullYear()} Chatbot Platform — MVP
        </footer>
      </div>
    </main>
  );
}
