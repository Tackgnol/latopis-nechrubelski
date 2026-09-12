async function csrfToken(): Promise<string> {
  const res = await fetch("/api/csrf-token");
  const { token } = (await res.json()) as { token: string };
  return token;
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return unwrap<T>(await fetch(path));
}

export async function apiPost<T>(path: string): Promise<T> {
  const token = await csrfToken();
  return unwrap<T>(await fetch(path, { method: "POST", headers: { "csrf-token": token } }));
}
