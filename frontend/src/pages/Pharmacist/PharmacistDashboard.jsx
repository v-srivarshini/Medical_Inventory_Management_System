import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import { useEffect, useState } from "react";
import { getDashboardData } from "../../services/authService";

import {
  FaPills,
  FaBoxes,
  FaCalendarAlt,
  FaBell,
  FaExclamationTriangle,
  FaTruck,
  FaShoppingCart
} from "react-icons/fa";

import "./PharmacistDashboard.css";

/* ---------------- Fallback sample data ---------------- */

const DEFAULT_STATE = {
  availableMedicines: 10,
  stockAvailable: 944,
  lowStock: 0,
  expiryAlerts: 0,
  notifications: 0,

  lowStockItems: [
    { medicine: "Insulin Glargine", batch: "BAT-23015", qty: 38, reorderLevel: 50 },
    { medicine: "Azithromycin 250mg", batch: "BAT-22899", qty: 0, reorderLevel: 40 },
    { medicine: "Paracetamol 650mg", batch: "BAT-22750", qty: 60, reorderLevel: 100 },
  ],

  expiringMedicines: [
    { medicine: "Paracetamol 650mg", batch: "BAT-22750", expires: "08/2026", daysLeft: 30 },
    { medicine: "Azithromycin 250mg", batch: "BAT-22899", expires: "06/2026", daysLeft: 12 },
  ],

  purchaseSummary: [
    { orderId: "PO-2291", supplier: "MedSupply Co.", date: "2026-07-29", status: "Delivered", amount: "$4,120" },
    { orderId: "PO-2298", supplier: "PharmaLink Ltd.", date: "2026-07-30", status: "In transit", amount: "$2,860" },
    { orderId: "PO-2302", supplier: "Global Health Distributors", date: "2026-08-01", status: "Pending", amount: "$1,540" },
  ],

  supplierInsights: [
    { supplier: "MedSupply Co.", medicinesSupplied: 58, lastOrder: "2026-07-29", status: "Reliable" },
    { supplier: "PharmaLink Ltd.", medicinesSupplied: 34, lastOrder: "2026-07-25", status: "Reliable" },
    { supplier: "Global Health Distributors", medicinesSupplied: 21, lastOrder: "2026-07-22", status: "Watch" },
  ],

  notificationsList: [
    { message: "Insulin Glargine is running low (38 units left)", time: "10 min ago" },
    { message: "Azithromycin 250mg expires in 12 days", time: "1 hour ago" },
    { message: "Purchase order PO-2298 is in transit", time: "3 hours ago" },
  ],
};

function statusBadgeClass(status) {
  const s = String(status).toLowerCase();
  if (s === "delivered" || s === "reliable") return "badge badge-ok";
  if (s === "pending" || s === "watch") return "badge badge-warning";
  if (s === "in transit") return "badge badge-info";
  return "badge badge-info";
}

function PharmacistDashboard() {
  const [dashboardData, setDashboardData] = useState(DEFAULT_STATE);

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        const response = await getDashboardData(token, "PHARMACIST", userId);

        setDashboardData((prev) => ({ ...prev, ...response.data }));

      } catch (error) {

        console.log(error);

      }

    };

    loadDashboard();

  }, []);

  return (

    <div className="pharmacist-container">

      <Sidebar role="pharmacist" />

      <div className="main-content">

        <Navbar userName={localStorage.getItem("fullName")} />

        {/* KPI cards */}
        <div className="cards">

          <DashboardCard title="Available Medicines" value={dashboardData.availableMedicines} icon={<FaPills />} />
          <DashboardCard title="Stock Available" value={dashboardData.stockAvailable} icon={<FaBoxes />} />
          <DashboardCard title="Low Stock" value={dashboardData.lowStock} icon={<FaExclamationTriangle />} />
          <DashboardCard title="Expiry Alerts" value={dashboardData.expiryAlerts} icon={<FaCalendarAlt />} />
          {/* <DashboardCard title="Notifications" value={dashboardData.notifications} icon={<FaBell />} /> */}

        </div>

        {/* Low-stock items + Expiring medicines */}
        <div className="grid-2">

          <div className="panel">
            <h3 className="panel-title"><FaExclamationTriangle /> Low-stock items</h3>
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
                {dashboardData.lowStockItems.map((item) => (
                  <tr key={item.batch}>
                    <td>{item.medicine}</td>
                    <td className="mono">{item.batch}</td>
                    <td>
                      <span className={`badge ${item.qty === 0 ? "badge-danger" : "badge-warning"}`}>{item.qty}</span>
                    </td>
                    <td>{item.reorderLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h3 className="panel-title"><FaCalendarAlt /> Expiring medicines</h3>
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
                {dashboardData.expiringMedicines.map((item) => (
                  <tr key={item.batch}>
                    <td>{item.medicine}</td>
                    <td className="mono">{item.batch}</td>
                    <td>{item.expires}</td>
                    <td>
                      <span className={`badge ${item.daysLeft <= 15 ? "badge-danger" : "badge-warning"}`}>
                        {item.daysLeft}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Purchase summary + Supplier insights */}
        <div className="grid-2">

          <div className="panel">
            <h3 className="panel-title"><FaShoppingCart /> Purchase summary</h3>
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
                {dashboardData.purchaseSummary.map((p) => (
                  <tr key={p.orderId}>
                    <td className="mono">{p.orderId}</td>
                    <td>{p.supplier}</td>
                    <td>{p.date}</td>
                    <td><span className={statusBadgeClass(p.status)}>{p.status}</span></td>
                    <td>{p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h3 className="panel-title"><FaTruck /> Supplier insights</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Medicines</th>
                  <th>Last order</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.supplierInsights.map((s) => (
                  <tr key={s.supplier}>
                    <td>{s.supplier}</td>
                    <td>{s.medicinesSupplied}</td>
                    <td>{s.lastOrder}</td>
                    <td><span className={statusBadgeClass(s.status)}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Notifications */}
        {/* <div className="panel">
          <h3 className="panel-title"><FaBell /> Recent notifications</h3>
          <ul className="notif-list">
            {dashboardData.notificationsList.map((n, i) => (
              <li key={i}>
                <span className="notif-dot" />
                <span className="notif-message">{n.message}</span>
                <span className="notif-time">{n.time}</span>
              </li>
            ))}
          </ul>
        </div> */}

      </div>

    </div>

  );

}

export default PharmacistDashboard;