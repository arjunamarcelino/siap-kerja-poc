const API_URL =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || "http://api:8080" // SSR: Docker network
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"; // Browser

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const { headers: customHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...customHeaders },
    ...restOptions,
  });
  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
