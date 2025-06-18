import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Users
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Tasks
export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (taskData: any) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id: string, taskData: any) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

// Clients
export const getClients = async () => {
  const response = await api.get('/clients');
  return response.data;
};

export const createClient = async (clientData: any) => {
  const response = await api.post('/clients', clientData);
  return response.data;
};

// Cars
export const getCars = async () => {
  const response = await api.get('/cars');
  return response.data;
};

export const createCar = async (carData: any) => {
  const response = await api.post('/cars', carData);
  return response.data;
};

// Drones
export const getDrones = async () => {
  const response = await api.get('/drones');
  return response.data;
};

export const createDrone = async (droneData: any) => {
  const response = await api.post('/drones', droneData);
  return response.data;
};

// Bank Entries
export const getBankEntries = async () => {
  const response = await api.get('/bank-entries');
  return response.data;
};

export const createBankEntry = async (entryData: any) => {
  const response = await api.post('/bank-entries', entryData);
  return response.data;
};

// Client Debts
export const getClientDebts = async () => {
  const response = await api.get('/client-debts');
  return response.data;
};

export const createClientDebt = async (debtData: any) => {
  const response = await api.post('/client-debts', debtData);
  return response.data;
};

// Client Payments
export const getClientPayments = async () => {
  const response = await api.get('/client-payments');
  return response.data;
};

export const createClientPayment = async (paymentData: any) => {
  const response = await api.post('/client-payments', paymentData);
  return response.data;
};

// Images
export const uploadImage = async (imageData: any) => {
  const response = await api.post('/images', imageData);
  return response.data;
}; 