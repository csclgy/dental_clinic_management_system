import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";

const AdminSchedule = () => {
const { id } = useParams();
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);

  // Scroll to section
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

  // Fetch consultations
  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          return;
        }

        const res = await fetch(`http://localhost:3000/auth/displayconsultations`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.message || "Failed to fetch consultation");
          return;
        }

        const data = await res.json();
        console.log("Fetched consultations:", data); // 👀 debug
        setRecords(Array.isArray(data.consultations) ? data.consultations : []);
      } catch (err) {
        console.error("Error fetching consultation:", err);
        setError("Server error");
      }
    };

    fetchConsultation();

    const interval = setInterval(fetchConsultation, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

      // 🔹 Handle delete consultation
  const handleDelete = async (appointId) => {
    if (!window.confirm("Are you sure you want to delete this consultation?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/auth/deleteconsultation/${appointId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete consultation");

      setConsultations(consultations.filter((record) => record.appoint_id !== appointId));
      alert("Consultation deleted successfully");
    } catch (err) {
      console.error("Error deleting consultation:", err);
      alert("Could not delete consultation");
    }
  };

  // Filtered records
  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
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
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                </button>
              </Link>

              {/* Schedule */}
              <Link to="/adminschedule">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00c3b8" }}
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
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <h1 className="text-2xl font-bold">Schedules</h1>
                </div>

                <p style={{ color: "transparent" }}>...</p>

                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  {/* Search bar */}
                  <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                    <div className="flex justify-between items-center mb-1">
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

                  {/* Table */}
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-white text-[#00458B] border-b border-gray-200">
                          <th className="px-4 py-2 text-center">Visit Date</th>
                          <th className="px-4 py-2 text-center">Last Name</th>
                          <th className="px-4 py-2 text-center">First Name</th>
                          <th className="px-4 py-2 text-center">Services</th>
                          <th className="px-4 py-2 text-center">Dentist</th>
                          <th className="px-4 py-2 text-center">Status</th>
                          <th className="px-4 py-2 text-center"></th>
                          <th className="px-4 py-2 text-center"></th>
                          <th className="px-4 py-2 text-center"></th>
                          <th className="px-4 py-2 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200 text-center"
                            >
                              <td className="px-4 py-2 text-blue-700">{record.pref_date}</td>
                              <td className="px-4 py-2 text-blue-700">{record.p_lname}</td>
                              <td className="px-4 py-2 text-blue-700">{record.p_fname}</td>
                              <td className="px-4 py-2 text-blue-700">{record.procedure_type}</td>
                              <td className="px-4 py-2 text-blue-700">{record.attending_dentist}</td>
                              <td className="px-4 py-2 text-blue-700">{record.appointment_status}</td>
                              <td className="px-4 py-2 space-x-2">
                                <Link to={`/adminconsultationview/${record.appoint_id}`}>
                                  <button 
                                    className="bg-[#008CBA] text-white font-semibold px-3 py-1 rounded-full">
                                    View
                                  </button>  
                                </Link>
                              </td>
                              <td className="px-4 py-2 space-x-2">
                                <button 
                                    onClick={() => handleDelete(record.appoint_id)}
                                    className="bg-[#f44336] text-white px-4 py-1 rounded-full">Delete
                                </button>
                              </td>
                              <td className="px-4 py-2 space-x-2">
                                <button className="bg-[#e7e7e7] text-black px-3 py-1 rounded-full">
                                  Cancel
                                </button>
                              </td>
                              <td className="px-4 py-2 space-x-2">
                                <button className="bg-[#00c3b8] text-white font-semibold px-3 py-1 rounded-full">
                                  + Follow Up
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center text-gray-500 py-4"
                            >
                              No records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedule;