import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X, Package, PlusCircle, Trash2, AlertTriangle, ChevronDown, ChevronUp, PhilippinePeso } from "lucide-react";
import axios from "axios";

const AdminSupplier = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // ✅ Confirmation Modal
  const [confirmBox, setConfirmBox] = useState({
    show: false,
    supplierId: null,
    supplierName: "",
  });

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // Scroll to the section if state.scrollTo is passed
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100); // delay ensures DOM is rendered
      }
    }
  }, [location]);

  // Fetch subsidiary data from backend
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/suppliers");
        setSuppliers(res.data);
      } catch (err) {
        console.error("Error fetching subsidiary records:", err);
      } finally {
        setLoading(false); // ✅ stop loading no matter what
      }
    };
    fetchSupplier();
  }, []);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token"); // get token from localStorage

      await axios.delete(
        `http://localhost:3000/auth/suppliers/${confirmBox.supplierId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // pass the token
          },
        }
      );

      setSuppliers(
        suppliers.filter((s) => s.supplier_id !== confirmBox.supplierId)
      );
      setConfirmBox({ show: false, supplierId: null, supplierName: "" });
      showPopup("Supplier deactivated successfully.", "success");
    } catch (err) {
      console.error("Error deleting supplier:", err);
      showPopup(
        err.response?.data?.message || "Failed to deactivate supplier.",
        "error"
      );
    }
  };


  // Filter records based on search term
  const filteredRecords = suppliers.filter((record) => {
    if (!searchTerm) return true;
    return record.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const handleAccountChange = (e) => {
    const path = e.target.value;
    navigate(path);
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
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/inventorydashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Inventory Dashboard
              </Link>
              <Link to="/receptionistdashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Receptionist Dashboard
              </Link>
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
                className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-white hover:text-[#00458B]"
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

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8">
        {/* ✅ Popup Notification */}
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
                Are you sure you want to deactivate this supplier?
              </h2>
              <p className="text-gray-600 mb-6">
                <span className="font-semibold text-[#00458B]">
                  {confirmBox.supplierName}
                </span>{" "}
                will be permanently inactive.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmBox({ show: false, supplierId: null, supplierName: "" })}
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

        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">Suppliers</h1>

          <div className="flex gap-3">
            <Link
              to="/admininventory"
              className="flex items-center font-bold gap-2 bg-[#00c3b8] text-white px-4 py-2 rounded-lg"
            >
              Back
            </Link>

            <Link
              to="/adminsupplieradd"
              className="flex items-center font-bold gap-2 bg-[#00458B] text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Add Supplier
            </Link>
          </div>
        </div>

        {loading ? (
          <p>Loading supplier data...</p>
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

            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-[#00458B]">
                  <th className="px-4 py-2 text-center">Supplier Name</th>
                  <th className="px-4 py-2 text-center">Contact Person</th>
                  <th className="px-4 py-2 text-center">Contact No</th>
                  <th className="px-4 py-2 text-center">Description</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center"></th>
                  <th className="px-4 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => {
                    const isInactive = record.supplier_status?.toLowerCase() === "inactive";

                    return (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 text-center ${isInactive ? "bg-gray-100 text-gray-500" : ""
                          }`}
                      >
                        <td className="px-4 py-2">{record.supplier_name}</td>
                        <td className="px-4 py-2 text-center">{record.contact_person}</td>
                        <td className="px-4 py-2 text-center">{record.contact_no}</td>
                        <td className="px-4 py-2 text-center">{record.description}</td>
                        <td
                          className={`px-4 py-2 text-center font-semibold ${record.supplier_status === "active"
                            ? "text-green-600"
                            : "text-red-500"
                            }`}
                        >
                          {record.supplier_status}
                        </td>

                        {/* Edit Button */}
                        <td className="px-4 py-2">
                          {/* ✅ Edit - ALWAYS clickable */}
                          <Link to={`/adminsupplieredit/${record.supplier_id}`}>
                            <button
                              className={`px-4 py-1 rounded-lg text-white ${isInactive
                                ? "bg-green-500 hover:bg-green-600 opacity-80" // Slightly dimmed look when inactive
                                : "bg-green-500 hover:bg-green-600"
                                }`}
                            >
                              Edit
                            </button>
                          </Link>
                        </td>

                        {/* ❌ Deactivate - disabled when inactive */}
                        <td className="px-4 py-2">
                          <button
                            disabled={isInactive}
                            onClick={() =>
                              setConfirmBox({
                                show: true,
                                supplierId: record.supplier_id,
                                supplierName: record.supplier_name,
                              })
                            }
                            className={`px-4 py-1 rounded-lg ${isInactive
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600 text-white"
                              }`}
                          >
                            {isInactive ? "Inactive" : "Deactivate"}
                          </button>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-4">
                      No records found
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSupplier;
