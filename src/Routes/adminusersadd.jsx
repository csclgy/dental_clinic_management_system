import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings, FolderKanban, BriefcaseMedical } from "lucide-react";

const AdminUsersAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);
  const [isSettingopen, setIsSettingOpen] = useState(false);


  // ✅ Popup state and fade animation (same as AdminCoaViewAdd)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const [registerData, setRegisterData] = useState({
    user_name: "",
    user_password: "",
    role: "",
    fname: "",
    mname: "",
    lname: "",
    email: "",
    contact_no: "",
    date_birth: "",
    gender: "",
    age: "",
  });

  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // get your saved JWT token

      const response = await axios.post(
        "https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/adduser",
        registerData, // ✅ send flat object
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showPopup(response.data.message || "User added successfully!", "success");
      setTimeout(() => navigate("/adminusers"), 1500);
    } catch (error) {
      if (error.response) {
        showPopup(error.response.data.message || "Something went wrong.", "error");
        console.error("Response error:", error.response.data);
      } else if (error.request) {
        showPopup("No response from server. Please try again later.", "error");
        console.error("Request error:", error.request);
      } else {
        showPopup("Error: " + error.message, "error");
        console.error("Axios error:", error.message);
      }
    }
  };

  const handleDateChange = (dateValue) => {
    updateFormData("date_birth", dateValue);

    if (dateValue) {
      const today = new Date();
      const birthDate = new Date(dateValue);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      updateFormData("age", age);
    } else {
      updateFormData("age", "");
    }
  };

  // Scroll to section if needed
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
              <Link to="/admininventory" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
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
        {/* ✅ Popup Notification (same style as AdminCoaViewAdd) */}
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
            Add New User
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Username: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={registerData.user_name}
                onChange={(e) => updateFormData("user_name", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Email: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Password: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="password"
                value={registerData.user_password}
                onChange={(e) =>
                  updateFormData("user_password", e.target.value)
                }
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Contact Number: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={registerData.contact_no}
                onChange={(e) => {
                  // Remove any non-digit characters
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  // Limit input to 11 digits
                  if (onlyDigits.length <= 11) {
                    updateFormData("contact_no", onlyDigits);
                  }
                }}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                pattern="\d{11}"
                maxLength={11}
                required
                title="Contact number must be exactly 11 digits"
                placeholder="Enter 11-digit number"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Access Level: <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={registerData.role}
                onChange={(e) => updateFormData("role", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
                required
              >
                <option value="">-- Select Role --</option>
                <option value="dentist">Dentist</option>
                <option value="receptionist">Receptionist</option>
                <option value="inventory">Inventory Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                First Name: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={registerData.fname}
                onChange={(e) => updateFormData("fname", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Middle Name: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={registerData.mname}
                onChange={(e) => updateFormData("mname", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Last Name: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={registerData.lname}
                onChange={(e) => updateFormData("lname", e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Gender: <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={registerData.gender}
                onChange={(e) => updateFormData("gender", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              >
                <option value="">-- Select --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Date of Birth: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                value={registerData.date_birth}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                max={new Date().toISOString().split("T")[0]} // prevents future and present dates
                required
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Age
              </label>
              <input
                type="number"
                value={registerData.age}
                readOnly
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              />
            </div>

            {errorMessage && (
              <p className="text-red-500 font-medium">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-green-600 font-medium">{successMessage}</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00458B] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/adminusers")}
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

export default AdminUsersAdd;