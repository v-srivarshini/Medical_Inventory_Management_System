import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/chatbot`;

export const askChatbot = async (message) => {

    const token = localStorage.getItem("token");

    return axios.post(
        API,
        {
            message
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

};