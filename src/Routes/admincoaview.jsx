import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminCoaView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [account, setAccount] = useState(null);
  const [sub, setSubAccounts] = useState([]);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/coa/${id}`);
        setAccount(res.data);
      } catch (err) {
        console.error("Error fetching account:", err);
      }
    };

    const fetchSubAccounts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/auth/coa/${id}/subaccounts`
        );
        setSubAccounts(res.data);
      } catch (err) {
        console.error("Error fetching subaccounts:", err);
      }
    };

    if (id) {
      fetchAccount();
      fetchSubAccounts();
    }
  }, [id]);

  // scroll to element if passed in navigation state
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

  // filter subaccounts
  const filteredSubAccounts = sub.filter((s) =>
    s.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger dropdown */}
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
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
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
          <Link
            to="/admincashier"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Calendar size={18} /> Cashier
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#00458B]">
                {account?.account_name || "Charts of Account"}
              </h1>
              <p className="text-sm text-gray-600">Sub Accounts</p>
            </div>
            <button
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
              onClick={() => navigate(`/admincoaviewadd/${account?.account_id}`)}
            >
              Add
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 mb-6 w-72">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700"
            />
            <i className="fa fa-search text-[#00458B]"></i>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-white text-[#00458B] border-b border-gray-200">
                  <th className="px-4 py-2 text-center">Account Name</th>
                  <th className="px-4 py-2 text-center">Edit</th>
                  <th className="px-4 py-2 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubAccounts.length > 0 ? (
                  filteredSubAccounts.map((sub, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 text-center"
                    >
                      <td className="px-4 py-2 text-blue-700">
                        {sub.account_name}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-[#04AA6D] text-white px-5 py-1 rounded-full hover:bg-teal-500"
                          onClick={() => navigate(`/admincoaviewedit/${sub.id}`)}
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <button className="bg-[#f44336] text-white px-4 py-1 rounded-full hover:bg-red-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center text-gray-500 py-4"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Back button */}
          <div className="mt-6">
            <Link to="/admincoa">
              <button className="bg-[#EBEBEB] text-black px-6 py-2 rounded-lg hover:bg-gray-300">
                Back
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCoaView;