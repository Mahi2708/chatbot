"use client";

import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { apiFetch } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Login to continue to your dashboard">
      <div className="space-y-3">
        <TextInput
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextInput
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <PrimaryButton onClick={submit} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </PrimaryButton>

        <p className="text-sm text-zinc-400">
          New here?{" "}
          <a className="text-white underline underline-offset-4" href="/register">
            Create an account
          </a>
        </p>

        <a className="text-xs text-zinc-500 hover:text-zinc-300 block" href="/">
          ← Back to Home
        </a>
      </div>
    </AuthShell>
  );
}
