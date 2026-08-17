import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import SupplierCards from "./SupplierCards";
import SupplierSearch from "./SupplierSearch";

import "../Medicines/Medicines.css";
import "../Medicines/MedicineFormModal.css";
import "./SuppliersTable.css";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaTruck
} from "react-icons/fa";

const Suppliers = () => {

    // =========================
    // STATE
    // =========================

    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [viewSupplier, setViewSupplier] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const suppliersPerPage = 6;

    // Get logged-in user's role
    const role = localStorage.getItem("roleName");

    // Only Admin can Add/Edit/Delete
    const isAdmin = role === "Admin";

    // =========================
    // FORM DATA
    // =========================

    const [formData, setFormData] = useState({
        supplierName: "",
        contactNumber: "",
        email: "",
        address: ""
    });

    // =========================
    // FETCH SUPPLIERS
    // =========================

    const fetchSuppliers = async () => {
        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:8080/api/suppliers",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuppliers(response.data);

        } catch (err) {

            console.log("FETCH SUPPLIERS ERROR:", err);

            Swal.fire({
                icon: "error",
                title: "Failed to load suppliers",
                text: "Unable to fetch suppliers."
            });

        }
    };

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        const loadInitialData = async () => {

            setLoading(true);

            await fetchSuppliers();

            setLoading(false);

        };

        loadInitialData();

    }, []);

    // =========================
    // SEARCH SUPPLIER
    // =========================

    const searchSupplier = async (keyword) => {

        setSearch(keyword);
        setCurrentPage(1);

        try {

            const token = localStorage.getItem("token");

            const url =
                keyword.trim() === ""
                    ? "http://localhost:8080/api/suppliers"
                    : `http://localhost:8080/api/suppliers/search?keyword=${encodeURIComponent(keyword)}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuppliers(response.data);

        } catch (err) {

            console.log("SEARCH SUPPLIER ERROR:", err);

        }
    };

    // =========================
    // RESET FORM
    // =========================

    const resetForm = () => {

        setFormData({
            supplierName: "",
            contactNumber: "",
            email: "",
            address: ""
        });

        setSelectedSupplier(null);
    };

    // =========================
    // ADD / UPDATE SUPPLIER
    // =========================

    const handleSave = async () => {

        // Extra frontend protection
        if (!isAdmin) {

            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Only Admin can add or edit suppliers."
            });

            return;
        }

        try {

            const token = localStorage.getItem("token");

            // =========================
            // UPDATE
            // =========================

            if (selectedSupplier) {

                await axios.put(
                    `http://localhost:8080/api/suppliers/${selectedSupplier.supplierId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                await Swal.fire({
                    icon: "success",
                    title: "Supplier Updated",
                    text: "Supplier updated successfully.",
                    confirmButtonColor: "#14968d"
                });

            }

            // =========================
            // ADD
            // =========================

            else {

                await axios.post(
                    "http://localhost:8080/api/suppliers",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                await Swal.fire({
                    icon: "success",
                    title: "Supplier Added",
                    text: "Supplier added successfully.",
                    confirmButtonColor: "#14968d"
                });

            }

            // Refresh suppliers
            await fetchSuppliers();

            // Close modal
            setShowModal(false);

            // Reset form
            resetForm();

        } catch (err) {

            console.log("SAVE SUPPLIER ERROR:", err);

            Swal.fire({
                icon: "error",
                title: "Operation Failed",
                text:
                    err.response?.data?.message ||
                    "Something went wrong while saving supplier."
            });

        }
    };

    // =========================
    // DELETE SUPPLIER
    // =========================

    const deleteSupplier = async (id) => {

        // Extra frontend protection
        if (!isAdmin) {

            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Only Admin can delete suppliers."
            });

            return;
        }

        const result = await Swal.fire({

            title: "Delete Supplier?",

            text: "This action cannot be undone!",

            icon: "warning",

            showCancelButton: true,

            confirmButtonColor: "#d33",

            cancelButtonColor: "#14968d",

            confirmButtonText: "Delete",

            cancelButtonText: "Cancel"

        });

        if (!result.isConfirmed) return;

        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `http://localhost:8080/api/suppliers/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await Swal.fire({
                icon: "success",
                title: "Supplier Deleted",
                text: "Supplier deleted successfully.",
                confirmButtonColor: "#14968d"
            });

            await fetchSuppliers();

        } catch (err) {

            console.log("DELETE SUPPLIER ERROR:", err);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    err.response?.data?.message ||
                    "Unable to delete supplier."
            });

        }
    };

    // =========================
    // EDIT SUPPLIER
    // =========================

    const editSupplier = (supplier) => {

        // Extra frontend protection
        if (!isAdmin) {

            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Only Admin can edit suppliers."
            });

            return;
        }

        setSelectedSupplier(supplier);

        setFormData({
            supplierName: supplier.supplierName || "",
            contactNumber: supplier.contactNumber || "",
            email: supplier.email || "",
            address: supplier.address || ""
        });

        setShowModal(true);
    };

    // =========================
    // OPEN ADD SUPPLIER MODAL
    // =========================

    const openAddModal = () => {

        if (!isAdmin) return;

        resetForm();

        setShowModal(true);
    };

    // =========================
    // FILTER SUPPLIERS
    // =========================

    const filteredSuppliers = suppliers.filter((supplier) => {

        const supplierName =
            supplier.supplierName?.toLowerCase() || "";

        const email =
            supplier.email?.toLowerCase() || "";

        const contactNumber =
            supplier.contactNumber?.toString() || "";

        const searchValue =
            search.toLowerCase();

        return (
            supplierName.includes(searchValue) ||
            email.includes(searchValue) ||
            contactNumber.includes(searchValue)
        );
    });

    // =========================
    // PAGINATION
    // =========================

    const indexOfLastSupplier =
        currentPage * suppliersPerPage;

    const indexOfFirstSupplier =
        indexOfLastSupplier - suppliersPerPage;

    const currentSuppliers =
        filteredSuppliers.slice(
            indexOfFirstSupplier,
            indexOfLastSupplier
        );

    const totalPages =
        Math.ceil(
            filteredSuppliers.length / suppliersPerPage
        );

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="loading-container">

                <div className="spinner-border text-success"></div>

                <h4>Loading Suppliers...</h4>

            </div>
        );
    }

    // =========================
    // JSX
    // =========================

    return (

        <div className="medicine-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="medicine-header">

                <div>

                    <h1>🚚 Suppliers Dashboard</h1>

                    <p>
                        Manage all suppliers efficiently
                    </p>

                </div>

                {/* ADMIN ONLY */}

                {isAdmin && (

                    <button
                        className="add-btn"
                        onClick={openAddModal}
                    >
                        <FaPlus />
                        Add Supplier
                    </button>

                )}

            </div>


            {/* =========================
                SUPPLIER CARDS
            ========================= */}

            <SupplierCards suppliers={suppliers} />


            {/* =========================
                SEARCH
            ========================= */}

            <SupplierSearch
                search={search}
                searchSupplier={searchSupplier}
            />


            {/* =========================
                TABLE
            ========================= */}

            <div className="card shadow border-0 rounded-4 suppliers-table-wrapper">

                <div className="card-body p-0">

                    <table className="table table-hover align-middle mb-0">

                        <thead
                            style={{
                                background: "#14968d",
                                color: "white"
                            }}
                        >

                            <tr>

                                <th>ID</th>

                                <th>Supplier</th>

                                <th>Contact</th>

                                <th>Email</th>

                                <th>Address</th>

                                <th className="text-center">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {currentSuppliers.length > 0 ? (

                                currentSuppliers.map((supplier) => (

                                    <tr
                                        key={supplier.supplierId}
                                    >

                                        {/* ID */}

                                        <td>
                                            {supplier.supplierId}
                                        </td>


                                        {/* SUPPLIER */}

                                        <td>

                                            <div className="supplier-cell">

                                                <div className="supplier-avatar">

                                                    <FaTruck />

                                                </div>

                                                <h6>
                                                    {supplier.supplierName}
                                                </h6>

                                            </div>

                                        </td>


                                        {/* CONTACT */}

                                        <td>
                                            {supplier.contactNumber}
                                        </td>


                                        {/* EMAIL */}

                                        <td
                                            title={supplier.email}
                                        >
                                            {supplier.email}
                                        </td>


                                        {/* ADDRESS */}

                                        <td
                                            title={supplier.address}
                                        >
                                            {supplier.address}
                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div className="action-buttons">

                                                {/* VIEW - EVERYONE */}

                                                <button
                                                    className="btn btn-info btn-sm"
                                                    title="View Supplier"
                                                    onClick={() =>
                                                        setViewSupplier(supplier)
                                                    }
                                                >
                                                    <FaEye />
                                                </button>


                                                {/* EDIT - ADMIN ONLY */}

                                                {isAdmin && (

                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        title="Edit Supplier"
                                                        onClick={() =>
                                                            editSupplier(supplier)
                                                        }
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                )}


                                                {/* DELETE - ADMIN ONLY */}

                                                {isAdmin && (

                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        title="Delete Supplier"
                                                        onClick={() =>
                                                            deleteSupplier(
                                                                supplier.supplierId
                                                            )
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="text-center p-5"
                                    >
                                        No Suppliers Found
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>


                    {/* =========================
                        PAGINATION
                    ========================= */}

                    <div className="pagination-container">

                        <button
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage(
                                    currentPage - 1
                                )
                            }
                        >
                            Previous
                        </button>


                        {[...Array(totalPages)].map(
                            (_, index) => (

                                <button
                                    key={index}
                                    className={
                                        currentPage === index + 1
                                            ? "active-page"
                                            : ""
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            index + 1
                                        )
                                    }
                                >
                                    {index + 1}
                                </button>

                            )
                        )}


                        <button
                            disabled={
                                currentPage === totalPages ||
                                totalPages === 0
                            }
                            onClick={() =>
                                setCurrentPage(
                                    currentPage + 1
                                )
                            }
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>


            {/* =========================
                ADD / EDIT MODAL
            ========================= */}

            {showModal && isAdmin && (

                <div className="modal-overlay">

                    <div className="medicine-modal wide">

                        <h3>

                            {selectedSupplier
                                ? "Edit Supplier"
                                : "Add Supplier"}

                        </h3>


                        <div className="form-grid">

                            {/* SUPPLIER NAME */}

                            <div className="form-field full-width">

                                <label>
                                    Supplier Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. MedSupply Co."
                                    value={
                                        formData.supplierName
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            supplierName:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>


                            {/* CONTACT */}

                            <div className="form-field">

                                <label>
                                    Contact Number
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. 9876543210"
                                    value={
                                        formData.contactNumber
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            contactNumber:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="form-field">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="e.g. contact@supplier.com"
                                    value={
                                        formData.email
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>


                            {/* ADDRESS */}

                            <div className="form-field full-width">

                                <label>
                                    Address
                                </label>

                                <textarea
                                    placeholder="Street, city, state, ZIP"
                                    value={
                                        formData.address
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>

                        </div>


                        {/* MODAL BUTTONS */}

                        <div className="d-flex justify-content-end gap-2 mt-3">

                            <button
                                className="modal-cancel-btn"
                                onClick={() => {

                                    setShowModal(false);

                                    resetForm();

                                }}
                            >
                                Cancel
                            </button>


                            <button
                                className="modal-save-btn"
                                onClick={handleSave}
                            >
                                {selectedSupplier
                                    ? "Update"
                                    : "Save"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =========================
                VIEW DRAWER
            ========================= */}

            {viewSupplier && (

                <div className="drawer-overlay">

                    <div className="drawer">

                        <div className="drawer-header">

                            <h2>
                                🚚 {viewSupplier.supplierName}
                            </h2>

                            <button
                                className="close-btn"
                                onClick={() =>
                                    setViewSupplier(null)
                                }
                            >
                                ✖
                            </button>

                        </div>


                        <div className="drawer-content">

                            <div className="drawer-card">

                                <h5>
                                    Supplier Details
                                </h5>


                                <p>
                                    <strong>ID :</strong>{" "}
                                    {viewSupplier.supplierId}
                                </p>


                                <p>
                                    <strong>Supplier :</strong>{" "}
                                    {viewSupplier.supplierName}
                                </p>


                                <p>
                                    <strong>Contact :</strong>{" "}
                                    {viewSupplier.contactNumber}
                                </p>


                                <p>
                                    <strong>Email :</strong>{" "}
                                    {viewSupplier.email}
                                </p>


                                <p>
                                    <strong>Address :</strong>{" "}
                                    {viewSupplier.address}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Suppliers;
