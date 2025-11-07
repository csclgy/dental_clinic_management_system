import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Users,
  PhilippinePeso,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Menu,
  IdCard,
  Settings,
  FolderKanban, 
  BriefcaseMedical
} from "lucide-react";

const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://dental-clinic-management-system-backend-jlz9.onrender.com";

const OrRangeSetup = () => {
  const navigate = useNavigate();

  // Sidebar and Navigation States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const role = localStorage.getItem("role");
const [isSettingopen, setIsSettingOpen] = useState(false);

  // OR Range States
  const [orRanges, setOrRanges] = useState([]);
  const [activeRange, setActiveRange] = useState(null);
  const [startOr, setStartOr] = useState("");
  const [endOr, setEndOr] = useState("");
  const [loading, setLoading] = useState(false);

  // Popup
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch OR ranges
  const fetchOrRanges = async () => {
    try {
      const allRes = await axios.get(`${API_BASE}/api/or-range`);
      setOrRanges(allRes.data);

      const activeRes = await axios.get(`${API_BASE}/api/or-range/active`);
      setActiveRange(activeRes.data);
    } catch (err) {
      console.error("❌ Failed to fetch OR ranges:", err);
      showPopup("Error fetching OR ranges.", "error");
    }
  };

  // Add new range
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startOr || !endOr) return showPopup("Please fill out all fields.", "error");
    if (parseInt(startOr) >= parseInt(endOr))
      return showPopup("Start OR must be less than End OR.", "error");
    if (activeRange)
      return showPopup("Deactivate the current active range before adding a new one.", "error");

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/or-range`, { start_or: startOr, end_or: endOr });
      await fetchOrRanges();
      setStartOr("");
      setEndOr("");
      showPopup("New OR range added successfully!", "success");
    } catch (err) {
      console.error("❌ Failed to add OR range:", err);
      showPopup(
        err.response?.data?.message || "Error adding OR range.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Activate range
  const handleActivate = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/or-range/${id}/activate`);
      showPopup("Range activated successfully!", "success");
      fetchOrRanges();
    } catch (err) {
      console.error("❌ Failed to activate OR range:", err);
      showPopup(
        err.response?.data?.message || "Error activating OR range.",
        "error"
      );
    }
  };

  // Deactivate range
  const handleDeactivate = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/or-range/${id}/deactivate`);
      showPopup("Range deactivated successfully!", "success");
      fetchOrRanges();
    } catch (err) {
      console.error("❌ Failed to deactivate OR range:", err);
      showPopup(
        err.response?.data?.message || "Error deactivating OR range.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchOrRanges();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Popup Notification */}
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

      {/* Sidebar */}
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
                className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
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

                  <Link to="/orRangeSetup" className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
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
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">OR Range Setup</h1>

          {activeRange ? (
            <div className="bg-[#f0f8ff] border border-[#00458b] rounded-lg p-4 mb-6">
              <p className="text-[#00458b] font-semibold">
                Active Range: {activeRange.start_or} - {activeRange.end_or}
              </p>
              <p className="text-[#00458b]">
                Current OR: <span className="font-semibold">{activeRange.current_or}</span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic mb-6">No active OR range yet.</p>
          )}

          {/* Add New Range Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Start OR Number:</label>
              <input
                type="number"
                value={startOr}
                onChange={(e) => setStartOr(e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">End OR Number:</label>
              <input
                type="number"
                value={endOr}
                onChange={(e) => setEndOr(e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#00458b] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#003a7a]"
              >
                {loading ? "Saving..." : "Save Range"}
              </button>
            </div>
          </form>

          {/* OR Range Table */}
          <h2 className="font-bold text-lg mb-2 text-[#00458B]">All OR Ranges</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Start OR</th>
                  <th className="border p-2">End OR</th>
                  <th className="border p-2">Current OR</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Created At</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {orRanges.length > 0 ? (
                  orRanges.map((r) => (
                    <tr key={r.id}>
                      <td className="border p-2 text-center">{r.id}</td>
                      <td className="border p-2 text-center">{r.start_or}</td>
                      <td className="border p-2 text-center">{r.end_or}</td>
                      <td className="border p-2 text-center">{r.current_or}</td>
                      <td className={`border p-2 text-center font-semibold ${r.status === "Active" ? "text-green-600" : "text-gray-500"}`}>
                        {r.status}
                      </td>
                      <td className="border p-2 text-center">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="border p-2 text-center space-x-2">
                        {r.status === "Active" ? (
                          <button onClick={() => handleDeactivate(r.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(r.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-3 text-center text-gray-500 italic">
                      No OR ranges found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrRangeSetup;