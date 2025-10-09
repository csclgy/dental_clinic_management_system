import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Menu, X, Package, PlusCircle } from "lucide-react";

function Inventory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch inventory data
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/auth/inventory", {
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

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/auth/inventory/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete item");

      setInventory(inventory.filter((item) => item.inv_id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Inventory Staff</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/inventorydashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>
          <Link
            to="/inventory"
            className="flex items-center gap-2 bg-[#01D5C4] text-white p-2 rounded-lg"
          >
            <Package size={18} /> Inventory
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
            <h2 className="text-xl font-bold mb-8">Inventory Staff</h2>
            <nav className="flex flex-col gap-2">
              <Link
                to="/inventorydashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/inventory"
                className="flex items-center gap-2 bg-[#01D5C4] text-white p-2 rounded-lg"
              >
                <Package size={18} /> Inventory
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
          <h1 className="text-2xl font-bold text-[#00458B]">Inventory</h1>
          <Link
            to="/inventoryadd"
            className="flex items-center gap-2 bg-[#01D5C4] text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <PlusCircle size={18} /> Add Item
          </Link>
        </div>

        {loading ? (
          <p>Loading inventory data...</p>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-[#00458B]">
                  <th className="px-4 py-2 text-left">Item Name</th>
                  <th className="px-4 py-2 text-center">Category</th>
                  <th className="px-4 py-2 text-center">Quantity</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Expiration Date</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.inv_id} className="border-b border-gray-200">
                    <td className="px-4 py-2">{item.inv_item_name}</td>
                    <td className="px-4 py-2 text-center">{item.inv_item_type}</td>
                    <td className="px-4 py-2 text-center">{item.inv_quantity}</td>
                    <td
                      className={`px-4 py-2 text-center font-bold ${Number(item.inv_quantity) <= 50
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
                    <td className="px-4 py-2 text-center space-x-2">
                      <Link
                        to={`/inventoryedit/${item.inv_id}`}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item.inv_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
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
}

export default Inventory;