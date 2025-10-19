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
  ChevronDown,
  ChevronUp,
  PhilippinePeso,
  IdCard
} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const AdminCashier = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Unpaid");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // table | calendar
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

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
      setLoading(true); // ✅ show spinner
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3000/auth/displayconsultations1", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch consultations");

        const data = await res.json();
        setRecords(Array.isArray(data.consultations) ? data.consultations : []);
      } catch (err) {
        console.error("Error fetching consultations:", err);
      } finally {
        setLoading(false); // ✅ hide spinner after fetch finishes
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


  // Filtered data
  const filteredRecords = records.filter((record) => {
    const status = record.payment_status?.toLowerCase().trim();
    const matchesFilter =
      statusFilter === "all" ? true : status === statusFilter.toLowerCase();
    const matchesSearch = Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-sxl font-bold mb-8">Arciaga-Juntilla TMJ Ortho Dental Clinic</h2>

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
              {/* Ledger Dropdown */}
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
                to="/adminhmo"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <IdCard size={18} /> HMO
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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
                className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-white hover:text-[#00458B]"
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

      {/* Sidebar (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#00458B] text-white flex flex-col p-6 z-50 overflow-y-auto">
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
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>

              {/* Ledger dropdown */}
              {role === "admin" && (
                <>
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
                  <Link to="/adminhmo" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <IdCard size={18} /> HMO
                  </Link>
                  <Link
                    to="/adminusers"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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
                    <Calendar size={18} /> Cashier
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
        <div className="items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]"> Payments </h1>
          <p className="text-gray-600">(Unpaid)</p>
        </div>

        {/* Content */}
        {viewMode === "table" ? (
          <div className="table-auto bg-white rounded-xl shadow-md border border-gray-200">
            {/* Filters */}
            <div className="flex justify-between items-center mb-4 p-3">
              <select
                defaultValue="/admincashier"
                onChange={(e) => navigate(e.target.value)}
                className="border border-[#00458B] rounded-lg px-3 py-2 text-1xl bg-[#00458B] font-semibold text-white"
              >
                <option value="/admincashier">Unpaid</option>
                <option value="/admincashierpaid">Paid</option>
                <option value="/admincashierpartial">Partial</option>
                <option value="/admincashierhmo">HMO</option>
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
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100 text-[#00458B] sticky top-0 z-10">
                  <tr className="bg-gray-100 text-[#00458B] text-center">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Last Name</th>
                    <th className="px-4 py-2">First Name</th>
                    <th className="px-4 py-2">Services</th>
                    <th className="px-4 py-2">Dentist</th>
                    <th className="px-4 py-2">Appointment Status</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10">
                        <div className="flex justify-center items-center h-64">
                          <svg
                            aria-hidden="true"
                            className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              className="text-gray-300"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              className="text-[#00458B]"
                              fill="currentFill"
                            />
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length > 0 ? (
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
                            onClick={() => navigate(`/adminconsultationpaid/${record.appoint_id}`)}
                            className="px-4 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                          >
                            Complete
                          </button>
                        </td>
                        <td className="px-4 py-2"></td>
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

export default AdminCashier;