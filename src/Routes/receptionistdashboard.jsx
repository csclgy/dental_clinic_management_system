import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, BarChart3, Menu, X, Clock, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

function ReceptionistDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stat cards dummy data
  const totalAppointments = 50;
  const patientsCount = 34;
  const pendingAppointments = 12;
  const completedAppointments = 35;

  // Patient Demographics dummy data
  const patientDemographics = [
    { category: "Children", value: 10 },
    { category: "Adults", value: 20 },
    { category: "Seniors", value: 4 },
  ];

  // Appointment Trends dummy data (month/year filter)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [startMonth, setStartMonth] = useState("Jan");
  const [endMonth, setEndMonth] = useState("Dec");
  const [year, setYear] = useState(new Date().getFullYear());
  const appointmentTrends = [
    { month: "Jan", appointments: 5 },
    { month: "Feb", appointments: 8 },
    { month: "Mar", appointments: 12 },
    { month: "Apr", appointments: 15 },
    { month: "May", appointments: 10 },
  ];

  // Today's Appointments dummy data
  const todayAppointments = [
    { id: 1, patientName: "John Doe", time: "09:00 AM", treatment: "Cleaning", status: "Pending" },
    { id: 2, patientName: "Jane Smith", time: "10:30 AM", treatment: "Filling", status: "Completed" },
    { id: 3, patientName: "Mike Johnson", time: "01:00 PM", treatment: "Extraction", status: "Pending" },
  ];

  const COLORS = ["#01D5C4","#00458B","#A3A3A3"];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/receptionistdashboard" className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200 hover:text-[#00458B]">
            <BarChart3 size={18} /> Dashboard
          </Link>
          <Link to="/receptionistpatients" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link to="/receptionistschedule" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <Calendar size={18} /> Schedules
          </Link>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)}></div>
          <aside className="relative w-64 bg-[#00458B] text-white flex flex-col p-6 overflow-y-auto shadow-lg">
            <button onClick={() => setSidebarOpen(false)} className="mb-4 self-end text-white">
              <X size={24} />
            </button>
            <nav className="flex flex-col gap-2">
              <Link to="/receptionistdashboard" className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200 hover:text-[#00458B] whitespace-nowrap">
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link to="/receptionistpatients" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B] whitespace-nowrap">
                <i className="fa fa-user-plus"></i> Patients
              </Link>
              <Link to="/receptionistschedule" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B] whitespace-nowrap">
                <Calendar size={18} /> Schedules
              </Link>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">

        {/* Mobile Menu Button */}
        <button onClick={() => setSidebarOpen(true)} className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]">
          <Menu size={24} /> Menu
        </button>

        <h1 className="text-2xl font-bold text-[#00458B] mb-6">Receptionist Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              </PieChart>
            </ResponsiveContainer>
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
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border rounded-lg px-2 py-1 w-16 sm:w-20"
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentTrends}>
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
              {todayAppointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b align-middle">{appt.patientName}</td>
                  <td className="p-3 border-b align-middle">{appt.time}</td>
                  <td className="p-3 border-b align-middle">{appt.treatment}</td>
                  <td className="p-3 border-b align-middle">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      appt.status === "Completed" ? "bg-green-100 text-green-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

export default ReceptionistDashboard;
