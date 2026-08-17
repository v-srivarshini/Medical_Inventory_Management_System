import React, { useState } from "react";
import axios from "axios";
import "./ChatBot.css";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hi! 👋 I'm MediStock Assistant. Ask me anything about medicines."
        }
    ]);

    const handleSend = async () => {
        if (!message.trim() || loading) {
            return;
        }

        const question = message.trim();

        // Add user's message immediately
        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text: question
            }
        ]);

        setMessage("");
        setLoading(true);

        try {
            // Get JWT token from localStorage
            const token = localStorage.getItem("token");

            if (!token) {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        text: "Please login again before using the MediStock Assistant."
                    }
                ]);

                setLoading(false);
                return;
            }

            console.log("Sending chatbot request...");

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/chatbot`,
                {
                    message: question
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Chatbot response:", response.data);

            // Add AI response
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: response.data.reply
                }
            ]);

        } catch (error) {
            console.error("CHATBOT ERROR:", error);

            if (error.response) {
                console.error(
                    "Status:",
                    error.response.status
                );

                console.error(
                    "Response:",
                    error.response.data
                );
            }

            let errorMessage =
                "Sorry, I couldn't connect to the MediStock Assistant right now.";

            if (error.response?.status === 401) {
                errorMessage =
                    "Your session has expired. Please login again.";
            }

            if (error.response?.status === 403) {
                errorMessage =
                    "You don't have permission to use the MediStock Assistant.";
            }

            if (error.response?.status === 500) {
                errorMessage =
                    "The MediStock Assistant is temporarily unavailable.";
            }

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: errorMessage
                }
            ]);

        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <>
            {/* CHAT WINDOW */}

            {isOpen && (
                <div className="staff-chatbot">

                    {/* HEADER */}

                    <div className="chatbot-header">

                        <div>
                            <h3>🤖 MediStock Assistant</h3>
                            <span>Medicine Support</span>
                        </div>

                        <button
                            className="chatbot-close"
                            onClick={() => setIsOpen(false)}
                        >
                            ×
                        </button>

                    </div>


                    {/* MESSAGES */}

                    <div className="chatbot-messages">

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-message ${msg.sender}`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {loading && (
                            <div className="chat-message bot">
                                Thinking... 🤔
                            </div>
                        )}

                    </div>


                    {/* INPUT AREA */}

                    <div className="chatbot-input-area">

                        <input
                            type="text"
                            placeholder="Ask about a medicine..."
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />

                        <button
                            onClick={handleSend}
                            disabled={
                                loading ||
                                !message.trim()
                            }
                        >
                            ➤
                        </button>

                    </div>

                </div>
            )}


            {/* FLOATING BUTTON */}

            <button
                className="chatbot-floating-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? "×" : "🤖"}
            </button>
        </>
    );
}
