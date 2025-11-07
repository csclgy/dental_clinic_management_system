import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Users,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  PhilippinePeso,
  IdCard,
  Settings,
  Printer,
  FolderKanban,
  BriefcaseMedical
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
  const [isSettingopen, setIsSettingOpen] = useState(false);


  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/displayconsultation/${appointId}`,
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
        const res = await axios.get("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/dentists", {
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
  if (!consultation)
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          aria-hidden="true"
          className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            className="text-gray-300"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            className="text-[#00c3b8]"
            fill="currentFill"
          />
        </svg>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">
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

      <div className="flex-1 flex flex-col">
        <main className="p-6 overflow-y-auto space-y-6">
          <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
            <div className="col-sm-12">
              <div className="row">
                <div className="col-sm-12">
                  <div className="flex items-center justify-between">
                    <h1 className="font-bold text-2xl" style={{ color: "#00458B" }}>
                      Patient's Information
                    </h1>
                    <button
                      disabled={consultation.appointment_status !== "done"}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold border transition ${consultation.appointment_status === "done"
                        ? "bg-[#00458B] text-white border-[#00458B] hover:bg-[#003870]"
                        : "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                        }`}
                      onClick={() => {
                        if (consultation.appointment_status === "done") {
                          handlePrintReport();
                        }
                      }}
                    >
                      <Printer size={18} />  Print
                    </button>
                  </div>

                </div>
              </div>
            </div>
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
                <p className="font-bold">Attending Dentist:</p><p>{consultation.attending_dentist}</p>
                <br />
                <p className="font-bold">Diagnosis:</p>{consultation.p_diagnosis}<p></p>
                <br />
                <p className="font-bold">Services:</p><p>{consultation.procedure_type}</p>
                <br />
                <p className="font-bold">Follow-Up:</p><p>{consultation.pref_date}</p>
                <br />
                <p className="font-bold">Consultation Completed:</p><p>{consultation.p_date_completed || "N/A"}</p>
                <br />
                <div className="mt-2">
                  <p className="font-bold">Image Uploaded:</p>
                  {photos.length > 0 ? (
                    photos.map((photo, idx) => (
                      <button
                        key={idx}
                        className="px-4 py-2 mt-1 mr-2 rounded-md bg-[#01D5C4] text-white font-semibold hover:bg-[#00b0a6]"
                        onClick={() => window.open(photo.up_url, "_blank")}
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
              <div className="col-sm-6" style={{ color: "#00458B" }}>
                <p className="font-bold text-xl">Billing Information</p>
                <br />

                {consultation.appointment_status !== "incomplete" &&
                  consultation.appointment_status !== "done" &&
                  consultation.appointment_status !== "cancelled" &&
                  role !== "dentist" ? (
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
                      maxHeight: "350px",
                      overflowY: "auto",
                    }}
                  >
                    <div className="col-sm-12 mb-2">
                      <p className="font-bold text-xl mb-2">Payment Details</p>
                      <div className="row">
                        <div className="col-sm-6">
                          <p className="font-bold">OR Number:</p>
                          <p>{consultation.or_num || "N/A"}</p>
                          <br />
                        </div>
                        <div className="col-sm-6">
                          <p className="font-bold">Payment Status:</p>
                          <p>{consultation.payment_status || "N/A"}</p>
                        </div>
                        <div className="col-sm-6">
                          <p className="font-bold">Payment Method:</p>
                          <p>{consultation.payment_method || "N/A"}</p>
                          <br />
                        </div>
                        <div className="col-sm-6">
                          <p className="font-bold">Charged Date:</p>
                          <p>{consultation.billing_date || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <hr className="mb-2"></hr>
                    <p className="font-bold mb-2">Charged Service:</p>
                    <p>
                      {consultation.procedure_type} - ₱{consultation.total_service_charged.toFixed(2)}
                    </p>
                    <hr className="my-2" />
                    <p className="font-bold mb-2">Charged Items:</p>
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
                          `https://dental-clinic-management-system-backend-jlz9.onrender.com/uploads/appointments/${consultation.downpayment_proof}`,
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
                            `https://dental-clinic-management-system-backend-jlz9.onrender.com/uploads/appointments/${cancelInfo.refund_photo}`,
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
                <div className="col-sm-9">
                </div>
                <div className="col-sm-3">
                  <div className="row">
                    <div className="col-sm-12">

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