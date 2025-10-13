import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Package, X, Menu } from "lucide-react";

const InventoryEdit = () => {
  const { id } = useParams(); // ✅ inv_id from route
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // form states
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [ml, setML] = useState("");
  const [expiration, setExpiration] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(
          `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/displayitem/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // populate states when item is loaded
  useEffect(() => {
    if (item) {
      setItemName(item.inv_item_name || "");
      setItemType(item.inv_item_type || "");
      setQuantity(item.inv_quantity ?? "");
      setPrice(
        item.inv_price_per_item !== null ? String(item.inv_price_per_item) : ""
      );
      setML(item.inv_ml ?? "");
      setExpiration(item.inv_exp_date || "");
    }
  }, [item]);

  // handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/edititem/${id}`,
        {
          inv_item_name: itemName,
          inv_item_type: itemType,
          inv_quantity: Number(quantity),
          inv_price_per_item: Number(price),
          inv_ml: itemType === "medicine" ? ml : null,
          inv_exp_date: itemType === "medicine" ? expiration : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("✅ Item updated successfully!");
      navigate("/inventory");
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

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

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">Edit Item</h1>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Item Name */}
            <div>
              <label className="block font-semibold mb-1 text-[#00458B]">
                Item Name:
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01D5C4]"
              />
            </div>

            {/* Item Type */}
            <div>
              <label className="block font-semibold mb-1 text-[#00458B]">
                Item Type:
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                required
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01D5C4]"
              >
                <option value="">--Select--</option>
                <option value="medicine">Medicine</option>
                <option value="tool">Tool</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-semibold mb-1 text-[#00458B]">
                Quantity:
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01D5C4]"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block font-semibold mb-1 text-[#00458B]">
                Price per Item: ₱
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01D5C4]"
              />
            </div>

            {/* Medicine-specific fields */}
            {itemType === "medicine" && (
              <>
                <div>
                  <label className="block font-semibold mb-1 text-[#00458B]">
                    mL:
                  </label>
                  <input
                    type="text"
                    value={ml}
                    onChange={(e) => setML(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01D5C4]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#00458B]">
                    Expiration Date:
                  </label>
                  <input
                    type="date"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01D5C4]"
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="submit"
                className="bg-green-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Update Item
              </button>

              <button
                type="button"
                onClick={() => navigate("/inventory")}
                className="bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default InventoryEdit;
