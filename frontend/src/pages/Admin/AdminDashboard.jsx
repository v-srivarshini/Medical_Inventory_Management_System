import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import { useEffect, useState } from "react";
import { getDashboardData } from "../../services/authService";

import {
    FaUsers,
    FaPills,
    FaTruck,
    FaBoxes,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaChartLine,
    FaHistory,
    FaShoppingCart
} from "react-icons/fa";

import "./AdminDashboard.css";

/* ---------------- Fallback sample data ---------------- */

const DEFAULT_STATE = {
    users: 0,
    medicines: 0,
    suppliers: 0,
    inventory: 0,

    availableMedicines: 0,
    stockAvailable: 0,
    lowStock: 0,
    expiryAlerts: 0,

    /* ---------------- Low Stock ---------------- */

    lowStockItems: [
        {
            medicine: "Insulin Glargine",
            batch: "BAT-23015",
            qty: 38,
            reorderLevel: 50
        },
        {
            medicine: "Azithromycin 250mg",
            batch: "BAT-22899",
            qty: 0,
            reorderLevel: 40
        },
        {
            medicine: "Paracetamol 650mg",
            batch: "BAT-22750",
            qty: 60,
            reorderLevel: 100
        }
    ],

    /* ---------------- Expiring Medicines ---------------- */

    expiringMedicines: [
        {
            medicine: "Paracetamol 650mg",
            batch: "BAT-22750",
            expires: "08/2026",
            daysLeft: 30
        },
        {
            medicine: "Azithromycin 250mg",
            batch: "BAT-22899",
            expires: "06/2026",
            daysLeft: 12
        }
    ],

    /* ---------------- Inventory Analytics ---------------- */

    inventoryByCategory: [
        {
            category: "Antibiotics",
            count: 320
        },
        {
            category: "Painkillers",
            count: 260
        },
        {
            category: "Diabetes Care",
            count: 140
        },
        {
            category: "Cardiac",
            count: 95
        },
        {
            category: "Vitamins",
            count: 180
        }
    ],

    /* ---------------- PURCHASE SUMMARY ---------------- */
    /* Same data as Pharmacist Dashboard */

    purchaseSummary: [
        {
            orderId: "PO-2291",
            supplier: "MedSupply Co.",
            date: "2026-07-29",
            status: "Delivered",
            amount: "$4,120"
        },
        {
            orderId: "PO-2298",
            supplier: "PharmaLink Ltd.",
            date: "2026-07-30",
            status: "In transit",
            amount: "$2,860"
        },
        {
            orderId: "PO-2302",
            supplier: "Global Health Distributors",
            date: "2026-08-01",
            status: "Pending",
            amount: "$1,540"
        }
    ],

    /* ---------------- Stock Movements ---------------- */

    stockMovements: [
        {
            date: "2026-08-01",
            medicine: "Amoxicillin 500mg",
            batch: "BAT-22981",
            type: "IN",
            qty: 200,
            by: "S. Rao"
        },
        {
            date: "2026-08-01",
            medicine: "Insulin Glargine",
            batch: "BAT-23015",
            type: "OUT",
            qty: 12,
            by: "M. Iyer"
        },
        {
            date: "2026-07-31",
            medicine: "Paracetamol 650mg",
            batch: "BAT-22750",
            type: "OUT",
            qty: 40,
            by: "S. Rao"
        },
        {
            date: "2026-07-30",
            medicine: "Metformin 500mg",
            batch: "BAT-23102",
            type: "IN",
            qty: 500,
            by: "A. Khan"
        }
    ],

    /* ---------------- Supplier Analytics ---------------- */

    supplierAnalytics: [
        {
            supplier: "MedSupply Co.",
            orders: 42,
            onTime: "96%",
            lastOrder: "2026-07-29"
        },
        {
            supplier: "PharmaLink Ltd.",
            orders: 27,
            onTime: "88%",
            lastOrder: "2026-07-25"
        },
        {
            supplier: "Global Health Distributors",
            orders: 19,
            onTime: "91%",
            lastOrder: "2026-07-22"
        }
    ],

    /* ---------------- User Activity ---------------- */

    userActivity: [
        {
            user: "S. Rao",
            role: "Pharmacist",
            action: "Updated stock — Amoxicillin 500mg",
            time: "10:42 AM"
        },
        {
            user: "A. Khan",
            role: "Staff",
            action: "Logged a stock receipt — Metformin 500mg",
            time: "09:58 AM"
        },
        {
            user: "M. Iyer",
            role: "Pharmacist",
            action: "Reviewed expiry alerts",
            time: "09:20 AM"
        },
        {
            user: "Admin",
            role: "Admin",
            action: "Added new supplier — Global Health Distributors",
            time: "Yesterday"
        }
    ],

    /* ---------------- Optional Lists ---------------- */

    lowStockList: [
        {
            medicine: "Insulin Glargine",
            batch: "BAT-23015",
            qty: 38
        },
        {
            medicine: "Azithromycin 250mg",
            batch: "BAT-22899",
            qty: 0
        }
    ],

    expiringList: [
        {
            medicine: "Paracetamol 650mg",
            batch: "BAT-22750",
            expires: "08/2026"
        },
        {
            medicine: "Azithromycin 250mg",
            batch: "BAT-22899",
            expires: "06/2026"
        }
    ]
};


/* ---------------- Status Badge ---------------- */

function statusBadgeClass(status) {
    const s = String(status).toLowerCase();

    if (s === "delivered" || s === "reliable") {
        return "badge badge-ok";
    }

    if (s === "pending" || s === "watch") {
        return "badge badge-warning";
    }

    if (s === "in transit") {
        return "badge badge-info";
    }

    return "badge badge-info";
}


/* ---------------- Admin Dashboard ---------------- */

function AdminDashboard() {

    const [dashboardData, setDashboardData] = useState(DEFAULT_STATE);


    /* ---------------- Load Dashboard Data ---------------- */

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                const response = await getDashboardData(
                    token,
                    "ADMIN",
                    userId
                );

                /*
                 * Merge API data with default data.
                 * If API doesn't return a particular field,
                 * the fallback data will remain.
                 */

                setDashboardData((prev) => ({
                    ...prev,
                    ...response.data
                }));

            } catch (error) {

                console.log(error);

            }

        };

        loadDashboard();

    }, []);


    /* ---------------- Maximum Category Count ---------------- */

    const maxCategoryCount = Math.max(
        ...dashboardData.inventoryByCategory.map(
            (c) => c.count
        ),
        1
    );


    return (

        <div className="admin-container">

            {/* Sidebar */}

            <Sidebar role="admin" />


            <div className="main-content">

                {/* Navbar */}

                <Navbar
                    userName={localStorage.getItem("fullName")}
                />


                {/* ==================================================
                    KPI CARDS
                ================================================== */}

                <div className="cards">

                    <DashboardCard
                        title="Users"
                        value={dashboardData.users}
                        icon={<FaUsers />}
                    />

                    <DashboardCard
                        title="Medicines"
                        value={dashboardData.medicines}
                        icon={<FaPills />}
                    />

                    <DashboardCard
                        title="Suppliers"
                        value={dashboardData.suppliers}
                        icon={<FaTruck />}
                    />

                    <DashboardCard
                        title="Inventory"
                        value={dashboardData.inventory}
                        icon={<FaBoxes />}
                    />

                </div>


                {/* ==================================================
                    LOW STOCK + EXPIRING MEDICINES
                ================================================== */}

                <div className="grid-2">


                    {/* ---------------- Low Stock ---------------- */}

                    <div className="panel">

                        <h3 className="panel-title">

                            <FaExclamationTriangle />

                            Low-stock items

                        </h3>


                        <table className="table">

                            <thead>

                                <tr>

                                    <th>Medicine</th>

                                    <th>Batch</th>

                                    <th>Qty</th>

                                    <th>Reorder at</th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboardData.lowStockItems.map(
                                    (item) => (

                                        <tr key={item.batch}>

                                            <td>
                                                {item.medicine}
                                            </td>

                                            <td className="mono">
                                                {item.batch}
                                            </td>

                                            <td>

                                                <span
                                                    className={`badge ${
                                                        item.qty === 0
                                                            ? "badge-danger"
                                                            : "badge-warning"
                                                    }`}
                                                >

                                                    {item.qty}

                                                </span>

                                            </td>

                                            <td>
                                                {item.reorderLevel}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ---------------- Expiring Medicines ---------------- */}

                    <div className="panel">

                        <h3 className="panel-title">

                            <FaCalendarAlt />

                            Expiring medicines

                        </h3>


                        <table className="table">

                            <thead>

                                <tr>

                                    <th>Medicine</th>

                                    <th>Batch</th>

                                    <th>Expires</th>

                                    <th>Days left</th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboardData.expiringMedicines.map(
                                    (item) => (

                                        <tr key={item.batch}>

                                            <td>
                                                {item.medicine}
                                            </td>

                                            <td className="mono">
                                                {item.batch}
                                            </td>

                                            <td>
                                                {item.expires}
                                            </td>

                                            <td>

                                                <span
                                                    className={`badge ${
                                                        item.daysLeft <= 15
                                                            ? "badge-danger"
                                                            : "badge-warning"
                                                    }`}
                                                >

                                                    {item.daysLeft}d

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* ==================================================
                    INVENTORY ANALYTICS + SUPPLIER ANALYTICS
                ================================================== */}

                <div className="grid-2">


                    {/* ---------------- Inventory Analytics ---------------- */}

                    <div className="panel">

                        <h3 className="panel-title">

                            <FaChartLine />

                            Inventory analytics

                        </h3>


                        <div className="bar-list">

                            {dashboardData.inventoryByCategory.map(
                                (c) => (

                                    <div
                                        className="bar-row"
                                        key={c.category}
                                    >

                                        <span className="bar-label">
                                            {c.category}
                                        </span>


                                        <div className="bar-track">

                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${
                                                        (c.count /
                                                            maxCategoryCount) *
                                                        100
                                                    }%`
                                                }}
                                            />

                                        </div>


                                        <span className="bar-value">
                                            {c.count}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    </div>


                    {/* ---------------- Supplier Analytics ---------------- */}

                    <div className="panel">

                        <h3 className="panel-title">

                            <FaTruck />

                            Supplier analytics

                        </h3>


                        <table className="table">

                            <thead>

                                <tr>

                                    <th>Supplier</th>

                                    <th>Orders</th>

                                    <th>On-time</th>

                                    <th>Last order</th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboardData.supplierAnalytics.map(
                                    (s) => (

                                        <tr key={s.supplier}>

                                            <td>
                                                {s.supplier}
                                            </td>

                                            <td>
                                                {s.orders}
                                            </td>

                                            <td>
                                                {s.onTime}
                                            </td>

                                            <td>
                                                {s.lastOrder}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* ==================================================
                    STOCK MOVEMENT + PURCHASE SUMMARY
                ================================================== */}

                <div className="grid-2">


                    {/* ---------------- Stock Movement ---------------- */}

                    <div className="panel">

                        <h3 className="panel-title">

                            <FaHistory />

                            Stock movement reports

                        </h3>


                        <table className="table">

                            <thead>

                                <tr>

                                    <th>Date</th>

                                    <th>Medicine</th>

                                    <th>Batch</th>

                                    <th>Type</th>

                                    <th>Qty</th>

                                    <th>By</th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboardData.stockMovements.map(
                                    (m, i) => (

                                        <tr key={i}>

                                            <td>
                                                {m.date}
                                            </td>

                                            <td>
                                                {m.medicine}
                                            </td>

                                            <td className="mono">
                                                {m.batch}
                                            </td>

                                            <td>

                                                <span
                                                    className={`badge ${
                                                        m.type === "IN"
                                                            ? "badge-ok"
                                                            : "badge-info"
                                                    }`}
                                                >

                                                    {m.type}

                                                </span>

                                            </td>

                                            <td>
                                                {m.qty}
                                            </td>

                                            <td>
                                                {m.by}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ==================================================
                        PURCHASE SUMMARY
                        SAME UI + SAME DATA AS PHARMACIST DASHBOARD
                    ================================================== */}

                    <div className="panel">

                        <h3 className="panel-title">

                            <FaShoppingCart />

                            Purchase summary

                        </h3>


                        <table className="table">

                            <thead>

                                <tr>

                                    <th>Order</th>

                                    <th>Supplier</th>

                                    <th>Date</th>

                                    <th>Status</th>

                                    <th>Amount</th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboardData.purchaseSummary.map(
                                    (p) => (

                                        <tr key={p.orderId}>

                                            <td className="mono">
                                                {p.orderId}
                                            </td>

                                            <td>
                                                {p.supplier}
                                            </td>

                                            <td>
                                                {p.date}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        statusBadgeClass(
                                                            p.status
                                                        )
                                                    }
                                                >

                                                    {p.status}

                                                </span>

                                            </td>

                                            <td>
                                                {p.amount}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* ==================================================
                    USER ACTIVITY
                ================================================== */}

                <div className="panel">

                    <h3 className="panel-title">

                        <FaUsers />

                        User activity

                    </h3>


                    <table className="table">

                        <thead>

                            <tr>

                                <th>User</th>

                                <th>Role</th>

                                <th>Action</th>

                                <th>Time</th>

                            </tr>

                        </thead>


                        <tbody>

                            {dashboardData.userActivity.map(
                                (a, i) => (

                                    <tr key={i}>

                                        <td>
                                            {a.user}
                                        </td>

                                        <td>

                                            <span className="badge badge-info">

                                                {a.role}

                                            </span>

                                        </td>

                                        <td>
                                            {a.action}
                                        </td>

                                        <td>
                                            {a.time}
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>


            </div>

        </div>

    );

}


export default AdminDashboard;
