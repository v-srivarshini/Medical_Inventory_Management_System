import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import "../Medicines/Medicines.css";
import "../Medicines/MedicineFormModal.css";
import "./UsersTable.css";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye
} from "react-icons/fa";

import DashboardCards from "./DashboardCards";
import SearchFilter from "./SearchFilter";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const getRoleClass = (roleName = "") => roleName.toLowerCase();

const Users = () => {

  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const [viewUser, setViewUser] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const usersPerPage = 6;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    roleId: ""
  });

  const fetchUsers = async () => {

    try {

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers(res.data);

    } catch (err) {
      console.log(err);
    }

  };

  useEffect(() => {

    const load = async () => {

      setLoading(true);

      await fetchUsers();

      setLoading(false);

    };

    load();

  }, []);

  useEffect(() => {

    let temp = [...users];

    if (search !== "") {

      temp = temp.filter(user =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );

    }

    if (activeFilter !== "ALL") {

      temp = temp.filter(
        user =>
          user.roleName?.toUpperCase() === activeFilter
      );

    }

    setFilteredUsers(temp);

  }, [users, search, activeFilter]);

  const indexOfLast = currentPage * usersPerPage;

  const indexOfFirst = indexOfLast - usersPerPage;

  const currentUsers =
    filteredUsers.slice(indexOfFirst, indexOfLast);

  const totalPages =
    Math.ceil(filteredUsers.length / usersPerPage);

  const handleDelete = async (id) => {

    const result = await Swal.fire({

      title: "Delete User?",

      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#14968d"

    });

    if (!result.isConfirmed) return;

    try {

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Swal.fire(
        "Deleted!",
        "User removed successfully.",
        "success"
      );

      fetchUsers();

    } catch (err) {

      console.log(err);

    }

  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-success" />
        <h4>Loading Users...</h4>
      </div>
    );
  }

  return (

    <div className="medicine-page">

      <div className="medicine-header">

        <div>

          <h1>👥 Users Dashboard</h1>

          <p>Manage all registered users</p>

        </div>

        <button
          className="add-btn"
          onClick={() => {
            setSelectedUser(null);

            setFormData({
              fullName: "",
              email: "",
              phone: "",
              roleId: ""
            });

            setShowModal(true);

          }}
        >

          <FaPlus />

          Add User

        </button>

      </div>

      <DashboardCards users={users} />

      <SearchFilter

        search={search}

        setSearch={setSearch}

        activeFilter={activeFilter}

        setActiveFilter={setActiveFilter}

      />

      <div className="card shadow border-0 rounded-4 users-table-wrapper">

        <div className="card-body p-0">

          <table className="table table-hover align-middle mb-0">

            <thead style={{ background: "#14968d", color: "white" }}>

              <tr>

                <th>ID</th>

                <th>User</th>

                <th>Email</th>

                <th>Phone</th>

                <th>Role</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {
                currentUsers.length > 0 ?

                  currentUsers.map(user => (

                    <tr key={user.userId}>

                      <td>{user.userId}</td>

                      <td>

                        <div className="user-cell">

                          <div className="user-avatar">

                            {getInitials(user.fullName)}

                          </div>

                          <h6>{user.fullName}</h6>

                        </div>

                      </td>

                      <td>{user.email}</td>

                      <td>{user.phone}</td>

                      <td>

                        <span className={`role-badge ${getRoleClass(user.roleName)}`}>

                          {user.roleName}

                        </span>

                      </td>

                      <td>

                        <div className="action-buttons">

                          <button

                            className="btn btn-info btn-sm"

                            onClick={() => setViewUser(user)}

                          >

                            <FaEye />

                          </button>

                          <button

                            className="btn btn-outline-primary btn-sm"

                            onClick={() => {

                              setSelectedUser(user);

                              setFormData({

                                fullName: user.fullName,

                                email: user.email,

                                phone: user.phone,

                                roleId: user.roleId

                              });

                              setShowModal(true);

                            }}

                          >

                            <FaEdit />

                          </button>

                          <button

                            className="btn btn-outline-danger btn-sm"

                            onClick={() => handleDelete(user.userId)}

                          >

                            <FaTrash />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                  :

                  <tr>

                    <td colSpan="6" className="text-center p-5">

                      No Users Found

                    </td>

                  </tr>
              }

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

                  className={currentPage === index + 1 ? "active-page" : ""}

                  onClick={() => setCurrentPage(index + 1)}

                >

                  {index + 1}

                </button>

              ))

            }

            <button

              disabled={currentPage === totalPages || totalPages === 0}

              onClick={() => setCurrentPage(currentPage + 1)}

            >

              Next

            </button>

          </div>

        </div>

      </div>

      {

        viewUser && (

          <div className="drawer-overlay">

            <div className="drawer">

              <div className="drawer-header">

                <h2>

                  👤 {viewUser.fullName}

                </h2>

                <button

                  className="close-btn"

                  onClick={() => setViewUser(null)}

                >

                  ✖

                </button>

              </div>

              <div className="drawer-content">

                <div className="drawer-card">

                  <h5>User Details</h5>

                  <p><strong>ID :</strong> {viewUser.userId}</p>

                  <p><strong>Name :</strong> {viewUser.fullName}</p>

                  <p><strong>Email :</strong> {viewUser.email}</p>

                  <p><strong>Phone :</strong> {viewUser.phone}</p>

                  <p><strong>Role :</strong> {viewUser.roleName}</p>

                </div>

              </div>

            </div>

          </div>

        )

      }
      {
        showModal && (

          <div className="modal-overlay">

            <div className="medicine-modal wide">

              <h3>

                {selectedUser ? "Edit User" : "Add User"}

              </h3>

              <div className="form-grid">

                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jordan Reyes"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="e.g. jordan@medistock.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Role</label>
                  <select

                    className="supplier-select"

                    value={formData.roleId}

                    onChange={(e) =>

                      setFormData({

                        ...formData,

                        roleId: e.target.value

                      })

                    }

                  >

                    <option value="">

                      Select Role

                    </option>

                    <option value="1">

                      Admin

                    </option>

                    <option value="2">

                      Pharmacist

                    </option>

                    <option value="3">

                      Staff

                    </option>

                  </select>
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

                  onClick={async () => {

                    try {

                      if (selectedUser) {

                        await axios.put(

                          `http://localhost:8080/api/users/${selectedUser.userId}`,

                          formData,

                          {

                            headers: {

                              Authorization: `Bearer ${token}`

                            }

                          }

                        );

                        Swal.fire(

                          "Success",

                          "User Updated Successfully",

                          "success"

                        );

                      }

                      else {

                        Swal.fire(

                          "Oops",

                          "User Creation Not Implemented Yet",

                          "info"

                        );

                      }

                      setShowModal(false);

                      fetchUsers();

                    }

                    catch (err) {

                      console.log(err);

                      Swal.fire(

                        "Error",

                        "Operation Failed",

                        "error"

                      );

                    }

                  }}

                >

                  Save

                </button>

              </div>

            </div>

          </div>

        )
      }
    </div>

  );

};

export default Users;
