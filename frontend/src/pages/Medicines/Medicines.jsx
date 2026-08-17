import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Medicines.css";
import "./MedicineFormModal.css";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaCapsules
} from "react-icons/fa";
import DashboardCards from "./DashboardCards";
import SearchFilter from "./SearchFilter";

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [showModal, setShowModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null); // for Edit
    const [viewMedicine, setViewMedicine] = useState(null); // for View drawer
    const [currentPage, setCurrentPage] = useState(1);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("roleName");
    const medicinesPerPage = 6;

    const [formData, setFormData] = useState({
        medicineName: "",
        category: "",
        batchNumber: "",
        quantity: "",
        price: "",
        supplierId: "",
        manufacturingDate: "",
        expiryDate: ""
    });

    const fetchMedicines = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/medicines`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMedicines(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/suppliers`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(response.data);

            setSuppliers(response.data);

        } catch (err) {
            console.log(err);
        }
    };

    // Corrected loading lifecycle inside useEffect
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([fetchMedicines(), fetchSuppliers()]);
            setLoading(false);
        };

        loadInitialData();
    }, []);

    const searchMedicine = async (keyword) => {
        setSearch(keyword);

        try {
            const token = localStorage.getItem("token");

            const url =
                keyword.trim() === ""
                    ? `${import.meta.env.VITE_API_URL}/api/medicines`
                    : `${import.meta.env.VITE_API_URL}/api/medicines/search?keyword=${keyword}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMedicines(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            if (selectedMedicine) {
                // UPDATE
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/medicines/${selectedMedicine.medicineId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                Swal.fire({
                    icon: "success",
                    title: "Medicine Updated",
                    text: "Medicine updated successfully.",
                    confirmButtonColor: "#14968d"
                });
            } else {
                // ADD
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/medicines`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                Swal.fire({
                    icon: "success",
                    title: "Medicine Added",
                    text: "Medicine has been added successfully.",
                    confirmButtonColor: "#14968d"
                });
            }

            fetchMedicines();
            setShowModal(false);
            setSelectedMedicine(null);
        } catch (err) {
            console.log("ERROR:", err);
            console.log("STATUS:", err.response?.status);
            console.log("DATA:", err.response?.data);
            alert(err.response?.data?.message || JSON.stringify(err.response?.data));
        }
    };

    const deleteMedicine = async (id) => {
        const result = await Swal.fire({
            title: "Delete Medicine?",
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
                `${import.meta.env.VITE_API_URL}/api/medicines/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Medicine deleted successfully.",
                confirmButtonColor: "#14968d"
            });

            fetchMedicines();
        } catch (err) {
            console.log(err);
            alert("Delete Failed");
        }
    };

    const editMedicine = (medicine) => {
        setSelectedMedicine(medicine);
        setFormData({
            medicineName: medicine.medicineName,
            category: medicine.category,
            batchNumber: medicine.batchNumber,
            quantity: medicine.quantity,
            price: medicine.price,
            supplierId: medicine.supplier?.supplierId || "",
            manufacturingDate: medicine.manufacturingDate || "",
            expiryDate: medicine.expiryDate || ""
        });
        setShowModal(true);
    };

    const filteredMedicines = medicines.filter((medicine) => {
        const matchesSearch =
            medicine.medicineName?.toLowerCase().includes(search.toLowerCase()) ||
            medicine.category?.toLowerCase().includes(search.toLowerCase()) ||
            medicine.batchNumber?.toLowerCase().includes(search.toLowerCase());

        let matchesFilter;

        switch (activeFilter) {
            case "INSTOCK":
                matchesFilter = medicine.quantity > 20;
                break;
            case "LOW":
                matchesFilter = medicine.quantity > 0 && medicine.quantity <= 20;
                break;
            case "OUT":
                matchesFilter = medicine.quantity === 0;
                break;
            default:
                matchesFilter = true;
        }

        return matchesSearch && matchesFilter;
    });

    const indexOfLastMedicine = currentPage * medicinesPerPage;
    const indexOfFirstMedicine = indexOfLastMedicine - medicinesPerPage;
    const currentMedicines = filteredMedicines.slice(
        indexOfFirstMedicine,
        indexOfLastMedicine
    );
    const totalPages = Math.ceil(filteredMedicines.length / medicinesPerPage);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-success" />
                <h4>Loading Medicines...</h4>
            </div>
        );
    }

    return (

        <div className="medicine-page">
            {/* Header */}
            <div className="medicine-header">
                <div>
                    <h1>💊 Medicines Dashboard</h1>
                    <p>Manage medicines, suppliers and inventory efficiently</p>
                </div>
                {(role === "Admin"||role === "Pharmacist") && (
                    <button
                        className="add-btn"
                        onClick={() => {
                            setSelectedMedicine(null);
                            setFormData({
                                medicineName: "",
                                category: "",
                                batchNumber: "",
                                quantity: "",
                                price: "",
                                supplierId: "",
                                manufacturingDate: "",
                                expiryDate: ""
                            });
                            setShowModal(true);
                        }}
                    >
                        <FaPlus /> Add Medicine
                    </button>
                )}
            </div>

            {/* Cards */}
            <DashboardCards medicines={medicines} />

            {/* Search */}
            <SearchFilter
                search={search}
                searchMedicine={searchMedicine}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
            />

            {/* Table */}
            <div className="card shadow border-0 rounded-4">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead style={{ background: "#14968d", color: "white" }}>
                            <tr>
                                <th>ID</th>
                                <th>Medicine</th>
                                <th>Batch</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Supplier</th>
                                <th>Stock</th>
                                <th>Expiry</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentMedicines.length > 0 ? (
                                currentMedicines.map((medicine) => {
                                    const expiryDate = new Date(medicine.expiryDate);
                                    const today = new Date();

                                    expiryDate.setHours(0, 0, 0, 0);
                                    today.setHours(0, 0, 0, 0);

                                    const daysLeft = Math.ceil(
                                        (expiryDate - today) / (1000 * 60 * 60 * 24)
                                    );
                                    const maxStock = 200; // or whatever makes sense for your inventory

                                    const progress = Math.min(
                                        (medicine.quantity / maxStock) * 100,
                                        100
                                    );


                                    return (
                                        <tr key={medicine.medicineId}>
                                            <td>{medicine.medicineId}</td>
                                            <td>
                                                <div className="medicine-info">
                                                    <div className="medicine-icon">
                                                        <FaCapsules />
                                                    </div>
                                                    <div>
                                                        <h6>{medicine.medicineName}</h6>
                                                        <p>{medicine.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="batch-pill">
                                                    {medicine.batchNumber}
                                                </span>
                                            </td>
                                            <td style={{ width: "220px" }}>
                                                <div className="stock-box">
                                                    <div className="progress">
                                                        <div
                                                            className={`progress-bar ${medicine.quantity <= 20
                                                                    ? "bg-danger"
                                                                    : "bg-success"
                                                                }`}
                                                            style={{
                                                                width: `${progress}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <div className="stock-number">
                                                        {medicine.quantity}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>₹ {medicine.price}</td>
                                            <td>{medicine.supplier?.supplierName || "N/A"}</td>
                                            <td>
                                                <span
                                                    className={`status-badge ${medicine.quantity <= 20
                                                            ? "low"
                                                            : "instock"
                                                        }`}
                                                >
                                                    {medicine.quantity <= 20
                                                        ? "Low Stock"
                                                        : "In Stock"}
                                                </span>
                                            </td>
                                            <td>
                                                {daysLeft < 0 ? (
                                                    <span className="expiry-badge expired">
                                                        🔴 Expired
                                                    </span>
                                                ) : daysLeft <= 30 ? (
                                                    <span className="expiry-badge warning">
                                                        🟡 Expiring Soon
                                                    </span>
                                                ) : (
                                                    <span className="expiry-badge safe">
                                                        🟢 Safe
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-info btn-sm"
                                                        onClick={() => setViewMedicine(medicine)}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    {(role === "Admin" || role === "Pharmacist") && (

                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => editMedicine(medicine)}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                    )}
                                                    {(role === "Admin" || role === "Pharmacist" )&& (

                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => deleteMedicine(medicine.medicineId)}
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
                                    <td colSpan="9" className="text-center p-5">
                                        No Medicines Found
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

            {/* Modal for Add / Edit — now a proper 2-column, labeled form */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="medicine-modal wide">
                        <h3>{selectedMedicine ? "Edit Medicine" : "Add Medicine"}</h3>

                        <div className="form-grid">

                            <div className="form-field full-width">
                                <label>Medicine Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Amoxicillin 500mg"
                                    value={formData.medicineName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, medicineName: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-field">
                                <label>Category</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Antibiotics"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-field">
                                <label>Batch Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BAT-22981"
                                    value={formData.batchNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, batchNumber: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-field">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 150"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, quantity: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-field">
                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 25.50"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-field full-width">
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
                                <label>Manufacturing Date</label>
                                <input
                                    type="date"
                                    value={formData.manufacturingDate || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            manufacturingDate: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="form-field">
                                <label>Expiry Date</label>
                                <input
                                    type="date"
                                    value={formData.expiryDate || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            expiryDate: e.target.value
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
                            <button className="modal-save-btn" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Drawer */}
            {viewMedicine && (
                <div className="drawer-overlay">
                    <div className="drawer">
                        <div className="drawer-header">
                            <h2>💊 {viewMedicine.medicineName}</h2>
                            <button
                                className="close-btn"
                                onClick={() => setViewMedicine(null)}
                            >
                                ✖
                            </button>
                        </div>

                        <div className="drawer-content">
                            <div className="drawer-card">
                                <h5>Medicine Details</h5>
                                <p><strong>ID :</strong> {viewMedicine.medicineId}</p>
                                <p><strong>Category :</strong> {viewMedicine.category}</p>
                                <p><strong>Batch :</strong> {viewMedicine.batchNumber}</p>
                                <p><strong>Quantity :</strong> {viewMedicine.quantity}</p>
                                <p><strong>Price :</strong> ₹ {viewMedicine.price}</p>
                                <p><strong>Supplier :</strong> {viewMedicine.supplier?.supplierName || "N/A"}</p>
                                <p><strong>Manufacturing :</strong> {viewMedicine.manufacturingDate}</p>
                                <p><strong>Expiry :</strong> {viewMedicine.expiryDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Medicines;
