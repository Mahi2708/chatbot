"use client";

import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { apiFetch } from "@/lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setOk(null);
    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      setOk("Account created successfully. Redirecting to login...");
      setTimeout(() => (window.location.href = "/login"), 1200);
    } catch (e: any) {
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start building projects and AI agents">
      <div className="space-y-3">
        <TextInput
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextInput
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextInput
          placeholder="Password (<= 72 bytes)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div className="text-red-400 text-sm">{err}</div>}
        {ok && <div className="text-emerald-400 text-sm">{ok}</div>}

        <PrimaryButton onClick={submit} disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </PrimaryButton>

        <p className="text-sm text-zinc-400">
          Already have an account?{" "}
          <a className="text-white underline underline-offset-4" href="/login">
            Login
          </a>
        </p>

        <a className="text-xs text-zinc-500 hover:text-zinc-300 block" href="/">
          ← Back to Home
        </a>
      </div>
    </AuthShell>
  );
}
