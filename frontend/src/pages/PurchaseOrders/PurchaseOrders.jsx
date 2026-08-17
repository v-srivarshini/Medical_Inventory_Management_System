import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Medicines/Medicines.css";
import "../Medicines/MedicineFormModal.css";
import "./PurchaseOrdersTable.css";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye
} from "react-icons/fa";

import PurchaseCards from "./PurchaseCards";
import PurchaseSearch from "./PurchaseSearch";

const PurchaseOrders = () => {

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewOrder, setViewOrder] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const ordersPerPage = 6;

    const [formData, setFormData] = useState({
        medicineId: "",
        supplierId: "",
        quantity: "",
        purchaseDate: "",
        status: "Pending"
    });

    const token = localStorage.getItem("token");

    const fetchPurchaseOrders = async () => {

        try {

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/purchase-orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPurchaseOrders(response.data);

        } catch (err) {
            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Failed to load purchase orders"
            });
        }
    };

    const fetchMedicines = async () => {

        try {

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/medicines`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMedicines(response.data);

        } catch (err) {
            console.log(err);
        }
    };

    const fetchSuppliers = async () => {

        try {

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/suppliers`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuppliers(response.data);

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);

            await Promise.all([
                fetchPurchaseOrders(),
                fetchMedicines(),
                fetchSuppliers()
            ]);

            setLoading(false);
        };

        loadData();

    }, []);

    // Reset to page 1 whenever the search term or status filter changes.
    useEffect(() => {

        setCurrentPage(1);

    }, [search, activeFilter]);

    // NOTE: filtering here is entirely client-side, on purpose. The
    // backend's /api/purchase-orders/search only matches against the
    // status field (findByStatusContainingIgnoreCase), but the search
    // box promises "medicine, supplier or status" — so instead of
    // calling that limited endpoint, the full list is fetched once and
    // filtered here across all three fields.
    const searchPurchase = (keyword) => {
        setSearch(keyword);
    };

    const filteredOrders = purchaseOrders.filter((order) => {

        const term = search.toLowerCase();

        const matchesSearch =
            order.medicine?.medicineName?.toLowerCase().includes(term) ||
            order.supplier?.supplierName?.toLowerCase().includes(term) ||
            order.status?.toLowerCase().includes(term);

        const matchesFilter =
            activeFilter === "ALL" || order.status === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

    const currentOrders = filteredOrders.slice(
        indexOfFirstOrder,
        indexOfLastOrder
    );

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // Add / Update Purchase Order
    const handleSave = async () => {

        try {

            const payload = {
                medicineId: Number(formData.medicineId),
                supplierId: Number(formData.supplierId),
                quantity: Number(formData.quantity),
                purchaseDate: formData.purchaseDate,
                status: formData.status
            };

            if (selectedOrder) {

                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/purchase-orders/${selectedOrder.purchaseId}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                Swal.fire({
                    icon: "success",
                    title: "Purchase Order Updated",
                    confirmButtonColor: "#14968d"
                });

            } else {

                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/purchase-orders`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                Swal.fire({
                    icon: "success",
                    title: "Purchase Order Created",
                    confirmButtonColor: "#14968d"
                });

            }

            fetchPurchaseOrders();

            setShowModal(false);

            setSelectedOrder(null);

            setFormData({
                medicineId: "",
                supplierId: "",
                quantity: "",
                purchaseDate: "",
                status: "Pending"
            });

        } catch (err) {

            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Operation Failed",
                text: err.response?.data?.message || "Something went wrong"
            });

        }
    };

    // Edit Purchase Order
    const editOrder = (order) => {

        setSelectedOrder(order);

        setFormData({
            medicineId: order.medicine?.medicineId || "",
            supplierId: order.supplier?.supplierId || "",
            quantity: order.quantity,
            purchaseDate: order.purchaseDate,
            status: order.status
        });

        setShowModal(true);
    };

    // Delete Purchase Order
    const deleteOrder = async (id) => {

        const result = await Swal.fire({
            title: "Delete Purchase Order?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#14968d",
            confirmButtonText: "Delete"
        });

        if (!result.isConfirmed) return;

        try {

            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/purchase-orders/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                icon: "success",
                title: "Purchase Order Deleted",
                confirmButtonColor: "#14968d"
            });

            fetchPurchaseOrders();

        } catch (err) {

            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Delete Failed"
            });

        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-success"></div>
                <h4>Loading Purchase Orders...</h4>
            </div>
        );
    }

    return (
        <div className="medicine-page">

            {/* Header */}
            <div className="medicine-header">
                <div>
                    <h1>🛒 Purchase Orders Dashboard</h1>
                    <p>Track and manage supplier purchase orders</p>
                </div>

                <button
                    className="add-btn"
                    onClick={() => {
                        setSelectedOrder(null);
                        setFormData({
                            medicineId: "",
                            supplierId: "",
                            quantity: "",
                            purchaseDate: "",
                            status: "Pending"
                        });
                        setShowModal(true);
                    }}
                >
                    <FaPlus /> Add Purchase Order
                </button>
            </div>

            <PurchaseCards purchaseOrders={purchaseOrders} />

            <PurchaseSearch
                search={search}
                searchPurchase={searchPurchase}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
            />

            {/* Table */}
            <div className="card shadow border-0 rounded-4 purchase-orders-table-wrapper">
                <div className="card-body p-0">

                    <table className="table table-hover align-middle mb-0">

                        <thead style={{ background: "#14968d", color: "white" }}>
                            <tr>
                                <th>ID</th>
                                <th>Medicine</th>
                                <th>Supplier</th>
                                <th>Quantity</th>
                                <th>Purchase Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {currentOrders.length > 0 ? (

                                currentOrders.map((order) => (

                                    <tr key={order.purchaseId}>

                                        <td>{order.purchaseId}</td>

                                        <td title={order.medicine?.medicineName}>
                                            {order.medicine?.medicineName || "—"}
                                        </td>

                                        <td title={order.supplier?.supplierName}>
                                            {order.supplier?.supplierName || "—"}
                                        </td>

                                        <td>{order.quantity}</td>

                                        <td>{order.purchaseDate}</td>

                                        <td>
                                            <span
                                                className={`status-badge ${order.status?.toLowerCase()}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">

                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => setViewOrder(order)}
                                                >
                                                    <FaEye />
                                                </button>

                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => editOrder(order)}
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => deleteOrder(order.purchaseId)}
                                                >
                                                    <FaTrash />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td colSpan="7" className="text-center p-5">
                                        No Purchase Orders Found
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
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>

                    </div>

                </div>
            </div>

            {/* Modal for Add / Edit */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="medicine-modal wide">

                        <h3>
                            {selectedOrder ? "Edit Purchase Order" : "Add Purchase Order"}
                        </h3>

                        <div className="form-grid">

                            <div className="form-field">
                                <label>Medicine</label>
                                <select
                                    className="supplier-select"
                                    value={formData.medicineId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            medicineId: e.target.value
                                        })
                                    }
                                >
                                    <option value="">Select Medicine</option>

                                    {medicines.map((medicine) => (
                                        <option
                                            key={medicine.medicineId}
                                            value={medicine.medicineId}
                                        >
                                            {medicine.medicineName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Supplier</label>
                                <select
                                    className="supplier-select"
                                    value={formData.supplierId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            supplierId: e.target.value
                                        })
                                    }
                                >
                                    <option value="">Select Supplier</option>

                                    {suppliers.map((supplier) => (
                                        <option
                                            key={supplier.supplierId}
                                            value={supplier.supplierId}
                                        >
                                            {supplier.supplierName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 200"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            quantity: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="form-field">
                                <label>Purchase Date</label>
                                <input
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            purchaseDate: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>Status</label>
                                <select
                                    className="supplier-select"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            status: e.target.value
                                        })
                                    }
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-3">

                            <button
                                className="modal-cancel-btn"
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedOrder(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="modal-save-btn"
                                onClick={handleSave}
                            >
                                Save
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* View Drawer */}
            {viewOrder && (
                <div className="drawer-overlay">

                    <div className="drawer">

                        <div className="drawer-header">

                            <h2>🛒 Order #{viewOrder.purchaseId}</h2>

                            <button
                                className="close-btn"
                                onClick={() => setViewOrder(null)}
                            >
                                ✖
                            </button>

                        </div>

                        <div className="drawer-content">

                            <div className="drawer-card">

                                <h5>Purchase Order Details</h5>

                                <p>
                                    <strong>Order ID :</strong> {viewOrder.purchaseId}
                                </p>

                                <p>
                                    <strong>Medicine :</strong> {viewOrder.medicine?.medicineName}
                                </p>

                                <p>
                                    <strong>Supplier :</strong> {viewOrder.supplier?.supplierName}
                                </p>

                                <p>
                                    <strong>Quantity :</strong> {viewOrder.quantity}
                                </p>

                                <p>
                                    <strong>Purchase Date :</strong> {viewOrder.purchaseDate}
                                </p>

                                <p>
                                    <strong>Status :</strong> {viewOrder.status}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default PurchaseOrders;
