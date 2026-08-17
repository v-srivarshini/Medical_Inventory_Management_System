import axios from "axios";

// Public APIs
const AUTH_API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,
});

// Protected APIs
const PROTECTED_API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export const registerUser = (userData) => {
    return AUTH_API.post("/register", userData);
};

export const loginUser = (loginData) => {
    return AUTH_API.post("/login", loginData);
};

export const getProtectedData = (token) => {
    return PROTECTED_API.get("/test", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// ✅ Dashboard API
// role: "ADMIN" | "PHARMACIST" | "STAFF" (defaults to ADMIN)
// userId: only needed for PHARMACIST, to scope the notifications list
export const getDashboardData = (token, role = "ADMIN", userId) => {

    const params = { role };

    if (userId) {
        params.userId = userId;
    }

    return PROTECTED_API.get("/dashboard", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params,
    });
};

// ✅ Analytics API
export const getAnalyticsData = (token) => {
    return PROTECTED_API.get("/analytics", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};