import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso, IdCard, PlusCircle } from "lucide-react";

const AdminSubsidiaryPayable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subsidiaryRecords, setSubsidiaryRecords] = useState([]);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

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

  // Fetch subsidiary ledger for Accounts Payable
  useEffect(() => {
    const fetchSubsidiary = async (account_id) => {
      setLoading(true); // ✅ show spinner
      try {
        const res = await axios.get("http://localhost:3000/auth/subsidiaryPayable", {
          params: { account_id },
        });
        setSubsidiaryRecords(res.data);
      } catch (err) {
        console.error("Error fetching subsidiary records:", err);
      } finally {
        setLoading(false); // ✅ hide spinner after fetch finishes
      }
    };

    fetchSubsidiary();
  }, []);

  // Filter records
  const filteredRecords = subsidiaryRecords.filter((record) => {
    if (!searchTerm) return true;

    const name = record.name ? record.name.toLowerCase() : "";
    const invoiceNo = record.invoice_no ? record.invoice_no.toLowerCase() : "";
    const particulars = record.particulars ? record.particulars.toLowerCase() : "";

    return (
      name.includes(searchTerm.toLowerCase()) ||
      invoiceNo.includes(searchTerm.toLowerCase()) ||
      particulars.includes(searchTerm.toLowerCase())
    );
  });

  const fullyPaidInvoices = new Set(
    subsidiaryRecords
      .filter((r) => Number(r.balance) <= 0)
      .map((r) => r.invoice_no)
  );


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
                    className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
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
          <h1 className="text-2xl font-bold text-[#00458B]">
            Subsidiary Ledger (Payable)
          </h1>
          <button
            onClick={() => navigate("/adminsubsidiaryaddpayable")}
            className="flex items-center gap-2 bg-[#00458B] font-semibold text-white px-4 py-2 rounded-lg"
          >
            <PlusCircle size={18} /> Add New Payable
          </button>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            {/* Dropdown on the Left */}
            <select
              defaultValue="/adminsubsidiaryreceivable"
              onChange={(e) => navigate(e.target.value)}
              className="border border-[#00458B] rounded-lg px-3 py-2 text-sm text-[#00458B] font-medium p-2.5 focus:ring-2 focus:ring-[#00458B] focus:border-[#00458B] transition"
            >
              <option value="/adminsubsidiaryreceivable">Accounts Receivable</option>
              <option value="/adminsubsidiarypayable">Accounts Payable</option>
            </select>

            {/* Search Bar on the Right */}
            <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1.5 w-full sm:w-64 bg-white">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <i className="fa fa-search text-[#00458B] text-sm"></i>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-200">
            <thead>

              <tr className="bg-gray-100 text-[#00458B]">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Particulars</th>
                <th className="px-4 py-2 text-left">Invoice No.</th>
                <th className="px-4 py-2 text-left">Debit</th>
                <th className="px-4 py-2 text-left">Credit</th>
                <th className="px-4 py-2 text-left">Balance</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>

            </thead>
            <tbody>
              {loading ? (
                // 🌀 Show spinner when loading is true
                <tr>
                  <td colSpan="7" className="py-10">
                    <div className="flex justify-center items-center h-64">
                      <svg
                        aria-hidden="true"
                        className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 
                 50 100.591C22.3858 100.591 0 78.2051 
                 0 50.5908C0 22.9766 22.3858 0.59082 
                 50 0.59082C77.6142 0.59082 100 
                 22.9766 100 50.5908ZM9.08144 
                 50.5908C9.08144 73.1895 27.4013 
                 91.5094 50 91.5094C72.5987 
                 91.5094 90.9186 73.1895 
                 90.9186 50.5908C90.9186 
                 27.9921 72.5987 9.67226 
                 50 9.67226C27.4013 9.67226 
                 9.08144 27.9921 9.08144 
                 50.5908Z"
                          className="text-gray-300"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 
                 97.8624 35.9116 97.0079 33.5539C95.2932 
                 28.8227 92.871 24.3692 89.8167 20.348C85.8452 
                 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 
                 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 
                 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 
                 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 
                 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 
                 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 
                 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 
                 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 
                 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 
                 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          className="text-[#00458B]"
                          fill="currentFill"
                        />
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    <td className="px-4 py-2 text-black">{record.date}</td>
                    <td
                      className="px-4 py-2 text-blue-700 cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPosition({
                          x: rect.right + 10 + window.scrollX,
                          y: rect.top + window.scrollY,
                        });
                        setSelectedRecord(record);
                      }}
                    >
                      {record.particulars}
                    </td>
                    <td className="px-4 py-2 text-black">{record.invoice_no}</td>
                    <td className="px-4 py-2 text-black">
                      ₱ {(Number(record.debit) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-black">
                      ₱ {(Number(record.credit) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-black">
                      {(Number(record.balance) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          const [companyName, expenseAccount] = record.particulars
                            ? record.particulars.split(" - ").map((part) => part.trim())
                            : ["", ""];
                          navigate("/adminsubsidiaryaddpayable", {
                            state: {
                              mode: "pay",
                              invoice_no: record.invoice_no,
                              name: companyName,
                              expense_account: expenseAccount,
                              items: record.items,
                              day_agreement: record.day_agreement,
                              due_date: record.due_date,
                              balance: record.balance,
                            },
                          });
                        }}
                        disabled={fullyPaidInvoices.has(record.invoice_no)}
                        className={`font-semibold px-4 py-2 rounded-lg ${fullyPaidInvoices.has(record.invoice_no)
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-[#00c3b8] hover:bg-[#00a99d] text-white"
                          }`}
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-4">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>

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
                    Invoice Details
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
                  <p className="mt-2"><strong>Invoice No:</strong></p>
                  <p className="mt-1 ml-3 text-blue-800"> {selectedRecord.invoice_no}</p>

                  {/* <p className="mt-1"><strong>Payment No:</strong> {selectedRecord.payment_reference}</p> */}

                  <p className="mt-1"><strong>Date:</strong></p>
                  <p className="mt-1 ml-3 text-blue-800">{selectedRecord.date}</p>

                  <p className="mt-1"><strong>Day Agreement:</strong></p>
                  <p className="mt-1 ml-3 text-blue-800"> {selectedRecord.day_agreement}</p>

                  <p className="mt-1"><strong>Due Date:</strong></p>
                  <p className="mt-1 ml-3 text-blue-800"> {selectedRecord.due_date}</p>

                  <p className="mt-1"><strong>Supplier Name:</strong></p>
                  <p className="mt-1 ml-3 text-blue-800"> {selectedRecord.supplier_name}</p>

                  <p className="mt-1"><strong>Items:</strong></p>
                  <p className="mt-1 ml-3 text-blue-800"> {selectedRecord.items}</p>

                  <p className="mt-1"><strong> Total Amount:</strong></p>
                  <p className="mt-1 ml-3 text-blue-800">  ₱ {(Number(selectedRecord.total_amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

                </div>
              </div>
            )}
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminSubsidiaryPayable;
