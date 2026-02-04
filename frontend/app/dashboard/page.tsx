/**
 * Dashboard UI
 *
 * Related issue: #1
 * Issue: Dashboard UI & Interaction Regression After Hero Panel Update
 */

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
  const MODEL_OPTIONS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1",
  "gpt-3.5-turbo",
];

  const [err, setErr] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  type Selection =
  | { type: "project"; data: Project }
  | { type: "agent"; data: Agent }
  | null;

const [selectedItem, setSelectedItem] = useState<Selection>(null);
  const [editMode, setEditMode] = useState(false);
  function ChatIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
    );
    
}

function TrashIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6v14h8V6" />
      <path d="M10 6V4h4v2" />
    </svg>
  );
  }
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

function EditIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}



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
  // ----------------------------
// Save (Update Project / Agent)
// ----------------------------
async function saveSelectedItem() {
  if (!selectedItem) return;

  try {
    if (selectedItem.type === "project") {
      await apiFetch(`/projects/${selectedItem.data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: selectedItem.data.name,
          description: selectedItem.data.description,
        }),
      });

      await loadProjects();
    }

    if (selectedItem.type === "agent") {
      if (!activeProjectId) return;

      await apiFetch(
        `/projects/${activeProjectId}/agents/${selectedItem.data.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: selectedItem.data.name,
            system_prompt: selectedItem.data.system_prompt,
            model_name: selectedItem.data.model_name,
          }),
        }
      );

      await loadAgents(activeProjectId);
    }

    setEditMode(false);
  } catch (e: any) {
    alert(e.message || "Failed to save");
  }
}

// ----------------------------
// Delete (Project / Agent)
// ----------------------------
async function deleteSelectedItem() {
  if (!selectedItem) return;

  try {
    if (selectedItem.type === "project") {
      await apiFetch(`/projects/${selectedItem.data.id}`, {
        method: "DELETE",
      });

      setSelectedItem(null);
      await loadProjects();
    }

    if (selectedItem.type === "agent") {
      if (!activeProjectId) return;

      await apiFetch(
        `/projects/${activeProjectId}/agents/${selectedItem.data.id}`,
        {
          method: "DELETE",
        }
      );

      setSelectedItem(null);
      await loadAgents(activeProjectId);
    }

    setShowDeleteConfirm(false);
  } catch (e: any) {
    alert(e.message || "Failed to delete");
  }
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
                onClick={() => {
                          setActiveProjectId(p.id);
                          setSelectedItem({ type: "project", data: p });
                          setEditMode(false);
                        }}

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
                onClick={() => {
                          setSelectedItem({ type: "agent", data: a });
                          setEditMode(false);
                        }}

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
<div className="max-w-6xl mx-auto px-6 py-12">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* --- TOP ROW: 3 cards --- */}
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="text-3xl mb-3">🗂</div>
      <h3 className="text-lg font-semibold mb-1">Create a Project</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Projects help you organize agents, prompts, and conversations.
      </p>
      <div className="text-xs text-zinc-500">
        Use <span className="text-zinc-300">+ Project</span> in the sidebar.
      </div>
    </div>

    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="text-3xl mb-3">🤖</div>
      <h3 className="text-lg font-semibold mb-1">Create an Agent</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Agents define behavior, model, and and role.
      </p>
      <div className="text-xs text-zinc-500">
        Select a project, then click{" "}
        <span className="text-zinc-300">+ Agent</span>.
      </div>
    </div>

    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="text-3xl mb-3">💬</div>
      <h3 className="text-lg font-semibold mb-1">Chat with an Agent</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Start conversations and test responses.
      </p>
      <div className="text-xs text-zinc-500">
        Click an agent in the sidebar.
      </div>
    </div>

    {/* --- BOTTOM ROW: Live Preview (spans all 3 columns) --- */}
{/* --- BOTTOM ROW: Hero Card (Live Preview / Details) --- */}
<div className="md:col-span-3 mt-6">

  {/* ========================= */}
  {/* DEFAULT: Live Preview */}
  {/* ========================= */}
  {!selectedItem && (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[32px] bg-white/5 blur-3xl" />

      <div className="relative w-full h-[520px] rounded-[32px] border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 flex flex-col">
        <div className="text-sm text-zinc-400 mb-6">Live Preview</div>

        <div className="flex-1 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4">
            <div className="text-xs text-zinc-400 mb-1">Agent</div>
            <div className="text-sm text-zinc-200">
              How can I help you today?
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 ml-8">
            <div className="text-xs text-zinc-400 mb-1">You</div>
            <div className="text-sm text-white">
              Create an onboarding checklist for my product.
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4">
            <div className="text-xs text-zinc-400 mb-1">Agent</div>
            <div className="text-sm text-zinc-200">
              Sure — here’s a structured onboarding checklist that helps new
              users get value quickly while reducing churn…
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 ml-8">
            <div className="text-xs text-zinc-400 mb-1">You</div>
            <div className="text-sm text-white">
              Thank you for the checklist.
            </div>
          </div>
        </div>

        <div className="pt-6 text-xs text-zinc-500">
          Start building your projects and agents using the sidebar on the left.
        </div>
      </div>
    </div>
  )}

  {/* ========================= */}
  {/* READ-ONLY DETAILS MODE */}
  {/* ========================= */}
  {selectedItem && !editMode && (
    <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/60 p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-sm text-zinc-400">
            {selectedItem.type === "project" ? "Project" : "Agent"}
          </div>
          <div className="text-xl font-semibold">
            {selectedItem.data.name}
          </div>
        </div>

        <div className="flex gap-3">
          {selectedItem.type === "agent" && (
            <button
                onClick={() => openChat(selectedItem.data.id)}
                className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800"
                title="Chat"
              >
                <ChatIcon className="text-zinc-200" />
              </button>

          )}

         <button
            onClick={() => setEditMode(true)}
            className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800"
            title="Edit"
          >
            <EditIcon className="text-zinc-200" />
          </button>

        </div>
      </div>

      <div className="space-y-4 text-sm">
        {selectedItem.type === "project" && (
          <div className="text-zinc-400">
            {selectedItem.data.description || "No description"}
          </div>
        )}

        {selectedItem.type === "agent" && (
          <>
            <div>
              <div className="text-xs text-zinc-500">Model</div>
              {selectedItem.data.model_name}
            </div>

            <div>
              <div className="text-xs text-zinc-500">System Prompt</div>
              <div className="text-zinc-400">
                {selectedItem.data.system_prompt}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )}
{/* ========================= */}
{/* EDIT MODE */}
{/* ========================= */}
{selectedItem && editMode && (
  <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/60 p-8 flex flex-col h-[520px]">
    
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div className="text-sm text-zinc-400">
        Edit {selectedItem.type}
      </div>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="p-2 rounded-lg border border-red-800 text-red-400 hover:bg-red-950"
        title="Delete"
      >
        <TrashIcon />
      </button>
    </div>

    {/* Form (grows to push buttons down) */}
    <div className="flex-1 space-y-4">
      <TextInput
        value={selectedItem.data.name}
        onChange={(e) =>
          setSelectedItem({
            ...selectedItem,
            data: { ...selectedItem.data, name: e.target.value },
          })
        }
      />

      {selectedItem.type === "project" && (
        <TextInput
          value={selectedItem.data.description || ""}
          onChange={(e) =>
            setSelectedItem({
              ...selectedItem,
              data: {
                ...selectedItem.data,
                description: e.target.value,
              },
            })
          }
        />
      )}

      {selectedItem.type === "agent" && (
        <textarea
          className="w-full min-h-[120px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3"
          value={selectedItem.data.system_prompt || ""}
          onChange={(e) =>
            setSelectedItem({
              ...selectedItem,
              data: {
                ...selectedItem.data,
                system_prompt: e.target.value,
              },
            })
          }
        />
      )}
    </div>

    {/* Bottom actions (pinned) */}
  <div className="pt-6 flex items-center justify-between border-t border-zinc-800">
  {/* Cancel */}
  <button
    onClick={() => setEditMode(false)}
    className="px-4 py-2.5 rounded-xl border border-zinc-800 text-sm"
  >
    Cancel
  </button>

  {/* Save */}
  <button onClick={saveSelectedItem}
    className="px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200"
  >
    Save
  </button>
</div>
  </div>
)}

</div>
  </div>
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

                  <div className="space-y-1">
          <div className="text-xs text-zinc-400">Model</div>
          <select
            value={agentModelName}
            onChange={(e) => setAgentModelName(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-white/10"
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>


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
      <Modal
  open={showDeleteConfirm}
  title="Confirm deletion"
  onClose={() => setShowDeleteConfirm(false)}
>
  <div className="space-y-4">
    <p className="text-sm text-zinc-400">
      This action cannot be undone. This will permanently delete this{" "}
      <span className="text-zinc-200">
        {selectedItem?.type}
      </span>.
    </p>

    <div className="flex gap-2">
      <button
        onClick={() => setShowDeleteConfirm(false)}
        className="flex-1 px-4 py-3 rounded-xl border border-zinc-800"
      >
        Cancel
      </button>

      <button
  onClick={deleteSelectedItem}
  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
>
  Delete
</button>

    </div>
  </div>
</Modal>

    </div>
  );
}
