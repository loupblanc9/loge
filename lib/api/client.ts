const JSON_HEADERS = { "Content-Type": "application/json" };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, body, ...rest } = init ?? {};
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(path, {
    credentials: "include",
    ...rest,
    headers: {
      ...(json !== undefined && !isForm ? JSON_HEADERS : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : body,
  });
  const data = (await parseJsonSafe(res)) as T;
  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as { error: string }).error)
        : res.statusText;
    throw new ApiError(msg || "Erreur API", res.status, data);
  }
  return data;
}

export function buildDossiersQuery(params: Record<string, string | number | boolean | undefined | null | string[]>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") sp.append(k, String(item));
      });
    } else {
      sp.set(k, String(v));
    }
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
}
