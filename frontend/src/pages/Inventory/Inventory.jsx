import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Medicines/Medicines.css";
import "../Medicines/MedicineFormModal.css";
import "../Notifications/Notifications.css";
import "./InventoryTable.css";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye
} from "react-icons/fa";

import InventoryCards from "./InventoryCards";
import InventorySearch from "./InventorySearch";

const Inventory = () => {

    const [inventory, setInventory] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [viewInventory, setViewInventory] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const inventoryPerPage = 6;
    const role = localStorage.getItem("roleName");

    const [formData, setFormData] = useState({
        medicineId: "",
        quantityAvailable: "",
        minimumStock: ""
    });

    const fetchInventory = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/inventory`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setInventory(response.data);

        } catch (err) {
            console.log(err);
        }
    };

    const fetchMedicines = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:8080/api/medicines",
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

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);

            await Promise.all([
                fetchInventory(),
                fetchMedicines()
            ]);

            setLoading(false);
        };

        loadData();

    }, []);

    // Reset to page 1 whenever the search term or filter changes, so
    // you're never left staring at a page that no longer has any rows.
    useEffect(() => {

        setCurrentPage(1);

    }, [search, activeFilter]);

    const searchInventory = async (keyword) => {

        setSearch(keyword);

        try {

            const token = localStorage.getItem("token");

            const url =
                keyword.trim() === ""
                    ? "http://localhost:8080/api/inventory"
                    : `http://localhost:8080/api/inventory/search?keyword=${keyword}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setInventory(response.data);

        } catch (err) {
            console.log(err);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            if (selectedInventory) {
                // Update Inventory
                await axios.put(
                    `http://localhost:8080/api/inventory/${selectedInventory.inventoryId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                Swal.fire(
                    "Success!",
                    "Inventory updated successfully.",
                    "success"
                );
            } else {
                // Add Inventory
                await axios.post(
                    "http://localhost:8080/api/inventory",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                Swal.fire(
                    "Success!",
                    "Inventory added successfully.",
                    "success"
                );
            }

            fetchInventory();

            setShowModal(false);

            setSelectedInventory(null);

            setFormData({
                medicineId: "",
                quantityAvailable: "",
                minimumStock: "",
            });

        } catch (err) {
            console.log(err);

            Swal.fire(
                "Error!",
                err.response?.data?.message || "Something went wrong",
                "error"
            );
        }
    };

    const editInventory = (item) => {

        setSelectedInventory(item);

        setFormData({
            medicineId: item.medicineId,
            quantityAvailable: item.quantityAvailable,
            minimumStock: item.minimumStock
        });

        setShowModal(true);
    };

    const deleteInventory = async (id) => {

        const result = await Swal.fire({
            title: "Delete Inventory?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#14968d",
            confirmButtonText: "Delete"
        });

        if (!result.isConfirmed) return;

        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `http://localhost:8080/api/inventory/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire(
                "Deleted!",
                "Inventory deleted successfully.",
                "success"
            );

            fetchInventory();

        } catch (err) {

            console.log(err);

            Swal.fire(
                "Error!",
                "Delete Failed",
                "error"
            );
        }
    };

    const filteredInventory = inventory.filter((item) => {

        const matchesSearch =
            item.medicineName?.toLowerCase().includes(search.toLowerCase());

        let matchesFilter;

        switch (activeFilter) {

            case "INSTOCK":
                matchesFilter =
                    item.quantityAvailable > item.minimumStock;
                break;

            case "LOW":
                matchesFilter =
                    item.quantityAvailable > 0 &&
                    item.quantityAvailable <= item.minimumStock;
                break;

            case "OUT":
                matchesFilter =
                    item.quantityAvailable === 0;
                break;

            default:
                matchesFilter = true;
        }

        return matchesSearch && matchesFilter;
    });

    const indexOfLastInventory = currentPage * inventoryPerPage;

    const indexOfFirstInventory =
        indexOfLastInventory - inventoryPerPage;

    const currentInventory = filteredInventory.slice(
        indexOfFirstInventory,
        indexOfLastInventory
    );

    const totalPages = Math.ceil(
        filteredInventory.length / inventoryPerPage
    );

    if (loading) {

        return (
            <div className="loading-container">
                <div className="spinner-border text-success"></div>
                <h4>Loading Inventory...</h4>
            </div>
        );

    }
    return (
        <div className="medicine-page">
            <div className="notification-content">
                <div className="medicine-header">
                    <div>
                        <h1>📦 Inventory Dashboard</h1>
                        <p>Manage inventory stock efficiently</p>
                    </div>
                    {(role === "Admin" || role === "Pharmacist" ) && (
                        <button
                            className="add-btn"
                            onClick={() => {
                                setSelectedInventory(null);

                                setFormData({
                                    medicineId: "",
                                    quantityAvailable: "",
                                    minimumStock: ""
                                });

                                setShowModal(true);
                            }}
                        >
                            <FaPlus /> Add Inventory
                        </button>
                    )}
                </div>

                <InventoryCards inventory={inventory} />

                <InventorySearch
                    search={search}
                    searchInventory={searchInventory}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                />
                <div className="card shadow border-0 rounded-4 inventory-table-wrapper">
                    <div className="card-body p-0">

                        <table className="table table-hover align-middle mb-0">

                            <thead style={{ background: "#14968d", color: "white" }}>
                                <tr>

                                    <th>ID</th>
                                    <th>Medicine</th>
                                    <th>Available</th>
                                    <th>Minimum</th>
                                    <th>Status</th>
                                    <th>Updated</th>
                                    <th>Actions</th>

                                </tr>
                            </thead>

                            <tbody>

                                {currentInventory.length > 0 ? (

                                    currentInventory.map((item) => {

                                        const progress = Math.min(
                                            (item.quantityAvailable / 200) * 100,
                                            100
                                        );

                                        return (

                                            <tr key={item.inventoryId}>

                                                <td>{item.inventoryId}</td>

                                                <td title={item.medicineName}>
                                                    {item.medicineName}
                                                </td>

                                                <td>

                                                    <div className="stock-box">

                                                        <div className="progress">

                                                            <div
                                                                className={`progress-bar ${item.quantityAvailable <= item.minimumStock
                                                                        ? "bg-danger"
                                                                        : "bg-success"
                                                                    }`}
                                                                style={{
                                                                    width: `${progress}%`
                                                                }}
                                                            ></div>

                                                        </div>

                                                        <div className="stock-number">
                                                            {item.quantityAvailable}
                                                        </div>

                                                    </div>

                                                </td>

                                                <td>{item.minimumStock}</td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${item.quantityAvailable <= item.minimumStock
                                                                ? "low"
                                                                : "instock"
                                                            }`}
                                                    >

                                                        {item.quantityAvailable <= item.minimumStock
                                                            ? "Low Stock"
                                                            : "In Stock"}

                                                    </span>

                                                </td>

                                                <td>{item.lastUpdated}</td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="btn btn-info btn-sm"
                                                            onClick={() => setViewInventory(item)}
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        {(role === "Admin" || role === "Pharmacist" || role === "Staff") && (
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => editInventory(item)}
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                        )}
                                                        {(role === "Admin" || role === "Pharmacist") && (
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => deleteInventory(item.inventoryId)}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    })

                                ) : (

                                    <tr>

                                        <td colSpan="7" className="text-center p-5">
                                            No Inventory Found
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>
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
                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="medicine-modal wide">

                            <h3>
                                {selectedInventory ? "Edit Inventory" : "Add Inventory"}
                            </h3>

                            <div className="form-grid">

                                <div className="form-field full-width">
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
                                    <label>Quantity Available</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 150"
                                        value={formData.quantityAvailable}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quantityAvailable: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Minimum Stock</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 20"
                                        value={formData.minimumStock}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                minimumStock: e.target.value
                                            })
                                        }
                                    />
                                </div>

                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-3">

                                <button
                                    className="modal-cancel-btn"
                                    onClick={() => setShowModal(false)}
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

                {viewInventory && (

                    <div className="drawer-overlay">

                        <div className="drawer">

                            <div className="drawer-header">

                                <h2>📦 {viewInventory.medicineName}</h2>

                                <button
                                    className="close-btn"
                                    onClick={() => setViewInventory(null)}
                                >
                                    ✖
                                </button>

                            </div>

                            <div className="drawer-content">

                                <div className="drawer-card">

                                    <h5>Inventory Details</h5>

                                    <p>
                                        <strong>Inventory ID :</strong>
                                        {" "}
                                        {viewInventory.inventoryId}
                                    </p>

                                    <p>
                                        <strong>Medicine :</strong>
                                        {" "}
                                        {viewInventory.medicineName}
                                    </p>

                                    <p>
                                        <strong>Available Quantity :</strong>
                                        {" "}
                                        {viewInventory.quantityAvailable}
                                    </p>

                                    <p>
                                        <strong>Minimum Stock :</strong>
                                        {" "}
                                        {viewInventory.minimumStock}
                                    </p>

                                    <p>
                                        <strong>Last Updated :</strong>
                                        {" "}
                                        {viewInventory.lastUpdated}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>
        </div>
    );
}

export default Inventory;
