import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X, PlusCircle, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings } from "lucide-react";

const AdminInventoryPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // ✅ Confirmation Modal
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

  // Scroll behavior
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

  // Fetch pending inventory items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/pendingitems", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch pending items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching pending items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/rejectitem/${confirmBox.itemId}`, {
        method: "PUT", // <-- match backend
        headers: { Authorization: `Bearer ${token}` },
      });


      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete Item");
      }

      setItems((prevItems) => prevItems.filter((item) => item.inv_id !== confirmBox.itemId));
      setConfirmBox({ show: false, itemId: null, itemName: "" });
      showPopup("Item rejected successfully", "success");
    } catch (err) {
      console.error("Error deleting item:", err);
      showPopup(err.message || "Could not reject item", "error");
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/approveitem/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to approve item");
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.inv_id === id ? { ...item, inv_item_status: "approved" } : item
        )
      );

      showPopup("Item approved successfully", "success"); // ✅ replaced alert
    } catch (err) {
      console.error("Error approving item:", err);
      showPopup(err.message || "Could not approve item", "error"); // ✅ replaced alert
    }
  };

  // Filter only "pending" + search
  const filteredItems = items.filter((item) => {
    const matchesStatus = item.inv_item_status === "pending";
    const matchesSearch = Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
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
              <i className="fa fa-exclamation-triangle text-red-500 mx-auto mb-3 text-5xl"></i>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Are you sure you want to reject this item?
              </h2>
              <p className="text-gray-600 mb-6">
                <span className="font-semibold text-[#00458B]">
                  {confirmBox.itemName}
                </span>{" "}
                will be permanently removed.
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
                  className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  Reject
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
          <div>
            <h1 className="text-2xl font-bold text-[#00458B]">
              Inventory
            </h1>
            <p className="text-gray-600">(Pending Items)</p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admininventory"
              className="flex items-center font-bold gap-2 bg-[#00c3b8] text-white px-4 py-2 rounded-lg"
            >
              Approved Items
            </Link>
            <Link
              to="/admininventoryadd"
              className="flex items-center font-bold gap-2 bg-[#00458B] text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Add Item
            </Link>
            <Link
              to="/adminsupplier"
              className="flex items-center font-bold gap-2 bg-[#00458B] text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Supplier
            </Link>
          </div>
        </div>

        {/* Table */}
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
                <th className="px-4 py-2 text-center">Item Name</th>
                <th className="px-4 py-2 text-center">Category</th>
                <th className="px-4 py-2 text-center">Quantity</th>
                <th className="px-4 py-2 text-center">Company Name</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className=" text-center"></th>
                <th className=" text-center">Actions</th>
                <th className=" text-center"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.inv_id}
                    className="border-b border-gray-200 text-center"
                  >
                    <td className="px-4 py-2 text-blue-700">
                      {item.inv_item_name}
                    </td>
                    <td className="px-4 py-2">{item.inv_item_type}</td>
                    <td className="px-4 py-2">{item.inv_quantity}</td>
                    <td className="px-4 py-2">{item.supplier_name}</td>
                    <td className="px-4 py-2">{item.inv_item_status}</td>
                    <td className="">
                      <button
                        onClick={() => navigate(`/admininventoryview/${item.inv_id}`)}
                        className="bg-[#008CBA] text-white px-4 py-2 rounded-lg hover:bg-[#008CBA]"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => handleApprove(item.inv_id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        Approve
                      </button>
                    </td>
                    <td className="px-1 py-2">
                      <button
                        onClick={() =>
                          setConfirmBox({
                            show: true,
                            itemId: item.inv_id,
                            itemName: item.inv_item_name,
                          })
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center text-gray-500 py-4"
                  >
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminInventoryPending;