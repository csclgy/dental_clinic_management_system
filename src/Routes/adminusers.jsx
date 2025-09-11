import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const AdminUsers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // AlertBox state (kept only for Delete)
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  // ✅ Success alert after delete
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    message: "",
  });

  // Scroll to section if state.scrollTo is passed
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

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const rawToken = localStorage.getItem("token");
        if (!rawToken) throw new Error("No token found in localStorage");

        const token = rawToken.startsWith("Bearer ")
          ? rawToken.split(" ")[1]
          : rawToken;

        const res = await fetch("http://localhost:3000/auth/displayusers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Fetch users error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Delete handler (keep alert box here)
  const handleDelete = (id) => {
    setAlertData({
      show: true,
      message: "Are you sure you want to delete this user?",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `http://localhost:3000/auth/deleteuserinfo/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) throw new Error("Failed to delete user");
          setUsers(users.filter((u) => u.user_id !== id));
          setAlertData({ show: false, message: "", onConfirm: null });

          // ✅ Show success alert in center
          setSuccessAlert({ show: true, message: "Account deleted successfully!" });
          setTimeout(() => {
            setSuccessAlert({ show: false, message: "" });
          }, 2000);
        } catch (err) {
          console.error("Error deleting user:", err);
          setAlertData({
            show: true,
            message: "Could not delete user",
            onConfirm: () =>
              setAlertData({ show: false, message: "", onConfirm: null }),
          });
        }
      },
      onCancel: () =>
        setAlertData({ show: false, message: "", onConfirm: null }),
    });
  };

  // AlertBox component (only for Delete now)
  const AlertBox = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-lg font-bold text-[#00c3b8]">Alert</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-[#00c3b8] text-white px-4 py-2 rounded-full font-semibold"
          >
            Confirm
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded-full font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ✅ Success alert styled like your screenshot
  const SuccessAlertBox = ({ message }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[320px] text-center">
        <h2 className="text-lg font-bold text-green-600 mb-2">Success</h2>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );

  // Search filter
  const filteredUsers = users.filter((user) =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
            <div
              className="col-sm-3 p-5 rounded-lg shadow-lg"
              style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
            >
              <Link to="/">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-tachometer" aria-hidden="true"></i>{" "}
                  Dashboard
                </button>
              </Link>

              {/* Ledger with Dropdown */}
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
                style={{ color: "#00458B" }}
              >
                <span>
                  <i className="fa fa-book" aria-hidden="true"></i> Ledger
                </span>
                <i
                  className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`}
                  aria-hidden="true"
                ></i>
              </button>

              {isLedgerOpen && (
                <div className="ml-8 text-sm">
                  <Link to="/admincoa">
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Chart of Accounts
                    </p>
                  </Link>
                  <Link to="/adminjournal">
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Journal Entries
                    </p>
                  </Link>
                  <Link to="/admingeneral">
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      General Ledger
                    </p>
                  </Link>
                  <Link to="/admintrial">
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Trial Balance
                    </p>
                  </Link>
                </div>
              )}

              {/* Users */}
              <Link to="/adminusers">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00c3b8" }}
                >
                  <i className="fa fa-users" aria-hidden="true"></i> Users
                </button>
              </Link>

              {/* Inventory */}
              <Link to="/admininventory">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-archive" aria-hidden="true"></i> Inventory
                </button>
              </Link>

              {/* Patients */}
              <Link to="/adminpatients">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                </button>
              </Link>

              {/* Schedule */}
              <Link to="/adminschedule">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-calendar" aria-hidden="true"></i> Schedules
                </button>
              </Link>

              {/* Audit Trail */}
              <Link to="/adminaudit">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-eye" aria-hidden="true"></i> Audit Trail
                </button>
              </Link>
            </div>

            {/* Main Content */}
            <div className="col-sm-7">
              <div className="row">
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <div className="row">
                    <div className="col-sm-4">
                      <h1 className="text-2xl font-bold">Users Management</h1>
                    </div>
                    <div className="col-sm-4">
                      <button
                        className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                        onClick={() => navigate("/adminusersaddpatient")}
                      >
                        + Add New Patient
                      </button>
                    </div>
                    <div className="col-sm-4">
                      <button
                        className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                        onClick={() => navigate("/adminusersadd")}
                      >
                        + Add New User
                      </button>
                    </div>
                  </div>
                </div>
                <p style={{ color: "transparent" }}>...</p>

                {/* Table */}
                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                    <div className="flex justify-between items-center">
                      <h1 className="font-bold text-[#00458B]"></h1>
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
                  </div>

                  {loading ? (
                    <p className="text-center text-gray-500">Loading users…</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-white text-[#00458B] border-b border-gray-200">
                            <th className="px-4 py-2 text-center">Username</th>
                            <th className="px-4 py-2 text-center">Access Level</th>
                            <th className="px-4 py-2 text-center">Name</th>
                            <th className="px-4 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <tr
                                key={user.user_id}
                                className="border-b border-gray-200 text-center"
                              >
                                <td className="px-4 py-2 text-blue-700">
                                  {user.user_name}
                                </td>
                                <td className="px-4 py-2">{user.role}</td>
                                <td className="px-4 py-2">{`${user.fname} ${
                                  user.mname || ""
                                } ${user.lname}`}</td>
                                <td className="px-4 py-2 flex gap-2 justify-center">
                                  <button
                                    className="bg-[#04AA6D] text-white font-semibold px-4 py-1 rounded-full"
                                    onClick={() =>
                                      navigate(`/adminusersedit/${user.user_id}`)
                                    }
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(user.user_id)}
                                    className="bg-[#f44336] text-white px-4 py-1 rounded-full hover:bg-red-600"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="4"
                                className="text-center text-gray-500 py-4"
                              >
                                No users found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AlertBox render (only for Delete) */}
      {alertData.show && (
        <AlertBox
          message={alertData.message}
          onConfirm={alertData.onConfirm}
          onCancel={alertData.onCancel}
        />
      )}

      {/* ✅ Success Alert render */}
      {successAlert.show && (
        <SuccessAlertBox message={successAlert.message} />
      )}
    </div>
  );
};

export default AdminUsers;
