import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Users,
  Calendar,
  Menu,
  X,
  PlusCircle,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PhilippinePeso
} from "lucide-react";

const AdminCoa = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // ✅ Popup state and fade animation (same as AdminCoaEdit)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // ✅ Confirmation Modal
  const [confirmBox, setConfirmBox] = useState({
    show: false,
    accountId: null,
    accountName: "",
  });

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const tooltip = document.getElementById("floatingTooltipBox");
      if (tooltip && !tooltip.contains(e.target)) {
        setSelectedRecord(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/coa");
        setAccounts(res.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        showPopup("Failed to fetch accounts.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    if (!searchTerm) return true;
    return (
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token"); // or wherever you store your JWT
      if (!token) {
        showPopup("No token found. Please login again.", "error");
        return;
      }

      await axios.delete(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/coa/${confirmBox.accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // <- include 'Bearer '
        },
      });

      setAccounts(accounts.filter((a) => a.account_id !== confirmBox.accountId));
      setConfirmBox({ show: false, accountId: null, accountName: "" });
      showPopup("Account deleted successfully.", "success");
    } catch (err) {
      console.error("Error deleting account:", err);
      showPopup("Failed to delete account.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* ✅ Popup Notification (same style as AdminCoaEdit) */}
      {popup.show && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
          style={{ zIndex: 9999 }}
        >
          {popup.message}
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {confirmBox.show && (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-[9998]">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 text-center relative animate-fadeIn">
            <AlertTriangle className="text-red-500 mx-auto mb-3" size={50} />
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Are you sure you want to deactive this account?
            </h2>
            <p className="text-gray-600 mb-6">
              <span className="font-semibold text-[#00458B]">
                {confirmBox.accountName}
              </span>{" "}
              will be inactive.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmBox({ show: false, accountId: null, accountName: "" })}
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">
            Chart of Accounts
          </h1>

          <div className="flex gap-3">
            <Link
              to="/admincoaadd"
              className="flex items-center gap-2 bg-[#00458B] font-bold text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Add Account
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              aria-hidden="true"
              className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                className="text-gray-300"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                className="text-[#00c3b8]" // your website color
                fill="currentFill"
              />
            </svg>
          </div>
        ) : (

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            {/* Search Bar */}
            <div className="flex justify-end mb-4">
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
            </div>
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100 text-[#00458B] sticky top-0 z-10">
                    <tr className="bg-gray-100 text-[#00458B]">
                      <th className="px-4 py-2 text-left">Account Name</th>
                      <th className="px-4 py-2 text-center">Account Type</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-center">Subaccounts</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account) => {
                        const isInactive = account.status?.toLowerCase() === "inactive";
                        return (
                          <tr
                            key={account.account_id}
                            className={`border-b border-gray-200 ${isInactive ? "bg-gray-100 text-gray-500" : ""
                              }`}
                          >
                            <td className="px-4 py-2 text-blue-700" onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipPosition({
                                x: rect.right + 10 + window.scrollX,
                                y: rect.top + window.scrollY,
                              });
                              setSelectedRecord(account);
                            }}
                            >
                              {account.account_name}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {account.account_type}
                            </td>
                            <td
                              className={`px-4 py-2 text-center font-semibold ${isInactive ? "text-red-500" : "text-green-600"
                                }`}
                            >
                              {isInactive ? "Inactive" : "Active"}
                            </td>

                            <td className="px-4 py-2 text-center">
                              {/* ✅ View button ALWAYS clickable */}
                              <Link to={`/admincoaview/${account.account_id}`}>
                                <button
                                  className={`px-4 py-2 rounded-lg text-white ${isInactive
                                    ? "bg-[#008CBA] hover:bg-[#0077a6] opacity-80" // Slightly dimmer if inactive
                                    : "bg-[#008CBA] hover:bg-[#0077a6]"
                                    }`}
                                >
                                  View
                                </button>
                              </Link>
                            </td>

                            <td className="px-4 py-2 text-center space-x-2">
                              {/* ✅ Edit button ALWAYS clickable */}
                              <Link to={`/admincoaedit/${account.account_id}`}>
                                <button className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600">
                                  Edit
                                </button>
                              </Link>

                              {/* ❌ Deactivate button disabled if inactive */}
                              <button
                                disabled={isInactive}
                                onClick={() => {
                                  if (!isInactive) {
                                    setConfirmBox({
                                      show: true,
                                      accountId: account.account_id,
                                      accountName: account.account_name,
                                    });
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg ${isInactive
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-red-500 text-white hover:bg-red-600"
                                  }`}
                              >
                                {isInactive ? "Deactivate" : "Deactivate"}
                              </button>
                            </td>


                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-gray-500 py-4">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {selectedRecord && (
                    <div
                      id="floatingTooltipBox"
                      style={{
                        position: "absolute",
                        top: tooltipPosition.y,
                        left: tooltipPosition.x,
                        zIndex: 1000,
                      }}
                      className="bg-white border border-gray-300 shadow-lg p-4 rounded-md w-80"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-[#00458B] absolute left-1/2 transform -translate-x-1/2">
                          Account Details
                        </h3>
                        <br></br>
                        <button
                          onClick={() => setSelectedRecord(null)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-sm text-gray-800">
                        <p className="mt-2 text-blue-800"><strong>{selectedRecord.account_name}</strong></p>
                        <p className="mt-1 ml-3 text-black"> {selectedRecord.description}</p>
                      </div>
                    </div>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCoa;
