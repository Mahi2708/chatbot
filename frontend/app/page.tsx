"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { apiFetch } from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Load current user from DB
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/auth/me", { method: "GET" });
        const data = await res.json();
        setUser(data);
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
        setUser(null);
      }
    }

    loadUser();
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  return (
    <main className="min-h-screen px-6">
      <div className="max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}
        <header className="flex items-center justify-between py-10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              CP
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              Chatbot Platform
            </h1>
          </div>

          {/* Auth-aware navigation */}
          <nav className="flex gap-3 items-center">
            {!loggedIn ? (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-medium"
                >
                  Get Started
                </a>
              </>
            ) : (
              <>
                <a
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 font-medium"
                >
                  Dashboard
                </a>

                {/* Profile avatar */}
                <button
                  onClick={() => setShowProfile(true)}
                  className="h-10 w-10 rounded-full bg-white text-black font-semibold flex items-center justify-center hover:bg-zinc-200"
                  title="Profile"
                >
                  {initials}
                </button>
              </>
            )}
          </nav>
        </header>

        {/* ================= HERO ================= */}
        <section className="py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Build and manage AI agents for your projects.
            </h2>

            <p className="mt-5 text-zinc-300 text-lg">
              Organize agents, store prompts, and chat with powerful
              LLM-backed assistants — all in one clean platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {!loggedIn ? (
                <a
                  href="/register"
                  className="px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200"
                >
                  Create an account
                </a>
              ) : (
                <a
                  href="/dashboard"
                  className="px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200"
                >
                  Go to dashboard
                </a>
              )}
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

          {/* ================= LIVE PREVIEW ================= */}
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 shadow-xl">
            <div className="text-sm text-zinc-400">Live Preview</div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                <div className="text-xs text-zinc-400">Agent</div>
                <div className="text-sm mt-1">
                  How can I help you today?
                </div>
              </div>

              <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 ml-10">
                <div className="text-xs text-zinc-400">You</div>
                <div className="text-sm mt-1">
                  Create an onboarding checklist for my product.
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                <div className="text-xs text-zinc-400">Agent</div>
                <div className="text-sm mt-1">
                  Sure — here’s a structured onboarding checklist...
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-zinc-500">
              Start building your AI agents today.
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="py-10 text-zinc-500 text-sm">
          © {new Date().getFullYear()} Chatbot Platform — MVP
        </footer>
      </div>

      {/* ================= PROFILE MODAL ================= */}
      <Modal
        open={showProfile}
        title={editingProfile ? "Edit profile" : "Profile"}
        onClose={() => {
          setShowProfile(false);
          setEditingProfile(false);
        }}
      >
        {!editingProfile ? (
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-zinc-500">Name</div>
              <div className="text-zinc-200">{user?.name}</div>
            </div>

            <div>
              <div className="text-zinc-500">Email</div>
              <div className="text-zinc-200">{user?.email}</div>
            </div>

            <div className="pt-4 space-y-2 border-t border-zinc-800">
              <button
                onClick={() => setEditingProfile(true)}
                className="w-full px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
              >
                Edit profile
              </button>

              <a
                href="/help"
                className="block w-full text-center px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
              >
                Help
              </a>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
                className="w-full px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <TextInput
              placeholder="Name"
              value={user?.name || ""}
              onChange={(e) =>
                setUser((u) => (u ? { ...u, name: e.target.value } : u))
              }
            />

            <TextInput
              placeholder="Email"
              value={user?.email || ""}
              onChange={(e) =>
                setUser((u) => (u ? { ...u, email: e.target.value } : u))
              }
            />

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setEditingProfile(false)}
                className="px-4 py-2 rounded-xl border border-zinc-800"
              >
                Cancel
              </button>

              <PrimaryButton
                onClick={async () => {
                  const res = await apiFetch("/me", {
                    method: "PUT",
                    body: JSON.stringify({
                      name: user!.name,
                      email: user!.email,
                    }),
                  });
                  const updated = await res.json();
                  setUser(updated);
                  setEditingProfile(false);
                }}
              >
                Save
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
