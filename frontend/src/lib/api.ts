const API_BASE_URL = 'http://localhost:3001/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authAPI = {
  login: (email: string, password: string) => 
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (data: { email: string; username: string; password: string; native_language: string; target_language: string }) => 
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  sendEmailCode: (email: string, type: 'register' | 'login' | 'reset_password') => 
    fetchAPI('/auth/email/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    }),
  
  verifyEmailCode: (data: {
    email: string;
    code: string;
    type: 'register' | 'login' | 'reset_password';
    username?: string;
    native_language?: string;
    target_language?: string;
  }) => 
    fetchAPI('/auth/email/verify-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getOAuthRedirect: (provider: 'google' | 'github') => 
    fetchAPI(`/auth/oauth/${provider}/redirect`, {
      method: 'POST',
    }),
  
  handleOAuthCallback: (provider: 'google' | 'github', code: string, state: string) => 
    fetchAPI(`/auth/oauth/${provider}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`),
  
  getProfile: () => fetchAPI('/auth/profile'),
  
  updateProfile: (data: {
    username?: string;
    native_language?: string;
    target_language?: string;
    avatar_url?: string;
  }) => 
    fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  changePassword: (old_password: string, new_password: string) => 
    fetchAPI('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password }),
    }),
  
  getAccountInfo: () => fetchAPI('/auth/account'),
  
  unlinkOAuth: (provider: string) => 
    fetchAPI(`/auth/unlink-oauth/${provider}`, {
      method: 'DELETE',
    }),
  
  resetPassword: (email: string, code: string, newPassword: string) =>
    fetchAPI('/auth/password-reset/reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password: newPassword }),
    }),
};
