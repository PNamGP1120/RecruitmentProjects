const API_URL = 'http://192.168.1.95';

export async function getCurrentUser(token) {
  const response = await fetch(`${API_URL}/auth/user-info/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return await response.json();
}
