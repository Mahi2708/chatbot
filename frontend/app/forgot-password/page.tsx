"use client";

import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { apiFetch } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="We’ll send you a reset link"
    >
      {!sent ? (
        <div className="space-y-3">
          <TextInput
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PrimaryButton onClick={submit} disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </PrimaryButton>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">
          If an account exists for this email, a reset link has been sent.
        </p>
      )}
    </AuthShell>
  );
}
