export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export async function api<T>(
  url: string,
  method: HttpMethod = 'GET',
  body?: unknown,
  token?: string | null,
): Promise<T> {
  const authToken =
    token ??
    (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null)

  const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `HTTP ${res.status}`)
  }

  if (res.status === 204) return {} as T

  return res.json() as Promise<T>
}
