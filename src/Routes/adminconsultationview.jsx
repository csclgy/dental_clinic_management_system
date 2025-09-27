import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const Adminconsultationview = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [chargedItems, setChargedItems] = useState([]);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false); // ✅ add this
  const [appointments, setAppointments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [dentists, setDentists] = useState([]);

  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [cancelInfo, setCancelInfo] = useState(null);


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
        console.log("API response:", data);  
        setConsultation(data.consultation);
        setChargedItems(data.chargedItems || []);
        setSelectedTeeth(data.selectedTeeth || []);
        setCancelInfo(data.cancelInfo?.[0] || null);
        setPhotos(data.photos || []);
      } catch (err) {
        console.error("Error fetching consultation:", err);
        setError("Could not load consultation");
      }
    };

    fetchConsultation();
  }, [appointId]);

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
                                                <button className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" 
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
                                            <p className="font-bold">Attending Dentist:</p><p>{consultation.attending_dentist}</p>
                                            <br />
                                            <p className="font-bold">Diagnosis:</p>{consultation.p_diagnosis}<p></p>
                                            <br />
                                            <p className="font-bold">Services:</p><p>{consultation.procedure_type}</p>
                                            <br />
                                            <p className="font-bold">Follow-Up:</p><p>{consultation.pref_date}</p>
                                            <br />
                                            <p className="font-bold">Consultation Completed:</p><p>{consultation.p_date_completed  || "N/A"}</p>
                                            <br />
                                            <div className="mt-2">
                                              <p className="font-bold">Image Uploaded:</p>
                                              {photos.length > 0 ? (
                                                photos.map((photo, idx) => (
                                                  <button
                                                    key={idx}
                                                    className="px-4 py-2 mt-1 mr-2 rounded-md bg-[#01D5C4] text-white font-semibold hover:bg-[#00b0a6]"
                                                    onClick={() => window.open(`http://localhost:3000/uploads/appointments/${photo.up_url}`, "_blank")
                                            }
                                                  >
                                                    View Image {idx + 1}
                                                  </button>
                                                ))
                                              ) : (
                                                <p className="text-gray-500">No image uploaded</p>
                                              )}
                                            </div>
                                            <br></br>
                                            <br></br>
                                            <div className="col-sm-12">
                                            {/* Hide Teeth Anatomy & Selected Teeth if appointment is cancelled */}
                                            {consultation.appointment_status !== "cancelled" && (
                                              <>
                                                <div className="col-sm-12">
                                                  <div className="col-sm-12">
                                                    <p className="text-1xl font-bold" style={{ color: "#00458B" }}>
                                                      Teeth Anatomy:
                                                    </p>
                                                    <img src="../teethmodel.png" style={{ width: "100%" }} alt="Teeth Model" />
                                                  </div>
                                                </div>

                                                <div className="mt-6">
                                                  <p className="font-bold text-1xl" style={{ color: "#00458B" }}>
                                                    Selected Teeth:
                                                  </p>
                                                  <hr />
                                                  <div
                                                    className="mt-4 border rounded-lg shadow-inner p-3"
                                                    style={{
                                                      maxHeight: "300px",   // 🔹 scroll height
                                                      overflowY: "auto",    // 🔹 vertical scroll
                                                    }}
                                                  >
                                                    <div className="grid grid-cols-2 gap-4">
                                                      {selectedTeeth.length > 0 ? (
                                                        selectedTeeth.map((tooth, idx) => (
                                                          <div
                                                            key={idx}
                                                            className="flex items-center p-3 border rounded-lg shadow-sm"
                                                            style={{ borderColor: "#01D5C4" }}
                                                          >
                                                            <div>
                                                              <p className="font-semibold text-[#00458B]">
                                                                Tooth {tooth.st_number}
                                                              </p>
                                                              <p className="text-sm text-gray-600">{tooth.st_name}</p>
                                                            </div>
                                                          </div>
                                                        ))
                                                      ) : (
                                                        <p className="text-gray-500">No teeth selected</p>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                            </div>
                                        </div>
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                        <p className="font-bold text-xl">Billing Information</p>
                                        <br />

                                        {consultation.appointment_status !== "incomplete" && consultation.appointment_status !== "done"  && consultation.appointment_status !== "cancelled" ? (
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
                                      {/* Downpayment Proof Preview Button */}
                                      {consultation.downpayment_proof && (
                                        <div className="mt-4">
                                          <p className="font-bold text-xl" style={{ color: "#00458B" }}>
                                            Downpayment Proof
                                          </p>
                                          <hr className="my-2" />
                                          <button
                                            onClick={() =>
                                              window.open(
                                                `http://localhost:3000/uploads/appointments/${consultation.downpayment_proof}`,
                                                "_blank"
                                              )
                                            }
                                            className="bg-[#00c3b8] text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition"
                                          >
                                            Preview Proof
                                          </button>
                                        </div>
                                      )}
                                        <br></br>
                                        {/* Cancelled Appointment Details (only show if cancelled) */}
                                        {consultation.appointment_status === "cancelled" && cancelInfo && (
                                          <>
                                            <br />
                                            <p className="font-bold text-xl" style={{ color: "#00458B" }}>
                                              Cancelled Appointment Details:
                                            </p>
                                            <hr />
                                            <br />
                                            <p className="font-bold">Reason of Cancellation:</p>
                                            <p>{cancelInfo.cc_reason || "N/A"}</p>

                                            <p className="font-bold">Notes:</p>
                                            <p>{cancelInfo.cc_notes || "N/A"}</p>

                                            <p className="font-bold">Date Cancelled:</p>
                                            <p>{cancelInfo.cc_date ? new Date(cancelInfo.cc_date).toLocaleDateString() : "N/A"}</p>

                                            <p className="font-bold">Refund Method:</p>
                                            <p>{cancelInfo.refund_method || "N/A"}</p>

                                            <p className="font-bold">Refund Photo:</p>
                                            {cancelInfo.refund_photo ? (
                                              <button
                                                onClick={() =>
                                                  window.open(
                                                    `http://localhost:3000/uploads/appointments/${cancelInfo.refund_photo}`,
                                                    "_blank"
                                                  )
                                                }
                                                className="bg-[#00458B] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#009a90]"
                                              >
                                                Preview Refund Photo
                                              </button>
                                            ) : (
                                              <p>No refund proof uploaded</p>
                                            )}
                                            <br />
                                          </>
                                        )}
                                        <br></br>
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
                                                <button
                                                  disabled={consultation.appointment_status !== "done"}
                                                  className={`px-6 py-2 rounded-full font-semibold w-full mb-4 border ${
                                                    consultation.appointment_status === "done"
                                                      ? "bg-white text-[#00c3b8] border-[#00458b] hover:bg-gray-100 cursor-pointer"
                                                      : "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                                                  }`}
                                                  onClick={() => {
                                                    if (consultation.appointment_status === "done") {
                                                      navigate("/"); // 👉 replace with your actual print page route
                                                    }
                                                  }}
                                                >
                                                  Print
                                                </button>
                                              </div>
                                                <div className="col-sm-6">
                                                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminpatients")}>Back to List</button>
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

export default Adminconsultationview;
