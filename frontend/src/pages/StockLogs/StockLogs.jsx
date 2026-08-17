import { useEffect, useState } from "react";
import axios from "axios";
import "../Medicines/Medicines.css";

import {
    FaClipboardList,
    FaSearch,
    FaEye
} from "react-icons/fa";

const StockLogs = () => {

    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [viewLog, setViewLog] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const logsPerPage = 6;

    const fetchLogs = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/stocklogs`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setLogs(response.data);
            setFilteredLogs(response.data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchLogs();

    }, []);

    useEffect(() => {

        const filtered = logs.filter(log =>
            log.medicineName.toLowerCase().includes(search.toLowerCase()) ||
            log.movementType.toLowerCase().includes(search.toLowerCase())
        );

        setFilteredLogs(filtered);
        setCurrentPage(1);

    }, [search, logs]);

    const totalLogs = logs.length;

    const stockIn = logs.filter(log =>
        log.movementType.includes("ADD") ||
        log.movementType.includes("PURCHASE_CREATE")
    ).length;

    const stockOut = logs.filter(log =>
        log.movementType.includes("DELETE")
    ).length;

    const todayLogs = logs.filter(log => {

        const today = new Date().toISOString().split("T")[0];

        return log.transactionDate.startsWith(today);

    }).length;

    const indexOfLast = currentPage * logsPerPage;

    const indexOfFirst = indexOfLast - logsPerPage;

    const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    if (loading) {

        return (

            <div className="loading-container">

                <div className="spinner-border text-success"></div>

                <h4>Loading Stock Logs...</h4>

            </div>

        );

    }

    return (

        <div className="medicine-page">

            <div className="medicine-header">

                <div>

                    <h1>📋 Stock Logs Dashboard</h1>

                    <p>Track every inventory movement</p>

                </div>

            </div>

            {/* Dashboard Cards */}

            <div className="dashboard-cards">

                <div className="dashboard-card supplier">

                      <div className="card-icon">📄</div>

                    <h3>Total Logs</h3>

                    <h1 style={{color:"#14968d"}}>{totalLogs}</h1>

                </div>

                <div className="dashboard-card total">

                   <div className="card-icon">✔️</div>

                    <h3>Stock In</h3>

                    <h1 style={{color:"#14968d"}}>{stockIn}</h1>

                </div>

                <div className="dashboard-card out">

                     <div className="card-icon">❌</div>

                    <h3>Stock Out</h3>

                    <h1 style={{color:"#14968d"}}>{stockOut}</h1>

                </div>

                <div className="dashboard-card low">

                    <div className="card-icon">⚠️</div>


                    <h3>Today's Logs</h3>

                    <h1 style={{color:"#14968d"}}> {todayLogs}</h1>

                </div>

            </div>

            {/* Search */}

            <div className="search-filter-container">

                <div className="search-box">

                    <FaSearch/>

                    <input

                        type="text"

                        placeholder="Search medicine or movement..."

                        value={search}

                        onChange={(e)=>setSearch(e.target.value)}

                    />

                </div>

            </div>

            {/* Table */}

            <div className="card shadow border-0 rounded-4">

                <div className="card-body p-0">

                    <table className="table table-hover align-middle mb-0">

                        <thead style={{background:"#14968d",color:"white"}}>

                            <tr>

                                <th>ID</th>

                                <th>Medicine</th>

                                <th>Movement</th>

                                <th>Quantity</th>

                                <th>Date</th>

                                <th>Action</th>

                            </tr>

                        </thead>

                        <tbody>

                            {currentLogs.length>0 ? (

                                currentLogs.map(log=>(

                                    <tr key={log.logId}>

                                        <td>{log.logId}</td>

                                        <td>

                                            <div className="medicine-info">

                                                <div className="medicine-icon">

                                                    <FaClipboardList/>

                                                </div>

                                                <div>

                                                    <h6>{log.medicineName}</h6>

                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            <span className="batch-pill">

                                                {log.movementType}

                                            </span>

                                        </td>

                                        <td>{log.quantity}</td>

                                        <td>

                                            {new Date(log.transactionDate).toLocaleString()}

                                        </td>

                                        <td>

                                            <button

                                                className="btn btn-info btn-sm"

                                                onClick={()=>setViewLog(log)}

                                            >

                                                <FaEye/>

                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ):(

                                <tr>

                                    <td colSpan="6" className="text-center p-5">

                                        No Stock Logs Found

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                    {/* Pagination */}

                    <div className="pagination-container">

                        <button

                            disabled={currentPage===1}

                            onClick={()=>setCurrentPage(currentPage-1)}

                        >

                            Previous

                        </button>

                        {[...Array(totalPages)].map((_,index)=>(

                            <button

                                key={index}

                                className={currentPage===index+1 ? "active-page":""}

                                onClick={()=>setCurrentPage(index+1)}

                            >

                                {index+1}

                            </button>

                        ))}

                        <button

                            disabled={currentPage===totalPages || totalPages===0}

                            onClick={()=>setCurrentPage(currentPage+1)}

                        >

                            Next

                        </button>

                    </div>

                </div>

            </div>

            {/* Drawer */}

            {viewLog && (

                <div className="drawer-overlay">

                    <div className="drawer">

                        <div className="drawer-header">

                            <h2>📋 Stock Log Details</h2>

                            <button

                                className="close-btn"

                                onClick={()=>setViewLog(null)}

                            >

                                ✖

                            </button>

                        </div>

                        <div className="drawer-content">

                            <div className="drawer-card">

                                <p><strong>Log ID :</strong> {viewLog.logId}</p>

                                <p><strong>Medicine :</strong> {viewLog.medicineName}</p>

                                <p><strong>Movement :</strong> {viewLog.movementType}</p>

                                <p><strong>Quantity :</strong> {viewLog.quantity}</p>

                                <p><strong>Reference ID :</strong> {viewLog.referenceId}</p>

                                <p><strong>Date :</strong> {new Date(viewLog.transactionDate).toLocaleString()}</p>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};

export default StockLogs;
