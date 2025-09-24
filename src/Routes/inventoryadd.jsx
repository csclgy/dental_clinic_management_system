import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Menu, X, Package } from "lucide-react";

const InventoryAdd = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [registerData, setRegisterData] = useState({
    inv_item_type: "",
    inv_item_name: "",
    inv_price_per_item: "",
    inv_quantity: "",
    inv_ml: "",
    inv_exp_date: "",
  });

  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/additem",
        registerData
      );
      setSuccessMessage(response.data.message || "Item added successfully!");
      setTimeout(() => navigate("/inventory"), 1500);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Something went wrong");
      } else if (error.request) {
        setErrorMessage("No response from server. Please try again later.");
      } else {
        setErrorMessage("Error: " + error.message);
      }
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
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
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
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
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

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Add New Item
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Item Type
              </label>
              <select
                value={registerData.inv_item_type || ""}
                onChange={(e) => updateFormData("inv_item_type", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="">-- Select Type --</option>
                <option value="tool">Tools</option>
                <option value="medicine">Medicine</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={registerData.inv_item_name}
                onChange={(e) => updateFormData("inv_item_name", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Price Per Item
              </label>
              <input
                type="number"
                value={registerData.inv_price_per_item || ""}
                onChange={(e) =>
                  updateFormData("inv_price_per_item", e.target.value)
                }
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={registerData.inv_quantity}
                onChange={(e) => updateFormData("inv_quantity", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            {/* Show only when medicine is selected */}
            {registerData.inv_item_type === "medicine" && (
              <>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Amount of mL
                  </label>
                  <input
                    type="number"
                    value={registerData.inv_ml || ""}
                    onChange={(e) => updateFormData("inv_ml", e.target.value)}
                    className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={registerData.inv_exp_date || ""}
                    onChange={(e) =>
                      updateFormData("inv_exp_date", e.target.value)
                    }
                    className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                  />
                </div>
              </>
            )}

            {errorMessage && (
              <p className="text-red-500 font-medium">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-green-600 font-medium">{successMessage}</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/inventory")}
              >
                Back to List
              </button>

              <button
                type="submit"
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default InventoryAdd;
