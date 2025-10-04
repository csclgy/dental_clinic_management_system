import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminCoaEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const [account, setAccount] = useState({
    account_name: "",
    account_type: "Asset",
    status: "Active",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch account by id
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/coa/${id}`);
        setAccount(res.data);
      } catch (err) {
        console.error("Error fetching account:", err);
      }
    };
    fetchAccount();
  }, [id]);

  // Handle field changes
  const handleChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  // Update account
  const handleUpdate = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!account.account_name) {
      setErrorMessage("Account Name is required");
      return;
    }

    try {
      await axios.put(`http://localhost:3000/auth/coa/${id}`, account);
      setSuccessMessage("Account updated successfully!");
      setTimeout(() => navigate("/admincoa"), 1500);
    } catch (err) {
      console.error("Error updating account:", err);
      setErrorMessage("Failed to update account");
    }
  };

  // Scroll to element if provided
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
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Edit Account
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Account Name
              </label>
              <input
                type="text"
                name="account_name"
                value={account.account_name}
                onChange={handleChange}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Account Type
              </label>
              <select
                name="account_type"
                value={account.account_type}
                onChange={handleChange}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="Asset">Asset</option>
                <option value="Revenue">Revenue</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Account Status
              </label>
              <select
                name="status"
                value={account.status}
                onChange={handleChange}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {errorMessage && (
              <p className="text-red-500 font-medium">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-green-600 font-medium">{successMessage}</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/admincoa")}
              >
                Back to List
              </button>

              <button
                type="button"
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCoaEdit;