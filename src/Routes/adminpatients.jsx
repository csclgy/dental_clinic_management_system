import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const AdminPatients = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 States
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const rawToken = localStorage.getItem("token");
        if (!rawToken) throw new Error("No token found in localStorage");

        const token = rawToken.startsWith("Bearer ")
          ? rawToken.split(" ")[1]
          : rawToken;

        const res = await fetch("http://localhost:3000/auth/displaypatients", {
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

  // 🔹 Handle delete patient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/auth/deletepatient/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete patient");

      setUsers(users.filter((u) => u.user_id !== id));
      alert("Patient deleted successfully");
    } catch (err) {
      console.error("Error deleting patient:", err);
      alert("Could not delete patient");
    }
  };

  // 🔹 Scroll to section if location.state.scrollTo exists
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

  // 🔹 Filtered search
  const filteredRecords = users.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-4">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div
            className="col-sm-3 p-5 rounded-lg shadow-lg"
            style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
          >
            {/* Dashboard */}
            <Link to="/">
              <button
                className="w-full text-left px-4 py-2 hover:bg-blue-100"
                style={{ color: "#00458B" }}
              >
                <i className="fa fa-tachometer" aria-hidden="true"></i> Dashboard
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
                style={{ color: "#00458B" }}
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
                style={{ color: "#00c3b8" }}
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
          <div className="col-sm-8">
            <div className="row">
              {/* Header */}
              <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg text-white">
                <h1 className="text-2xl font-bold">Patients Record</h1>
              </div>

              {/* Table + Search */}
              <div
                className="col-sm-12 mt-4 p-10 rounded-lg shadow-lg"
                style={{ border: "solid", borderColor: "#01D5C4" }}
              >
                {/* Search Bar */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                  <div className="flex justify-between items-center">
                    <div></div>
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

                {/* Patients Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-white text-[#00458B] border-b border-gray-200">
                        <th className="px-4 py-2">Last Name</th>
                        <th className="px-4 py-2">First Name</th>
                        <th className="px-4 py-2">Middle Name</th>
                        <th className="px-4 py-2">Age</th>
                        <th className="px-4 py-2">Gender</th>
                        <th className="px-4 py-2">Contact No.</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            Loading...
                          </td>
                        </tr>
                      ) : filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                          <tr
                            key={record.user_id}
                            className="border-b border-gray-200 text-center"
                          >
                            <td className="px-4 py-2 text-blue-700">{record.lname}</td>
                            <td className="px-4 py-2 text-blue-700">{record.fname}</td>
                            <td className="px-4 py-2 text-blue-700">{record.mname}</td>
                            <td className="px-4 py-2 text-blue-700">{record.age}</td>
                            <td className="px-4 py-2 text-blue-700">{record.gender}</td>
                            <td className="px-4 py-2 text-blue-700">{record.contact_no}</td>
                            <td className="px-4 py-2 text-blue-700">{record.email}</td>
                            <td className="px-4 py-2 flex gap-2 justify-center">
                              <Link to={`/adminpatientsview/${record.user_id}`}>
                                <button className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-4 py-1 rounded-full">
                                  View
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(record.user_id)}
                                className="bg-[#f44336] text-white px-4 py-1 rounded-full"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4 text-gray-500">
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                            <div className="col-sm-12">
                                <div className="row">
                                    <div className="col-sm-6">
                                    </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-4">

                                                </div>
                                            <div className="col-sm-8">
                                                    <br />
                                                    <br />
                                                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/register2")}>Generate Report</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty Column for Spacing */}
          <div className="col-sm-2"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminPatients;
