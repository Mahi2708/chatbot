"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("My Project");

  async function load() {
    const res = await apiFetch("/projects");
    setProjects(await res.json());
  }

  async function createProject() {
    await apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description: "" }),
    });
    load();
  }

  useEffect(() => {
    load().catch(() => alert("Please login first"));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ marginBottom: 20 }}>
        <input value={name} onChange={e => setName(e.target.value)} />
        <button onClick={createProject}>Create Project</button>
      </div>

      {projects.map(p => (
        <Project key={p.id} project={p} />
      ))}
    </div>
  );
}

function Project({ project }: any) {
  const [agents, setAgents] = useState<any[]>([]);
  const [agentName, setAgentName] = useState("My Agent");

  async function loadAgents() {
    const res = await apiFetch(`/projects/${project.id}/agents`);
    setAgents(await res.json());
  }

  async function createAgent() {
    await apiFetch(`/projects/${project.id}/agents`, {
      method: "POST",
      body: JSON.stringify({ name: agentName }),
    });
    loadAgents();
  }

  useEffect(() => { loadAgents(); }, []);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
      <h3>{project.name}</h3>

      <input value={agentName} onChange={e => setAgentName(e.target.value)} />
      <button onClick={createAgent}>Add Agent</button>

      <ul>
        {agents.map(a => (
          <li key={a.id}>
            {a.name} → <a href={`/chat/${a.id}`}>Open chat</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
