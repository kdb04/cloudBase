export const getAuthToken = () => sessionStorage.getItem('token');
export const setAuthToken = (token) => {
  localStorage.removeItem('token'); // Clear token from localStorage if it exists
  sessionStorage.setItem('token', token);
} 
export const removeAuthToken = () => sessionStorage.removeItem('token');
export const hasAuthToken = () => !!getAuthToken();

export const getEmailFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)).email ?? null;
  } catch {
    return null;
  }
};

export const ADMIN_EMAIL = 'admin@example.com';
export const isAdminUser = (email) => email === ADMIN_EMAIL;
export const getUserRole = (email) => isAdminUser(email) ? 'admin' : 'user';

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return{
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
