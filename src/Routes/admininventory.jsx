import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X, Package, PlusCircle } from "lucide-react";

function admininventory() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

const handleDelete = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:3000/auth/inactiveitem/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to approve item");
    }

    // Update state to remove approved item from pending list
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.inv_id === id ? { ...item, inv_item_status: "inactive" } : item
      )
    );

    alert("Item Inactive successfully");
  } catch (err) {
    console.error("Error Inactive item:", err);
    alert(err.message || "Could not approve item");
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
              <Link to="/admincoa" className="hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:bg-[white] hover:text-[#00458B]">
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
              className="flex items-center gap-2 bg-[#00c3b8] text-white px-4 py-2 rounded-lg"
            >
              Pending Items
            </Link>

            <Link
              to="/admininventoryadd"
              className="flex items-center gap-2 bg-[#00458B] text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Add Item
            </Link>
            <Link
              to="/adminsupplier"
              className="flex items-center gap-2 bg-[#00458B] text-white px-4 py-2 rounded-lg"
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
                {items.map((item) => (
                  <tr key={item.inv_id} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-blue-700">{item.inv_item_name}</td>
                    <td className="px-4 py-2 text-center">{item.inv_item_type}</td>
                    <td className="px-4 py-2 text-center">{item.inv_quantity}</td>
                    <td
                      className={`px-4 py-2 text-center font-bold ${
                        Number(item.inv_quantity) <= 50
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {Number(item.inv_quantity) <= 50 ? "Low" : "OK"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {item.inv_exp_date
                        ? new Date(item.inv_exp_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 text-center">{item.inv_item_status}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <Link
                        to={`/admininventoryview/${item.inv_id}`}
                        className={`px-4 py-2 rounded-lg text-white ${
                          item.inv_item_status === "inactive"
                            ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                            : "bg-[#008CBA] text-white font-semibold px-4 py-2 rounded-lg"
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
                      <Link
                        onClick={() => handleDelete(item.inv_id)}
                        className={`px-4 py-2 rounded-lg text-white ${
                          item.inv_item_status === "inactive"
                            ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        Delete
                      </Link>
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