import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const adminconsultationadd = () => {
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

    const [selectedService, setSelectedService] = useState(null);

  const treatments = [
    "TMJ TREATMENT",
    "ODONTECTOMY",
    "ORTHODONTIC TREATMENT",
    "RESTORATIVE FILLING",
    "MYOFUNCTIONAL TREATMENT",
    "FLOURIDE TREATMENT",
    "ROOT CANAL TREATMENT",
    "DENTURES",
    "ORAL PROPHYLAXIS",
    "TEETH WHITENING",
    "TOOTH EXTRACTION",
    "DENTAL X-RAY"
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
                                </div>
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <h1 className="text-2xl font-bold" style={{color:"#00458B"}}>Create New Consultation</h1>
                                        </div>
                                    </div>
                                </div>

                                <hr></hr>

                                <div className="col-sm-12">
                                    <br />
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Date of Visit</label>
                                                <input type="date" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] mb-1">Attending Dentist</label>
                                                    <select  class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                        <option value="...">Dentist1</option>
                                                        <option value="...">Dentist2</option>
                                                    </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <p className="block text-[#00458b] font-bold mb-1">Billing Information</p>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] mb-1">OR Number</label>
                                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] mb-1">Mode of Payment</label>
                                                    <select  class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                        <option value="...">Advance Payment</option>
                                                        <option value="...">Pay at Counter</option>
                                                    </select>
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] mb-1">Payment Status</label>
                                                    <select  class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                        <option value="...">Pending check receipt</option>
                                                        <option value="...">Received</option>
                                                        <option value="...">Refunded</option>
                                                        <option value="...">Cancelled</option>
                                                        <option value="...">Completed</option>
                                                    </select>
                                            </div>
                                        </div>
                                    </div>

                                    <br />
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <p className="text-2xl font-bold" style={{ color: "#00458B" }}>
                                                Services
                                            </p>
                                            <br />
                                            <form className="grid grid-cols-2 gap-x-12 gap-y-4">
                                                {treatments.map((treatment, index) => (
                                                <label
                                                    key={index}
                                                    className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
                                                >
                                                    <input
                                                    type="checkbox"
                                                    className="hidden peer"
                                                    id={`treatment-${index}`}
                                                    name="treatment"
                                                    value={treatment}
                                                    checked={selectedService === treatment}
                                                    onChange={() => setSelectedService(treatment)}
                                                    />
                                                    <span className="w-5 h-5 border-2 border-blue-300 rounded-sm flex items-center justify-center peer-checked:bg-blue-700 transition">
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    </span>
                                                    <span className="text-blue-800 tracking-wide">{treatment}</span>
                                                </label>
                                                ))}
                                            </form>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-6">

                                                </div>
                                                <div className="col-sm-6">
                                                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminbillingedit")}>Edit Billing</button>  
                                                </div>
                                            </div>
                                            <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4", color:"#00458B"}}>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <p className="block text-[#00458b] font-bold mb-1">Charged Item</p>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <p className="block text-[#00458b] font-bold mb-1">Item</p>
                                                    </div>
                                                </div>
                                                <hr></hr>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <p>Oral Examination</p>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <p>500.00</p>
                                                    </div>
                                                </div>
                                                <br />
                                                <br />
                                                <br />
                                                <br />
                                                <br />
                                                <hr></hr>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <p className="block text-[#00458b] font-bold mb-1">Total Charge Amount</p>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <p className="block text-[#00458b] font-bold mb-1">1,300.00</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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

                                                </div>
                                                <div className="col-sm-6">
                                                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminpatientsview")}>Save</button>
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

export default adminconsultationadd;
