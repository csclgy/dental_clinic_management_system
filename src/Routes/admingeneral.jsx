import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso } from "lucide-react";

const Admingeneral = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      const tooltip = document.getElementById("floatingTooltipBox");
      if (tooltip && !tooltip.contains(e.target)) {
        setSelectedRecord(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await axios.get("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/general");
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching general ledger:", err);
      }
    };
    fetchLedger();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/coa");
        setAccounts(res.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
            <h1>General Ledger Report</h1>
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
                <th>Account Name</th>
                <th>Account Type</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(records => `
                <tr>
                  <td>${records.date}</td>
                  <td>${records.account}</td>
                  <td>${records.account_type}</td>
                  <td>₱ ${records.debit}</td>
                  <td>₱ ${records.credit}</td>
                  <td>₱ ${records.balance}</td>
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

  // Filter only "pending" + search
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

  const filterRecord = async (account_id) => {
    try {
      if (!account_id) {
        const res = await axios.get("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/general");
        setRecords(res.data);
        return;
      }

      const res = await axios.get("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/general_ledger1", {
        params: { account_id },
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching filtered ledger:", err);
    }
  };

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
                    className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
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
          <h1 className="text-2xl font-bold text-[#00458B]">General Ledger</h1>

          <div>
            <label
              htmlFor="accounts"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Account Name
            </label>
            <select
              id="accounts"
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                filterRecord(e.target.value);
              }}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            >
              <option value="">All</option>
              {accounts.map((acc) => (
                <option key={acc.account_id} value={acc.account_id}>
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>
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
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Account Name</th>
                  <th className="px-4 py-2 text-left">Account Type</th>
                  <th className="px-4 py-2 text-left">Debit</th>
                  <th className="px-4 py-2 text-left">Credit</th>
                  <th className="px-4 py-2 text-left">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    < tr key={index}
                      className="border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                      <td className="px-4 py-2 text-black">{record.date}</td>
                      <td className="px-4 py-2 text-blue-700"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect(); // Get position of the cell
                          setTooltipPosition({
                            x: rect.right + 10 + window.scrollX,
                            y: rect.top + window.scrollY,
                          });
                          setSelectedRecord(record);
                        }} >
                        {record.account}
                      </td>
                      <td className="px-4 py-2 text-black">
                        {record.account_type || "-"}
                      </td>
                      <td className="px-4 py-2 text-black">
                        ₱ {(Number(record.debit) || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-black">
                        ₱ {(Number(record.credit) || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-black">
                        ₱ {(Number(record.balance) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-4">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedRecord && (
            <div
              id="floatingTooltipBox"
              style={{
                position: "absolute",
                top: tooltipPosition.y,
                left: tooltipPosition.x,
                zIndex: 1000,
              }}
              className="bg-white border border-gray-300 shadow-lg p-4 rounded-md w-80"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-[#00458B] absolute left-1/2 transform -translate-x-1/2">
                  Description
                </h3>
                <br></br>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-800">
                <p className="mt-2"><strong>Date:</strong></p>
                <p className="mt-1 ml-3 text-blue-800"> {selectedRecord.date}</p>

                <p className="mt-1"><strong>Description:</strong></p>
                <p className="mt-1 ml-3 text-blue-800"> {selectedRecord.description}</p>

                <p className="mt-1"><strong> Total Amount:</strong></p>
                <p className="mt-1 ml-3 text-blue-800">  ₱ {(Number(selectedRecord.total_amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

              </div>
            </div>
          )}

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

export default Admingeneral;
