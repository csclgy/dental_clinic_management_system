import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Calendar, Users, BarChart3, ChevronDown, ChevronUp, Menu, X, AlertTriangle, PlusCircle, PhilippinePeso } from "lucide-react";

import axios from "axios";

function AdminUsers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  // ✅ Popup state (notification)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // ✅ Confirmation modal
  const [confirmBox, setConfirmBox] = useState({
    show: false,
    userId: null,
    userName: "",
  });

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // Scroll behavior (same as inventory page)
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const rawToken = localStorage.getItem("token");
        if (!rawToken) throw new Error("No token found in localStorage");

        const token = rawToken.startsWith("Bearer ") ? rawToken.split(" ")[1] : rawToken;

        const res = await fetch("http://localhost:3000/auth/displayusers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Fetch users error:", err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async () => {
    try {
      const rawToken = localStorage.getItem("token");
      const token =
        rawToken && rawToken.startsWith("Bearer ")
          ? rawToken.split(" ")[1]
          : rawToken;

      await axios.delete(
        `http://localhost:3000/auth/deleteuserinfo/${confirmBox.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.filter((u) => u.user_id !== confirmBox.userId));
      setConfirmBox({ show: false, userId: null, userName: "" });
      showPopup("User deleted successfully.", "success");
    } catch (err) {
      console.error("Error deleting user:", err);
      showPopup("Failed to delete user.", "error");
    }
  };

  // 🔹 Apply both search and role filter
  const filteredUsers = users.filter((user) => {
    // Exclude Patients entirely
    if (user.role.toLowerCase() === "patient") return false;

    const matchesSearch = Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "All" || user.role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/inventorydashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Inventory Dashboard
              </Link>
              <Link to="/receptionistdashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Receptionist Dashboard
              </Link>
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
              <button onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <span className="flex items-center gap-2">
                  <i className="fa fa-book"></i> Ledger
                </span>
                {isLedgerOpen ?
                  <ChevronUp size={16} /> :
                  <ChevronDown size={16} />}
              </button>

              {isLedgerOpen && (
                <div className="ml-6 flex flex-col gap-1 text-sm">
                  <Link
                    to="/admincoa"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Chart of Accounts
                  </Link>
                  <Link
                    to="/adminjournal"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Journal Entries
                  </Link>
                  <Link
                    to="/adminsubsidiaryreceivable"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Subsidiary
                  </Link>
                  <Link
                    to="/admingeneral"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    General Ledger
                  </Link>
                  <Link
                    to="/admintrial"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Trial Balance
                  </Link>
                </div>
              )}

              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Users size={18} /> Users
              </Link>
            </>
          )}

          {(role === "admin" || role === "inventory") && (
            <>
              <Link
                to="/admininventory"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-archive"></i> Inventory
              </Link>
            </>
          )}

          {(role === "admin" || role === "dentist" || role === "receptionist") && (
            <>
              <Link
                to="/adminpatients"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-user-plus"></i> Patients
              </Link>
              <Link
                to="/adminschedule"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Calendar size={18} /> Schedules
              </Link>
            </>
          )}

          {(role === "admin" || role === "receptionist") && (
            <>
              <Link
                to="/admincashier"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <PhilippinePeso size={18} /> Cashier
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link
                to="/adminaudit"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-eye"></i> Audit Trail
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">

        {/* ✅ Popup Notification */}
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
              } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}

        {/* ✅ Delete Confirmation Modal */}
        {confirmBox.show && (
          <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-[9998]">
            <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 text-center relative animate-fadeIn">
              <AlertTriangle className="text-red-500 mx-auto mb-3" size={50} />
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Are you sure you want to deactivate this user?
              </h2>
              <p className="text-gray-600 mb-6">
                <span className="font-semibold text-[#00458B]">
                  {confirmBox.userName}
                </span>{" "}
                will be permanently inactive.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() =>
                    setConfirmBox({ show: false, userId: null, userName: "" })
                  }
                  className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">Users Management</h1>

          <div className="flex gap-3">
            <Link
              to="/adminusersadd"
              className="flex items-center gap-2 font-bold bg-[#00458B] text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Add New User
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
          <div className="flex justify-between items-center gap-4">
            {/* Role Filter Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-[#00458B] rounded-lg px-3 py-2 text-sm text-[#00458B] font-medium"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Dentist">Dentist</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Inventory Staff">Inventory Staff</option>
            </select>

            {/* Search Bar */}
            <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-64">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-700"
              />
              <i className="fa fa-search text-[#00458B]"></i>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading users…</p>
          ) : (
            <div className="overflow-x-auto mt-6">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100 text-[#00458B] sticky top-0 z-10">
                    <tr className="bg-gray-100 text-[#00458B]">
                      <th className="px-4 py-2 text-center">Username</th>
                      <th className="px-4 py-2 text-center">Access Level</th>
                      <th className="px-4 py-2 text-center">Name</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const isInactive = user.user_status?.toLowerCase() === "inactive";

                        return (
                          <tr
                            key={user.user_id}
                            className={`border-b border-gray-200 text-center ${isInactive ? "bg-gray-100 text-gray-500" : ""
                              }`}
                          >
                            <td className="px-4 py-2 text-blue-700">{user.user_name}</td>
                            <td className="px-4 py-2">{user.role}</td>
                            <td className="px-4 py-2">{`${user.fname} ${user.mname || ""} ${user.lname}`}</td>
                            <td
                              className={`px-4 py-2 font-semibold ${isInactive ? "text-red-500" : "text-green-600"
                                }`}
                            >
                              {isInactive ? "Inactive" : "Active"}
                            </td>
                            <td className="px-4 py-2 flex gap-2 justify-center">
                              {/* ✅ Edit should always be clickable */}
                              <Link to={`/adminusersedit/${user.user_id}`}>
                                <button
                                  className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                                >
                                  Edit
                                </button>
                              </Link>

                              {/* ❌ Deactivate should be disabled if already inactive */}
                              <button
                                disabled={isInactive}
                                onClick={() => {
                                  if (!isInactive) {
                                    setConfirmBox({
                                      show: true,
                                      userId: user.user_id,
                                      userName: user.user_name,
                                    });
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg ${isInactive
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-red-500 text-white hover:bg-red-600"
                                  }`}
                              >
                                {isInactive ? "Deactivate" : "Deactivate"}
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-gray-500 py-4">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;
