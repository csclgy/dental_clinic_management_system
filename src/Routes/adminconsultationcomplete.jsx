import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const Adminconsultationcomplete = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const [chargedItems, setChargedItems] = useState([]);
  const [error, setError] = useState("");
  
  const [dentists, setDentists] = useState([]);

  const [selectedTeeth, setSelectedTeeth] = useState([]);
  // Add this new state
  const [showTeethSelection, setShowTeethSelection] = useState(false);

    //For editable fields
  const [assignedDentist, setAssignedDentist] = useState("");
  const [diagnosis, setDiagnosis] = useState("");


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
    alert("Please assign a dentist before completion.");
    return;
  }
  if (!diagnosis.trim()) {
    alert("Please enter a diagnosis before completion.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3000/auth/completeconsultation/${appointId}`, {
      method: "PUT", // or POST depending on your backend
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attending_dentist: assignedDentist,
        p_diagnosis: diagnosis,
        appointment_status: "done",
        selected_teeth: selectedTeeth,
      }),
    });

    if (!res.ok) throw new Error("Failed to complete consultation");

    alert("Consultation marked as complete!");
    navigate("/adminpatients");
  } catch (err) {
    console.error("Error completing consultation:", err);
    alert("Error completing consultation. Try again.");
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
                     <Link to='/adminsubsidiaryreceivable'>
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Subsidiary 
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
                    <i className="fa fa-calendar" aria-hidden="true"></i> Schedules
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
                                    <h1 className="text-2xl font-bold">Complete Appointment</h1>
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
                                        </div>
                                    </div>
                                </div>
                                <br></br>
                                <br></br>
                                <hr></hr>

                                <div className="col-sm-12">
                                        <br />
                                    <p className="font-bold text-xl" style={{color:"#00c3b8"}}>{consultation.p_fname} {consultation.p_mname} {consultation.p_lname}</p>
                                    <p style={{color:"#00458B"}}>{consultation.p_gender} | {consultation.p_age} | {consultation.p_date_birth}</p>
                                        <br />
                                        <br />
                                        <br />
                                <div className="row">
                                    <div className="col-sm-6" style={{color:"#00458B"}}>
                                        <p className="font-bold text-2xl">Address and Contact Information</p>
                                        <hr></hr>
                                        <br />
                                        <p className="font-bold">Address:</p><p>{consultation.p_home_address}, {consultation.p_city}</p>
                                        <br />
                                        <p className="font-bold">Email Address:</p><p>{consultation.p_email}</p>
                                        <br />
                                        <p className="font-bold">Contact Number:</p><p>{consultation.p_contact_no}</p>
                                    </div>

                                    <div className="col-sm-6" style={{color:"#00458B"}}>
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
                                    <p className="font-bold text-2xl" style={{color:"#00458B"}}>Consultation Details</p>
                                    <hr></hr>
                                    <br />
                                    <div className="row">
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold">Date of Visit:</p><p>{consultation.pref_date}</p>
                                            <br />
                                            {/* Dentist Selection */}
                                            <p className="font-bold">Attending Dentist:</p>
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
                                            <p className="font-bold">Diagnosis:</p>
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
                                              <p className="text-1xl font-bold" style={{color:"#00458B"}}>Teeth Anatomy:</p>
                                              <img src="../teethmodel.png" style={{width:"100%"}}></img>
                                          </div>
                                          
                                        </div>
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
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
                                      <p className="text-1xl font-bold" style={{color:"#00458B"}}>Select Teeth:</p>
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
                                                        className="bg-[#00458B] text-[white] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full"
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

export default Adminconsultationcomplete;
