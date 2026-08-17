import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import "../Medicines/Medicines.css";
import "./ReportsTable.css";
import "../Medicines/MedicineFormModal.css";

import {
    FaPlus,
    FaEye,
    FaTrash,
    FaFileAlt
} from "react-icons/fa";

import DashboardCards from "./DashboardCards";
import SearchFilter from "./SearchFilter";

const getReportTypeClass = (type = "") =>
    type
        .toLowerCase()
        .replace(/\s*report\s*$/i, "")
        .trim()
        .replace(/\s+/g, "_");

const Reports = () => {

    const token = localStorage.getItem("token");

    // Was hardcoded to 1 — now reads the actual logged-in user, set at
    // login time (see LoginResponse.userId on the backend).
    const userId = localStorage.getItem("userId");

    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);

    const [viewReport, setViewReport] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const reportsPerPage = 6;

    const [formData, setFormData] = useState({

        reportType: "INVENTORY"

    });

    //------------------------------------
    // Load Reports
    //------------------------------------

    const fetchReports = async () => {

        try {

            const response = await axios.get(

                `${import.meta.env.VITE_API_URL}/api/reports`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setReports(response.data);

        }

        catch (err) {

            console.log(err);

        }

    };

    //------------------------------------
    // Initial Load
    //------------------------------------

    useEffect(() => {

        const load = async () => {

            setLoading(true);

            await fetchReports();

            setLoading(false);

        };

        load();

    }, []);

    //------------------------------------
    // Search + Filter
    //
    // Fixed: this used to run the activeFilter check twice — the second
    // pass compared reportType.toUpperCase() against activeFilter (which
    // is NOT uppercased, e.g. "Inventory Report"), so it could never
    // match and silently wiped out every result whenever a filter button
    // was clicked. It also never actually applied `search` to anything.
    //------------------------------------

    useEffect(() => {

        let temp = [...reports];

        if (search.trim() !== "") {

            const term = search.toLowerCase();

            temp = temp.filter(report =>
                report.reportType?.toLowerCase().includes(term) ||
                (report.generatedByName || "").toLowerCase().includes(term)
            );

        }

        if (activeFilter !== "ALL") {

            temp = temp.filter(
                report => report.reportType === activeFilter
            );

        }

        setFilteredReports(temp);

    }, [reports, search, activeFilter]);

    // Reset to page 1 whenever search or filter changes.
    useEffect(() => {

        setCurrentPage(1);

    }, [search, activeFilter]);

    //------------------------------------
    // Delete Report History
    //------------------------------------

    const handleDelete = async (id) => {

        const result = await Swal.fire({

            title: "Delete Report?",

            text: "This action cannot be undone.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonColor: "#14968d"

        });

        if (!result.isConfirmed) return;

        try {

            await axios.delete(

                `${import.meta.env.VITE_API_URL}/api/reports/${id}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            Swal.fire({

                icon: "success",

                title: "Deleted",

                text: "Report removed successfully"

            });

            fetchReports();

        }

        catch (err) {

            console.log(err);

        }

    };

    //------------------------------------
    // Generate PDF
    //------------------------------------

    const generateReport = async () => {

        if (!userId) {

            Swal.fire({
                icon: "error",
                title: "Not signed in",
                text: "Couldn't find your user id — please log in again."
            });

            return;

        }

        try {

            let url = "";

            switch (formData.reportType) {

                case "INVENTORY":

                    url = `${import.meta.env.VITE_API_URL}/api/reports/inventory/${userId}`;

                    break;

                case "PURCHASE":

                    url = `${import.meta.env.VITE_API_URL}/api/reports/purchase/${userId}`;

                    break;

                case "SUPPLIER":

                    url = `${import.meta.env.VITE_API_URL}/api/reports/supplier/${userId}`;

                    break;

                case "LOW_STOCK":

                    url = `${import.meta.env.VITE_API_URL}/api/reports/low-stock/${userId}`;

                    break;

                default:

                    return;

            }

            const response = await axios.get(

                url,

                {

                    responseType: "blob",

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            const file = new Blob(

                [response.data],

                {

                    type: "application/pdf"

                }

            );

            const fileURL = window.URL.createObjectURL(file);

            const link = document.createElement("a");

            link.href = fileURL;

            link.download = `${formData.reportType}_Report.pdf`;

            link.click();

            Swal.fire({

                icon: "success",

                title: "Success",

                text: "Report Generated Successfully",

                confirmButtonColor: "#14968d"

            });

            setShowModal(false);

            fetchReports();

        }

        catch (err) {

            console.log(err);

            Swal.fire({

                icon: "error",

                title: "Oops",

                text: "Unable to Generate Report"

            });

        }

    };

    //------------------------------------
    // Pagination
    //------------------------------------

    const indexOfLast = currentPage * reportsPerPage;

    const indexOfFirst = indexOfLast - reportsPerPage;

    const currentReports = filteredReports.slice(

        indexOfFirst,

        indexOfLast

    );

    const totalPages = Math.ceil(

        filteredReports.length /

        reportsPerPage

    );

    //------------------------------------

    if (loading) {

        return (

            <div className="loading-container">

                <div className="spinner-border text-success" />

                <h4>Loading Reports...</h4>

            </div>

        );

    }

    return (

        <div className="medicine-page">

            <div className="medicine-header">

                <div>

                    <h1>📄 Reports Dashboard</h1>

                    <p>

                        Generate Inventory,

                        Purchase,

                        Supplier &

                        Low Stock Reports

                    </p>

                </div>

                <button

                    className="add-btn"

                    onClick={() => setShowModal(true)}

                >

                    <FaPlus />

                    Generate Report

                </button>

            </div>

            <DashboardCards reports={reports} />

            <SearchFilter

                search={search}

                setSearch={setSearch}

                activeFilter={activeFilter}

                setActiveFilter={setActiveFilter}

            />

            <div className="card shadow border-0 rounded-4 reports-table-wrapper">

                <div className="card-body p-0">

                    <table className="table table-hover align-middle mb-0">

                        <thead style={{

                            background: "#14968d",

                            color: "white"

                        }}>

                            <tr>

                                <th>ID</th>

                                <th>Report</th>

                                <th>Generated By</th>

                                <th>Date</th>

                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {currentReports.length > 0 ? (

                                currentReports.map((report) => (

                                    <tr key={report.reportId}>

                                        <td>{report.reportId}</td>

                                        <td>

                                            <div className="report-cell">

                                                <div className="report-icon">

                                                    <FaFileAlt />

                                                </div>

                                                <span className={`report-badge ${getReportTypeClass(report.reportType)}`}>

                                                    {report.reportType}

                                                </span>

                                            </div>

                                        </td>

                                        <td title={report.generatedByName || report.generatedBy}>

                                            {report.generatedByName || report.generatedBy}

                                        </td>

                                        <td>

                                            {new Date(report.generatedAt).toLocaleString()}

                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button

                                                    className="btn btn-info btn-sm"

                                                    onClick={() => setViewReport(report)}

                                                >

                                                    <FaEye />

                                                </button>

                                                <button

                                                    className="btn btn-outline-danger btn-sm"

                                                    onClick={() => handleDelete(report.reportId)}

                                                >

                                                    <FaTrash />

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td colSpan="5" className="text-center p-5">

                                        No Reports Found

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

                        {

                            [...Array(totalPages)].map((_, index) => (

                                <button

                                    key={index}

                                    className={

                                        currentPage === index + 1

                                            ?

                                            "active-page"

                                            :

                                            ""

                                    }

                                    onClick={() => setCurrentPage(index + 1)}

                                >

                                    {index + 1}

                                </button>

                            ))

                        }

                        <button

                            disabled={

                                currentPage === totalPages ||

                                totalPages === 0

                            }

                            onClick={() => setCurrentPage(currentPage + 1)}

                        >

                            Next

                        </button>

                    </div>

                </div>

            </div>

            {/* ------------------------ Generate Modal ------------------------ */}

            {

                showModal && (

                    <div className="modal-overlay">

                        <div className="medicine-modal wide">

                            <h3>

                                Generate Report

                            </h3>

                            <select

                                className="supplier-select"

                                value={formData.reportType}

                                onChange={(e) =>

                                    setFormData({

                                        ...formData,

                                        reportType: e.target.value

                                    })

                                }

                            >

                                <option value="INVENTORY">

                                    Inventory Report

                                </option>

                                <option value="PURCHASE">

                                    Purchase Report

                                </option>

                                <option value="SUPPLIER">

                                    Supplier Report

                                </option>

                                <option value="LOW_STOCK">

                                    Low Stock Report

                                </option>

                            </select>

                            <div

                                className="d-flex justify-content-end gap-2 mt-3"

                            >

                                <button

                                    className="modal-cancel-btn"

                                    onClick={() => setShowModal(false)}

                                >

                                    Cancel

                                </button>

                                <button

                                    className="modal-save-btn"

                                    onClick={generateReport}

                                >

                                    Generate

                                </button>

                            </div>

                        </div>

                    </div>

                )

            }

            {/* ------------------------ View Drawer ------------------------ */}

            {

                viewReport && (

                    <div className="drawer-overlay">

                        <div className="drawer">

                            <div className="drawer-header">

                                <h2>

                                    📄 {viewReport.reportType}

                                </h2>

                                <button

                                    className="close-btn"

                                    onClick={() => setViewReport(null)}

                                >

                                    ✖

                                </button>

                            </div>

                            <div className="drawer-content">

                                <div className="drawer-card">

                                    <h5>

                                        Report Details

                                    </h5>

                                    <p>

                                        <strong>ID :</strong>

                                        {" "}

                                        {viewReport.reportId}

                                    </p>

                                    <p>

                                        <strong>Type :</strong>

                                        {" "}

                                        {viewReport.reportType}

                                    </p>

                                    <p>

                                        <strong>Generated By :</strong>

                                        {" "}

                                        {viewReport.generatedByName || viewReport.generatedBy}

                                    </p>

                                    <p>

                                        <strong>Date :</strong>

                                        {" "}

                                        {new Date(viewReport.generatedAt).toLocaleString()}

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                )

            }

        </div>

    );

};

export default Reports;
