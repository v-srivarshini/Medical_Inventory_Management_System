import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/notifications`;

export const getNotifications = (token) => {
    return axios.get(API, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getUnreadNotifications = (token) => {
    return axios.get(`${API}/unread/1`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const markAsRead = (id, token) => {
    return axios.put(`${API}/${id}/read`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const deleteNotification = (id, token) => {
    return axios.delete(`${API}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};