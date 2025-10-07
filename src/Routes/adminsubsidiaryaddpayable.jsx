import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminSubsidiaryPayableAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [account, setAccount] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    description: "",
    invoice_no: "",
    account: "",
    accountName: "",
    account1: "",
    type: "debit",
    amount: "",
    items:"",
    day_agreement:"",
    due_date:""

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

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }

    const fetchAccountPayable = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/accountPayable`);
        if (res.data.length > 0) {
          const { account_id, account_name } = res.data[0];
          setFormData((prev) => ({
            ...prev,
            account: account_id,
            accountName: account_name,
          }));
        }
      } catch (err) {
        console.error("Error fetching Account Payable:", err);
      }
    };

    const fetchInventory = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/accountInventory`);
        if (res.data.length > 0) {
          setAccount(res.data);
        }
      } catch (err) {
        console.error("Error fetching Inventory Accounts:", err);
      }
    };

    fetchAccountPayable();
    fetchInventory();
  }, [location]);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setNameSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:3000/auth/supplier?name=${query}`
      );
      setNameSuggestions(res.data);
    } catch (err) {
      console.error("Error fetching name suggestions:", err);
    }
  };

  useEffect(() => {
  if (formData.day_agreement && formData.date) {
    let days = parseInt(formData.day_agreement);
    const baseDate = new Date(formData.date);
    const due = new Date(baseDate);
    due.setDate(baseDate.getDate() + days);
    const formattedDue = due.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, due_date: formattedDue }));
  }
}, [formData.day_agreement, formData.date]);

const handleChange = (e) => {
  const { name, value } = e.target;

  // Handle day agreement change
  if (name === "day_agreement") {
    let days = 0;

    if (value.includes("30")) days = 30;
    else if (value.includes("60")) days = 60;
    else if (value.includes("90")) days = 90;
    else if (value.includes("100")) days = 100;

    // Use the current date or selected formData.date as base
    const baseDate = formData.date ? new Date(formData.date) : new Date();
    const due = new Date(baseDate);
    due.setDate(baseDate.getDate() + days);

    // Format date to YYYY-MM-DD for input type="date"
    const formattedDue = due.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      day_agreement: value,
      due_date: formattedDue,
    }));
  } 
  // Handle normal input fields
  else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.date ||
      !formData.description ||
      !formData.account ||
      !formData.amount ||
      !formData.account1
    ) {
      showPopup("Please fill in all required fields.", "error");
      return;
    }

    try {
      const debit = formData.type === "debit" ? Number(formData.amount) : 0;
      const credit = formData.type === "credit" ? Number(formData.amount) : 0;

      await axios.post("http://localhost:3000/auth/subsidiary1", {
        date: formData.date,
        name: formData.description,
        account_id: formData.account,
        expense_id: formData.account1,
        invoice_no: formData.invoice_no,
        amount:formData.amount,
        debit,
        credit,
        items: formData.items,
        day_agreement: formData.day_agreement,
        due_date: formData.due_date
      });

      showPopup("Subsidiary entry saved successfully!", "success");
      navigate("/adminsubsidiaryPayable");
    } catch (err) {
      console.error("Error saving entry:", err);
      showPopup(err.response?.data?.message || "Something went wrong", "error");
    }
  };

useEffect(() => {
  const state = location.state;
  if (!state?.mode) return;

  if (state.mode === "pay") {
    const expenseName = (state.expense_account || state.expenseAccount || "").trim();

    // Try to find the account object whose name matches the expense name (case-insensitive)
    const matched = account.find(
      (acc) =>
        acc.account_name &&
        acc.account_name.toLowerCase() === expenseName.toLowerCase()
    );

    setFormData((prev) => ({
      ...prev,
      date: state.date || prev.date,
      description: state.name || prev.description,
      invoice_no: state.invoice_no || prev.invoice_no,
      type: "debit",
      account: prev.account,         
      accountName: prev.accountName, 
      account1: matched ? String(matched.account_id) : "",
      items: state.items || prev.items,
      day_agreement: state.day_agreement || prev.day_agreement,
      due_date: state.due_date || prev.due_date,
    }));
  }
}, [location.state, account]); 

const expenseFromState =
  (location.state?.expense_account || location.state?.expenseAccount || "").trim();

const matchedAccount = account.find(
  (acc) =>
    expenseFromState &&
    acc.account_name &&
    acc.account_name.toLowerCase() === expenseFromState.toLowerCase()
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

          {/* Ledger Dropdown */}
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
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${
              fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
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
            Add Subsidiary Payable Entry
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date & Invoice */}
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
                    readOnly={location.state?.mode === "pay"}
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
                    readOnly={location.state?.mode === "pay"}
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                />
              </div>
            </div>

            {/* Name + Suggestions */}
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Name
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={(e) => {
                  handleChange(e);
                  fetchSuggestions(e.target.value);
                }}
                  readOnly={location.state?.mode === "pay"}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                autoComplete="off"
              />
              {nameSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1">
                  {nameSuggestions.map((supplier) => (
                    <li
                      key={supplier.supplier_id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          description: supplier.supplier_name,
                        }));
                        setSelectedPatientId(supplier.supplier_id);
                        setNameSuggestions([]);
                      }}
                    >
                      {supplier.supplier_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Debit/Credit & Amount */}
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
                    readOnly={location.state?.mode === "pay"}
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

            {/* Account Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Expense Account
                </label>

              {/* if pay mode */}
                {location.state?.mode === "pay" && matchedAccount ? (
                  <select
                    name="account1"
                    value={formData.account1}
                    onChange={handleChange}
                    className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
                    disabled
                  >
                    <option value="">-- Select Account --</option>
                    {account.map((acc) => (
                      <option key={acc.account_id} value={String(acc.account_id)}>
                        {acc.account_name}
                      </option>
                    ))}
                  </select>
                ) : location.state?.mode === "pay" && expenseFromState ? (
                  <input
                    type="text"
                    value={expenseFromState}
                    readOnly
                    className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
                  />
                    ) : (
                      <select
                        name="account1"
                        value={formData.account1}
                        onChange={handleChange}
                        className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                      >
                        <option value="">-- Select Account --</option>
                        {account.map((acc) => (
                          <option key={acc.account_id} value={String(acc.account_id)}>
                            {acc.account_name}
                          </option>
                        ))}
                      </select>
                    )}
              </div>
            </div>
            
            {/* Transaction Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Items:
                </label>
                <input
                  type="text"
                  name="items"
                  value={formData.items}
                  onChange={handleChange}
                  readOnly={location.state?.mode === "pay"}
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Agreement
                </label>
                <select
                    name="day_agreement"
                    value={formData.day_agreement}
                    onChange={handleChange}
                    className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                      readOnly={location.state?.mode === "pay"}
                  >
                    <option value="">Select Agreement</option>
                    <option value="30 days">30 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                    <option value="100 days">100 days</option>
                  </select>
              </div>
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  readOnly
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/adminsubsidiaryPayable")}
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

export default AdminSubsidiaryPayableAdd;
