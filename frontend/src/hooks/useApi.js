const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function getMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error("Failed to load metrics");
  return res.json();
}
