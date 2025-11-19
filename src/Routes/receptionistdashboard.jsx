import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Users,
  BarChart3,
  Menu,
  X,
  Clock,
  XCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  PhilippinePeso,
  IdCard,
  Settings,
  FolderKanban,
  BriefcaseMedical
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function ReceptionistDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const role = localStorage.getItem("role");

  // Dashboard States
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [cancelledAppointments, setCancelledAppointments] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [isSettingopen, setIsSettingOpen] = useState(false);


  // Chart filter controls
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [startMonth, setStartMonth] = useState("Jan");
  const [endMonth, setEndMonth] = useState("Dec");
  const [year, setYear] = useState(new Date().getFullYear());

  const [patientDemographics, setPatientDemographics] = useState([]);
  const [appointmentTrends, setAppointmentTrends] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);

  const COLORS = ["#01D5C4", "#00458B", "#A3A3A3"];

  // ✅ Include year in API call
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/auth/receptionistdashboard?year=${year}`
        );
        const data = res.data;

        console.log("📊 Dashboard Data:", data);

        setTotalAppointments(data.totalAppointments);
        setPatientsCount(data.patientsCount);
        setPendingAppointments(data.pendingAppointments);
        setCancelledAppointments(data.cancelledAppointments);
        setCompletedAppointments(data.completedAppointments);
        setPatientDemographics(data.patientDemographics || []);
        setAppointmentTrends(data.appointmentTrends || []);
        setTodayAppointments(data.todayAppointments || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [year]);

  // ✅ Filter trends by start/end month (before return)
  const filteredTrends = appointmentTrends.filter((item) => {
    const startIndex = months.indexOf(startMonth);
    const endIndex = months.indexOf(endMonth);
    const itemIndex = months.indexOf(item.month);
    return itemIndex >= startIndex && itemIndex <= endIndex;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-sxl font-bold mb-8">Arciaga-Juntilla TMJ Ortho Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button onClick={() => setOpenDashboard(!openDashboard)}
            className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ?
              <ChevronUp size={16} /> :
              <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              {role === "admin" && (
                <Link to="/admindashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Admin Dashboard</Link>
              )}
              {(role === "admin" || role === "inventory") && (
                <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard
                </Link>
              )}
              {(role === "admin" || role === "receptionist" || role === "dentist") && (
                <Link to="/receptionistdashboard" className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Receptionist
                  Dashboard</Link>
              )}
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
                  <Link to="/admincoa" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Chart of Accounts
                  </Link>
                  <Link to="/adminjournal"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Journal Entries
                  </Link>
                  <Link to="/adminsubsidiaryreceivable"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Subsidiary
                  </Link>
                  <Link to="/admingeneral"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    General Ledger
                  </Link>
                  <Link to="/admintrial" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Trial Balance
                  </Link>
                </div>
              )}
              <Link to="/adminusers" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <Users size={18} /> Users
              </Link>
            </>
          )}

          {(role === "admin" || role === "inventory") && (
            <>
              <Link to="/admininventory" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-archive"></i> Inventory
              </Link>
            </>
          )}

          {(role === "admin" || role === "dentist" || role === "receptionist") && (
            <>
              <Link to="/adminpatients" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-user-plus"></i> Patients
              </Link>

              <Link to="/adminschedule" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <Calendar size={18} />{" "}
                {role === "dentist" ? "Appointments" : "Appointments & Billing"}
              </Link>
            </>
          )}
          {role === "admin" && (
            <>
              <button onClick={() => setIsSettingOpen(!isSettingopen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <span className="flex items-center gap-2">
                  <Settings size={18} /> Settings
                </span>
                {isSettingopen ?
                  <ChevronUp size={16} /> :
                  <ChevronDown size={16} />}
              </button>
              {isSettingopen && (
                <div className="ml-6 flex flex-col gap-1 text-sm">
                  <Link to="/adminhmo" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <IdCard size={18} /> HMO
                  </Link>

                  <Link to="/orRangeSetup" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <FolderKanban size={18} /> OR Range
                  </Link>

                  <Link to="/adminServices"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <BriefcaseMedical size={18} /> Services
                  </Link>
                </div>
              )}
            </>
          )}
          {role === "admin" && (
            <>
              <Link to="/adminaudit"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-eye"></i> Audit Trail
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <h1 className="text-2xl font-bold text-[#00458B] mb-6">
          Receptionist Dashboard
        </h1>

        <div className="mb-6 flex justify-end items-center gap-3">
          <label className="font-semibold text-[#00458B]">Filter by Year:</label>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg"
          >
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
            <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
            <option value={new Date().getFullYear() - 3}>{new Date().getFullYear() - 3}</option>
            <option value={new Date().getFullYear() - 4}>{new Date().getFullYear() - 4}</option>
            <option value={new Date().getFullYear() - 5}>{new Date().getFullYear() - 5}</option>
          </select>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-[#01D5C4] hover:shadow-lg transition">
            <Calendar size={32} className="text-[#00458B]" />
            <div>
              <h2 className="text-lg font-semibold">Total Appointments</h2>
              <p className="text-2xl font-bold">{totalAppointments}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-[#01D5C4] hover:shadow-lg transition">
            <Users size={32} className="text-[#00458B]" />
            <div>
              <h2 className="text-lg font-semibold">Patients</h2>
              <p className="text-2xl font-bold">{patientsCount}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-yellow-400 hover:shadow-lg transition">
            <Clock size={32} className="text-[#00458B]" />
            <div>
              <h2 className="text-lg font-semibold">Pending</h2>
              <p className="text-2xl font-bold">{pendingAppointments}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-red-400 hover:shadow-lg transition">
            <XCircle size={32} className="text-[#00458B]" />
            <div>
              <h2 className="text-lg font-semibold">Cancelled</h2>
              <p className="text-2xl font-bold">{cancelledAppointments}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-green-400 hover:shadow-lg transition">
            <CheckCircle size={32} className="text-[#00458B]" />
            <div>
              <h2 className="text-lg font-semibold">Completed</h2>
              <p className="text-2xl font-bold">{completedAppointments}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Patient Demographics */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#00458B]">
              <Users size={20} /> Patient Demographics
            </h2>

            {patientDemographics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patientDemographics}
                    dataKey="value"
                    nameKey="category"
                    outerRadius={100}
                    label
                  >
                    {patientDemographics.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 italic text-center">No demographic data available</p>
            )}
          </div>


          {/* Appointment Trends */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-[#00458B]">
                <Calendar size={20} /> Appointment Trends
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="border rounded-lg px-2 py-1">
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="text-gray-600">to</span>
                <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="border rounded-lg px-2 py-1">
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {/* <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border rounded-lg px-2 py-1 w-16 sm:w-20"
                /> */}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredTrends}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#00458B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#00458B]">
            <Clock size={20} /> Today's Appointments
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border-b align-middle">Patient Name</th>
                <th className="p-3 border-b align-middle">Time</th>
                <th className="p-3 border-b align-middle">Treatment</th>
                <th className="p-3 border-b align-middle">Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-500 italic">
                    No appointment data available — waiting for backend connection.
                  </td>
                </tr>
              ) : (
                todayAppointments.map((appt) => (
                  <tr key={appt.appoint_id} className="hover:bg-gray-50">
                    <td className="p-3 border-b align-middle">
                      {appt.p_fname} {appt.p_lname}
                    </td>
                    <td className="p-3 border-b align-middle">{appt.pref_time}</td>
                    <td className="p-3 border-b align-middle">{appt.procedure_type}</td>
                    <td className="p-3 border-b align-middle">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${appt.appointment_status === "done"
                          ? "bg-green-100 text-green-800"
                          : appt.appointment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {appt.appointment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </main>
    </div>
  );
}

export default ReceptionistDashboard;
