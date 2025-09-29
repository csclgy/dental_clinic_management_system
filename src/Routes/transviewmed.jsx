import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";

const transviewmed = () => {
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

  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [cancelInfo, setCancelInfo] = useState(null);

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

  useEffect(() => {
      const fetchConsultation = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:3000/auth/viewmyconsultation/${appointId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!res.ok) throw new Error("Failed to fetch consultation");
  
          const data = await res.json();
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-lg shadow-md p-4 md:col-span-1">
          <h2 className="text-2xl font-bold text-[#00458B] mb-6">
            Transaction History
          </h2>
          <nav className="flex flex-col gap-2">
            <Link to="/transmed">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-user-circle-o mr-2"></i>
                Medical Records
              </button>
            </Link>
            <Link to="/transappointment">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-history mr-2"></i>
                Appointment History
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3 space-y-6">
          <div className="bg-[#00458B] text-white p-6 rounded-lg shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold">Medical Records</h1>
          </div>

            <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                        <h1 className="font-bold text-2xl" style={{color:"#00458B"}}>Patients Information</h1>
                        <br />
                        <hr></hr>
                        <div className="row">
                            <div className="col-sm-12">
                                <br />
                                {consultation ? (
                                    <div className="row">
                                    <div className="col-sm-12">
                                        <p className="font-bold text-xl" style={{color:"#00c3b8"}}>
                                        {consultation.p_lname}, {consultation.p_fname} {consultation.p_mname}
                                        </p>
                                        <p style={{color:"#00458B"}}>
                                        {consultation.p_gender} | {consultation.p_age} years old | {consultation.p_date_birth}
                                        </p>
                                        <br /><br />

                                        <div className="row">
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold text-2xl">Address and Contact Information</p>
                                            <hr /><br />
                                            <p className="font-bold">Address:</p><p>{consultation.p_home_address}</p>
                                            <br />
                                            <p className="font-bold">Email Address:</p><p>{consultation.p_email}</p>
                                            <br />
                                            <p className="font-bold">Contact Number:</p><p>{consultation.p_contact_no}</p>
                                        </div>

                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold text-2xl">Health Information & Medical History</p>
                                            <hr /><br />
                                            <p className="font-bold">Blood Type:</p><p>{consultation.p_blood_type}</p>
                                        </div>
                                        </div>

                                        <br /><br />
                                        <p className="font-bold text-2xl" style={{color:"#00458B"}}>Consultation Details</p>
                                        <hr /><br />

                                        <div className="row">
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold">Date of Visit:</p><p>{consultation.pref_date}</p>
                                            <br />
                                            <p className="font-bold">Attending Dentist:</p><p>{consultation.attending_dentist}</p>
                                            <br />
                                            <p className="font-bold">Diagnosis:</p><p>{consultation.p_diagnosis}</p>
                                            <br />
                                            <p className="font-bold">Services:</p><p>{consultation.procedure_type}</p>
                                            <br />
                                            <p className="font-bold">Follow-Up:</p><p>{consultation.pref_date}</p>
                                            <br />
                                            <p className="font-bold">Consultation Completed:</p><p>{consultation.p_date_completed}</p>
                                            <br />
                                            <br></br>
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
                                              <p className="text-1xl font-bold" style={{color:"#00458B"}}>Teeth Anatomy:</p>
                                              <img src="../teethmodel.png" style={{width:"100%"}}></img>
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
                                        </div>

                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold">Billing Information</p>
                                            <br />
                                            <ul>
                                            <div
                                                className="p-4 rounded-lg shadow-md"
                                                style={{
                                                border: "solid",
                                                borderColor: "#01D5C4",
                                                maxHeight: "350px",
                                                overflowY: "auto",
                                                }}
                                            >
                                                <p className="font-bold mb-2">Charged Service</p>
                                                <p>
                                                {consultation.procedure_type} - ₱
                                                {consultation.total_service_charged?.toFixed(2)}
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
                                            </ul>
                                                                                    <br></br>
                                        <br></br>
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
                                        <br></br>
                                        <br></br>
                                        <br></br>
                                        {/* Cancelled Appointment Details (only show if cancelled) */}
                                          {consultation?.appointment_status === "cancelled" && cancelInfo && (
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
                                              <p>
                                                {cancelInfo.cc_date
                                                  ? new Date(cancelInfo.cc_date).toLocaleDateString()
                                                  : "N/A"}
                                              </p>

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
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                ) : (
                                    <p style={{color:"#00458B"}}>Loading consultation...</p>
                                )}

                            </div>
                    </div>
                    <div className="col-sm-12">
                      <br></br>
                        <div className="row">
                            <div className="col-sm-6">
                            </div>
                            <div className="col-sm-6">
                                <button
                                disabled={!consultation || consultation.appointment_status !== "done"}
                                className={`px-6 py-2 rounded-full font-semibold w-full mb-4 border ${
                                    consultation && consultation.appointment_status === "done"
                                    ? "bg-[#00458B] text-[white] border-[#00458b] hover:bg-[#00458B]-100 cursor-pointer"
                                    : "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                                }`}
                                onClick={() => {
                                    if (consultation && consultation.appointment_status === "done") {
                                    navigate("/"); // 👉 replace with your actual print page route
                                    }
                                }}
                                >
                                Print
                                </button>
                            </div>
                        </div>
                    </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default transviewmed;
