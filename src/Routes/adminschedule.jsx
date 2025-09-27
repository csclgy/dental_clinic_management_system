import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";  
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);


const AdminSchedule = () => {
  const { id } = useParams();
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // toggle between table & calendar
  const [statusFilter, setStatusFilter] = useState("all");

  const [view, setView] = useState("week");   // default = week view
  const [date, setDate] = useState(new Date()); // default = today

  const events = records.map((record) => {
  const date = new Date(record.pref_date);

  // Example: assume 1-hour appointments starting at 9:00 AM
  // (you can replace with actual start/end times if you have them in DB)
  const start = new Date(date.setHours(9, 0, 0));  
  const end = new Date(date.setHours(10, 0, 0));

  return {
    title: `${record.p_fname} ${record.p_lname} - ${record.procedure_type}`, 
    start,
    end,
    dentist: record.attending_dentist, // optional, in case you need tooltip/details
  };
});


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
        setRecords(Array.isArray(data.consultations) ? data.consultations : []);
      } catch (err) {
        console.error("Error fetching consultation:", err);
        setError("Server error");
      }
    };

    fetchConsultation();
    const interval = setInterval(fetchConsultation, 5000);
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

      setConsultations(consultations.filter((c) => c.appoint_id !== appointId));
      alert("Consultation deleted successfully");
    } catch (err) {
      console.error("Error deleting consultation:", err);
      alert("Could not delete consultation");
    }
  };

    // Scroll effect
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

  const filteredRecords = records.filter((record) => {
    const status = record.appointment_status?.toLowerCase().trim();

    // 🔹 Match filter (all = no filter)
    const matchesFilter =
      statusFilter === "all" ? true : status === statusFilter.toLowerCase();

    // 🔹 Match search
    const matchesSearch = Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesFilter && matchesSearch;
  });

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
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
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
                  <h1 className="text-2xl font-bold">Upcoming Appointments</h1>
                  <div className="mt-3">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-4 py-2 rounded-full mr-2 ${
                        viewMode === "table"
                          ? "bg-[#00c3b8] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setViewMode("calendar")}
                      className={`px-4 py-2 rounded-full ${
                        viewMode === "calendar"
                          ? "bg-[#00c3b8] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Calendar View
                    </button>
                  </div>
                </div>

                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg mt-4"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  {viewMode === "table" ? (
                    // 🔹 Table View
                    <div>
                    {/* Search Bar */}
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                        <div className="flex justify-between items-center">
                          {/* 🔹 Status Filter Dropdown */}
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-[#00458B] rounded-full px-3 py-1 text-sm text-gray-700"
                          >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="incomplete">Incomplete</option>
                            <option value="cancel with refund request">Cancel with refund request</option>
                          </select>

                          {/* 🔹 Search Bar */}
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
                      <div className="overflow-x-auto">
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
                                <tr key={index} className="border-b border-gray-200 text-center">
                                  <td className="px-4 py-2 text-blue-700">{record.pref_date}</td>
                                  <td className="px-4 py-2">{record.p_lname}</td>
                                  <td className="px-4 py-2">{record.p_fname}</td>
                                  <td className="px-4 py-2">{record.procedure_type}</td>
                                  <td className="px-4 py-2">{record.attending_dentist}</td>
                                  <td className="px-4 py-2">{record.appointment_status}</td>

                                  {/* View button always enabled */}
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <button
                                      onClick={() => navigate(`/adminconsultationview/${record.appoint_id}`)}
                                      className="bg-[#008CBA] hover:bg-[#0079A5] transition text-white font-semibold px-4 py-2 rounded-full"
                                    >
                                      View
                                    </button>
                                  </td>

                                  {/* Cancel button → visible if pending/incomplete */}
                                  <td className="px-2 py-3 whitespace-nowrap">
                                      <button
                                        onClick={() => navigate(`/adminschedulecancel/${record.appoint_id}`)}
                                        disabled={!(record.appointment_status === "incomplete" || record.appointment_status === "pending"  || record.appointment_status === "cancel with refund request")}
                                        className={`px-4 py-2 rounded-full transition ${
                                          record.appointment_status === "incomplete" || record.appointment_status === "pending" || record.appointment_status === "cancel with refund request"
                                            ? "bg-[#e7e7e7] hover:bg-gray-300 text-black font-semibold"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                      >
                                        Cancel
                                      </button>
                                  </td>

                                  {/* Follow Up button → visible if pending/incomplete */}
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <Link to="/admininventoryedit" state={{ schedule: record }}>
                                      <button
                                        disabled={!(record.appointment_status === "incomplete" || record.appointment_status === "pending")}
                                        className={`px-4 py-2 rounded-full transition font-semibold ${
                                          record.appointment_status === "incomplete" || record.appointment_status === "pending"
                                            ? "bg-[#00c3b8] hover:bg-[#00a89d] text-white"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                      >
                                        + Follow Up
                                      </button>
                                    </Link>
                                  </td>

                                  {/* Complete button → visible only if status = incomplete */}
                                  <td className="px-2 py-3 whitespace-nowrap">
                                      <button
                                        onClick={() => navigate(`/adminconsultationcomplete/${record.appoint_id}`)}
                                        disabled={record.appointment_status !== "incomplete"}
                                        className={`px-4 py-2 rounded-full transition font-semibold ${
                                          record.appointment_status === "incomplete"
                                            ? "bg-green-600 hover:bg-green-700 text-white"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                      >
                                        Complete
                                      </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="10" className="text-center text-gray-500 py-4">
                                  No records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    // 🔹 Calendar View
                    <div className="bg-white rounded-lg shadow-lg p-4">
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      views={["month", "week", "day"]}
                      view={view}
                      onView={setView}
                      date={date}
                      onNavigate={setDate}
                      step={30}
                      timeslots={2}
                      min={view !== "month" ? new Date(1970, 1, 1, 8, 0) : undefined}   // only apply on week/day
                      max={view !== "month" ? new Date(1970, 1, 1, 16, 0) : undefined}
                      toolbar={true}
                    />
                    </div>
                  )}
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