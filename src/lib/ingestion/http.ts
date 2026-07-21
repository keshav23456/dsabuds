export async function fetchJson(
  url: string,
  { method = "GET", headers, body, timeoutMs = 8000 }: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
  } = {}
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { method, headers, body, signal: controller.signal });
    clearTimeout(timeoutId);

    const text = await res.text();
    let json: any;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      const msg = json?.error ?? json?.message ?? text ?? `HTTP ${res.status}`;
      const err: any = new Error(msg);
      err.status = res.status;
      err.body = text;
      throw err;
    }

    return json;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
