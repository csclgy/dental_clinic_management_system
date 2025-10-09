import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Calendar, Users, BarChart3, ChevronDown, ChevronUp, Menu, X, AlertTriangle, PlusCircle } from "lucide-react";
import axios from "axios";

function adminaudit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT token
        const response = await axios.get("http://localhost:3000/auth/audit-trail", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map backend data to frontend table fields
        const mappedRecords = response.data.map(item => ({
          date: new Date(item.created_at).toLocaleDateString(),
          user: item.user_name,
          role: item.role,
          action: item.at_action,
          description: item.at_description,
        }));

        setRecords(mappedRecords);
      } catch (err) {
        console.error("Error fetching audit trail:", err);
      }
    };

    fetchAuditTrail();
  }, []);

  // Scroll to section if passed
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

  // Print Report function
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Audit Trail Report</h1>
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
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(record => `
                <tr>
                  <td>${record.date}</td>
                  <td>${record.user}</td>
                  <td>${record.action}</td>
                  <td>${record.description}</td>
                </tr>
              `).join('')}
            </tbody>
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

  // Filter based on search term (case-insensitive)
  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 w-full max-w-full overflow-hidden">
          <h1 className="text-2xl font-bold text-[#00458B] whitespace-nowrap">
            Audit Trail
          </h1>

          <div className="w-full sm:w-auto flex justify-end">
            <button
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg w-full sm:w-auto"
              onClick={handlePrintReport}
            >
              Generate Report
            </button>
          </div>
        </div>



        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
          {/* Search Bar */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-full sm:w-64 bg-white">
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

          <div className="overflow-x-auto">
            {/* Table */}
            <table className="w-full border-collapse border border-gray-200 min-w-[600px] text-center">
              <thead>
                <tr className="bg-gray-100 text-[#00458B] ">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-blue-700">{record.date}</td>
                      <td className="px-4 py-2">{record.user}</td>
                      <td className="px-4 py-2">{record.role}</td>
                      <td className="px-4 py-2">{record.action}</td>
                      <td className="px-4 py-2 text-left">{record.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-4">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default adminaudit;