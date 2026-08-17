import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginButton() {
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        console.log("Google login successful");

        try {
            const response = await axios.post(
               `${import.meta.env.VITE_API_URL}/api/auth/google`,
                {
                    token: credentialResponse.credential,
                }
            );

            console.log("Backend response:", response.data);

            const { token, role, fullName, email } = response.data;

            // Make sure backend returned everything
            if (!token || !role) {
                console.error("Invalid backend response:", response.data);
                alert("Login failed: invalid response from server.");
                return;
            }

            // Store login information
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("fullName", fullName || "");
            localStorage.setItem("email", email || "");

            console.log("Saved role:", role);
            console.log("Saved token:", localStorage.getItem("token"));

            // Navigate according to role
            if (role === "Admin") {
                console.log("Navigating to Admin Dashboard");
                navigate("/admin");
            } 
            else if (role === "Pharmacist") {
                console.log("Navigating to Pharmacist Dashboard");
                navigate("/pharmacist");
            } 
            else if (role === "Staff") {
                console.log("Navigating to Staff Dashboard");
                navigate("/staff");
            } 
            else {
                console.error("Unknown role:", role);
                alert("Unknown user role: " + role);
            }

        } catch (error) {
            console.error("Google login error:", error);

            if (error.response) {
                console.error("Backend error:", error.response.data);
                alert(
                    "Login failed: " +
                    (error.response.data?.message || "Backend error")
                );
            } else {
                alert("Unable to connect to backend.");
            }
        }
    };

    const handleError = () => {
        console.error("Google Login Failed");
        alert("Google Login Failed");
        
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
        />
    );
}
