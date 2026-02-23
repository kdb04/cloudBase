export const getAuthToken = () => sessionStorage.getItem('token');
export const setAuthToken = (token) => {
  localStorage.removeItem('token'); // Clear token from localStorage if it exists
  sessionStorage.setItem('token', token);
} 
export const removeAuthToken = () => sessionStorage.removeItem('token');
export const hasAuthToken = () => !!getAuthToken();

const decodePayload = (token) => {
  if(!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const getEmailFromToken = () => {
  return decodePayload(getAuthToken())?.email || null;
};

export const getRoleFromToken = () => {
  return decodePayload(getAuthToken())?.role || null;
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return{
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
