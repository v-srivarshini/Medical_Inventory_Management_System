import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/inventory`;

export const getInventory = (token) => {
    return axios.get(API, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const updateInventory = (id, data, token) => {
    return axios.put(
        `${API}/${id}`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};