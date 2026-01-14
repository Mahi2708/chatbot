"use client";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Chat({ params }: { params: { agentId: string } }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const evtRef = useRef<EventSource | null>(null);

  async function send() {
    const text = input.trim();
    if (!text) return;

    setMessages(m => [...m, { role: "user", content: text }]);
    setInput("");

    const url = `${process.env.NEXT_PUBLIC_API_URL}/chat/agents/${params.agentId}`;
    const token = localStorage.getItem("token");

    // SSE (server sends data: {...})
    const payload = { conversation_id: conversationId, message: text };
    const qs = encodeURIComponent(JSON.stringify(payload));

    // We use fetch to create request; but SSE doesn't support POST easily without polyfills.
    // So MVP uses GET-like hack: send JSON in query param.
    // For production: use WebSocket or streaming fetch.
    const streamUrl = `${url}?payload=${qs}`;

    // fallback: do normal POST and parse as stream via response body (advanced)
    const res = await apiFetch(`/chat/agents/${params.agentId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() || "";

      for (const c of chunks) {
        if (c.startsWith("data: ")) {
          const jsonStr = c.slice(6);
          const data = JSON.parse(jsonStr);
          if (data.conversation_id) setConversationId(data.conversation_id);
          if (data.text) setMessages(m => [...m, { role: "assistant", content: data.text }]);
        }
      }
    }
  }

  return (
    <div>
      <h2>Chat</h2>
      <div style={{ border: "1px solid #ddd", padding: 12, height: 400, overflow: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          style={{ width: "80%" }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
