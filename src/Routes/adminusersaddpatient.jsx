import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp } from "lucide-react";

const AdminUsersAddPatient = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

  const [registerData, setRegisterData] = useState({
    user_name: "",
    user_password: "",
    role: "patient",
    email: "",
    contact_no: "",
    gcash_num: "",
    fname: "",
    mname: "",
    lname: "",
    date_birth: "",
    gender: "",
    age: "",
    religion: "",
    nationality: "",
    home_address: "",
    province: "",
    city: "",
    occupation: "",
    blood_type: "",
    user_status: "active",
  });

  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:3000/auth/addpatient",
        registerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showPopup(response.data.message || "Patient added successfully!", "success");
      setTimeout(() => navigate("/adminusers"), 1500);
    } catch (error) {
      if (error.response) {
        showPopup(error.response.data.message || "Something went wrong", "error");
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

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/inventorydashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Inventory Dashboard
              </Link>
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <span className="flex items-center gap-2">
                  <i className="fa fa-book"></i> Ledger
                </span>
                <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
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
                className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-white hover:text-[#00458B]"
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
                <Calendar size={18} /> Cashier
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

        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Add New Patient
          </h1>
          <hr></hr>
          <br></br>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LOGIN INFO */}
            <div>
              <h2 className="text-xl font-semibold text-[#00458B] mb-4">
                Login Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={registerData.user_name}
                    onChange={(e) =>
                      updateFormData("user_name", e.target.value)
                    }
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={registerData.user_password}
                    onChange={(e) =>
                      updateFormData("user_password", e.target.value)
                    }
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={registerData.contact_no}
                    onChange={(e) => {
                      // Only allow numbers and max 11 digits
                      const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                      updateFormData("contact_no", value);
                    }}
                    pattern="\d{11}" // exactly 11 digits
                    maxLength={11}
                    required
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                    placeholder="Enter 11-digit number"
                  />
                </div>

              </div>
            </div>

            {/* PERSONAL INFO */}
            <div>
              <hr></hr>
              <br></br>
              <h2 className="text-xl font-semibold text-[#00458B] mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={registerData.fname}
                    onChange={(e) => updateFormData("fname", e.target.value)}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={registerData.mname}
                    onChange={(e) => updateFormData("mname", e.target.value)}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={registerData.lname}
                    onChange={(e) => updateFormData("lname", e.target.value)}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Gender
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
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={registerData.date_birth}
                    onChange={(e) => handleDateChange(e.target.value)}
                    max={new Date().toISOString().split("T")[0]} // only allow past dates
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
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

                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Religion
                  </label>
                  <input
                    type="text"
                    value={registerData.religion}
                    onChange={(e) => updateFormData("religion", e.target.value)}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={registerData.nationality}
                    onChange={(e) =>
                      updateFormData("nationality", e.target.value)
                    }
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Home Address
                  </label>
                  <input
                    type="text"
                    value={registerData.home_address}
                    onChange={(e) =>
                      updateFormData("home_address", e.target.value)
                    }
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Blood Type
                  </label>
                  <select
                    value={registerData.blood_type}
                    onChange={(e) =>
                      updateFormData("blood_type", e.target.value)
                    }
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  >
                    <option value="">-- Select Blood Type --</option>
                    <option value="O">O</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A">A</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B">B</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB">AB</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={registerData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={registerData.occupation}
                    onChange={(e) =>
                      updateFormData("occupation", e.target.value)
                    }
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Province
                  </label>
                  <input
                    type="text"
                    value={registerData.province}
                    onChange={(e) => updateFormData("province", e.target.value)}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                onClick={() => navigate("/adminpatients")}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg"
                onClick={handleSubmit}
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

export default AdminUsersAddPatient;