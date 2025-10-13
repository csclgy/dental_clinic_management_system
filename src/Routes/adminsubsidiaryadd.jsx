import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso } from "lucide-react";

const AdminSubsidiaryAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    description: "",
    invoice_no: "",
    account: "",
    accountName: "",
    type: "debit",
    amount: "",
  });

  // ✅ Popup state and fade animation (same style as AdminCoaViewAdd)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // Scroll into view if coming from another page
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
        const res = await axios.get(
          `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/accountReceivable`
        );
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.description || !formData.account || !formData.amount) {
      showPopup("Please fill in all required fields.", "error");
      return;
    }

    const debit = formData.type === "debit" ? Number(formData.amount) : 0;
    const credit = formData.type === "credit" ? Number(formData.amount) : 0;
    const balance = debit - credit;

    try {
      const token = localStorage.getItem("token"); // get your saved JWT token
      await axios.post("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/subsidiary", {
        date: formData.date,
        name: formData.description,
        invoice_no: formData.invoice_no,
        account_id: formData.account,
        patient_id: selectedPatientId,
        debit,
        credit,
        balance,
      },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ add this
          },
        }
      );

      showPopup("Subsidiary entry saved successfully!", "success");
      setTimeout(() => navigate("/adminsubsidiaryreceivable"), 1500);
    } catch (err) {
      console.error("Error saving entry:", err.response?.data || err.message);
      showPopup(err.response?.data?.message || "Something went wrong", "error");
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

        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
              } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}

        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Add Subsidiary Entry
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
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
                <ul className="absolute z-10 bg-white border border-gray-300 rounded">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Account
              </label>
              <input
                type="text"
                value={formData.accountName || ""}
                readOnly
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
              />
              <input type="hidden" name="account" value={formData.account || ""} />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/adminsubsidiaryreceivable")}
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
