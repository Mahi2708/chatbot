const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers: any = {
    ...(options.headers || {}),
  };

  // ✅ Only set JSON content-type if body is not FormData
  const isForm = options.body instanceof FormData;
  if (!isForm) headers["Content-Type"] = "application/json";

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res;
}
export async function getMe() {
  const res = await apiFetch("/me", { method: "GET" });
  if (!res.ok) throw new Error("Failed to load user");
  return res.json();
}

export async function updateMe(data: { name: string; email: string }) {
  const res = await apiFetch("/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}
