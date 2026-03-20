import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// Issues
export const getAllIssues = () => API.get('/issues');
export const getIssue = (id) => API.get(`/issues/${id}`);
export const createIssue = (data) => API.post('/issues', data);
export const updateStatus = (id, data) => API.put(`/issues/${id}/status`, data);
export const upvoteIssue = (id) => API.put(`/issues/${id}/upvote`);
export const deleteIssue = (id) => API.delete(`/issues/${id}`);

export default API;