import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Calendar, Users, DollarSign, BarChart3, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
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

function AdminDashboard() {
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [patientDemographics, setPatientDemographics] = useState([]);
  const [openDashboard, setOpenDashboard] = useState(false);


  const COLORS = ["#01D5C4", "#00458B", "#A3A3A3"];

 useEffect(() => {
    axios.get("http://localhost:3000/auth/appointments/count")
      .then(res => setAppointmentsCount(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:3000/auth/patients/count")
      .then(res => setPatientsCount(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:3000/auth/patients/demographics")
    .then(res => setPatientDemographics(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
    {/* Sidebar (desktop) */}
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
        </div>
      )}


          {/* Ledger with dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <i className="fa fa-book"></i> Ledger
            </span>
            <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
          </button>
          {isLedgerOpen && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link to="/admincoa" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Trial Balance
              </Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link
            to="/adminpatients"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link
            to="/adminschedule"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Calendar size={18} /> Schedules
          </Link>
          <Link
            to="/admincashier"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Calendar size={18} /> Cashier
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Sidebar (mobile with toggle) */}
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
            {/* Same nav as desktop */}
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 bg-[#01D5C4] text-black p-2 rounded-lg"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <Users size={18} /> Users
              </Link>
              {/* ... add other links here */}
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

        <h1 className="text-2xl font-bold text-[#00458B] mb-6">
          Admin Dashboard
        </h1>

        {/* Stats cards */}
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
            <DollarSign className="text-[#00458B]" size={32} />
            <div>
              <h2 className="text-lg font-semibold">Revenue</h2>
              <p className="text-2xl font-bold">₱120,000</p>
            </div>
          </div>
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Demographics */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#00458B]">
              <Users size={20} /> Patient Demographics
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={patientDemographics}
                  dataKey="value"
                  nameKey="category"
                  outerRadius={90}
                  label
                >
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
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#00458B]">
              <DollarSign size={20} /> Revenue Trends
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                // data={revenueData}
                margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
              >
                <XAxis
                  dataKey="month"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis
                //   tickFormatter={(value) => `₱${value.toLocaleString("en-PH")}`}
                />
                <Tooltip
                //   formatter={(value) => `₱${value.toLocaleString("en-PH")}`}
                />
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