import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso } from "lucide-react";
import axios from "axios";

const AdminTrial = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [trialData, setTrialData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  // Scroll to section if location.state.scrollTo is passed
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
          <title>Dental Clinic Management System</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #00458B;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #00458B;
              margin: 0;
            }
            .report-info {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: center;
            }
            th {
              background-color: #00458B;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f0f8ff;
              border-left: 4px solid #00c3b8;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }

            tfoot td:first-child {
              background-color: #003366;
              color: white;
              font-weight: bold;
              padding: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Patient Management Report</h1>
            <p>Generated on: ${currentDate}</p>
          </div>
          
          <div class="summary">
            <strong>Report Summary:</strong><br>
            Total Items: ${filteredRecords.length}<br>
            Search Filter: ${searchTerm ? `"${searchTerm}"` : 'None'}
          </div>

          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(record => `
                <tr>
                  <td>${record.account_name}</td>
                  <td>₱ ${record.debit}</td>
                  <td>₱ ${record.credit}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>₱ ${Number(totalDebit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong></td>
                <td><strong>₱ ${Number(totalCredit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>This report was automatically generated for Arciaga-Juntilla TMJ Ortho Dental Clinic. </p>
          </div>

          <script>
            window.addEventListener('afterprint', function() {
              window.close();
            });

            window.addEventListener('beforeunload', function() {
            });

            setTimeout(function() {
              if (!window.closed) {
                window.close();
              }
            }, 10000);
          </script>
        </body>
        </html>
      `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();

      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.addEventListener('focus', () => {
            setTimeout(() => {
              if (!printWindow.closed) {
                printWindow.close();
              }
            }, 1000);
          });
        }
      }, 500);
    }, 250);
  };


  // Fetch trial balance from backend
  useEffect(() => {
    const fetchTrialBalance = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/trial");
        setTrialData(response.data.data);
        setTotalDebit(response.data.totalDebit);
        setTotalCredit(response.data.totalCredit);
      } catch (error) {
        console.error("Error fetching trial balance:", error);
      }
    };

    fetchTrialBalance();
  }, []);

  // Filter based on search term
  const filteredRecords = trialData.filter((record) =>
    record.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
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
              {role === "admin" && (
                <Link to="/admindashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Admin Dashboard</Link>
              )}
              {(role === "admin" || role === "inventory") && (
                <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard</Link>
              )}
              {(role === "admin" || role === "receptionist" || role === "dentist") && ( 
                <Link to="/receptionistdashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Receptionist Dashboard</Link>
              )}
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
              <button onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
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
                    className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
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
          <h1 className="text-2xl font-bold text-[#00458B]">Trial Balance</h1>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
          {/* Search Bar */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-64 bg-white">
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

          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100 text-[#00458B] sticky top-0 z-10">
                <tr className="bg-gray-100 text-[#00458B]">
                  <th className="px-4 py-2 text-left">Account Name</th>
                  <th className="px-4 py-2 text-center">₱ Debit</th>
                  <th className="px-4 py-2 text-center">₱ Credit</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-blue-700">{record.account_name}</td>
                      <td className="px-4 py-2 text-center">
                        {Number(record.debit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {Number(record.credit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-4">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Totals row */}
              <tfoot>
                <tr className="bg-gray-100 font-bold text-[#00458B]">
                  <td className="px-4 py-2 text-right">Total:</td>
                  <td className="px-4 py-2 text-center">
                    ₱ {Number(totalDebit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 text-center">
                    ₱ {Number(totalCredit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Generate Report Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handlePrintReport}
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg"
            >
              Generate Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTrial;
