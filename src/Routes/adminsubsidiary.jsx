import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Users,
  Calendar,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  PhilippinePeso,
  IdCard
} from "lucide-react";

const AdminSubsidiaryAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  const [account, setAccount] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    description: "",
    invoice_no: "",
    account: "",
    subaccount: "",
    type: "debit",
    amount: "",
    comment: "",
  });

  // ✅ Scroll to element and fetch account receivable
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }

    const fetchAccountReceivable = async () => {
      try {
        const res = await axios.get(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/accountReceivable`);
        if (res.data.length > 0) {
          const { account_id, account_name } = res.data[0];
          setFormData((prev) => ({
            ...prev,
            account: account_id,
            accountName: account_name,
          }));
        }
      } catch (err) {
        console.error("Error fetching Account Receivable:", err);
      }
    };

    fetchAccountReceivable();
  }, [location]);

  // ✅ Fetch patient name suggestions
  const fetchSuggestions = async (query) => {
    if (!query) {
      setNameSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/patients/search?name=${query}`
      );
      setNameSuggestions(res.data);
    } catch (err) {
      console.error("Error fetching name suggestions:", err);
    }
  };

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.description || !formData.account || !formData.amount) {
      alert("Please fill in all required fields.");
      return;
    }

    const debit = formData.type === "debit" ? Number(formData.amount) : 0;
    const credit = formData.type === "credit" ? Number(formData.amount) : 0;
    const balance = debit - credit;

    try {
      await axios.post("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/subsidiary", {
        date: formData.date,
        name: formData.description,
        invoice_no: formData.invoice_no,
        account_id: formData.account,
        patient_id: selectedPatientId,
        debit,
        credit,
        balance,
      });
      alert("Journal + Subsidiary entry saved successfully!");
      navigate("/adminsubsidiaryreceivable");
    } catch (err) {
      console.error("Error saving entry:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ✅ Sidebar (Copied from AdminScheduleCancel) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-sxl font-bold mb-8">Arciaga-Juntilla TMJ Ortho Dental Clinic</h2>

        <nav className="flex flex-col gap-2">
          {/* Dashboard dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <i className="fa fa-book"></i> Ledger
            </span>
            <i
              className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`}
            ></i>
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
          <Link to="/adminhmo" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <IdCard size={18} /> HMO
          </Link>
          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>

          {(role === "admin" || role === "inventory") && (
            <Link
              to="/admininventory"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
            >
              <i className="fa fa-archive"></i> Inventory
            </Link>
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
            <Link
              to="/admincashier"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
            >
              <PhilippinePeso size={18} /> Cashier
            </Link>
          )}

          {role === "admin" && (
            <Link
              to="/adminaudit"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
            >
              <i className="fa fa-eye"></i> Audit Trail
            </Link>
          )}
        </nav>
      </aside>

      {/* ✅ Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        {/* Your Form */}
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Add Subsidiary Entry
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Date + Invoice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoice_no"
                  value={formData.invoice_no}
                  onChange={handleChange}
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                />
              </div>
            </div>

            {/* Patient */}
            <div className="mb-6 relative">
              <label className="block text-[#00458b] font-semibold mb-1">
                Patient Name
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={(e) => {
                  handleChange(e);
                  fetchSuggestions(e.target.value);
                }}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                autoComplete="off"
              />
              {nameSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full">
                  {nameSuggestions.map((user) => (
                    <li
                      key={user.user_id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          description: user.full_name,
                        }));
                        setSelectedPatientId(user.user_id);
                        setNameSuggestions([]);
                      }}
                    >
                      {user.full_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Type + Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Debit/Credit
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                />
              </div>
            </div>

            {/* Account */}
            <div className="mb-6">
              <label className="block text-[#00458b] font-semibold mb-1">
                Account
              </label>
              <input
                type="text"
                value={formData.accountName || ""}
                readOnly
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/adminsubsidiaryreceivable")}
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminSubsidiaryAdd;