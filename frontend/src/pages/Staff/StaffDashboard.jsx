import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import ChatBot from "../../components/ChatBot/ChatBot";

import {
  FaBoxes,
  FaShoppingCart,
  FaClipboardList,
  FaExclamationTriangle,
  FaSearch,
  FaCalendarAlt
} from "react-icons/fa";

import { getDashboardData } from "../../services/authService";

import "./StaffDashboard.css";

/* ---------------- Fallback sample data ---------------- */

const DEFAULT_STATE = {
  inventory: 0,
  suppliers: 0,
  purchaseOrders: 10,
  stockAvailable: 0,
  lowStock: 0,
  expiryAlerts: 0,

  // Values used by the KPI cards
  stockLogs: 944,
  lowStockAlerts: 0,

  medicines: [
    {
      medicine: "Amoxicillin 500mg",
      batch: "BAT-22981",
      qty: 1240,
      status: "In stock"
    },
    {
      medicine: "Insulin Glargine",
      batch: "BAT-23015",
      qty: 38,
      status: "Low stock"
    },
    {
      medicine: "Paracetamol 650mg",
      batch: "BAT-22750",
      qty: 60,
      status: "Low stock"
    },
    {
      medicine: "Metformin 500mg",
      batch: "BAT-23102",
      qty: 890,
      status: "In stock"
    },
    {
      medicine: "Azithromycin 250mg",
      batch: "BAT-22899",
      qty: 0,
      status: "Out of stock"
    }
  ],

  recentStockLogs: [
    {
      date: "2026-08-01",
      medicine: "Amoxicillin 500mg",
      change: "+200",
      by: "You"
    },
    {
      date: "2026-07-31",
      medicine: "Paracetamol 650mg",
      change: "-40",
      by: "You"
    },
    {
      date: "2026-07-30",
      medicine: "Metformin 500mg",
      change: "+500",
      by: "A. Khan"
    }
  ],

  purchaseOrdersList: [
    {
      orderId: "PO-2291",
      supplier: "MedSupply Co.",
      status: "Delivered",
      expected: "2026-07-29"
    },
    {
      orderId: "PO-2298",
      supplier: "PharmaLink Ltd.",
      status: "In transit",
      expected: "2026-08-03"
    },
    {
      orderId: "PO-2302",
      supplier: "Global Health Distributors",
      status: "Pending",
      expected: "2026-08-06"
    }
  ],

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
  ]
};


/* ---------------- Status badge ---------------- */

function statusBadgeClass(status) {
  const value = String(status).toLowerCase();

  if (value === "in stock" || value === "delivered") {
    return "badge badge-ok";
  }

  if (value === "low stock" || value === "pending") {
    return "badge badge-warning";
  }

  if (value === "out of stock") {
    return "badge badge-danger";
  }

  return "badge badge-info";
}


/* ---------------- Staff Dashboard ---------------- */

function StaffDashboard() {

  const [dashboardData, setDashboardData] = useState(DEFAULT_STATE);

  const [searchTerm, setSearchTerm] = useState("");

  // Quick stock update form state
  const [updateMedicine, setUpdateMedicine] = useState("");
  const [updateQty, setUpdateQty] = useState("");
  const [updateNote, setUpdateNote] = useState("");


  /* ---------------- Load dashboard ---------------- */

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await getDashboardData(
          token,
          "STAFF"
        );

        console.log(
          "STAFF DASHBOARD RESPONSE:",
          response.data
        );

        const data = response.data || {};


        /*
         * Keep array fields safe.
         *
         * If backend sends an object/null instead of an array,
         * we keep the existing fallback array.
         */

        setDashboardData((prev) => ({

          ...prev,

          ...data,


          /* ---------- Array fields ---------- */

          medicines: Array.isArray(data.medicines)
            ? data.medicines
            : prev.medicines,

          lowStockItems: Array.isArray(data.lowStockItems)
            ? data.lowStockItems
            : prev.lowStockItems,

          expiringMedicines: Array.isArray(data.expiringMedicines)
            ? data.expiringMedicines
            : prev.expiringMedicines,

          recentStockLogs: Array.isArray(data.recentStockLogs)
            ? data.recentStockLogs
            : prev.recentStockLogs,

          purchaseOrdersList: Array.isArray(data.purchaseOrdersList)
            ? data.purchaseOrdersList
            : prev.purchaseOrdersList,


          /* ---------- KPI field mapping ---------- */

          stockLogs:
            data.stockLogs ??
            data.totalStockLogs ??
            prev.stockLogs,

          lowStockAlerts:
            data.lowStockAlerts ??
            data.lowStock ??
            prev.lowStockAlerts

        }));

      } catch (error) {

        console.error(
          "Failed to load staff dashboard data:",
          error
        );

      }

    };


    fetchDashboardData();

  }, []);


  /* ---------------- Search medicines ---------------- */

  const filteredMedicines = useMemo(() => {

    const medicines = Array.isArray(dashboardData.medicines)
      ? dashboardData.medicines
      : [];

    if (!searchTerm.trim()) {
      return medicines;
    }

    const term = searchTerm.toLowerCase();

    return medicines.filter((medicine) => {

      const medicineName =
        String(medicine.medicine || "").toLowerCase();

      const batch =
        String(medicine.batch || "").toLowerCase();

      return (
        medicineName.includes(term) ||
        batch.includes(term)
      );

    });

  }, [searchTerm, dashboardData.medicines]);


  /* ---------------- Quick stock update ---------------- */

  function handleStockUpdate(e) {

    e.preventDefault();

    if (!updateMedicine || !updateQty) {
      return;
    }

    // TODO: Connect to POST /api/inventory/stock-update

    console.log(
      "Stock update submitted:",
      {
        medicine: updateMedicine,
        qtyChange: updateQty,
        note: updateNote
      }
    );

    setUpdateMedicine("");
    setUpdateQty("");
    setUpdateNote("");

  }


  /* ---------------- Render ---------------- */

  return (

    <div className="staff-container">

      <Sidebar role="staff" />

      <div className="main-content">

        <Navbar
          userName={localStorage.getItem("fullName")}
        />


        {/* ================= KPI CARDS ================= */}

        <div className="cards">

          <DashboardCard
            title="Inventory"
            value={dashboardData.inventory ?? 0}
            icon={<FaBoxes />}
          />


          <DashboardCard
            title="Medicines"
            value={dashboardData.purchaseOrders ?? 0}
            icon={<FaShoppingCart />}
          />


          <DashboardCard
            title="Stock Logs"
            value={dashboardData.stockLogs ?? 0}
            icon={<FaClipboardList />}
          />


          <DashboardCard
            title="Low-Stock Alerts"
            value={
              dashboardData.lowStockAlerts ??
              dashboardData.lowStock ??
              0
            }
            icon={<FaExclamationTriangle />}
          />

        </div>


        {/* ================= SEARCH ================= */}

        <div className="panel">

          <h3 className="panel-title">
            <FaSearch />
            Scan & search medicines
          </h3>


          <div className="search-bar">

            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by medicine name or batch number…"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>


          <table className="table">

            <thead>

              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              {filteredMedicines.length === 0 && (

                <tr>

                  <td
                    colSpan={4}
                    className="empty-row"
                  >
                    No medicines match that search.
                  </td>

                </tr>

              )}


              {filteredMedicines.map((medicine) => (

                <tr key={medicine.batch}>

                  <td>
                    {medicine.medicine}
                  </td>

                  <td className="mono">
                    {medicine.batch}
                  </td>

                  <td>
                    {medicine.qty}
                  </td>

                  <td>

                    <span
                      className={statusBadgeClass(
                        medicine.status
                      )}
                    >
                      {medicine.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* ================= LOW STOCK + EXPIRY ================= */}

        <div className="grid-2">


          {/* ---------- Low stock ---------- */}

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

                {Array.isArray(
                  dashboardData.lowStockItems
                ) &&
                  dashboardData.lowStockItems.map(
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
                              Number(item.qty) === 0
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


          {/* ---------- Expiring medicines ---------- */}

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

                {Array.isArray(
                  dashboardData.expiringMedicines
                ) &&
                  dashboardData.expiringMedicines.map(
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
                              Number(item.daysLeft) <= 15
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


      </div>


      {/* ================= CHATBOT ================= */}

      <ChatBot />

    </div>

  );

}


export default StaffDashboard;