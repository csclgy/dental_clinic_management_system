import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminUsersAddPatient = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      const response = await axios.post(
        "http://localhost:3000/auth/addpatient",
        registerData
      );
      setSuccessMessage(response.data.message || "Patient Added successfully!");
      setTimeout(() => navigate("/adminusers"), 1500);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Something went wrong");
        console.error("Response error:", error.response.data);
      } else if (error.request) {
        setErrorMessage("No response from server. Please try again later.");
        console.error("Request error:", error.request);
      } else {
        setErrorMessage("Error: " + error.message);
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
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

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
              <Link to="/admincoa" className="hover:underline">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:underline">
                Journal Entries
              </Link>
              <Link to="/admingeneral" className="hover:underline">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:underline">
                Trial Balance
              </Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B] bg-white text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
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
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
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
            <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
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
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
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
                    type="number"
                    value={registerData.contact_no}
                    onChange={(e) =>
                      updateFormData("contact_no", e.target.value)
                    }
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
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

            {errorMessage && (
              <p className="text-red-500 font-medium">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-green-600 font-medium">{successMessage}</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full"
                onClick={() => navigate("/adminusers")}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full"
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