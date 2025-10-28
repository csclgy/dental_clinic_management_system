import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, Package, PlusCircle, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings } from "lucide-react";

const AdminInventoryAdd = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  const [suppliers, setSuppliers] = useState([]);

  // ✅ Popup state and fade animation (same as AdminCoaAdd)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const [registerData, setRegisterData] = useState({
    inv_item_type: "",
    inv_item_name: "",
    inv_price_per_item: "",
    inv_quantity: "",
    inv_ml: "",
    inv_exp_date: "",
    supplier_id: "",
  });

  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  // 🔹 Fetch suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/suppliers");
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/additem",
        registerData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      showPopup(response.data.message || "Item added successfully!", "success");

      setRegisterData({
        inv_item_type: "",
        inv_item_name: "",
        inv_price_per_item: "",
        inv_quantity: "",
        inv_ml: "",
        inv_exp_date: "",
        supplier_id: "",
      });

      setTimeout(() => navigate("/admininventory"), 1500);
    } catch (error) {
      if (error.response) {
        showPopup(error.response.data.message || "Something went wrong", "error");
      } else if (error.request) {
        showPopup("No response from server. Please try again later.", "error");
      } else {
        showPopup("Error: " + error.message, "error");
      }
    }
  };

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
        {/* ✅ Popup Notification (same as AdminCoaAdd) */}
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
              } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}

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
                Item Type: <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={registerData.inv_item_type || ""}
                onChange={(e) => updateFormData("inv_item_type", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="">-- Select Type --</option>
                <option value="Medical Supply">Medical Supply</option>
                <option value="Medicine">Medicine</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Item Name: <span style={{ color: "red" }}>*</span>
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
                Price Per Item (₱): <span style={{ color: "red" }}>*</span>
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
                Quantity: <span style={{ color: "red" }}>*</span>
              </label>
              <div className="flex items-center border border-[#00458b] rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() =>
                    updateFormData(
                      "inv_quantity",
                      Math.max(0, Number(registerData.inv_quantity) - 1)
                    )
                  }
                  className="px-4 py-2 text-[#00458b] font-bold text-lg hover:bg-[#00458b] hover:text-white transition"
                >
                  −
                </button>

                <input
                  type="text"
                  value={registerData.inv_quantity}
                  onChange={(e) => {
                    const value = e.target.value;

                    // Allow only numbers (no negatives, no special chars)
                    if (/^\d*$/.test(value)) {
                      updateFormData("inv_quantity", value);
                    }
                  }}
                  onBlur={() => {
                    // If empty, set to 0
                    if (registerData.inv_quantity === "") {
                      updateFormData("inv_quantity", 0);
                    }
                  }}
                  className="w-16 text-center outline-none border-x border-[#00458b] py-2"
                  inputMode="numeric"
                />

                <button
                  type="button"
                  onClick={() =>
                    updateFormData("inv_quantity", Number(registerData.inv_quantity) + 1)
                  }
                  className="px-4 py-2 text-[#00458b] font-bold text-lg hover:bg-[#00458b] hover:text-white transition"
                >
                  +
                </button>
              </div>
            </div>


            {/* Show only when medicine is selected */}
            {registerData.inv_item_type === "Medicine" && (
              <>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Amount of mL: <span style={{ color: "red" }}>*</span>
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
                    Expiration Date: <span style={{ color: "red" }}>*</span>
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

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Supplier: <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={registerData.supplier_id}
                onChange={(e) => updateFormData("supplier_id", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.supplier_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00458B] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/admininventory")}
              >
                Back to List
              </button>

              <button
                type="submit"
                className="bg-[#00458B] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
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

export default AdminInventoryAdd;