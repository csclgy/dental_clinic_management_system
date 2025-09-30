import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import {
  BarChart3,
  Users,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const AdminSchedule = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // table | calendar
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());

  const events = records.map((record) => {
    const date = new Date(record.pref_date);
    const start = new Date(date.setHours(9, 0, 0));
    const end = new Date(date.setHours(10, 0, 0));

    return {
      title: `${record.p_fname} ${record.p_lname} - ${record.procedure_type}`,
      start,
      end,
      dentist: record.attending_dentist,
    };
  });

  // Fetch consultations
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3000/auth/displayconsultations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch consultations");

        const data = await res.json();
        setRecords(Array.isArray(data.consultations) ? data.consultations : []);
      } catch (err) {
        console.error("Error fetching consultations:", err);
      }
    };

    fetchConsultations();
    const interval = setInterval(fetchConsultations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll
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

  const handleFollowUp = async (appoint_id, p_fname, p_lname) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/auth/followup/${appoint_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: `Reminder: Today is your appointment, ${p_fname} ${p_lname}.` }),
    });

    if (!res.ok) throw new Error("Failed to send follow-up notification");
    const data = await res.json();
    alert(data.message || "Follow-up notification sent!");
  } catch (err) {
    console.error("Follow-up error:", err);
    alert("Error sending follow-up notification.");
  }
};

  // Filtered data
  const filteredRecords = records.filter((record) => {
    const status = record.appointment_status?.toLowerCase().trim();
    const matchesFilter =
      statusFilter === "all" ? true : status === statusFilter.toLowerCase();
    const matchesSearch = Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <i className="fa fa-book"></i> Ledger
            </span>
            <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
          </button>
          {isLedgerOpen && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link to="/admincoa" className="hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:bg-[white] hover:text-[#00458B]">
                Trial Balance
              </Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link
            to="/adminpatients"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link
            to="/adminschedule"
            className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Calendar size={18} /> Schedules
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#00458B] text-white flex flex-col p-6 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end mb-6"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <Users size={18} /> Users
              </Link>
              {/* add other links as needed */}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">Upcoming Appointments</h1>
          <div>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg mr-2 ${
                viewMode === "table"
                  ? "bg-[#00c3b8] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "calendar"
                  ? "bg-[#00c3b8] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "table" ? (
          <div className="table-auto bg-white rounded-xl shadow-md border border-gray-200">
            {/* Filters */}
            <div className="flex justify-between items-center mb-4 p-3">
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

            {/* Table */}
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-[#00458B]">
                  <th className="px-4 py-2">Visit Date</th>
                  <th className="px-4 py-2">Last Name</th>
                  <th className="px-4 py-2">First Name</th>
                  <th className="px-4 py-2">Services</th>
                  <th className="px-4 py-2">Dentist</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, i) => (
                    <tr key={i} className="border-b border-gray-200 text-center">
                      <td className="px-4 py-2 text-blue-700">{record.pref_date}</td>
                      <td className="px-4 py-2">{record.p_lname}</td>
                      <td className="px-4 py-2">{record.p_fname}</td>
                      <td className="px-4 py-2">{record.procedure_type}</td>
                      <td className="px-4 py-2">{record.attending_dentist}</td>
                      <td className="px-4 py-2">{record.appointment_status}</td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/adminconsultationview/${record.appoint_id}`)}
                          className="bg-[#008CBA] text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          View
                        </button>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/adminschedulecancel/${record.appoint_id}`)}
                          disabled={
                            !(
                              record.appointment_status === "incomplete" ||
                              record.appointment_status === "pending" ||
                              record.appointment_status === "cancel with refund request"
                            )
                          }
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            record.appointment_status === "incomplete" ||
                            record.appointment_status === "pending" ||
                            record.appointment_status === "cancel with refund request"
                              ? "bg-gray-200 hover:bg-gray-300 text-black"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Cancel
                        </button>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                      <button
                        disabled={!(record.appointment_status === "incomplete" || record.appointment_status === "pending")}
                        onClick={() => handleFollowUp(record.appoint_id, record.p_fname, record.p_lname)}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          record.appointment_status === "incomplete" || record.appointment_status === "pending"
                            ? "bg-[#00c3b8] hover:bg-[#00a89d] text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        + Follow Up
                      </button>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/adminconsultationcomplete/${record.appoint_id}`)}
                          disabled={record.appointment_status !== "incomplete"}
                          className={`px-4 py-2 rounded-lg font-semibold ${
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
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "75vh" }}
              views={["month", "week", "day"]}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              step={30}
              timeslots={2}
              min={view !== "month" ? new Date(1970, 1, 1, 8, 0) : undefined}
              max={view !== "month" ? new Date(1970, 1, 1, 16, 0) : undefined}
              toolbar={true}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSchedule;