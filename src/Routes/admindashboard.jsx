import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {Calendar, Users, PhilippinePeso, BarChart3, ChevronDown, ChevronUp, Menu, X,} from "lucide-react";
import {PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,} from "recharts";

function AdminDashboard() {
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [patientDemographics, setPatientDemographics] = useState([]);
  const [openDashboard, setOpenDashboard] = useState(false);

  const [revenueData, setRevenueData] = useState([]);
  const [filteredRevenue, setFilteredRevenue] = useState([]);
  const [startMonth, setStartMonth] = useState("Jan");
  const [endMonth, setEndMonth] = useState("Dec");
  const [year, setYear] = useState(new Date().getFullYear());

  const COLORS = ["#01D5C4", "#00458B", "#A3A3A3"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Fetch data from backend
  useEffect(() => {
    axios.get("http://localhost:3000/auth/appointments/count")
      .then(res => setAppointmentsCount(res.data))
      .catch(err => console.error("Error fetching appointments:", err));

    axios.get("http://localhost:3000/auth/patients/count")
      .then(res => setPatientsCount(res.data))
      .catch(err => console.error("Error fetching patients:", err));

    axios.get("http://localhost:3000/auth/patients/demographics")
      .then(res => setPatientDemographics(res.data))
      .catch(err => console.error("Error fetching demographics:", err));

    axios.get("http://localhost:3000/auth/revenue")
      .then(res => {
        // Expected format: [{ month: "Jan", year: 2025, revenue: 120000 }, ...]
        setRevenueData(res.data);
        setFilteredRevenue(res.data);
      })
      .catch(err => console.error("Error fetching revenue data:", err));
  }, []);

  // Filter revenue 
  useEffect(() => {
    const startIndex = months.indexOf(startMonth);
    const endIndex = months.indexOf(endMonth);

    const filtered = revenueData.filter((item) => {
      const monthIndex = months.indexOf(item.month);
      return (
        item.year === parseInt(year) &&
        monthIndex >= startIndex &&
        monthIndex <= endIndex
      );
    });

    setFilteredRevenue(filtered);
  }, [startMonth, endMonth, year, revenueData]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link to="/admindashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Admin Dashboard</Link>
              <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard</Link>
            </div>
          )}

          {/* Ledger Dropdown */}
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
              <Link to="/admincoa" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Chart of Accounts</Link>
              <Link to="/adminjournal" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Journal Entries</Link>
              <Link to="/adminsubsidiaryreceivable" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Subsidiary</Link>
              <Link to="/admingeneral" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">General Ledger</Link>
              <Link to="/admintrial" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Trial Balance</Link>
            </div>
          )}

          {/* Other Links */}
          <Link to="/adminusers" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <Users size={18} /> Users
          </Link>
          <Link to="/admininventory" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link to="/adminpatients" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link to="/adminschedule" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <Calendar size={18} /> Schedules
          </Link>
          <Link to="/admincashier" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <PhilippinePeso size={18} /> Cashier
          </Link>
          <Link to="/adminaudit" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <h1 className="text-2xl font-bold text-[#00458B] mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-[#01D5C4]">
            <Calendar className="text-[#00458B]" size={32} />
            <div>
              <h2 className="text-lg font-semibold">Appointments</h2>
              <p className="text-2xl font-bold">{appointmentsCount}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-[#01D5C4]">
            <Users className="text-[#00458B]" size={32} />
            <div>
              <h2 className="text-lg font-semibold">Patients</h2>
              <p className="text-2xl font-bold">{patientsCount}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-[#01D5C4]">
            <PhilippinePeso className="text-[#00458B]" size={32} />
            <div>
              <h2 className="text-lg font-semibold">Revenue</h2>
              <p className="text-2xl font-bold">
                ₱{filteredRevenue.reduce((sum, r) => sum + (r.revenue || 0), 0).toLocaleString("en-PH")}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Demographics */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#00458B]">
              <Users size={20} /> Patient Demographics
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={patientDemographics} dataKey="value" nameKey="category" outerRadius={90} label>
                  {patientDemographics.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trends */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-[#00458B]">
                <PhilippinePeso size={20} /> Revenue Trends
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="border rounded-lg px-2 py-1">
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="text-gray-600">to</span>
                <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="border rounded-lg px-2 py-1">
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border rounded-lg px-2 py-1 w-16 sm:w-20"
                />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filteredRevenue} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                <XAxis dataKey="month" angle={-45} textAnchor="end" interval={0} height={60} />
                <YAxis />
                <Tooltip formatter={(v) => `₱${v.toLocaleString("en-PH")}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#01D5C4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
