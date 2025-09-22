import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";

const AdminPatientsView = () => {
  const { id } = useParams();
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState(""); // "" means show all

  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]); // ✅ define consultations
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          return;
        }

        const res = await fetch(`http://localhost:3000/auth/displaypatient/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.message || "Failed to fetch patient");
          return;
        }

        const data = await res.json();
        setPatient(data.patient);
        setConsultations(data.consultations || []); // ✅ save history
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError("Server error");
      }
    };

    fetchPatient();
  }, [id]);

  // Scroll effect
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

  if (error) return <p className="text-red-500">{error}</p>;
  if (!patient) return <p>Loading...</p>;

  // ✅ filter consultation history
const filteredConsultations = consultations
  .filter((c) =>
    Object.values(c).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
  .filter((c) => (statusFilter ? c.appointment_status === statusFilter : true));
  

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
                                        <div className="col-sm-9">
                                            <h1 className="text-2xl font-bold" style={{color:"#00458B"}}>Patients Information</h1>
                                        </div>
                                        <div className="col-sm-3">
                                            <button 
                                                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                                                onClick={() => navigate(`/adminpatientsedit/${patient.user_id}`)}
                                                >
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <hr></hr>

                                <div className="col-sm-12">
                                        <br />
                                    <p className="font-bold text-xl" style={{color:"#00c3b8"}}>{patient.fname} {patient.mname} {patient.lname}</p>
                                    <p style={{color:"#00458B"}}>{patient.gender} | {patient.age} | {patient.date_birth}</p>
                                        <br />
                                        <br />
                                        <br />
                                <div className="row">
                                    <div className="col-sm-6" style={{color:"#00458B"}}>
                                        <p className="font-bold text-2xl">Address and Contact Information</p>
                                        <hr></hr>
                                        <br />
                                        <p className="font-bold">Address:</p><p>{patient.home_address}, {patient.city}</p>
                                        <br />
                                        <p className="font-bold">Email Address:</p><p>{patient.email}</p>
                                        <br />
                                        <p className="font-bold">Contact Number:</p><p>{patient.contact_no}</p>
                                        <br />
                                        <p className="font-bold" style={{color:"transparent"}}>Username:</p><p style={{color:"transparent"}}>{patient.user_name}</p>
                                    </div>

                                    <div className="col-sm-6" style={{color:"#00458B"}}>
                                        <p className="font-bold text-2xl">Health Information & Medical History</p>
                                        <hr></hr>
                                        <br />
                                        <p className="font-bold">Blood Type:</p><p>{patient.blood_type}</p>
                                        <p className="font-bold"></p><p style={{color:"transparent"}}>{patient.user_name}</p>
                                    </div>
                                </div>
                                    <br />
                                    <br />
                                    <br />
                                </div>

                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-8">
                                            <h1 className="text-2xl font-bold" style={{color:"#00458B"}}>Consultation History</h1>
                                        </div>
                                        <div className="col-sm-4">
                                            <button
                                            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                                            onClick={() =>
                                                navigate("/adminconsultationadd", {
                                                state: { patient } 
                                                })
                                            }
                                            >
                                            + Create New Consultation
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <hr></hr>
                                    <br />
                                <div className="col-sm-12">
                                {/* Search bar */}
                                <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                                    <div className="flex justify-between items-center"></div>
                                    <div></div>
                                    <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-64">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1 outline-none text-sm text-gray-700"
                                    />
                                    <i className="fa fa-search text-[#00458B]"></i>
                                    </div>
                                    <br></br>
                                    <div className="mb-4 flex items-center gap-4">
                                        <label className="font-semibold text-[#00458B]">Filter by Status:</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="border border-[#00458B] rounded px-2 py-1"
                                        >
                                            <option value="">All</option>
                                            <option value="pending">Pending</option>
                                            <option value="done">Done</option>
                                        </select>
                                        </div>
                                    </div>
                                {/* Table */}
                                        {filteredConsultations.length === 0 ? (
                                        <p className="text-gray-500">No consultations found.</p>
                                        ) : (
                                    <div className="overflow-x-auto"
                                     style={{
                                            maxHeight: "300px",
                                            overflowY: "auto",  
                                            border: "1px solid #ddd",
                                        }}>
                                        <table className="w-full border-collapse border border-gray-200">
                                            <thead>
                                            <tr className="bg-gray-100 text-[#00458B] text-center">
                                                <th className="border px-2 py-1">Date</th>
                                                <th className="border px-2 py-1">Procedure</th>
                                                <th className="border px-2 py-1">Dentist</th>
                                                <th className="border px-2 py-1">Payment Status</th>
                                                <th className="border px-5 py-1">Total Charged</th>
                                                <th className=" px-2 py-1"></th>
                                                <th className=" px-2 py-1"></th>
                                                <th className=" px-2 py-1"></th>
                                                <th className=" px-2 py-1"></th>
                                            </tr>
                                            </thead>
                                           <tbody>
                                            {filteredConsultations.map((c) => (
                                            <tr key={c.appoint_id} className="border-b border-gray-200 text-center">
                                                <td className="px-4 py-2 text-blue-700">{c.pref_date}</td>
                                                <td className="px-4 py-2 text-blue-700">{c.procedure_type}</td>
                                                <td className="px-4 py-2 text-blue-700">{c.attending_dentist}</td>
                                                <td className="px-4 py-2 text-blue-700">{c.payment_status}</td>
                                                <td className="px-4 py-2 text-blue-700">₱{c.total_charged}</td>
                                                <td className="px-4 py-2">
                                                <button 
                                                    onClick={() => navigate(`/adminconsultationview/${c.appoint_id}`)}
                                                    className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-4 py-1 rounded-full"
                                                >
                                                    View
                                                </button>
                                                </td>

                                                {/* ✅ Cancel + Follow Up visible if status is incomplete or pending */}
                                                {(c.appointment_status === "incomplete" || c.appointment_status === "pending") ? (
                                                <>
                                                    <td className="px-4 py-2">
                                                    <button className="bg-[#e7e7e7] text-black px-3 py-1 rounded-full">
                                                        Cancel
                                                    </button>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                    <button className="bg-[#00c3b8] text-white px-3 py-1 rounded-full">
                                                        + Follow Up
                                                    </button>
                                                    </td>
                                                </>
                                                ) : (
                                                <>
                                                    <td></td>
                                                    <td></td>
                                                </>
                                                )}

                                                {/* ✅ Complete button visible only if status is incomplete */}
                                                {c.appointment_status === "incomplete" ? (
                                                <td className="px-4 py-2">
                                                    <button 
                                                    onClick={() => navigate(`/adminconsultationcomplete/${c.appoint_id}`)}
                                                    className="bg-[#4CAF50] text-white px-3 py-1 rounded-full">
                                                    Complete
                                                    </button>
                                                </td>
                                                ) : (
                                                <td></td>
                                                )}
                                            </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="row">
                                    <div className="col-sm-6">
                                    </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-4">

                                                </div>
                                            <div className="col-sm-8">
                                                    <br />
                                                    <br />
                                                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/register2")}>Generate Report</button>
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
  );
};

export default AdminPatientsView;
