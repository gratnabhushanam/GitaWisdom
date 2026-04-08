const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.yourdomain.com';

export async function apiGet(path, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function apiPost(path, body, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function apiPut(path, body, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function apiDelete(path, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export { API_BASE };
