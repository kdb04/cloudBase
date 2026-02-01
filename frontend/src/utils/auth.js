export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');
export const hasAuthToken = () => !!getAuthToken();

export const ADMIN_EMAIL = 'admin@example.com';
export const isAdminUser = (email) => email === ADMIN_EMAIL;
export const getUserRole = (email) => isAdminUser(email) ? 'admin' : 'user';

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` })
});
