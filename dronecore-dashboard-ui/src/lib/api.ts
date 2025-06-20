import axios from 'axios';

const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.error("VITE_API_URL is not defined in .env");
    // Fallback or throw an error
    return 'http://localhost:3001/api'; 
  }
  return apiUrl;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 