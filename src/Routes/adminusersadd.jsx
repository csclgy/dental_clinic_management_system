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

  const updateFormData = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post("http://localhost:3000/auth/adduser", registerData);
      setSuccessMessage(response.data.message || "User Added successfully!");
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
                  <Link to='/adminsubsidiaryreceivable'> <p className="py-1 hover:underline" style={{ color: "#00458B" }}>Subsidiary </p></Link>   
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
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Username</label>
                          <input 
                            type="text"
                            value={registerData.user_name}
                            onChange={(e) => updateFormData("user_name", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                            required
                          />
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Email</label>
                          <input 
                            type="email"
                            value={registerData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                            required
                          />
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Password</label>
                          <input
                            type="password"
                            value={registerData.user_password}
                            onChange={(e) => updateFormData("user_password", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                            required
                          />
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Contact Number</label>
                          <input
                            type="number"
                            value={registerData.contact_no}
                            onChange={(e) => updateFormData("contact_no", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Access Level</label>
                          <select
                            value={registerData.role}
                            onChange={(e) => updateFormData("role", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                            required
                          >
                            <option value="">-- Select Role --</option>
                            <option value="dentist">Dentist</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="inventory">Inventory Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">First Name</label>
                          <input
                            type="text"
                            value={registerData.fname}
                            onChange={(e) => updateFormData("fname", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Middle Name</label>
                          <input
                            type="text"
                            value={registerData.mname}
                            onChange={(e) => updateFormData("mname", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
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
    </div>
  );
};

export default AdminUsersAdd;