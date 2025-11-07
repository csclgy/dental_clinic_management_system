import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings } from "lucide-react";

const AdminServiceEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { service_id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);
  const [file, setFile] = useState(null);

  const [service, setService] = useState({
    service_name: "",
    status: "Active",
  });

  // ✅ Popup state and fade animation (copied from AdminCoaAdd)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // ✅ Fetch account by id
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/service/${service_id}`);
        setService(res.data);
      } catch (err) {
        console.error("Error fetching account:", err);
        showPopup("Failed to fetch account details.", "error");
      }
    };
    fetchServices();
  }, [service_id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      showPopup("No token found. Please login again.", "error");
      return;
    }

    const services = {
      service_name: service.service_name,
      status: service.status,
    };

    const response = await axios.put(
      `http://localhost:3000/auth/service/${service_id}`,
      services,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", 
        },
      }
    );

    showPopup(response.data.message || "Service updated successfully!", "success");
    setTimeout(() => navigate("/adminServices"), 1500);
  } catch (err) {
    console.error("Error updating Service:", err);
    showPopup(err.response?.data?.message || "Failed to update Service.", "error");
  }
};

  // ✅ Scroll to element if provided
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
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* ✅ Popup Notification (same style as AdminCoaAdd) */}
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
                    className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
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
            Edit Service
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Service Name
              </label>
              <input
                type="text"
                name="service_name"
                value={service.service_name}
                onChange={handleChange}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Service Status
              </label>
              <select
                name="status"
                value={service.status}
                onChange={handleChange}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>


            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00458B] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/adminhmo")}
              >
                Back to List
              </button>

              <button
                type="button"
                className="bg-[#00458B] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
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

export default AdminServiceEdit;
