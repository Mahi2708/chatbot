"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import TextInput from "@/components/TextInput";
import PrimaryButton from "@/components/PrimaryButton";
import { apiFetch } from "@/lib/api";

export default function ResetPassword() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    await apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: password }),
    });
    setDone(true);
  }

  return (
    <AuthShell title="Reset password">
      {!done ? (
        <div className="space-y-3">
          <TextInput
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PrimaryButton onClick={submit}>
            Reset password
          </PrimaryButton>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">
          Password updated. You can now log in.
        </p>
      )}
    </AuthShell>
  );
}
