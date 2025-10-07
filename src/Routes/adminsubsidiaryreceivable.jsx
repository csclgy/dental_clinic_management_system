import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminSubsidiaryReceivable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subsidiaryRecords, setSubsidiaryRecords] = useState([]);

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

  // Fetch subsidiary ledger for Accounts Receivable
  useEffect(() => {
    const fetchSubsidiary = async (account_id) => {
      try {
        const res = await axios.get("http://localhost:3000/auth/subsidiaryReceivable", {
          params: { account_id },
        });
        setSubsidiaryRecords(res.data);
      } catch (err) {
        console.error("Error fetching subsidiary records:", err);
      }
    };

    const fetchAccountReceivable = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/accountReceivable");
        if (res.data.length > 0) {
          const { account_id } = res.data[0];
          fetchSubsidiary(account_id);
        }
      } catch (err) {
        console.error("Error fetching Account Receivable:", err);
      }
    };

    fetchAccountReceivable();
  }, []);

  // Filter records
  const filteredRecords = subsidiaryRecords.filter((record) => {
    if (!searchTerm) return true;
    return (
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.invoice_no.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
            Subsidiary Ledger (Receivable)
          </h1>
          <button
            onClick={() => navigate("/adminsubsidiaryadd")}
            className="flex items-center gap-2 bg-[#00458B] font-semibold text-white px-4 py-2 rounded-lg"
          >
            + Add New Receivable
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
              defaultValue="/adminsubsidiaryreceivable"
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
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-black">{record.date}</td>
                    <td className="px-4 py-2 text-blue-700">{record.particulars}</td>
                    <td className="px-4 py-2 text-black">{record.Invoice_no}</td>
                    <td className="px-4 py-2 text-black">
                      ₱ {(Number(record.debit) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-black">
                      ₱ {(Number(record.credit) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-black">
                      {(Number(record.balance) || 0).toFixed(2)}
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
      </main>
    </div>
  );
};

export default AdminSubsidiaryReceivable;