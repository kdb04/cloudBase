import { getAuthToken, getAuthHeaders } from '../utils/auth';

export const useAuth = () => {
  const token = getAuthToken();
  const isAuthenticated = !!token;

  const authenticatedFetch = async (url, options = {}) => {
    if (!token) throw new Error('Not authenticated');
    return fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers }
    });
  };

  return { token, isAuthenticated, authenticatedFetch };
};
