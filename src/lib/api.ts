import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Backend URL

// ✅ Signup Request
export const signup = async (data: { username: string; email: string; password: string }) => {
  return await axios.post(`${API_URL}/register`, data);
};

// ✅ Login Request
export const login = async (data: { email: string; password: string }) => {
  return await axios.post(`${API_URL}/login`, data);
};

// ✅ Fetch Current User (Using Token)
export const getCurrentUser = async (token: string) => {
  return await axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
