"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import SidebarItem from "@/components/SidebarItem";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { apiFetch } from "@/lib/api";

type Project = {
  id: string;
  name: string;
  description?: string;
};

type Agent = {
  id: string;
  name: string;
  system_prompt?: string;
  model_provider?: string;
  model_name?: string;
};

export default function Dashboard() {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
    setCheckedAuth(true);
  }, []);

  // while checking token
  if (!checkedAuth) return null;

  // 🚫 Not logged in
  if (!loggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h1 className="text-xl font-semibold">Access Restricted</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            You must be logged in to access the dashboard.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href="/login"
              className="rounded-xl bg-white text-black py-2.5 text-sm font-medium hover:bg-zinc-200"
            >
              Go to Login
            </a>

            <a
              href="/"
              className="rounded-xl border border-zinc-800 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ✅ Logged in → render real dashboard
  return <DashboardContent />;
}

/** ✅ Your entire original dashboard moved here */
function DashboardContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  // modals
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [openAgentModal, setOpenAgentModal] = useState(false);

  // create forms
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  const [agentName, setAgentName] = useState("");
  const [agentSystemPrompt, setAgentSystemPrompt] = useState(
    "You are a helpful assistant."
  );
  const [agentModelName, setAgentModelName] = useState("gpt-4o-mini");

  const [err, setErr] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  // ----------------------------
  // Fetch projects
  // ----------------------------
  async function loadProjects() {
    setErr(null);
    setLoadingProjects(true);
    try {
      const res = await apiFetch("/projects", { method: "GET" });
      const data = await res.json();
      setProjects(data);

      // auto-select first project
      if (data?.length && !activeProjectId) {
        setActiveProjectId(data[0].id);
      }
    } catch (e: any) {
      setErr(e.message || "Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  }

  // ----------------------------
  // Fetch agents for project
  // ----------------------------
  async function loadAgents(projectId: string) {
    setErr(null);
    setLoadingAgents(true);
    try {
      const res = await apiFetch(`/projects/${projectId}/agents`, { method: "GET" });
      const data = await res.json();
      setAgents(data);
    } catch (e: any) {
      setErr(e.message || "Failed to load agents");
    } finally {
      setLoadingAgents(false);
    }
  }

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeProjectId) loadAgents(activeProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId]);

  // ----------------------------
  // Search filter
  // ----------------------------
  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, search]);

  const filteredAgents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) => a.name.toLowerCase().includes(q));
  }, [agents, search]);

  // ----------------------------
  // Create Project
  // ----------------------------
  async function createProject() {
    setErr(null);
    try {
      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
          description: projectDesc,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setOpenProjectModal(false);
      setProjectName("");
      setProjectDesc("");
      await loadProjects();
    } catch (e: any) {
      setErr(e.message || "Failed to create project");
    }
  }

  // ----------------------------
  // Create Agent
  // ----------------------------
  async function createAgent() {
    if (!activeProjectId) {
      setErr("Select a project first");
      return;
    }

    setErr(null);
    try {
      const res = await apiFetch(`/projects/${activeProjectId}/agents`, {
        method: "POST",
        body: JSON.stringify({
          name: agentName,
          system_prompt: agentSystemPrompt,
          model_provider: "openai",
          model_name: agentModelName,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setOpenAgentModal(false);
      setAgentName("");
      await loadAgents(activeProjectId);
    } catch (e: any) {
      setErr(e.message || "Failed to create agent");
    }
  }

  // ----------------------------
  // Open Chat
  // ----------------------------
  function openChat(agentId: string) {
    window.location.href = `/chat/${agentId}`;
  }

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-[320px] border-r border-zinc-800 bg-zinc-950 hidden md:flex flex-col">
        {/* Top bar */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              CP
            </div>
            <div>
              <div className="font-semibold leading-tight">Chatbot Platform</div>
              <div className="text-xs text-zinc-400">Dashboard</div>
            </div>
          </div>

          <div className="mt-4">
            <TextInput
              placeholder="Search projects / agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-white text-black font-medium hover:bg-zinc-200"
              onClick={() => setOpenProjectModal(true)}
            >
              + Project
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
              onClick={() => setOpenAgentModal(true)}
            >
              + Agent
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">
              Projects
            </div>
            {loadingProjects && (
              <div className="text-xs text-zinc-500">Loading...</div>
            )}
          </div>

          <div className="mt-3 space-y-2 max-h-[280px] overflow-auto pr-1">
            {filteredProjects.length === 0 && (
              <div className="text-sm text-zinc-400">No projects found.</div>
            )}

            {filteredProjects.map((p) => (
              <SidebarItem
                key={p.id}
                active={activeProjectId === p.id}
                title={p.name}
                subtitle={p.description || ""}
                onClick={() => setActiveProjectId(p.id)}
              />
            ))}
          </div>
        </div>

        {/* Agents */}
        <div className="px-4 pb-4 mt-1 flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">
              Agents
            </div>
            {loadingAgents && (
              <div className="text-xs text-zinc-500">Loading...</div>
            )}
          </div>

          <div className="mt-3 space-y-2 overflow-auto pr-1 h-full">
            {activeProjectId && filteredAgents.length === 0 && (
              <div className="text-sm text-zinc-400">
                No agents found. Create an agent to start chatting.
              </div>
            )}

            {!activeProjectId && (
              <div className="text-sm text-zinc-400">
                Select a project to view agents.
              </div>
            )}

            {filteredAgents.map((a) => (
              <button
                key={a.id}
                onClick={() => openChat(a.id)}
                className="w-full text-left px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800"
              >
                <div className="text-sm font-medium truncate">{a.name}</div>
                <div className="text-xs text-zinc-500 truncate">
                  {a.model_name || "model"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 mb-2"
          >
            Home
          </button>
          <button
            onClick={logout}
            className="w-full px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Mobile header */}
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Dashboard</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
              onClick={() => setOpenProjectModal(true)}
            >
              + Project
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* keep your existing UI exactly as before... */}
          {/* ... */}
        </div>
      </main>

      {/* Your modals remain unchanged */}
      <Modal
        open={openProjectModal}
        title="Create Project"
        onClose={() => setOpenProjectModal(false)}
      >
        <div className="space-y-3">
          <TextInput
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <TextInput
            placeholder="Description (optional)"
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
          />

          <div className="pt-2 flex gap-2">
            <button
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
              onClick={() => setOpenProjectModal(false)}
            >
              Cancel
            </button>
            <PrimaryButton
              className="flex-1"
              onClick={createProject}
              disabled={!projectName.trim()}
            >
              Create
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={openAgentModal}
        title="Create Agent"
        onClose={() => setOpenAgentModal(false)}
      >
        <div className="space-y-3">
          <TextInput
            placeholder="Agent name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
          />

          <div className="space-y-2">
            <div className="text-xs text-zinc-400">System prompt</div>
            <textarea
              value={agentSystemPrompt}
              onChange={(e) => setAgentSystemPrompt(e.target.value)}
              className="w-full min-h-[110px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-white/10"
              placeholder="You are a helpful assistant..."
            />
          </div>

          <TextInput
            placeholder="Model name (e.g. gpt-4o-mini)"
            value={agentModelName}
            onChange={(e) => setAgentModelName(e.target.value)}
          />

          <div className="pt-2 flex gap-2">
            <button
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
              onClick={() => setOpenAgentModal(false)}
            >
              Cancel
            </button>
            <PrimaryButton
              className="flex-1"
              onClick={createAgent}
              disabled={!agentName.trim()}
            >
              Create
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
