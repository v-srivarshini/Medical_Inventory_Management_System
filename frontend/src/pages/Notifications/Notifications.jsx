import { useEffect, useState } from "react";
import "../Medicines/Medicines.css";
import "./Notifications.css";

import { FaTrash, FaEnvelopeOpen } from "react-icons/fa";

import {
    getNotifications,
    markAsRead,
    deleteNotification
} from "../../services/notificationService";

const getTypeClass = (type = "") => type.toLowerCase();

function Notifications() {

    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const notificationsPerPage = 8;

    const token = localStorage.getItem("token");

    const loadNotifications = async () => {

        try {

            const response = await getNotifications(token);

            setNotifications(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        loadNotifications();

    }, []);

    // Keep currentPage valid if the list shrinks (e.g. after deleting
    // the last item on the last page).
    useEffect(() => {

        const totalPages = Math.ceil(notifications.length / notificationsPerPage);

        if (currentPage > totalPages) {
            setCurrentPage(totalPages > 0 ? totalPages : 1);
        }

    }, [notifications, currentPage]);

    const handleRead = async (id) => {

        await markAsRead(id, token);

        loadNotifications();

    };

    const handleDelete = async (id) => {

        await deleteNotification(id, token);

        loadNotifications();

    };

    const unread = notifications.filter(n => !n.isRead).length;
    const read = notifications.filter(n => n.isRead).length;
    const lowStock = notifications.filter(
        n => n.notificationType === "LOW_STOCK"
    ).length;

    const expiry = notifications.filter(
        n => n.notificationType === "EXPIRY"
    ).length;

    // Pagination
    const indexOfLast = currentPage * notificationsPerPage;
    const indexOfFirst = indexOfLast - notificationsPerPage;
    const currentNotifications = notifications.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(notifications.length / notificationsPerPage);

    return (
        <div className="notification-page">
            <div className="medicine-page">

                <div className="notification-content">

                    {/* Header */}

                    <div className="medicine-header">

                        <div>

                            <h1>🔔 Notifications Dashboard</h1>

                            <p>Manage system alerts efficiently</p>

                        </div>

                    </div>

                    {/* Dashboard Cards */}

                    <div className="dashboard-cards">

                        <div className="dashboard-card total">

                            <div className="card-icon">🔔</div>

                            <h5>Total Notifications</h5>

                            <h2>{notifications.length}</h2>

                        </div>

                        <div className="dashboard-card low">

                            <div className="card-icon">⚠️</div>

                            <h5>Unread</h5>

                            <h2>{unread}</h2>

                        </div>

                        <div className="dashboard-card supplier">

                            <div className="card-icon">✔️</div>

                            <h5>Read</h5>

                            <h2>{read}</h2>

                        </div>

                        <div className="dashboard-card low">

                            <div className="card-icon">❌</div>

                            <h5>Low Stock</h5>

                            <h2>{lowStock}</h2>

                        </div>

                        <div className="dashboard-card low">

                            <div className="card-icon">🔔</div>

                            <h5>Expiry Alerts</h5>

                            <h2>{expiry}</h2>

                        </div>

                    </div>

                    {/* Table */}

                    <div className="card shadow border-0 rounded-4 notifications-table-wrapper">

                        <div className="card-body p-0">

                            <table className="table table-hover align-middle mb-0">

                                <thead style={{ background: "#14968d", color: "white" }}>

                                    <tr>

                                        <th>Message</th>

                                        <th>Type</th>

                                        <th>Status</th>

                                        <th>Date</th>

                                        <th>Actions</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {currentNotifications.length > 0 ? (

                                        currentNotifications.map((notification) => (

                                            <tr key={notification.notificationId}>

                                                <td title={notification.message}>
                                                    {notification.message}
                                                </td>

                                                <td>

                                                    <span className={`type-badge ${getTypeClass(notification.notificationType)}`}>

                                                        {notification.notificationType}

                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${notification.isRead
                                                                ? "instock"
                                                                : "low"
                                                            }`}
                                                    >

                                                        {notification.isRead
                                                            ? "Read"
                                                            : "Unread"}

                                                    </span>

                                                </td>

                                                <td>

                                                    {new Date(
                                                        notification.createdAt
                                                    ).toLocaleString()}

                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        {!notification.isRead && (

                                                            <button
                                                                className="btn btn-info btn-sm"
                                                                onClick={() =>
                                                                    handleRead(notification.notificationId)
                                                                }
                                                            >

                                                                <FaEnvelopeOpen />

                                                            </button>

                                                        )}

                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() =>
                                                                handleDelete(notification.notificationId)
                                                            }
                                                        >

                                                            <FaTrash />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="text-center p-5"
                                            >

                                                No Notifications Found

                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                            {/* Pagination */}

                            <div className="pagination-container">

                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        className={currentPage === index + 1 ? "active-page" : ""}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    disabled={
                                        currentPage === totalPages || totalPages === 0
                                    }
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Notifications;
