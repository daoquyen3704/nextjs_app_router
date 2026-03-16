const BASE_URL = 'http://127.0.0.1:8000';

// ─── Login ─────────────────────────────────────────────────────────────────
export type LoginPayload = { username: string; password: string };
export type LoginResponse = { access: string; refresh: string };

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail ?? 'Đăng nhập thất bại');
  }
  return data;
}

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

export async function registerApi(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const firstError = Object.values(data)?.[0];
    const msg = Array.isArray(firstError) ? firstError[0] : 'Đăng ký thất bại';
    throw new Error(msg as string);
  }
}


// Trả về access token mới, hoặc throw nếu refresh token cũng hết hạn
async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/refresh_token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    // Refresh token hết hạn → logout
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login'; // redirect cứng
    throw new Error('Session expired');
  }

  const data = await res.json();
  localStorage.setItem('access_token', data.access);
  // Lưu ý: Django SimpleJWT mặc định KHÔNG trả refresh mới,
  // trừ khi bật ROTATE_REFRESH_TOKENS = True trong settings
  if (data.refresh) {
    localStorage.setItem('refresh_token', data.refresh);
  }
  return data.access;
}


// Dùng hàm này thay cho fetch() trong mọi API call cần xác thực
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('access_token');

  // Gán Authorization header tự động
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  // Nếu 401 → thử refresh rồi retry 1 lần
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      res = await fetch(`${BASE_URL}${url}`, { ...options, headers: retryHeaders });
    } catch {
      // refreshAccessToken đã redirect → không cần làm gì thêm
      throw new Error('Session expired. Please login again.');
    }
  }

  return res;
}