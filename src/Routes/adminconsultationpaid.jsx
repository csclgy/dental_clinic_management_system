import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, X, ChevronDown, ChevronUp, PhilippinePeso } from "lucide-react";

const Adminconsultationpaid = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [consultation, setConsultation] = useState(null);
  const [chargedItems, setChargedItems] = useState([]);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [cancelInfo, setCancelInfo] = useState(null);
  const [dentists, setDentists] = useState([]);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  // ✅ Popup state and fade animation (same as AdminCoaAdd)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

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

  const handlePrintReport = () => {
    if (!consultation) return;

    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const totalAmount = consultation.total_service_charged + chargedItems.reduce((sum, i) => sum + i.ci_amount, 0);

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Patient Consultation Report - ${consultation.p_fname} ${consultation.p_lname}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #00458B;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #00458B;
              margin: 0;
              font-size: 28px;
            }
            .clinic-name {
              color: #00c3b8;
              font-size: 16px;
              margin: 5px 0;
            }
            .patient-info {
              background-color: #f8f9ff;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #00c3b8;
              margin-bottom: 30px;
            }
            .patient-name {
              color: #00458B;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .patient-details {
              color: #00458B;
              font-size: 16px;
            }
            .section {
              margin: 25px 0;
              page-break-inside: avoid;
            }
            .section-title {
              color: #00458B;
              font-size: 20px;
              font-weight: bold;
              border-bottom: 2px solid #00c3b8;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              margin: 10px 0;
            }
            .info-label {
              font-weight: bold;
              color: #00458B;
              width: 180px;
              flex-shrink: 0;
            }
            .info-value {
              color: #333;
            }
            .billing-section {
              background-color: #f0f8ff;
              padding: 20px;
              border-radius: 8px;
              border: 2px solid #00c3b8;
              margin: 20px 0;
            }
            .billing-item {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 5px 0;
            }
            .billing-total {
              border-top: 2px solid #00458B;
              padding-top: 10px;
              margin-top: 15px;
              font-weight: bold;
              font-size: 18px;
              color: #00458B;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .two-column {
              display: flex;
              gap: 40px;
            }
            .column {
              flex: 1;
            }
            hr {
              border: none;
              border-top: 1px solid #ddd;
              margin: 15px 0;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Patient Consultation Report</h1>
            <p class="clinic-name">Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
            <p>Report generated on: ${currentDate}</p>
          </div>

          <div class="patient-info">
            <div class="patient-name">${consultation.p_fname} ${consultation.p_mname} ${consultation.p_lname}</div>
            <div class="patient-details">${consultation.p_gender} | ${consultation.p_age} years old | Born: ${new Date(consultation.p_date_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div class="two-column">
            <div class="column">
              <div class="section">
                <div class="section-title">Contact Information</div>
                <div class="info-row">
                  <span class="info-label">Address:</span>
                  <span class="info-value">${consultation.p_home_address}, ${consultation.p_city}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${consultation.p_email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Contact Number:</span>
                  <span class="info-value">${consultation.p_contact_no}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Medical Information</div>
                <div class="info-row">
                  <span class="info-label">Blood Type:</span>
                  <span class="info-value">${consultation.p_blood_type}</span>
                </div>
              </div>
            </div>

            <div class="column">
              <div class="section">
                <div class="section-title">Consultation Details</div>
                <div class="info-row">
                  <span class="info-label">Date of Visit:</span>
                  <span class="info-value">${new Date(consultation.pref_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Attending Dentist:</span>
                  <span class="info-value">${consultation.attending_dentist}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Services:</span>
                  <span class="info-value">${consultation.procedure_type}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Diagnosis:</span>
                  <span class="info-value">${consultation.p_diagnosis}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Follow-Up:</span>
                  <span class="info-value">${new Date(consultation.pref_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Completed:</span>
                  <span class="info-value">${consultation.p_date_completed}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Billing Information</div>
            <div class="billing-section">
              <div class="info-row">
                <span class="info-label">OR Number:</span>
                <span class="info-value">${consultation.or_num || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${consultation.payment_method || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-value">${consultation.payment_status || "N/A"}</span>
              </div>
              <hr style="margin: 15px 0;" />

              <div class="billing-item">
                <span><strong>Service:</strong> ${consultation.procedure_type}</span>
                <span>₱${consultation.total_service_charged.toFixed(2)}</span>
              </div>

              ${chargedItems.length > 0 ? `
                <hr>
                <div style="margin: 15px 0;"><strong>Additional Items:</strong></div>
                ${chargedItems.map(item => `
                  <div class="billing-item">
                    <span>${item.ci_item_name} (x${item.ci_quantity})</span>
                    <span>₱${item.ci_amount.toFixed(2)}</span>
                  </div>
                `).join('')}
              ` : `
                <hr>
                <div style="margin: 15px 0; font-style: italic;">No additional items charged</div>
              `}
              
              <div class="billing-total">
                <div class="billing-item">
                  <span>TOTAL AMOUNT:</span>
                  <span>₱${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This consultation report was automatically generated from the Dental Clinic Management System</p>
            <p>For any questions or concerns, please contact Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
          </div>

          <script>
            window.addEventListener('afterprint', function() {
              window.close();
            });

            setTimeout(function() {
              if (!window.closed) {
                window.close();
              }
            }, 10000);
          </script>
        </body>
        </html>
      `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!consultation) return <p>Loading consultation...</p>;

  const handleComplete = async () => {
    try {
      const totalCharged = consultation.total_charged;
      const appoint_id = appointId;
      const patientName = `${consultation.p_fname} ${consultation.p_mname || ""} ${consultation.p_lname}`;
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:3000/auth/complete/${appoint_id}`,
        {
          appoint_id: consultation.appoint_id,
          total_charged: totalCharged,
          patient_name: patientName,
          description: `Payment received from ${patientName}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ add token
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        showPopup("Payment completed successfully!", "success");
        setTimeout(() => navigate("/admincashier"), 1500); // ✅ navigate is correct
      } else {
        showPopup(res.data.message || "Failed to complete payment.", "error");
      }
    } catch (err) {
      console.error("Error completing payment:", err);
      showPopup("An error occurred while completing payment.", "error");
    }
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {/* ✅ Popup Notification (same style as AdminCoaAdd) */}
      {popup.show && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            } ${popup.type === "success" ? "bg-green-500" : "bg-green-500"}`}
          style={{ zIndex: 9999 }}
        >
          {popup.message}
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/inventorydashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Inventory Dashboard
              </Link>
              <Link to="/receptionistdashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Receptionist Dashboard
              </Link>
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
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
                  <Link
                    to="/admincoa"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Chart of Accounts
                  </Link>
                  <Link
                    to="/adminjournal"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Journal Entries
                  </Link>
                  <Link
                    to="/adminsubsidiaryreceivable"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Subsidiary
                  </Link>
                  <Link
                    to="/admingeneral"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    General Ledger
                  </Link>
                  <Link
                    to="/admintrial"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Trial Balance
                  </Link>
                </div>
              )}

              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Users size={18} /> Users
              </Link>
            </>
          )}

          {(role === "admin" || role === "inventory") && (
            <>
              <Link
                to="/admininventory"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-archive"></i> Inventory
              </Link>
            </>
          )}

          {(role === "admin" || role === "dentist" || role === "receptionist") && (
            <>
              <Link
                to="/adminpatients"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-user-plus"></i> Patients
              </Link>
              <Link
                to="/adminschedule"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Calendar size={18} /> Schedules
              </Link>
            </>
          )}

          {(role === "admin" || role === "receptionist") && (
            <>
              <Link
                to="/admincashier"
                className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <PhilippinePeso size={18} /> Cashier
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link
                to="/adminaudit"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-eye"></i> Audit Trail
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main content vertical */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="p-6 space-y-8">
          <div
            className="p-10 rounded-lg shadow-lg border border-[#01D5C4] bg-white"
          >
            <h1 className="text-2xl font-bold text-[#00458B] mb-4">
              Patient Information
            </h1>
            <hr />
            <div className="mt-4 text-[#00458B]">
              <p className="font-bold text-xl text-[#00c3b8]">
                {consultation.p_fname} {consultation.p_mname}{" "}
                {consultation.p_lname}
              </p>
              <p>
                {consultation.p_gender} | {consultation.p_age} |{" "}
                {consultation.p_date_birth}
              </p>

              <div className="mt-6">
                <p className="font-bold text-2xl">Address and Contact Information</p>
                <hr />
                <p className="font-bold mt-2">Address:</p>
                <p>
                  {consultation.p_home_address}, {consultation.p_city}
                </p>
                <p className="font-bold mt-2">Email Address:</p>
                <p>{consultation.p_email}</p>
                <p className="font-bold mt-2">Contact Number:</p>
                <p>{consultation.p_contact_no}</p>
              </div>

              <div className="mt-6">
                <p className="font-bold text-2xl">
                  Health Information & Medical History
                </p>
                <hr />
                <p className="font-bold mt-2">Blood Type:</p>
                <p>{consultation.p_blood_type}</p>
              </div>

              <div className="mt-6">
                <p className="font-bold text-2xl">Consultation Details</p>
                <hr />
                <div className="row">
                  <div className="col-sm-6">
                    <p className="font-bold mt-2">Date of Visit:</p>
                    <p> {consultation.pref_date} | {consultation.pref_time}</p>
                    <p className="font-bold mt-2">Attending Dentist:</p>
                    <p>{consultation.attending_dentist}</p>
                    <p className="font-bold mt-2">Diagnosis:</p>
                    <p>{consultation.p_diagnosis}</p>
                  </div>
                  <div className="col-sm-6">
                    <p className="font-bold mt-2">Services:</p>
                    <p>{consultation.procedure_type}</p>
                    <p className="font-bold mt-2">Follow-Up:</p>
                    <p>{consultation.pref_date}</p>
                    <p className="font-bold mt-2">Consultation Completed:</p>
                    <p>{consultation.p_date_completed || "N/A"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-bold">Images Uploaded:</p>
                  {photos.length > 0 ? (
                    photos.map((photo, idx) => (
                      <button
                        key={idx}
                        className="px-4 py-2 mt-2 mr-2 rounded-md bg-[#01D5C4] text-white font-semibold hover:bg-[#00b0a6]"
                        onClick={() =>
                          window.open(
                            `http://localhost:3000/uploads/appointments/${photo.up_url}`,
                            "_blank"
                          )
                        }
                      >
                        View Image {idx + 1}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500">No image uploaded</p>
                  )}
                </div>
              </div>

              {/* Billing */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-2xl text-[#00458B]">
                    Billing Information
                  </p>
                  <button
                    disabled={consultation.appointment_status !== "done"}
                    className={`px-6 py-2 rounded-lg font-semibold border w-full sm:w-auto ${consultation.appointment_status === "done"
                      ? "bg-white text-[#00458B] border-[#00458b] hover:bg-gray-100 cursor-pointer"
                      : "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                      }`}
                    onClick={() => {
                      if (consultation.appointment_status === "done") {
                        handlePrintReport();
                      }
                    }}
                  >
                    Print
                  </button>
                </div>

                <hr />

                {consultation.appointment_status !== "incomplete" &&
                  consultation.appointment_status !== "done" &&
                  consultation.appointment_status !== "cancelled" ? (
                  <button
                    className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg mt-4"
                    onClick={() =>
                      navigate(`/adminbillingedit/${consultation.appoint_id}`)
                    }
                  >
                    Edit Billing
                  </button>
                ) : (
                  <div
                    className="p-4 rounded-lg shadow-md mt-4 border border-[#01D5C4]"
                    style={{ maxHeight: "350px", overflowY: "auto" }}
                  >
                    <p>
                      <b>OR Number:</b> {consultation.or_num}
                    </p>
                    <p>
                      <b>Payment Method:</b> {consultation.payment_method}
                    </p>
                    <p>
                      <b>Payment Status:</b> {consultation.payment_status}
                    </p>
                    <hr className="my-2" />
                    <p className="font-bold mb-1">Charged Service:</p>
                    <p>
                      {consultation.procedure_type} - ₱
                      {consultation.total_service_charged.toFixed(2)}
                    </p>
                    <hr className="my-2" />
                    <p className="font-bold mb-1">Charged Items:</p>
                    {chargedItems.length > 0 ? (
                      chargedItems.map((item, idx) => (
                        <p key={idx}>
                          {item.ci_item_name} (x{item.ci_quantity}) - ₱
                          {item.ci_amount.toFixed(2)}
                        </p>
                      ))
                    ) : (
                      <p>No additional items</p>
                    )}
                    <hr className="my-2" />
                    <p className="font-bold text-lg">
                      Total: ₱
                      {(
                        consultation.total_service_charged +
                        chargedItems.reduce((sum, i) => sum + i.ci_amount, 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Downpayment Proof */}
              {consultation.downpayment_proof && (
                <div className="mt-6">
                  <p className="font-bold text-xl">Downpayment Proof</p>
                  <hr />
                  <button
                    onClick={() =>
                      window.open(
                        `http://localhost:3000/uploads/appointments/${consultation.downpayment_proof}`,
                        "_blank"
                      )
                    }
                    className="bg-[#00c3b8] text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 mt-3"
                  >
                    Preview Proof
                  </button>
                </div>
              )}

              {/* Cancelled Appointment */}
              {consultation.appointment_status === "cancelled" && cancelInfo && (
                <div className="mt-6">
                  <p className="font-bold text-xl">Cancelled Appointment Details</p>
                  <hr />
                  <p className="mt-2">
                    <b>Reason:</b> {cancelInfo.cc_reason || "N/A"}
                  </p>
                  <p>
                    <b>Notes:</b> {cancelInfo.cc_notes || "N/A"}
                  </p>
                  <p>
                    <b>Date Cancelled:</b>{" "}
                    {cancelInfo.cc_date
                      ? new Date(cancelInfo.cc_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <b>Refund Method:</b> {cancelInfo.refund_method || "N/A"}
                  </p>
                  {cancelInfo.refund_photo ? (
                    <button
                      onClick={() =>
                        window.open(
                          `http://localhost:3000/uploads/appointments/${cancelInfo.refund_photo}`,
                          "_blank"
                        )
                      }
                      className="bg-[#00458B] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#009a90] mt-2"
                    >
                      Preview Refund Photo
                    </button>
                  ) : (
                    <p>No refund proof uploaded</p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg w-full sm:w-auto"
                  onClick={() => navigate("/admincashier")}
                >
                  Back to List
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg w-full sm:w-auto"
                  onClick={handleComplete}
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Adminconsultationpaid;
