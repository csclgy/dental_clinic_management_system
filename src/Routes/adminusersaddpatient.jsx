import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const adminusersaddpatient = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Scroll to the section if state.scrollTo is passed
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100); // delay ensures DOM is rendered
      }
    }
  }, [location]);

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
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
                    <Link to="/admincoa">
                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                        Chart of Accounts
                        </p>
                    </Link>
                    <Link to="/adminjournal">
                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                        Journal Entries
                        </p>
                    </Link>
                    <Link to="/admingeneral">
                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                        General Ledger
                        </p>
                    </Link>
                    <Link to="/admintrial">
                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                        Trial Balance
                        </p>
                    </Link>
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
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i className="fa fa-archive" aria-hidden="true"></i> Inventory
                    </button>
                </Link>

                {/* Patients */}
                <Link to="/adminpatients">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                    </button>
                </Link>

                {/* Schedule */}
                <Link to="/adminschedule">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i class="fa fa-calendar" aria-hidden="true"></i> Schedules
                    </button>
                </Link>

                {/* Audit Trail */}
                <Link to="/adminaudit">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i className="fa fa-eye" aria-hidden="true"></i> Audit Trail
                    </button>
                </Link>
                </div>
                <div className="col-sm-7">
                    <div className="row">
                        <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                            <div className="row">
                                <div className="col-sm-4">
                                    <h1 className="text-2xl font-bold">Users Management</h1>
                                </div>
                                <div className="col-sm-4">
                                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminusersaddpatient")}>+ Add New Patient</button>
                                </div>
                                <div className="col-sm-4">
                                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminusersadd")}>+ Add New User</button>
                                </div>
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                    <h1 className="text-2xl font-bold" style={{ color: "#00458B" }}>Add New Patient</h1>
                                    <br />
                                    <br />
                                    <hr />
                                    <br />
                                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>LOGIN INFORMATION</h1>
                                    <br />
                                    <br />
                                    <div className="col-sm-12">
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Username</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Password</label>
                                                    <input type="password" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Access Level</label>
                                                    <select  class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                        <option value="male">Patient</option>
                                                        <option value="female">Dentist</option>
                                                        <option value="female">Receptionist</option>
                                                        <option value="female">Inventory Staff</option>
                                                        <option value="female">Admin</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Email</label>
                                                    <input type="email" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Contact Number</label>
                                                    <input type="number" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                            
                                            <hr />
                                            <br />
                                            <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>Gcash Account Number</h1>
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Contact Number</label>
                                                    <input type="number" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">

                                            </div>

                                            <hr />
                                            <br />
                                            <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>Personal Information</h1>
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">First Name</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Last Name</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Gender</label>
                                                    <select  class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Religion</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Home Address</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Province</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Middle Name</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
                                                    <input type="date" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Age</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" min={1} />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Nationality</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">City</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Occupation</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <br />
                                        <br /> 
                                        <div className="row">
                                            <div className="col-sm-6">
                                            </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminusers")}>Back</button>
                                                </div>
                                            <div className="col-sm-6">
                                                <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminusers")}>Save</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                    </div>
            <div className="col-sm-2"> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default adminusersaddpatient;
