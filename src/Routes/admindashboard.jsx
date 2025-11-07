import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Users,
  PhilippinePeso,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Menu,
  IdCard,
  Printer,
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

  const [ledgerData, setLedgerData] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const role = localStorage.getItem("role");
  const [isSettingopen, setIsSettingOpen] = useState(false);



  const COLORS = ["#01D5C4", "#00458B", "#A3A3A3"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Fetch backend data
  // //NEW CODE
  useEffect(() => {
    axios.get(`http://localhost:3000/auth/appointments/count?year=${year}`)
      .then(res => setAppointmentsCount(res.data.count))
      .catch(err => console.error(err));

    axios.get(`http://localhost:3000/auth/patients/count?year=${year}`)
      .then(res => setPatientsCount(res.data.total)) // if backend sends total
      .catch(err => console.error(err));

    axios.get("http://localhost:3000/auth/patients/demographics")
      .then(res => setPatientDemographics(res.data))
      .catch(err => console.error("Error fetching demographics:", err));

    axios.get("http://localhost:3000/auth/revenue")
      .then(res => {
        setRevenueData(res.data);
        setFilteredRevenue(res.data);
      })
      .catch(err => console.error("Error fetching revenue data:", err));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:3000/auth/trial")
      .then(res => {
        const { data, totalDebit, totalCredit } = res.data;
        setLedgerData(data);
        setTotalDebit(totalDebit);
        setTotalCredit(totalCredit);
        setNetBalance(totalCredit - totalDebit);
      })
      .catch(err => console.error("Error fetching trial balance:", err));
  }, []);

  //NEW CODE
  // Filter revenue by year only
  useEffect(() => {
    const filtered = revenueData.filter((item) => item.year === parseInt(year));
    setFilteredRevenue(filtered);
  }, [year, revenueData]);

  const ledgerSummaryData = [
    { name: "Total Debit", value: totalDebit },
    { name: "Total Credit", value: totalCredit },
  ];

  const topAccounts = ledgerData
    .reduce((acc, curr) => {
      const found = acc.find(a => a.account_name === curr.account_name);
      if (found) found.balance += curr.credit - curr.debit;
      else acc.push({ account: curr.account_name, balance: curr.credit - curr.debit });
      return acc;
    }, [])
    .slice(0, 5);

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dental Clinic Report</title>
      <style>
        body { font-family: Arial; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00458B; padding-bottom: 20px; }
        .header h1 { color: #00458B; margin: 0; }
        .summary { margin: 20px 0; padding: 15px; background-color: #f0f8ff; border-left: 4px solid #00c3b8; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
        th { background-color: #00458B; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Dental Clinic Dashboard Report</h1>
        <p>Generated on: ${currentDate}</p>
      </div>

      <div class="summary">
        <strong>Report Summary:</strong><br>
        Total Appointments: ${appointmentsCount}<br>
        Total Patients: ${patientsCount}<br>
        Total Revenue: ₱${filteredRevenue.reduce((sum, r) => sum + (r.revenue || 0), 0).toLocaleString("en-PH")}
      </div>

      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRevenue.map(r => `
            <tr>
              <td>${r.month} ${r.year}</td>
              <td>₱${r.revenue.toLocaleString("en-PH")}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This report was automatically generated for Arciaga-Juntilla TMJ Ortho Dental Clinic.</p>
      </div>

      <script>
        window.print();
        window.addEventListener('afterprint', () => { window.close(); });
      </script>
    </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
  };

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
                <Link to="/admindashboard" className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Admin Dashboard</Link>
              )}
              {(role === "admin" || role === "inventory") && (
                <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard
                </Link>
              )}
              {(role === "admin" || role === "receptionist" || role === "dentist") && (
                <Link to="/receptionistdashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Appointments
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
                    className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">Admin Dashboard</h1>
          <button
            onClick={handlePrintReport}
            className="px-6 py-3 bg-[#00458B] hover:bg-[#003366] text-white font-bold rounded-lg flex items-center gap-2"
          >
            <Printer size={18} /> Generate Report
          </button>
        </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
          {/* //NEW CODE */}
          {/* Revenue Trends */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-[#00458B]">
                <PhilippinePeso size={20} /> Revenue Trends
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <label className="text-gray-600 font-medium">Year:</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border rounded-lg px-2 py-1 w-20 sm:w-24"
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

        {/* ===== Ledger Analytics Section ===== */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-[#00458B] mb-4">Ledger Analytics</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="font-semibold text-[#00458B]">Total Debit</h3>
              <p className="text-2xl font-bold text-red-500">₱{totalDebit.toLocaleString("en-PH")}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="font-semibold text-[#00458B]">Total Credit</h3>
              <p className="text-2xl font-bold text-green-500">₱{totalCredit.toLocaleString("en-PH")}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="font-semibold text-[#00458B]">Net Balance</h3>
              <p className="text-2xl font-bold text-blue-600">₱{netBalance.toLocaleString("en-PH")}</p>
            </div>
          </div>

          {/* Debit vs Credit Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-[#00458B] mb-2 text-center">Debit vs Credit</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ledgerSummaryData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {ledgerSummaryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-[#00458B] mb-2 text-center">Top Accounts by Balance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topAccounts}>
                  <XAxis dataKey="account" />
                  <YAxis />
                  <Tooltip formatter={(v) => `₱${v.toLocaleString("en-PH")}`} />
                  <Bar dataKey="balance" fill="#00458B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;