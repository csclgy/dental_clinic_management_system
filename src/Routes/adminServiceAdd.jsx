import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings } from "lucide-react";

const AdminServiceAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const [ServiceName, setServiceName] = useState("");
  const [status, setStatus] = useState("Active");



  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);



  // ✅ Popup state and fade animation (copied from ProfileChange)
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
  }, [location]);

const handleSave = async () => {
  if (!ServiceName.trim() || !status.trim()) {
    showPopup("Please fill in all required fields.", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:3000/auth/serviceadd",
      { service_name: ServiceName.trim(), status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    showPopup(res.data.message || "Service added successfully!", "success");
    setServiceName("");
    setStatus("Active");

    setTimeout(() => navigate("/adminServices"), 1500); 
  } catch (err) {
    console.error("Error adding Service:", err);
    showPopup(err.response?.data?.message || "Something went wrong.", "error");
  }
};


  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* ✅ Popup Notification (same style as ProfileChange) */}
      {popup.show && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
          style={{ zIndex: 9999 }}
        >
          {popup.message}
        </div>
      )}

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
              {role === "admin" && (
                <Link to="/admindashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Admin Dashboard</Link>
              )}
              {(role === "admin" || role === "inventory") && (
                <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard
                </Link>
              )}
              {(role === "admin" || role === "receptionist" || role === "dentist") && (
                <Link to="/receptionistdashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Receptionist
                  Dashboard</Link>
              )}
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
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
              <Link to="/adminhmo" className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-white hover:text-[#00458B]">
                <IdCard size={18} /> HMO
              </Link>
              <Link to="/orRangeSetup" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <Settings size={18} /> OR Range
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

      {/* Mobile Sidebar */}
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
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Add New Service
          </h1>

          <div className="space-y-6">
            {/* ✅ HMO Name */}
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Service Name: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={ServiceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            {/* ✅ Status */}
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Status: <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* ✅ Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00458b] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/adminservice")}
              >
                Back to List
              </button>

              <button
                type="button"
                className="bg-[#00458b] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#003a7a]"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminServiceAdd;
