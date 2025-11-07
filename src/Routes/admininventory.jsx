import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X, Package, PlusCircle, ChevronDown, ChevronUp, AlertTriangle, Trash2, PhilippinePeso, IdCard, Settings, FolderKanban, BriefcaseMedical } from "lucide-react";
import axios from "axios";

function admininventory() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);
  const [isSettingopen, setIsSettingOpen] = useState(false);


  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const [confirmBox, setConfirmBox] = useState({
    show: false,
    itemId: null,
    itemName: "",
  });

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch inventory items on load
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token"); // include token if needed
        const res = await fetch("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/inventory", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch inventory");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/inactiveitem/${confirmBox.itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.inv_id === confirmBox.itemId
            ? { ...item, inv_item_status: "inactive" }
            : item
        )
      );

      setConfirmBox({ show: false, itemId: null, itemName: "" });
      showPopup("Item set to inactive successfully.", "success");
    } catch (err) {
      console.error("Error inactivating item:", err);
      showPopup("Failed to set item inactive.", "error");
    }
  };

  // Filter only "pending" + search
  const filteredItems = items.filter((item) => {
    const matchesStatus = item.inv_item_status === "active";
    const matchesSearch = Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesStatus && matchesSearch;
  });

  const sortedItems = [...items].sort((a, b) => {
    if (a.inv_item_status === b.inv_item_status) return 0;
    return a.inv_item_status === "active" ? -1 : 1; // active first
  });

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
              <Link to="/admininventory" className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
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
                Are you sure you want to deactivate this item?
              </h2>
              <p className="text-gray-600 mb-6">
                <span className="font-semibold text-[#00458B]">
                  {confirmBox.itemName}
                </span>{" "}
                will be set as inactive.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmBox({ show: false, itemId: null, itemName: "" })}
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

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">Inventory</h1>

          <div className="flex gap-3">
            {role === "admin" && (
              <>
                <Link
                  to="/admininventorypending"
                  className="flex items-center font-bold gap-2 bg-[#00c3b8] text-white px-4 py-2 rounded-lg"
                >
                  Pending Items
                </Link>
              </>
            )}

            <Link
              to="/admininventoryadd"
              className="flex items-center font-bold gap-2 bg-[#00458B] text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Add Item
            </Link>

            {role === "admin" && (
              <>
                <Link
                  to="/adminsupplier"
                  className="flex items-center font-bold gap-2 bg-[#00458B] text-white px-4 py-2 rounded-lg"
                >
                  View Suppliers
                </Link>
              </>
            )}
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
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100 text-[#00458B] sticky top-0 z-10">
                  <tr className="bg-gray-100 text-[#00458B]">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Item Name</th>
                    <th className="px-4 py-2 text-center">Category</th>
                    <th className="px-4 py-2 text-center">Quantity</th>
                    <th className="px-4 py-2 text-center">Stocks</th>
                    <th className="px-4 py-2 text-center">Expiration Date</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems
                    .filter(item =>
                      Object.values(item).some(val =>
                        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    )
                    .map(item => (
                      <tr key={item.inv_id} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-center">{item.inv_id}</td>
                        <td className="px-4 py-2 text-blue-700">{item.inv_item_name}</td>
                        <td className="px-4 py-2 text-center">{item.inv_item_type}</td>
                        <td className="px-4 py-2 text-center">{item.inv_quantity}</td>
                        <td
                          className={`px-4 py-2 text-center font-bold ${Number(item.inv_quantity) <= 50 ? "text-red-600" : "text-green-600"
                            }`}
                        >
                          {Number(item.inv_quantity) <= 50 ? "Low" : "OK"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {item.inv_exp_date ? new Date(item.inv_exp_date).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-4 py-2 text-center">{item.inv_item_status}</td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-2 gap-2">
                            {/* ✅ View - ALWAYS clickable */}
                            <Link
                              to={`/admininventoryview/${item.inv_id}`}
                              className={`px-4 py-2 rounded-lg text-white ${item.inv_item_status === "inactive"
                                ? "bg-[#008CBA] hover:bg-[#0079a1] opacity-80" // Slightly dimmer when inactive
                                : "bg-[#008CBA] hover:bg-[#0079a1]"
                                }`}
                            >
                              View
                            </Link>

                            {/* ✅ Edit - always clickable */}
                            <Link
                              to={`/admininventoryedit/${item.inv_id}`}
                              className="px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600"
                            >
                              Edit
                            </Link>

                            {/* ❌ Deactivate - disabled when inactive */}
                            <button
                              disabled={item.inv_item_status === "inactive"}
                              onClick={() =>
                                setConfirmBox({
                                  show: true,
                                  itemId: item.inv_id,
                                  itemName: item.inv_item_name,
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-white ${item.inv_item_status === "inactive"
                                ? "bg-gray-400 text-gray-500 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                                }`}
                            >
                              {item.inv_item_status === "inactive" ? "Deactivate" : "Deactivate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default admininventory;