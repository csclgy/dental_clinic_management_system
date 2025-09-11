import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AdminUsersAddPatient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // ALERT STATE
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [registerData, setRegisterData] = useState({
    user_name: "",
    user_password: "",
    role: "Patient",
    email: "",
    contact_no: "",
    gcash_num: "",
    fname: "",
    mname: "",
    lname: "",
    date_birth: "",
    gender: "Male",
    age: "",
    religion: "",
    nationality: "",
    home_address: "",
    province: "",
    city: "",
    occupation: "",
  });

  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/auth/addpatient", registerData);
      const msg = response.data.message || "Patient added successfully!";
      setAlert({ show: true, type: "success", message: msg });
    } catch (error) {
      let msg = "Something went wrong";
      if (error.response) msg = error.response.data.message || msg;
      setAlert({ show: true, type: "error", message: msg });
    }
  };

  // auto close alert after 3s
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        const wasSuccess = alert.type === "success";
        setAlert({ show: false, type: "", message: "" });
        if (wasSuccess) navigate("/adminusers");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleDateChange = (dateValue) => {
    updateFormData("date_birth", dateValue);
    if (dateValue) {
      const today = new Date();
      const birthDate = new Date(dateValue);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      updateFormData("age", age);
    } else updateFormData("age", "");
  };

  return (
    <div className="p-4">
      <div className="container-fluid">
        <div className="row">
          {/* LEFT SIDEBAR */}
          <div
            className="col-sm-3 p-5 rounded-lg shadow-lg"
            style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
          >
            <Link to="/">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                <i className="fa fa-tachometer" /> Dashboard
              </button>
            </Link>

            <button
              onClick={() => setIsLedgerOpen(!isLedgerOpen)}
              className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
              style={{ color: "#00458B" }}
            >
              <span>
                <i className="fa fa-book" /> Ledger
              </span>
              <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
            </button>

            {isLedgerOpen && (
              <div className="ml-8 text-sm">
                <Link to="/admincoa"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Chart of Accounts</p></Link>
                <Link to="/adminjournal"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Journal Entries</p></Link>
                <Link to="/admingeneral"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>General Ledger</p></Link>
                <Link to="/admintrial"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Trial Balance</p></Link>
              </div>
            )}

            <Link to="/adminusers">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00c3b8" }}>
                <i className="fa fa-users" /> Users
              </button>
            </Link>

            <Link to="/admininventory">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                <i className="fa fa-archive" /> Inventory
              </button>
            </Link>

            <Link to="/adminpatients">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                <i className="fa fa-user-plus" /> Patients
              </button>
            </Link>

            <Link to="/adminschedule">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                <i className="fa fa-calendar" /> Schedules
              </button>
            </Link>

            <Link to="/adminaudit">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                <i className="fa fa-eye" /> Audit Trail
              </button>
            </Link>
          </div>

          {/* FORM */}
          <div className="col-sm-7">
            <div className="bg-[#00458B] p-10 rounded-lg shadow-lg text-white mb-4">
              <div className="row">
                <div className="col-sm-4">
                  <h1 className="text-2xl font-bold">Users Management</h1>
                </div>
                <div className="col-sm-4">
                  <button
                    className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                    onClick={() => navigate("/adminusersaddpatient")}
                  >
                    + Add New Patient
                  </button>
                </div>
                <div className="col-sm-4">
                  <button
                    className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                    onClick={() => navigate("/adminusersadd")}
                  >
                    + Add New User
                  </button>
                </div>
              </div>
            </div>

            <div className="p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
              <h1 className="text-2xl font-bold mb-4" style={{ color: "#00458B" }}>Add New Patient</h1>
              <hr className="mb-4" />
              <h1 className="text-xl font-bold mb-4" style={{ color: "#00458B" }}>LOGIN INFORMATION</h1>

              <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Username</label>
                    <input type="text" className="form-control" value={registerData.user_name}
                      onChange={(e) => updateFormData("user_name", e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label>Email</label>
                    <input type="email" className="form-control" value={registerData.email}
                      onChange={(e) => updateFormData("email", e.target.value)} />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Password</label>
                    <input type="password" className="form-control" value={registerData.user_password}
                      onChange={(e) => updateFormData("user_password", e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label>Contact Number</label>
                    <input type="text" className="form-control" value={registerData.contact_no}
                      onChange={(e) => updateFormData("contact_no", e.target.value)} />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Access Level</label>
                    <select className="form-control" value={registerData.role}
                      onChange={(e) => updateFormData("role", e.target.value)}>
                      <option>Patient</option>
                      <option>User</option>
                      <option>Admin</option>
                    </select>
                  </div>
                </div>

                <h1 className="text-xl font-bold mb-4" style={{ color: "#00458B" }}>Gcash Account Number</h1>
                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Contact Number</label>
                    <input type="text" className="form-control" value={registerData.gcash_num}
                      onChange={(e) => updateFormData("gcash_num", e.target.value)} />
                  </div>
                </div>

                <h1 className="text-xl font-bold mb-4" style={{ color: "#00458B" }}>Personal Information</h1>
                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>First Name</label>
                    <input type="text" className="form-control" value={registerData.fname}
                      onChange={(e) => updateFormData("fname", e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label>Middle Name</label>
                    <input type="text" className="form-control" value={registerData.mname}
                      onChange={(e) => updateFormData("mname", e.target.value)} />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Last Name</label>
                    <input type="text" className="form-control" value={registerData.lname}
                      onChange={(e) => updateFormData("lname", e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label>Date of Birth</label>
                    <input type="date" className="form-control" value={registerData.date_birth}
                      onChange={(e) => handleDateChange(e.target.value)} />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Gender</label>
                    <select className="form-control" value={registerData.gender}
                      onChange={(e) => updateFormData("gender", e.target.value)}>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label>Age</label>
                    <input type="text" className="form-control" value={registerData.age} readOnly />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Religion</label>
                    <input type="text" className="form-control" value={registerData.religion}
                      onChange={(e) => updateFormData("religion", e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label>Nationality</label>
                    <input type="text" className="form-control" value={registerData.nationality}
                      onChange={(e) => updateFormData("nationality", e.target.value)} />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Home Address</label>
                    <input type="text" className="form-control" value={registerData.home_address}
                      onChange={(e) => updateFormData("home_address", e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label>City</label>
                    <input type="text" className="form-control" value={registerData.city}
                      onChange={(e) => updateFormData("city", e.target.value)} />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-sm-6">
                    <label>Province</label>
                    <input type="text" className="form-control" value={registerData.province}
                      onChange={(e) => updateFormData("province", e.target.value)} />
                  </div>
                  <div className="col-sm-6">
                    <label>Occupation</label>
                    <input type="text" className="form-control" value={registerData.occupation}
                      onChange={(e) => updateFormData("occupation", e.target.value)} />
                  </div>
                </div>

                <div className="row mt-4">
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
          </div>

          <div className="col-sm-2"></div>
        </div>
      </div>

      {/* ALERT MODAL */}
{alert.show && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 w-80 text-center relative shadow-lg">
      {alert.type === "success" ? (
        <div className="text-green-500 text-4xl mb-2"></div>
      ) : (
        <div className="text-red-500 text-4xl mb-2"></div>
      )}
      <h3
        className={`text-lg font-bold mb-2 ${
          alert.type === "success" ? "text-green-600" : "text-red-500"
        }`}
      >
        {alert.type === "success" ? "Success!" : "Error!"}
      </h3>
      <p
        className={`text-sm mb-2 ${
          alert.type === "success" ? "text-green-600" : "text-gray-700"
        }`}
      >
        {alert.message}
      </p>
      <p className="text-xs text-gray-400">()</p>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminUsersAddPatient;
