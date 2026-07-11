// src/services/company.service.js
import axios from "axios";

const API_URL = "http://localhost:8000/api/Company";

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

export const companyService = {
  // Create new company
  create: async (data) => {
    try {
      const response = await api.post("/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all companies with filters
  getAll: async (filters = {}) => {
    try {
      const response = await api.get("/", { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get company by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update company
  update: async (id, data) => {
    try {
      const response = await api.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete company
  delete: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all industries
  getIndustries: async () => {
    try {
      const response = await api.get("/industries");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search companies
  search: async (searchTerm) => {
    try {
      const response = await api.get("/search", { params: { searchTerm } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get recent companies
  getRecent: async (limit = 5) => {
    try {
      const response = await api.get("/recent", { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get companies by industry
  getByIndustry: async (industry) => {
    try {
      const response = await api.get(`/industry/${industry}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default companyService;
