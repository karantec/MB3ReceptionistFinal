// src/services/idManagement.service.js
import axios from "axios";

const API_URL = "https://mb3-ivxh.onrender.com/api/IDManage";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const idManagementService = {
  // Create new ID record
  create: async (data) => {
    try {
      const response = await api.post("/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all ID records with filters
  getAll: async (filters = {}) => {
    try {
      const response = await api.get("/", { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ID record by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ID records by phone number
  getByPhone: async (phone) => {
    try {
      const response = await api.get(`/phone/${phone}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update ID record
  update: async (id, data) => {
    try {
      const response = await api.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete ID record (soft delete)
  delete: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get active ID records
  getActive: async () => {
    try {
      const response = await api.get("/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get expired ID records
  getExpired: async () => {
    try {
      const response = await api.get("/expired");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get ID statistics
  getStats: async () => {
    try {
      const response = await api.get("/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default idManagementService;
