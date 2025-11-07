import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings, FolderKanban, BriefcaseMedical } from "lucide-react";

const AdminConsultationPartialPayment = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);
  const [isSettingopen, setIsSettingOpen] = useState(false);


  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };


  const [formData, setFormData] = useState({
    date: "",
    name: "",
    invoice_no: "",
    account: "",
    accountName: "",
    type: "debit",
    amount: "",
    procedure_type: "",
    appoint_id: ""
  });

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

  useEffect(() => {
    if (location.state) {
      const { patientName, invoiceNo, procedureType, appointId } = location.state;
      setFormData((prev) => ({
        ...prev,
        name: patientName || "",
        invoice_no: invoiceNo || "",
        procedure_type: procedureType || "",
        appoint_id: appointId || ""
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.name || !formData.account || !formData.amount) {
      showPopup("Please fill in all required fields.", "error");
      return;
    }


    const debit = formData.type === "debit" ? Number(formData.amount) : 0;
    const credit = formData.type === "credit" ? Number(formData.amount) : 0;


    try {
      await axios.post("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/subsidiaryReceivable", {
        date: formData.date,
        name: formData.name,
        invoice_no: formData.invoice_no,
        amount: Number(formData.amount),
        appoint_id: formData.appoint_id,
        procedure_type: formData.procedure_type,
      });
      showPopup("Payment successful! Payment recorded in accounts receivable", "success");
      setTimeout(() => navigate("/admincashier"), 1500);

    } catch (err) {
      console.error("Error saving entry:", err.response?.data || err.message);
      showPopup(err.response?.data?.message || "Something went wrong", "error");

    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-sxl font-bold mb-8">Arciaga-Juntilla TMJ Ortho Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button onClick={() => setOpenDashboard(!openDashboard)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ?
              <ChevronUp size={16} /> :
              <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              {role === "admin" && (
                <Link to="/admindashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Admin Dashboard</Link>
              )}
              {(role === "admin" || role === "inventory") && (
                <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard
                </Link>
              )}
              {(role === "admin" || role === "receptionist" || role === "dentist") && (
                <Link to="/receptionistdashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Appointments
                  Dashboard</Link>
              )}
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
              {/* Ledger Dropdown */}
              <button onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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
                  <Link to="/admincoa" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Chart of Accounts
                  </Link>
                  <Link to="/adminjournal"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Journal Entries
                  </Link>
                  <Link to="/adminsubsidiaryreceivable"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Subsidiary
                  </Link>
                  <Link to="/admingeneral"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    General Ledger
                  </Link>
                  <Link to="/admintrial" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Trial Balance
                  </Link>
                </div>
              )}
              <Link to="/adminusers" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <Users size={18} /> Users
              </Link>
            </>
          )}

          {(role === "admin" || role === "inventory") && (
            <>
              <Link to="/admininventory" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-archive"></i> Inventory
              </Link>
            </>
          )}

          {(role === "admin" || role === "dentist" || role === "receptionist") && (
            <>
              <Link to="/adminpatients" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-user-plus"></i> Patients
              </Link>

              <Link to="/adminschedule" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <Calendar size={18} />{" "}
                {role === "dentist" ? "Appointments" : "Appointments & Billing"}
              </Link>
            </>
          )}
          {role === "admin" && (
            <>
              <button onClick={() => setIsSettingOpen(!isSettingopen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <span className="flex items-center gap-2">
                  <Settings size={18} /> Settings
                </span>
                {isSettingopen ?
                  <ChevronUp size={16} /> :
                  <ChevronDown size={16} />}
              </button>
              {isSettingopen && (
                <div className="ml-6 flex flex-col gap-1 text-sm">
                  <Link to="/adminhmo" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <IdCard size={18} /> HMO
                  </Link>

                  <Link to="/orRangeSetup" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <FolderKanban size={18} /> OR Range
                  </Link>

                  <Link to="/adminServices"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <BriefcaseMedical size={18} /> Services
                  </Link>
                </div>
              )}
            </>
          )}
          {role === "admin" && (
            <>
              <Link to="/adminaudit"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-eye"></i> Audit Trail
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Add Payment
          </h1>

          {popup.show && (
            <div
              className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"} ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
              style={{ zIndex: 9999 }}
            >
              {popup.message}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Appointment No:
                </label>
                <input
                  type="text"
                  name="appoint_id"
                  value={formData.appoint_id}
                  onChange={handleChange}
                  readOnly
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
                />
              </div>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoice_no"
                  value={formData.invoice_no}
                  onChange={handleChange}
                  readOnly
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Service:
                </label>
                <input
                  type="text"
                  name="procedure_type"
                  value={formData.procedure_type}
                  onChange={handleChange}
                  readOnly
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>


            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Patient Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Debit
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  readOnly
                  disabled
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

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate(`/adminconsultationpartial/${appointId}`)}
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

export default AdminConsultationPartialPayment;
