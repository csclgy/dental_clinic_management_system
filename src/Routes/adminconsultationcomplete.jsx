import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Users,
  Calendar,
  Package,
  PlusCircle,
  BookOpen,
  Eye,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  PhilippinePeso,
  IdCard,
  Settings,
  FolderKanban,
  BriefcaseMedical
} from "lucide-react";

const Adminconsultationcomplete = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [consultation, setConsultation] = useState(null);
  const [chargedItems, setChargedItems] = useState([]);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  const [dentists, setDentists] = useState([]);
  const [isSettingopen, setIsSettingOpen] = useState(false);


  const [selectedTeeth, setSelectedTeeth] = useState([]);
  // Add this new state
  const [showTeethSelection, setShowTeethSelection] = useState(false);

  //For editable fields
  const [assignedDentist, setAssignedDentist] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const teethList = [
    { number: 1, name: "Upper RIGHT Central Incisor" },
    { number: 1.1, name: "Upper LEFT Central Incisor" },
    { number: 2, name: "Upper RIGHT Lateral Incisor" },
    { number: 2.1, name: "Upper LEFT Lateral Incisor" },
    { number: 3, name: "Upper RIGHT Canine" },
    { number: 3.1, name: "Upper LEFT Canine" },
    { number: 4, name: "Upper RIGHT First Premolar" },
    { number: 4.1, name: "Upper LEFT First Premolar" },
    { number: 5, name: "Upper RIGHT Second Premolar" },
    { number: 5.1, name: "Upper LEFT Second Premolar" },
    { number: 6, name: "Upper RIGHT First molar" },
    { number: 6.1, name: "Upper LEFT First molar" },
    { number: 7, name: "Upper RIGHT Second molar" },
    { number: 7.1, name: "Upper LEFT Second molar" },
    { number: 8, name: "Upper RIGHT Third molar(Wisdom Teeth)" },
    { number: 8.1, name: "Upper LEFT Third molar(Wisdom Teeth)" },

    { number: 9, name: "Lower RIGHT Third molar(Wisdom Teeth)" },
    { number: 9.1, name: "Lower LEFT Third molar(Wisdom Teeth)" },
    { number: 10, name: "Lower RIGHT Second Molar" },
    { number: 10.1, name: "Lower LEFT Second Molar" },
    { number: 11, name: "Lower RIGHT First Molar" },
    { number: 11.1, name: "Lower LEFT First Molar" },
    { number: 12, name: "Lower RIGHT Second Premolar" },
    { number: 12.1, name: "Lower LEFT Second Premolar" },
    { number: 13, name: "Lower RIGHT First Premolar" },
    { number: 13.1, name: "Lower LEFT First Premolar" },
    { number: 14, name: "Lower RIGHT Canine" },
    { number: 14.1, name: "Lower LEFT Canine" },
    { number: 15, name: "Lower RIGHT Lateral Incisor" },
    { number: 15.1, name: "Lower LEFT Lateral Incisor" },
    { number: 16, name: "Lower RIGHT Central Incisor" },
    { number: 16.1, name: "Lower LEFT Central Incisor" },
  ];

  const handleSelect = (toothNumber, toothName, isChecked) => {
    setSelectedTeeth((prev) => {
      if (isChecked) {
        return [
          ...prev.filter((t) => t.st_number !== toothNumber),
          { st_number: toothNumber, st_name: toothName }, // ✅ use backend field names
        ];
      }
      return prev.filter((t) => t.st_number !== toothNumber);
    });
  };

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/auth/displayconsultation/${appointId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch consultation");

        const data = await res.json();
        setConsultation(data.consultation);
        setChargedItems(data.chargedItems || []);

        // Set defaults if missing
        setAssignedDentist(data.consultation.attending_dentist || "Unassigned");
        setDiagnosis(data.consultation.p_diagnosis || "");
      } catch (err) {
        console.error("Error fetching consultation:", err);
        setError("Could not load consultation");
      }
    };

    fetchConsultation();
  }, [appointId]);

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

  const handleComplete = async () => {
    if (assignedDentist === "Unassigned") {
      showPopup("Please assign a dentist before completion.", "error");
      return;
    }
    if (!diagnosis.trim()) {
      showPopup("Please enter a diagnosis before completion.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/auth/completeconsultation/${appointId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attending_dentist: assignedDentist,
          p_diagnosis: diagnosis,
          appointment_status: "done",
          payment_confirmation: 'incomplete',
          selected_teeth: selectedTeeth,
        }),
      });

      if (!res.ok) throw new Error("Failed to complete consultation");

      showPopup("Consultation marked as complete!", "success");
      setTimeout(() => navigate("/adminschedule"), 2000);
    } catch (err) {
      console.error("Error completing consultation:", err);
      showPopup("Error completing consultation. Try again.", "error");
    }
  };

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/auth/dentists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDentists(res.data);
      } catch (err) {
        console.error("Error fetching dentists:", err);
      }
    };
    fetchDentists();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!consultation) return <p>Loading consultation...</p>;

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
        <p style={{ color: "transparent" }}>...</p>
        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
          <div className="row">
            <div className="col-sm-12">
              <div className="row">
                <div className="col-sm-9">
                  <h1 className="text-2xl font-bold" style={{ color: "#00458B" }}>Patients Information</h1>
                </div>
                <div className="col-sm-3">
                </div>
              </div>
            </div>
            <br></br>
            <br></br>
            <hr></hr>

            <div className="col-sm-12">
              <br />
              <p className="font-bold text-xl" style={{ color: "#00c3b8" }}>{consultation.p_fname} {consultation.p_mname} {consultation.p_lname}</p>
              <p style={{ color: "#00458B" }}>{consultation.p_gender} | {consultation.p_age} | {consultation.p_date_birth}</p>
              <br />
              <br />
              <br />
              <div className="row">
                <div className="col-sm-6" style={{ color: "#00458B" }}>
                  <p className="font-bold text-2xl">Address and Contact Information</p>
                  <hr></hr>
                  <br />
                  <p className="font-bold">Address:</p><p>{consultation.p_home_address}, {consultation.p_city}</p>
                  <br />
                  <p className="font-bold">Email Address:</p><p>{consultation.p_email}</p>
                  <br />
                  <p className="font-bold">Contact Number:</p><p>{consultation.p_contact_no}</p>
                </div>

                <div className="col-sm-6" style={{ color: "#00458B" }}>
                  <p className="font-bold text-2xl">Health Information & Medical History</p>
                  <hr></hr>
                  <br />
                  <p className="font-bold">Blood Type:</p><p>{consultation.p_blood_type}</p>
                </div>
              </div>
              <br />
              <br />
              <br />
            </div>

            <br />
            <br />
            <p className="font-bold text-2xl" style={{ color: "#00458B" }}>Consultation Details</p>
            <hr></hr>
            <br />
            <div className="row">
              <div className="col-sm-6" style={{ color: "#00458B" }}>
                <p className="font-bold">Date of Visit:</p><p>{consultation.pref_date} | {consultation.pref_time}</p>
                <br />
                {/* Dentist Selection */}
                <p className="font-bold">Attending Dentist: <span style={{ color: "red" }}>*</span></p>
                <select
                  value={assignedDentist}
                  onChange={(e) => setAssignedDentist(e.target.value)}
                  className="border p-2 rounded w-full"
                  disabled={consultation.attending_dentist && consultation.attending_dentist !== "Unassigned"}
                >
                  <option value="Unassigned">-- Select Dentist --</option>
                  {dentists.map((d) => (
                    <option key={d.user_id} value={`${d.fname} ${d.lname}`}>
                      Dr. {d.fname} {d.lname}
                    </option>
                  ))}
                  <p className="mt-2 text-gray-700">Assigned: {consultation.attending_dentist}</p>
                </select>
                {/* {consultation.attending_dentist && consultation.attending_dentist !== "Unassigned" && (
                                              <p className="mt-2 text-gray-700">Assigned: {consultation.attending_dentist}</p>
                                            )} */}

                <br />
                <br />

                {/* Diagnosis */}
                <p className="font-bold">Diagnosis: <span style={{ color: "red" }}>*</span></p>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis"
                  className="border p-2 rounded w-full"
                  disabled={!!consultation.p_diagnosis}
                />
                {consultation.p_diagnosis && (
                  <p className="mt-2 text-gray-700">Diagnosis: {consultation.p_diagnosis}</p>
                )}
                <br />
                <br />
                <p className="font-bold">Services:</p><p>{consultation.procedure_type}</p>
                <br />
                <p className="font-bold">Follow-Up:</p><p>{consultation.pref_date}</p>
                <br />
                <br />

                <div className="col-sm-12">
                  <p className="text-1xl font-bold" style={{ color: "#00458B" }}>Teeth Anatomy:</p>
                  <img src="../teethmodel.png" style={{ width: "100%" }}></img>
                </div>

              </div>
              <div className="col-sm-6" style={{ color: "#00458B" }}>
                <p className="font-bold">Billing Information</p>
                <br />

                {consultation.appointment_status !== "incomplete" && consultation.appointment_status !== "done" ? (
                  <button
                    className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full"
                    onClick={() => navigate(`/adminbillingedit/${consultation.appoint_id}`)}
                  >
                    Edit Billing
                  </button>
                ) : (
                  <div
                    className="p-4 rounded-lg shadow-md"
                    style={{
                      border: "solid",
                      borderColor: "#01D5C4",
                      maxHeight: "350px",   // 🔹 fixed height
                      overflowY: "auto",    // 🔹 enables vertical scrolling
                    }}
                  >
                    <div className="col-sm-12 mb-2">
                      <div className="row">
                        <div className="col-sm-4">
                          <p className="font-bold">OR Number:</p><p>{consultation.or_num} </p>
                        </div>
                        <div className="col-sm-4">
                          <p className="font-bold mb-2">Payment Method:</p> <p>{consultation.payment_method} </p>
                        </div>
                        <div className="col-sm-4">
                          <p className="font-bold mb-2">Payment Status:</p> <p>{consultation.payment_status} </p>
                        </div>
                      </div>
                    </div>
                    <hr className="mb-2"></hr>
                    <p className="font-bold mb-2">Charged Service</p>
                    <p>
                      {consultation.procedure_type} - ₱{consultation.total_service_charged.toFixed(2)}
                    </p>
                    <hr className="my-2" />
                    <p className="font-bold mb-2">Charged Items</p>
                    {chargedItems.length > 0 ? (
                      chargedItems.map((item, idx) => (
                        <p key={idx}>
                          {item.ci_item_name} (x{item.ci_quantity}) - ₱{item.ci_amount.toFixed(2)}
                        </p>
                      ))
                    ) : (
                      <p>No additional items</p>
                    )}
                    <hr className="my-2" />
                    <p className="font-bold text-lg">
                      Total: ₱{(
                        consultation.total_service_charged +
                        chargedItems.reduce((sum, i) => sum + i.ci_amount, 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
                <br />
                <br />
                <br />
                <br />
                <br />
                <p className="text-1xl font-bold" style={{ color: "#00458B" }}>Select Teeth:</p>
                <hr></hr>
                <br></br>
                <button
                  type="button"
                  onClick={() => setShowTeethSelection(!showTeethSelection)}
                  className="bg-[#00c3b8] text-white px-4 py-2 rounded-full font-semibold mb-4"
                >
                  {showTeethSelection ? "Hide Teeth Selection" : "Show Teeth Selection"}
                </button>

                {showTeethSelection && (
                  <div
                    className="border rounded-lg shadow-inner p-3"
                    style={{
                      maxHeight: "300px",   // 🔹 fixed height for scroll area
                      overflowY: "auto",    // 🔹 vertical scroll enabled
                    }}
                  >
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {teethList.map((tooth) => {
                        const isSelected = selectedTeeth.some((t) => t.st_number === tooth.number);
                        return (
                          <div
                            key={tooth.number}
                            className="flex items-center justify-between p-3 border rounded-lg shadow-sm hover:shadow-md transition"
                            style={{ borderColor: isSelected ? "#01D5C4" : "#ddd" }}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`tooth-${tooth.number}`}
                                checked={isSelected}
                                onChange={(e) =>
                                  handleSelect(tooth.number, tooth.name, e.target.checked)
                                }
                                className="w-5 h-5 text-[#01D5C4] border-gray-300 rounded focus:ring-[#01D5C4]"
                              />
                              <label
                                htmlFor={`tooth-${tooth.number}`}
                                className="text-sm font-medium text-[#00458B]"
                              >
                                {tooth.number}. {tooth.name}
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
          <br></br>
          <br></br>
          <div className="col-sm-12">
            <div className="row">
              <div className="col-sm-6">
              </div>
              <div className="col-sm-6">
                <div className="row">
                  <div className="col-sm-6">
                  </div>
                  <div className="col-sm-6">
                    <button
                      className="bg-[#00458B] text-[white] font-semibold border border-[#00458b] px-6 py-2 rounded-lg w-full"
                      onClick={handleComplete}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

  );
};

export default Adminconsultationcomplete;