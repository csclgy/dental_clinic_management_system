import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AdminUsersAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [successMessage, setSuccessMessage] = useState("");

  const [registerData, setRegisterData] = useState({
    user_name: "",
    user_password: "",
    role: "",
    fname: "",
    mname: "",
    lname: "",
    email: "",
    contact_no: ""
  });

  // 🔔 Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const updateFormData = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // check if required fields are empty
    if (!registerData.user_name || !registerData.user_password || !registerData.role || !registerData.email) {
      setAlertMessage("Please fill in all required fields.");
      setShowAlert(true);

      // auto-close error alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/auth/adduser", registerData);
      setAlertMessage(response.data.message || "User created successfully");
      setShowAlert(true);

      // ⏳ Auto close + redirect after 2 seconds
      setTimeout(() => {
        setShowAlert(false);
        navigate("/adminusers");
      }, 2000);
    } catch (error) {
      if (error.response) {
        setAlertMessage(error.response.data.message || "Something went wrong");
      } else if (error.request) {
        setAlertMessage("No response from server. Please try again later.");
      } else {
        setAlertMessage("Error: " + error.message);
      }
      setShowAlert(true);

      // hide error alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
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
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
            <div
              className="col-sm-3 p-5 rounded-lg shadow-lg"
              style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
            >
              {/* Dashboard */}
              <Link to="/">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-tachometer" aria-hidden="true"></i> Dashboard
                </button>
              </Link>

              {/* Ledger with Dropdown */}
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
                style={{ color: "#00458B" }}
              >
                <span>
                  <i className="fa fa-book" aria-hidden="true"></i> Ledger
                </span>
                <i
                  className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`}
                  aria-hidden="true"
                ></i>
              </button>

              {isLedgerOpen && (
                <div className="ml-8 text-sm">
                  <Link to="/admincoa"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Chart of Accounts</p></Link>
                  <Link to="/adminjournal"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Journal Entries</p></Link>
                  <Link to="/admingeneral"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>General Ledger</p></Link>
                  <Link to="/admintrial"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Trial Balance</p></Link>
                </div>
              )}

              {/* Users */}
              <Link to="/adminusers">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00c3b8" }}
                >
                  <i className="fa fa-users" aria-hidden="true"></i> Users
                </button>
              </Link>

              {/* Inventory */}
              <Link to="/admininventory">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-archive" aria-hidden="true"></i> Inventory
                </button>
              </Link>

              {/* Patients */}
              <Link to="/adminpatients">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                </button>
              </Link>

              {/* Schedule */}
              <Link to="/adminschedule">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-calendar" aria-hidden="true"></i> Schedules
                </button>
              </Link>

              {/* Audit Trail */}
              <Link to="/adminaudit">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-eye" aria-hidden="true"></i> Audit Trail
                </button>
              </Link>
            </div>

            {/* Main Content */}
            <div className="col-sm-7">
              <div className="row">
                <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                  <div className="row">
                    <div className="col-sm-4">
                      <h1 className="text-2xl font-bold">Users Management</h1>
                    </div>
                    <div className="col-sm-4">
                      <button className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminusersaddpatient")}>
                        + Add New Patient
                      </button>
                    </div>
                    <div className="col-sm-4">
                      <button className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminusersadd")}>
                        + Add New User
                      </button>
                    </div>
                  </div>
                </div>

                <p style={{color:"transparent"}}>...</p>

                <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                  <div className="row">
                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>Add New User</h1>
                    <div className="col-sm-3"></div>

                    <div className="col-sm-6">
                      <br /><br />
                      <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Username</label>
                          <input 
                            type="text"
                            value={registerData.user_name}
                            onChange={(e) => updateFormData("user_name", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        {/* Email */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Email</label>
                          <input 
                            type="email"
                            value={registerData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        {/* Password */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Password</label>
                          <input
                            type="password"
                            value={registerData.user_password}
                            onChange={(e) => updateFormData("user_password", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        {/* Contact */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Contact Number</label>
                          <input
                            type="number"
                            value={registerData.contact_no}
                            onChange={(e) => updateFormData("contact_no", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        {/* Role */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Access Level</label>
                          <select
                            value={registerData.role}
                            onChange={(e) => updateFormData("role", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          >
                            <option value="">-- Select Role --</option>
                            <option value="dentist">Dentist</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="inventory">Inventory Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        {/* First Name */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">First Name</label>
                          <input
                            type="text"
                            value={registerData.fname}
                            onChange={(e) => updateFormData("fname", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        {/* Middle Name */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Middle Name</label>
                          <input
                            type="text"
                            value={registerData.mname}
                            onChange={(e) => updateFormData("mname", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        {/* Last Name */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Last Name</label>
                          <input
                            type="text"
                            value={registerData.lname}
                            onChange={(e) => updateFormData("lname", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>

                        {errorMessage && <p className="text-red-500 font-medium mt-4">{errorMessage}</p>}
                        {successMessage && <p className="text-green-600 font-medium mt-4">{successMessage}</p>}

                        <div className="row mt-6">
                          <div className="col-sm-6">
                            <button
                              type="button"
                              className="bg-[#FFFFFF] text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full"
                              onClick={() => navigate("/adminusers")}
                            >
                              Back
                            </button>
                          </div>
                          <div className="col-sm-6">
                            <button
                              type="submit"
                              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="col-sm-3"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-2"></div>
          </div>
        </div>
      </div>

      {/* 🔔 Alert Box */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[320px] text-center">
            {/* Title */}
            <h2
              className={`text-xl font-bold mb-4 ${
                alertMessage.toLowerCase().includes("success")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {alertMessage.toLowerCase().includes("success") ? "Success" : "Error"}
            </h2>

            {/* Message */}
            <p className="text-gray-700">{alertMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersAdd;
