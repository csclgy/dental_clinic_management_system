import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Users,
  Calendar,
  Menu,
  X,
  AlertTriangle,
  Trash2,
} from "lucide-react";

const AdminCoaView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [account, setAccount] = useState(null);
  const [sub, setSubAccounts] = useState([]);

  // ✅ Popup state and fade animation (same as AdminCoa)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // ✅ Confirmation Modal
  const [confirmBox, setConfirmBox] = useState({
    show: false,
    subId: null,
    subName: "",
  });

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/coa/${id}`);
        setAccount(res.data);
      } catch (err) {
        console.error("Error fetching account:", err);
        showPopup("Failed to fetch account details.", "error");
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
        showPopup("Failed to fetch subaccounts.", "error");
      }
    };

    if (id) {
      fetchAccount();
      fetchSubAccounts();
    }
  }, [id]);

  // ✅ Delete subaccount
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/auth/coa/sub/${confirmBox.subId}`
      );
      setSubAccounts(sub.filter((s) => s.id !== confirmBox.subId));
      setConfirmBox({ show: false, subId: null, subName: "" });
      showPopup("Subaccount deleted successfully.", "success");
    } catch (err) {
      console.error("Error deleting subaccount:", err);
      showPopup("Failed to delete subaccount.", "error");
    }
  };

  // filter subaccounts
  const filteredSubAccounts = sub.filter((s) =>
    s.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* ✅ Popup Notification */}
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

      {/* ✅ Delete Confirmation Modal */}
      {confirmBox.show && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9998]">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 text-center relative animate-fadeIn">
            <AlertTriangle className="text-red-500 mx-auto mb-3" size={50} />
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Are you sure you want to delete this subaccount?
            </h2>
            <p className="text-gray-600 mb-6">
              <span className="font-semibold text-[#00458B]">
                {confirmBox.subName}
              </span>{" "}
              will be permanently removed.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  setConfirmBox({ show: false, subId: null, subName: "" })
                }
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
              <Link
                to="/admincoa"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                Chart of Accounts
              </Link>
              <Link
                to="/adminjournal"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                Journal Entries
              </Link>
              <Link
                to="/adminsubsidiaryreceivable"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                Subsidiary
              </Link>
              <Link
                to="/admingeneral"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                General Ledger
              </Link>
              <Link
                to="/admintrial"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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
                {account?.account_name || "Chart of Account"}
              </h1>
              <p className="text-sm text-gray-600">Sub Accounts</p>
            </div>
            <button
              className="flex items-center gap-2 bg-[#00458B] font-bold text-white px-4 py-2 rounded-lg"
              onClick={() =>
                navigate(`/admincoaviewadd/${account?.account_id}`)
              }
            >
              + Add New Sub Account
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
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                          onClick={() =>
                            navigate(`/admincoaviewedit/${sub.id}`)
                          }
                        >
                          Edit
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                          onClick={() =>
                            setConfirmBox({
                              show: true,
                              subId: sub.id,
                              subName: sub.account_name,
                            })
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-4">
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
              <button className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg">
                Back to List
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCoaView;