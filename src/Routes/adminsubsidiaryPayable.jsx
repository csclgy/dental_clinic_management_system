import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminSubsidiaryPayable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subsidiaryRecords, setSubsidiaryRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });


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
      try {
        const res = await axios.get("http://localhost:3000/auth/subsidiaryPayable", {
          params: { account_id },
        });
        setSubsidiaryRecords(res.data);
      } catch (err) {
        console.error("Error fetching subsidiary records:", err);
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
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 bg-[white] text-[#00458B] rounded-lg"
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
              <Link to="/adminsubsidiaryreceivable" className="bg-[white] text-[#00458B] flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
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

      {/* Sidebar (mobile) */}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">
            Subsidiary Ledger (Payable)
          </h1>
          <button
            onClick={() => navigate("/adminsubsidiaryaddpayable")}
            className="flex items-center gap-2 bg-[#00458B] font-semibold text-white px-4 py-2 rounded-lg"
          >
            + Add New Payable
          </button>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
          {/* Search Bar */}
          <div className="flex justify-between mb-4">
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

            {/* Switch Dropdown */}
            <select
              defaultValue="/adminsubsidiarypayable"
              onChange={(e) => navigate(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            >
              <option value="/adminsubsidiaryreceivable">
                Accounts Receivable
              </option>
              <option value="/adminsubsidiarypayable">Accounts Payable</option>
            </select>
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
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                      <td className="px-4 py-2 text-black">{record.date}</td>
                        <td
                        className="px-4 py-2 text-blue-700 cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect(); // Get position of the cell
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
                                date: record.date,
                                items: record.items,
                                day_agreement: record.day_agreement,
                                due_date: record.due_date,
                                balance: record.balance,
                              },
                            });
                          }}
                          disabled={fullyPaidInvoices.has(record.invoice_no)} 
                          className={`font-semibold px-4 py-2 rounded-lg ${
                            fullyPaidInvoices.has(record.invoice_no)
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
                    <td colSpan="6" className="text-center text-gray-500 py-4">
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
                  <p className="mt-1 ml-3 text-blue-800">  ₱ {(Number(selectedRecord.balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

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
