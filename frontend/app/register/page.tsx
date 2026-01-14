"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("User");
  const [password, setPassword] = useState("");

  async function submit() {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    });
    alert("Registered! Now login.");
    window.location.href = "/login";
  }

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="name" value={name} onChange={e => setName(e.target.value)} /><br />
      <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={submit}>Create account</button>
    </div>
  );
}
