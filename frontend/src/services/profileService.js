import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/profile`;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getProfile = () => {
  return axios.get(API, authHeader());
};

export const updateProfile = (data) => {
  return axios.put(API, data, authHeader());
};

export const changePassword = (data) => {
  return axios.put(`${API}/change-password`, data, authHeader());
};