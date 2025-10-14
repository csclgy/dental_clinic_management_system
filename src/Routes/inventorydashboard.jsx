import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Menu, X, Package, AlertTriangle, Clock, Calendar, Users, ChevronDown, ChevronUp, PhilippinePeso } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function InventoryDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDashboard, setOpenDashboard] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const role = localStorage.getItem("role");

  // Fetch inventory data from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token"); // staff login token
        const res = await fetch("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/inventory", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch inventory");
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const totalItems = inventory.length;

  const totalQuantity = inventory.reduce(
    (sum, item) => sum + Number(item.inv_quantity || 0),
    0
  );

  // Low stock: quantity <= 10
  const lowStock = inventory.filter((item) => Number(item.inv_quantity) <= 50).length;

  // Expiring Soon: within 30 days
  const expiringSoon = inventory.filter((item) => {
    if (!item.inv_exp_date) return false;
    const expDate = new Date(item.inv_exp_date);
    const today = new Date();
    const diffDays = (expDate - today) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30;
  }).length;

  // ======= CHARTS =======

  // Chart 1: Inventory Status (Low vs In Stock)
  const lowCount = inventory.filter((item) => Number(item.inv_quantity) <= 50).length;
  const inStockCount = inventory.filter((item) => Number(item.inv_quantity) > 10).length;

  const statusData = [
    { status: "Low Stock", count: lowCount },
    { status: "In Stock", count: inStockCount },
  ];

  // Chart 2: Top 5 items by quantity
  const topItemsData = [...inventory]
    .sort((a, b) => b.inv_quantity - a.inv_quantity)
    .slice(0, 5)
    .map((item) => ({
      name: item.inv_item_name,
      quantity: item.inv_quantity,
    }));

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
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
                <Link to="/inventorydashboard" className="bg-white text-[#00458B] hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard</Link>
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
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <h1 className="text-2xl font-bold text-[#00458B] mb-6">
          Inventory Dashboard
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              aria-hidden="true"
              className="w-12 h-12 text-gray-300 animate-spin"
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
          <> 
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-[#01D5C4]">
                <Package className="text-[#00458B]" size={32} />
                <div>
                  <h2 className="text-lg font-semibold">Total Items</h2>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-[#01D5C4]">
                <BarChart3 className="text-[#00458B]" size={32} />
                <div>
                  <h2 className="text-lg font-semibold">Total Quantity</h2>
                  <p className="text-2xl font-bold">{totalQuantity}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-red-500">
                <AlertTriangle className="text-red-500" size={32} />
                <div>
                  <h2 className="text-lg font-semibold">Low Stock</h2>
                  <p className="text-2xl font-bold">{lowStock}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 border-t-4 border-yellow-500">
                <Clock className="text-yellow-500" size={32} />
                <div>
                  <h2 className="text-lg font-semibold">Expiring Soon</h2>
                  <p className="text-2xl font-bold">{expiringSoon}</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Status Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#00458B]">
                  <BarChart3 size={20} /> Inventory Status
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusData}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#01D5C4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top 5 Items by Quantity */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#00458B]">
                  <Package size={20} /> Top 5 Items by Quantity
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topItemsData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#00458B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-600">
                <Clock size={20} /> Expiring Soon Items (within 30 days)
              </h2>
              {expiringSoon > 0 ? (
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-[#00458B]">
                      <th className="px-4 py-2 text-left">Item Name</th>
                      <th className="px-4 py-2 text-center">Quantity</th>
                      <th className="px-4 py-2 text-center">Expiration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory
                      .filter((item) => {
                        if (!item.inv_exp_date) return false;
                        const expDate = new Date(item.inv_exp_date);
                        const today = new Date();
                        const diffDays = (expDate - today) / (1000 * 60 * 60 * 24);
                        return diffDays > 0 && diffDays <= 30;
                      })
                      .map((item) => (
                        <tr key={item.inv_id} className="border-b border-gray-200">
                          <td className="px-4 py-2">{item.inv_item_name}</td>
                          <td className="px-4 py-2 text-center">{item.inv_quantity}</td>
                          <td className="px-4 py-2 text-center">
                            {new Date(item.inv_exp_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No expiring items soon.</p>
              )}
            </div>

            {/* Low Stock Table */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} /> Low Stock Items
              </h2>

              {inventory.filter((item) => Number(item.inv_quantity) <= 50).length > 0 ? (
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-[#00458B]">
                      <th className="px-4 py-2 text-left">Item Name</th>
                      <th className="px-4 py-2 text-center">Quantity</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-center">Expiration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory
                      .filter((item) => Number(item.inv_quantity) <= 50)
                      .map((item) => (
                        <tr key={item.inv_id} className="border-b border-gray-200">
                          <td className="px-4 py-2">{item.inv_item_name}</td>
                          <td className="px-4 py-2 text-center">{item.inv_quantity}</td>
                          <td className="px-4 py-2 text-center text-red-600 font-bold">
                            Low
                          </td>
                          <td className="px-4 py-2 text-center">
                            {item.inv_exp_date
                              ? new Date(item.inv_exp_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No low stock items.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default InventoryDashboard;