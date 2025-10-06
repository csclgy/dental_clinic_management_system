import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X, Package, PlusCircle, AlertTriangle, Trash2 } from "lucide-react";
import axios from "axios";

function admininventory() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
        const res = await fetch("http://localhost:3000/auth/inventory", {
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
        `http://localhost:3000/auth/inactiveitem/${confirmBox.itemId}`,
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
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger with dropdown */}
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
            className="flex items-center gap-2 bg-[white] text-[#00458B] p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
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

      {/* Sidebar (mobile with toggle) */}
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
            {/* Same nav as desktop */}
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
              {/* ... add other links here */}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
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
          <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-[9998]">
            <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 text-center relative animate-fadeIn">
              <AlertTriangle className="text-red-500 mx-auto mb-3" size={50} />
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Are you sure you want to delete this item?
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
                  <Trash2 size={16} /> Delete
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
            <Link
              to="/admininventorypending"
              className="flex items-center font-bold gap-2 bg-[#00c3b8] text-white px-4 py-2 rounded-lg"
            >
              Pending Items
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
              View Suppliers
            </Link>
          </div>
          
        </div>

        {loading ? (
          <p>Loading inventory data...</p>
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
                    <td className="px-4 py-2 text-blue-700">{item.inv_item_name}</td>
                    <td className="px-4 py-2 text-center">{item.inv_item_type}</td>
                    <td className="px-4 py-2 text-center">{item.inv_quantity}</td>
                    <td
                      className={`px-4 py-2 text-center font-bold ${
                        Number(item.inv_quantity) <= 50 ? "text-red-600" : "text-green-600"
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
                        <Link
                          to={`/admininventoryview/${item.inv_id}`}
                          className={`px-4 py-2 rounded-lg text-white ${
                            item.inv_item_status === "inactive"
                              ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                              : "bg-[#008CBA] hover:bg-[#0079a1]"
                          }`}
                        >
                          View
                        </Link>
                        <Link
                          to={`/admininventoryedit/${item.inv_id}`}
                          className={`px-4 py-2 rounded-lg text-white ${
                            item.inv_item_status === "inactive"
                              ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() =>
                            setConfirmBox({
                              show: true,
                              itemId: item.inv_id,
                              itemName: item.inv_item_name,
                            })
                          }
                          className={`px-4 py-2 rounded-lg text-white ${
                            item.inv_item_status === "inactive"
                              ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          Inactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
             </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default admininventory;