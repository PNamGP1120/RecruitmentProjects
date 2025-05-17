const API_URL = 'http://192.168.1.95:8000'; // ✅ Thay bằng IP thật của máy bạn

// 🔐 Đăng nhập
export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Login failed');
  }

  return data; // { access, refresh }
}

// 👤 Lấy thông tin người dùng hiện tại
export async function getCurrentUser(token) {
  const res = await fetch(`${API_URL}/auth/user-info/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Failed to fetch user info');
  }

  return data;
}

// 🆕 Đăng ký tài khoản mới
export async function register({ username, email, password, password2 }) {
  const res = await fetch(`${API_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, password2 }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
}
