import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Users,
  Calendar,
  X,
} from "lucide-react";

const Adminconsultationview = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [patient, setPatient] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [chargedItems, setChargedItems] = useState([]);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [cancelInfo, setCancelInfo] = useState(null);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:3000/auth/displayconsultation/${appointId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <i className="fa fa-book"></i> Ledger
            </span>
            <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
          </button>
          {isLedgerOpen && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link to="/admincoa" className="hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:bg-[white] hover:text-[#00458B]">
                Trial Balance
              </Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link
            to="/adminpatients"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link
            to="/adminschedule"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Calendar size={18} /> Schedules
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Sidebar (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#00458B] text-white flex flex-col p-6 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end mb-6"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 bg-[#01D5C4] text-black p-2 rounded-lg"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <Users size={18} /> Users
              </Link>
              {/* add the rest of the links like desktop here */}
            </nav>
          </aside>
        </div>
      )}
      <div className="flex-1 flex flex-col">
                <main className="p-6 overflow-y-auto space-y-6">
                  <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-9">
                                            <h1 className="text-2xl font-bold" style={{color:"#00458B"}}>Patients Information</h1>
                                        </div>
                                    </div>
                                </div>
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
                                </div>

                               <br />
                                    <br />
                                    <p className="font-bold text-2xl" style={{color:"#00458B"}}>Consultation Details</p>
                                    <hr></hr>
                                    <br />
                                    <div className="row">
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold">Date of Visit:</p><p>{consultation.pref_date} | {consultation.pref_time}</p>
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
                                            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg"
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
                                    </main>
                            </div>
            </div>
  );
};

export default Adminconsultationview;
