import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const adminconsultationview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
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

   const records = [
    {
      date: "05-30-2025",
      diagnosis: "Dental Caries",
      services: "Oral Exam & Periapical X-ray",
      dentist: "Dr. A. Reyes",
      status: "Completed",
    },
    {
      date: "07-15-2025",
      diagnosis: "Tooth Extraction",
      services: "Extraction of Wisdom Tooth",
      dentist: "Dr. M. Santos",
      status: "Ongoing",
    },
  ];

  // Filter based on search term (case-insensitive)
  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
                    style={{ color: "#00458B" }}
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
                    style={{ color: "#00c3b8" }}
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
                <div className="col-sm-8">
                    <div className="row">
                        <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                            <div className="row">
                                <div className="col-sm-10">
                                    <h1 className="text-2xl font-bold">Patients Record</h1>
                                </div>
                                <div className="col-sm-2">
                                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminpatientsadd")}>Add</button>
                                </div>
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-9">
                                            <h1 className="text-2xl font-bold" style={{color:"#00458B"}}>Patients Information</h1>
                                        </div>
                                        <div className="col-sm-3">
                                                <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminpatientsedit")}>Edit Profile</button>
                                        </div>
                                    </div>
                                </div>

                                <hr></hr>

                                <div className="col-sm-12">
                                        <br />
                                    <p className="font-bold text-xl" style={{color:"#00c3b8"}}>Santos Maria</p>
                                    <p style={{color:"#00458B"}}>Female | 28 years old | Frebruary 15, 1997</p>
                                        <br />
                                        <br />
                                        <br />
                                <div className="row">
                                    <div className="col-sm-6" style={{color:"#00458B"}}>
                                        <p className="font-bold text-2xl">Address and Contact Information</p>
                                        <hr></hr>
                                        <br />
                                        <p className="font-bold">Address:</p><p>...</p>
                                        <br />
                                        <p className="font-bold">Email Address:</p><p>...</p>
                                        <br />
                                        <p className="font-bold">Contact Number:</p><p>...</p>
                                    </div>

                                    <div className="col-sm-6" style={{color:"#00458B"}}>
                                        <p className="font-bold text-2xl">Health Information & Medical History</p>
                                        <hr></hr>
                                        <br />
                                        <p className="font-bold">Blood Type:</p><p>...</p>
                                    </div>
                                </div>
                                    <br />
                                    <br />
                                    <br />
                                </div>

                               <br />
                                    <br />
                                    <p className="font-bold text-2xl" style={{color:"#00458B"}}>Consultation Details</p>
                                    <hr></hr>
                                    <br />

                                    <div className="row">
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold">Date of Visit:</p><p>...</p>
                                            <br />
                                            <p className="font-bold">Attending Dentist:</p><p>...</p>
                                            <br />
                                            <p className="font-bold">Diagnosis:</p><p>...</p>
                                            <br />
                                            <p className="font-bold">Services:</p><p>...</p>
                                            <br />
                                            <p className="font-bold">Follow-Up:</p><p>...</p>
                                            <br />
                                        </div>
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold">Billing Information</p>
                                            <br />
                                            <ul>
                                                <li>...</li>
                                            </ul>
                                        </div>
                                    </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="row">
                                    <div className="col-sm-6">
                                    </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/")}>Print</button>

                                                </div>
                                                <div className="col-sm-6">
                                                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminpatientsview")}>Back to List</button>
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

export default adminconsultationview;
