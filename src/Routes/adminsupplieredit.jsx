import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings } from "lucide-react";

const AdminSupplierEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const [supplier, setSupplier] = useState({
    supplier_name: "",
    contact_person: "",
    contact_no: "",
    description: "",
    supplier_status: "active", // add this
  });


  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch supplier details
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await axios.get(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/supplier/${id}`);
        setSupplier(response.data);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to fetch supplier details.");
      }
    };
    fetchSupplier();
  }, [id]);

  // Update supplier
  const handleUpdate = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!supplier.supplier_name || !supplier.contact_person || !supplier.contact_no || !supplier.description) {
      showPopup("Please fill in all required fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showPopup("Unauthorized: No token found", "error");
        return;
      }

      const response = await axios.put(
        `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/supplier/${id}`,
        supplier,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showPopup(response.data.message || "Supplier updated successfully!", "success");
      setTimeout(() => navigate("/adminsupplier"), 1500);
    } catch (err) {
      console.error(err);
      showPopup(err.response?.data?.message || "Something went wrong", "error");
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

        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Edit Supplier
          </h1>

          <form className="space-y-6">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Supplier Name:
              </label>
              <input
                type="text"
                value={supplier.supplier_name}
                onChange={(e) => setSupplier({ ...supplier, supplier_name: e.target.value })}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Contact Person Name:
              </label>
              <input
                type="text"
                value={supplier.contact_person}
                onChange={(e) => setSupplier({ ...supplier, contact_person: e.target.value })}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Contact Number:
              </label>
              <input
                type="number"
                value={supplier.contact_no}
                onChange={(e) => setSupplier({ ...supplier, contact_no: e.target.value })}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Description:
              </label>
              <input
                type="text"
                value={supplier.description}
                onChange={(e) => setSupplier({ ...supplier, description: e.target.value })}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Status:
              </label>
              <select
                value={supplier.supplier_status}
                onChange={(e) => setSupplier({ ...supplier, supplier_status: e.target.value })}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>



            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00458B] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/adminsupplier")}
              >
                Back to List
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="bg-[#00458B] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminSupplierEdit;