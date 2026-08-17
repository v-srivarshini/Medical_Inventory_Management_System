import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import CircularStat from "./Circularstat";
import { useEffect, useState } from "react";
import { getAnalyticsData } from "../../services/authService";

import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

import {
  FaPills,
  FaBoxes,
  FaExclamationTriangle,
  FaBan,
  FaCalendarAlt,
  FaHourglassEnd,
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaCalendarCheck,
  FaTruck,
  FaStar,
  FaBell,
  FaEnvelopeOpenText,
  FaUsers,
  FaUserShield,
  FaUserMd,
  FaUserTag
} from "react-icons/fa";

import "./AnalyticsDashboard.css";

/* ================= Fallback sample data =================
   Populates every module from day one; gets replaced field
   by field once the analytics endpoint returns real data.  */

const COLORS = ["#0B6E63", "#4C8DFF", "#C97F1E", "#B3402A", "#7CB9A8", "#8B5CF6"];

// Paired color + soft tint for each ring — the tint drives the track
// and the icon-badge background, the color drives the filled arc.
const RING = {
  green: { color: "#1FAE7A", tint: "#DCF3EA" },
  amber: { color: "#F2B33D", tint: "#FDF0D9" },
  red: { color: "#E14B4B", tint: "#FBDEDE" },
  indigo: { color: "#6C5CE7", tint: "#E7E4FB" },
  purple: { color: "#4B3F94", tint: "#E4E1F5" },
  blue: { color: "#4C8DFF", tint: "#E2ECFB" },
  orange: { color: "#C97F1E", tint: "#F6E6C8" },
  teal: { color: "#0B6E63", tint: "#DCEAE6" },
};

const DEFAULT_STATE = {
  // Inventory Analytics
  totalMedicines: 186,
  totalStock: 24500,
  lowStock: 12,
  outOfStock: 3,
  expiringSoon: 9,
  expired: 4,

  // Purchase Analytics
  totalPurchaseOrders: 96,
  pendingOrders: 8,
  completedOrders: 84,
  ordersThisMonth: 14,

  // Supplier Analytics
  totalSuppliers: 12,
  mostActiveSupplier: "MedSupply Co.",

  // Notification Analytics
  totalNotifications: 58,
  lowStockAlerts: 12,
  expiryAlerts: 9,
  unreadNotifications: 6,

  // User Analytics
  totalUsers: 22,
  totalAdmins: 3,
  totalPharmacists: 7,
  totalStaff: 12,

  // Medicines by therapeutic category (pie + stock bar)
  categoryData: [
    { category: "Antibiotics", count: 42, stock: 6200 },
    { category: "Painkillers", count: 35, stock: 5100 },
    { category: "Cardiac", count: 24, stock: 3200 },
    { category: "Diabetes Care", count: 18, stock: 2800 },
    { category: "Vitamins", count: 30, stock: 4100 },
    { category: "Other", count: 37, stock: 3100 },
  ],

  // Medicines by dosage form
  dosageFormData: [
    { form: "Tablet", count: 78 },
    { form: "Syrup", count: 34 },
    { form: "Injection", count: 26 },
    { form: "Capsule", count: 31 },
    { form: "Ointment", count: 17 },
  ],

  // Monthly purchase orders
  monthlyPurchases: [
    { month: "Mar", orders: 9 },
    { month: "Apr", orders: 11 },
    { month: "May", orders: 8 },
    { month: "Jun", orders: 14 },
    { month: "Jul", orders: 12 },
    { month: "Aug", orders: 14 },
  ],

  // Low stock trend
  lowStockTrend: [
    { month: "Mar", count: 6 },
    { month: "Apr", count: 9 },
    { month: "May", count: 7 },
    { month: "Jun", count: 11 },
    { month: "Jul", count: 8 },
    { month: "Aug", count: 12 },
  ],

  // Supplier contribution (medicines supplied)
  supplierContribution: [
    { supplier: "MedSupply Co.", medicines: 58 },
    { supplier: "PharmaLink Ltd.", medicines: 34 },
    { supplier: "Global Health Distributors", medicines: 21 },
    { supplier: "Wellness Pharma", medicines: 17 },
  ],

  mostStocked: [
    { medicine: "Amoxicillin 500mg", qty: 1240 },
    { medicine: "Metformin 500mg", qty: 890 },
    { medicine: "Paracetamol 650mg", qty: 760 },
  ],

  leastStocked: [
    { medicine: "Azithromycin 250mg", qty: 0 },
    { medicine: "Insulin Glargine", qty: 38 },
    { medicine: "Losartan 50mg", qty: 45 },
  ],
};

function AnalyticsDashboard() {
  const [data, setData] = useState(DEFAULT_STATE);

  useEffect(() => {

    const loadAnalytics = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await getAnalyticsData(token);

        setData((prev) => ({ ...prev, ...response.data }));

      } catch (error) {

        console.log(error);

      }

    };

    loadAnalytics();

  }, []);

  return (
    <div className="analytics-container">

      <Sidebar role="admin" />

      <div className="main-content">

        <Navbar userName={localStorage.getItem("fullName")} />

        {/* ---------------- Inventory Analytics ---------------- */}
        <h2 className="section-heading">📊 Inventory Analytics</h2>
        <div className="circular-row" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "30px", width: "100%" }}>
          <CircularStat value={data.totalMedicines} label="Medicines" icon={<FaPills />} percent={82} {...RING.green} />
          <CircularStat value={data.totalStock} label="Total Stock" icon={<FaBoxes />} percent={74} {...RING.teal} />
          <CircularStat value={data.lowStock} label="Low Stock" icon={<FaExclamationTriangle />} percent={30} {...RING.amber} />
          <CircularStat value={data.outOfStock} label="Out of Stock" icon={<FaBan />} percent={18} {...RING.red} />
          <CircularStat value={data.expiringSoon} label="Expiring Soon" icon={<FaCalendarAlt />} percent={55} {...RING.indigo} />
          <CircularStat value={data.expired} label="Expired" icon={<FaHourglassEnd />} percent={40} {...RING.purple} />
        </div>

        {/* ---------------- Medicine Analytics ---------------- */}
        <h2 className="section-heading">🏥 Medicine Analytics</h2>
        <div className="grid-2">

          <div className="panel">
            <h3 className="panel-title">Medicines by category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => entry.category}
                >
                  {data.categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="panel">
            <h3 className="panel-title">Medicines by dosage form</h3>
            <p className="sub-label">Tablet, syrup, injection, capsule, ointment</p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={data.dosageFormData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="form" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0B6E63" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="grid-2">

          <div className="panel">
            <h3 className="panel-title"><FaCheckCircle /> Most stocked medicines</h3>
            <table className="table">
              <thead><tr><th>Medicine</th><th>Qty</th></tr></thead>
              <tbody>
                {data.mostStocked.map((m) => (
                  <tr key={m.medicine}><td>{m.medicine}</td><td>{m.qty}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h3 className="panel-title"><FaExclamationTriangle /> Least stocked medicines</h3>
            <table className="table">
              <thead><tr><th>Medicine</th><th>Qty</th></tr></thead>
              <tbody>
                {data.leastStocked.map((m) => (
                  <tr key={m.medicine}>
                    <td>{m.medicine}</td>
                    <td><span className={`badge ${m.qty === 0 ? "badge-danger" : "badge-warning"}`}>{m.qty}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* ---------------- Purchase Analytics ---------------- */}
        <h2 className="section-heading">💰 Purchase Analytics</h2>
        <div className="circular-row" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "30px", width: "100%" }}>
          <CircularStat value={data.totalPurchaseOrders} label="Total Orders" icon={<FaShoppingCart />} percent={80} {...RING.teal} />
          <CircularStat value={data.pendingOrders} label="Pending" icon={<FaClock />} percent={25} {...RING.amber} />
          <CircularStat value={data.completedOrders} label="Completed" icon={<FaCheckCircle />} percent={88} {...RING.green} />
          <CircularStat value={data.ordersThisMonth} label="This Month" icon={<FaCalendarCheck />} percent={45} {...RING.blue} />
        </div>

        <div className="grid-2">

          <div className="panel">
            <h3 className="panel-title">Monthly purchase orders</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.monthlyPurchases}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#0B6E63" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="panel">
            <h3 className="panel-title">Purchases by supplier</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.supplierContribution} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="supplier" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="medicines" fill="#4C8DFF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* ---------------- Supplier Analytics ---------------- */}
        <h2 className="section-heading">🚚 Supplier Analytics</h2>
        <div className="circular-row" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "30px", width: "100%" }}>
          <CircularStat value={data.totalSuppliers} label="Total Suppliers" icon={<FaTruck />} percent={70} {...RING.blue} />
          <CircularStat value={data.mostActiveSupplier} label="Most Active" icon={<FaStar />} percent={90} {...RING.orange} />
        </div>

        {/* ---------------- Stock Analytics ---------------- */}
        <h2 className="section-heading">📦 Stock Analytics</h2>
        <div className="grid-2">

          <div className="panel">
            <h3 className="panel-title">Stock levels by category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="stock" fill="#C97F1E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel">
            <h3 className="panel-title">Low stock trend</h3>
            <p className="sub-label">Number of low-stock items over the last 6 months</p>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={data.lowStockTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#B3402A" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* ---------------- Notification Analytics ---------------- */}
        <h2 className="section-heading">🔔 Notification Analytics</h2>
        <div className="circular-row" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "30px", width: "100%" }}>
          <CircularStat value={data.totalNotifications} label="Total" icon={<FaBell />} percent={78} {...RING.teal} />
          <CircularStat value={data.lowStockAlerts} label="Low Stock Alerts" icon={<FaExclamationTriangle />} percent={30} {...RING.amber} />
          <CircularStat value={data.expiryAlerts} label="Expiry Alerts" icon={<FaCalendarAlt />} percent={25} {...RING.indigo} />
          <CircularStat value={data.unreadNotifications} label="Unread" icon={<FaEnvelopeOpenText />} percent={15} {...RING.red} />
        </div>

        {/* ---------------- User Analytics ---------------- */}
        <h2 className="section-heading">👥 User Analytics</h2>
        <div className="circular-row" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "30px", width: "100%" }}>
          <CircularStat value={data.totalUsers} label="Total Users" icon={<FaUsers />} percent={85} {...RING.teal} />
          <CircularStat value={data.totalAdmins} label="Admins" icon={<FaUserShield />} percent={20} {...RING.purple} />
          <CircularStat value={data.totalPharmacists} label="Pharmacists" icon={<FaUserMd />} percent={45} {...RING.blue} />
          <CircularStat value={data.totalStaff} label="Staff" icon={<FaUserTag />} percent={65} {...RING.green} />
        </div>

      </div>

    </div>
  );
}

export default AnalyticsDashboard;
