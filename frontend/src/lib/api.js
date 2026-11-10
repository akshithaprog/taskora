// All communication with the Flask backend lives in this one file.
const BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "taskora_token";

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("Can't reach the server. Check that the backend is running.", 0);
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    if (res.status === 401 && auth) window.dispatchEvent(new Event("taskora:unauthorized"));
    throw new ApiError(data?.error || "Something went wrong. Please try again.", res.status, data?.fields);
  }
  return data;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const api = {
  register: (b) => request("/auth/register", { method: "POST", body: b, auth: false }),
  login: (b) => request("/auth/login", { method: "POST", body: b, auth: false }),
  me: () => request("/auth/me"),
  updateMe: (b) => request("/auth/me", { method: "PATCH", body: b }),
  changePassword: (b) => request("/auth/password", { method: "POST", body: b }),
  listTasks: () => request("/tasks"),
  createTask: (b) => request("/tasks", { method: "POST", body: b }),
  updateTask: (id, b) => request(`/tasks/${id}`, { method: "PUT", body: b }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: "PATCH", body: { today: today() } }),
  stats: () => request(`/stats?today=${today()}`),
};
