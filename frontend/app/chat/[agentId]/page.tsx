"use client";

import { use, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };
type Attachment = { filename: string; openai_file_id: string };

export default function Chat({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Upload each file one-by-one
      for (const f of Array.from(files)) {
        const form = new FormData();
        form.append("file", f);

        const res = await apiFetch("/files/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();

        setAttachments((prev) => [
          ...prev,
          { filename: data.filename, openai_file_id: data.openai_file_id },
        ]);
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      // allow re-picking same file
      e.target.value = "";
    }
  }

  function removeAttachment(fileId: string) {
    setAttachments((prev) => prev.filter((a) => a.openai_file_id !== fileId));
  }

  async function send() {
    const text = input.trim();
    if ((!text && attachments.length === 0) || loading) return;

    // display user msg
    setMessages((m) => [
      ...m,
      {
        role: "user",
        content:
          attachments.length > 0
            ? `${text}\n\n📎 Attached:\n${attachments
                .map((a) => `- ${a.filename}`)
                .join("\n")}`
            : text,
      },
    ]);

    setInput("");
    setLoading(true);

    const fileIds = attachments.map((a) => a.openai_file_id);

    try {
      const res = await apiFetch(`/chat/agents/${agentId}`, {
        method: "POST",
        body: JSON.stringify({
          conversation_id: conversationId,
          message: text || "(User sent files)",
          file_ids: fileIds,
        }),
      });

      // clear attachments after send
      setAttachments([]);

      // streaming response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const c of chunks) {
          if (!c.startsWith("data: ")) continue;
          const jsonStr = c.slice(6);
          const data = JSON.parse(jsonStr);

          if (data.conversation_id) setConversationId(data.conversation_id);
          if (data.text) {
            setMessages((m) => [...m, { role: "assistant", content: data.text }]);
          }
        }
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Failed to get response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* top bar */}
      <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a className="text-zinc-300 hover:text-white" href="/dashboard">
            ← Dashboard
          </a>
          <div className="text-sm text-zinc-400">Agent Chat</div>
        </div>
      </header>

      {/* chat area */}
      <section className="flex-1 overflow-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-zinc-400">
              Ask something or attach a file to begin.
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 border ${
                  m.role === "user"
                    ? "bg-white text-black border-zinc-200"
                    : "bg-zinc-900 text-zinc-100 border-zinc-800"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-zinc-400 text-sm">Agent is typing...</div>
          )}
        </div>
      </section>

      {/* input bar */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {/* attachments row */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((a) => (
                <div
                  key={a.openai_file_id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-sm"
                >
                  <span className="text-zinc-200">📎 {a.filename}</span>
                  <button
                    className="text-zinc-400 hover:text-white"
                    onClick={() => removeAttachment(a.openai_file_id)}
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            {/* hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onPickFiles}
            />

            <button
              onClick={openFilePicker}
              disabled={uploading || loading}
              className="h-12 w-12 rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center disabled:opacity-60"
              title="Upload file"
            >
              📎
            </button>

            <input
              className="flex-1 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 outline-none focus:ring-2 focus:ring-white/10"
              placeholder={uploading ? "Uploading..." : "Message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={uploading}
            />

            <button
              onClick={send}
              disabled={loading || uploading}
              className="h-12 px-5 rounded-2xl bg-white text-black font-medium hover:bg-zinc-200 disabled:opacity-60"
            >
              Send
            </button>
          </div>

          <div className="text-xs text-zinc-500 mt-2">
            {uploading
              ? "Uploading files..."
              : "Tip: attach docs (PDF/TXT) and ask questions about them."}
          </div>
        </div>
      </footer>
    </main>
  );
}
