"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    window.location.href = "/dashboard";
  }

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={submit}>Login</button>
    </div>
  );
}
