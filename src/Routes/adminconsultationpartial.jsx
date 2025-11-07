import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, X, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings, Printer, FolderKanban, BriefcaseMedical } from "lucide-react";

const AdminConsultationPartial = () => {
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
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(0);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);
  const printRef = useRef();
  const [isSettingopen, setIsSettingOpen] = useState(false);



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
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/auth/consultationpayments/${appointId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPayments(res.data || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
      }
    };
    fetchPayments();
  }, [appointId]);

  useEffect(() => {
    if (consultation && payments.length > 0) {
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.credit || 0), 0);
      const totalCharged = consultation.total_charged || 0;
      const remainingBalance = totalCharged - totalPaid;
      setBalance(remainingBalance);
    } else if (consultation) {
      setBalance(consultation.total_charged || 0);
    }
  }, [payments, consultation]);

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

  const handleComplete = async () => {
    try {

      const totalCharged = consultation.total_charged
      const appoint_id = appointId;
      // Combine patient name fields
      const patientName = `${consultation.p_fname} ${consultation.p_mname || ""} ${consultation.p_lname}`;

      const res = await axios.post(`http://localhost:3000/auth/complete/${appoint_id}`, {
        appoint_id: consultation.appoint_id,
        total_charged: totalCharged,
        patient_name: patientName,
        description: `Payment received from ${patientName}`,
      });

      if (res.data.success) {
        alert("Payment completed successfully and journal entries recorded!");
        navigate("/admincashier");
      } else {
        alert(res.data.message || "Failed to complete payment.");
      }
    } catch (err) {
      console.error("Error completing payment:", err);
      alert("An error occurred while completing payment.");
    }
  };

  const handlePrintReport = () => {
    if (!consultation) return;

    const currentDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const totalAmount = (
      Number(consultation?.total_charged || 0) +
      payments.reduce((sum, p) => sum + Number(p.credit || 0), 0)
    ).toFixed(2);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SOA - ${consultation.p_lname}, ${consultation.p_fname}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #00458B;
          padding-bottom: 20px;
        }
        .header h1 { color: #00458B; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0; }
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section-title { color: #00458B; font-size: 20px; font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #01D5C4; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
        .info-item { margin-bottom: 10px; }
        .info-label { font-weight: bold; color: #00458B; margin-bottom: 3px; }
        .info-value { color: #333; }
        .patient-name { color: #00c3b8; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .patient-basic { color: #00458B; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #00458B; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .billing-box { background-color: #f0f8ff; border: 2px solid #01D5C4; border-radius: 8px; padding: 15px; margin-top: 10px; }
        .total-row { font-weight: bold; font-size: 18px; color: #00458B; margin-top: 10px; padding-top: 10px; border-top: 2px solid #00458B; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
        .teeth-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
        .tooth-item { border: 1px solid #01D5C4; border-radius: 5px; padding: 8px; background-color: #f9f9f9; }
        @media print { body { margin: 0; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Statement of Account</h1>
        <p>Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
        <p>Generated on: ${currentDate}</p>
      </div>

      <!-- Patient Information -->
      <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="patient-name">${consultation.p_lname}, ${consultation.p_fname} ${consultation.p_mname || ""}</div>
        <div class="patient-basic">${consultation.p_gender} | ${consultation.p_age} years old | ${new Date(consultation.p_date_birth).toLocaleDateString()}</div>
        <div class="info-grid">
          <div>
            <div class="info-item"><div class="info-label">Address:</div><div class="info-value">${consultation.p_home_address}, ${consultation.p_city}</div></div>
            <div class="info-item"><div class="info-label">Email:</div><div class="info-value">${consultation.p_email}</div></div>
            <div class="info-item"><div class="info-label">Contact:</div><div class="info-value">${consultation.p_contact_no}</div></div>
          </div>
          <div>
            <div class="info-item"><div class="info-label">Blood Type:</div><div class="info-value">${consultation.p_blood_type}</div></div>
          </div>
        </div>
      </div>

      <!-- Consultation Details -->
      <div class="section">
        <div class="section-title">Consultation Details</div>
        <div class="info-grid">
          <div>
            <div class="info-item"><div class="info-label">Date of Visit:</div><div class="info-value">${new Date(consultation.pref_date).toLocaleDateString()} | ${consultation.pref_time}</div></div>
            <div class="info-item"><div class="info-label">Attending Dentist:</div><div class="info-value">${consultation.attending_dentist}</div></div>
            <div class="info-item"><div class="info-label">Diagnosis:</div><div class="info-value">${consultation.p_diagnosis}</div></div>
          </div>
          <div>
            <div class="info-item"><div class="info-label">Services:</div><div class="info-value">${consultation.procedure_type}</div></div>
            <div class="info-item"><div class="info-label">Consultation Completed:</div><div class="info-value">${consultation.p_date_completed ? new Date(consultation.p_date_completed).toLocaleDateString() : "N/A"}</div></div>
          </div>
        </div>
      </div>

      <!-- Selected Teeth -->
      ${selectedTeeth.length > 0 ? `
      <div class="section">
        <div class="section-title">Selected Teeth</div>
        <div class="teeth-grid">
          ${selectedTeeth.map(tooth => `<div class="tooth-item"><strong>Tooth ${tooth.st_number}</strong> - ${tooth.st_name}</div>`).join('')}
        </div>
      </div>` : ''}

      <!-- Billing -->
      <div class="section">
        <div class="section-title">Billing Information</div>
        <div class="billing-box">
          <table>
            <thead>
              <tr><th>Description</th><th style="text-align: right;">Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Service: ${consultation.procedure_type}</td><td style="text-align: right;">₱ ${consultation.total_service_charged.toFixed(2)}</td></tr>
              ${chargedItems.length > 0 ? chargedItems.map(item => `<tr><td>${item.ci_item_name} (x${item.ci_quantity})</td><td style="text-align: right;">₱ ${item.ci_amount.toFixed(2)}</td></tr>`).join('') : '<tr><td colspan="2">No additional items</td></tr>'}
            </tbody>
          </table>
          <div class="total-row">Total Amount: ₱ ${totalAmount}</div>
        </div>
      </div>

      <!-- Cancelled Appointment -->
      ${consultation?.appointment_status === "cancelled" && cancelInfo ? `
      <div class="section">
        <div class="section-title">Cancellation Details</div>
        <div class="info-item"><div class="info-label">Reason:</div><div class="info-value">${cancelInfo.cc_reason || 'N/A'}</div></div>
        <div class="info-item"><div class="info-label">Notes:</div><div class="info-value">${cancelInfo.cc_notes || 'N/A'}</div></div>
        <div class="info-item"><div class="info-label">Date Cancelled:</div><div class="info-value">${cancelInfo.cc_date ? new Date(cancelInfo.cc_date).toLocaleDateString() : 'N/A'}</div></div>
        <div class="info-item"><div class="info-label">Refund Method:</div><div class="info-value">${cancelInfo.refund_method || 'N/A'}</div></div>
      </div>` : ''}

      <!-- Installment Payments -->
      <div class="section">
        <div class="section-title">Payment for Installments</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
              <th style="text-align: right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${payments.length > 0
        ? payments.map(p => `
                  <tr>
                    <td>${new Date(p.date).toLocaleDateString()}</td>
                    <td>${p.particulars}</td>
                    <td style="text-align: right;">₱ ${Number(p.credit || 0).toFixed(2)}</td>
                    <td style="text-align: right;">₱ ${Number(p.balance || 0).toFixed(2)}</td>
                  </tr>
                `).join('')
        : '<tr><td colspan="4" style="text-align:center;">No Record</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>This report was automatically generated for Arciaga-Juntilla TMJ Ortho Dental Clinic.</p>
        <p>Confidential Medical Record - Handle with Care</p>
      </div>

      <script>
        setTimeout(() => { window.print(); window.close(); }, 300);
      </script>
    </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();

      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.addEventListener('focus', () => {
            setTimeout(() => {
              if (!printWindow.closed) {
                printWindow.close();
              }
            }, 1000);
          });
        }
      }, 500);
    }, 250);
  };

  const totalAmount = (
    Number(consultation?.total_charged || 0) +
    payments.reduce((sum, p) => sum + Number(p.credit || 0), 0)
  ).toFixed(2);
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

      {/* Mobile Sidebar */}
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
            </nav>
          </aside>
        </div>
      )}

      {/* Main content vertical */}
      <div className="flex-1 flex flex-col overflow-y-auto">

        <main className="p-6 space-y-8">
          <div
            className="p-10 rounded-lg shadow-lg border border-[#01D5C4] bg-white"
          >
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
                  onClick={handlePrintReport}
                >
                  <Printer size={18} /> Print
                </button>
              </div>

            </div>
            <br></br>
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
                <p className="font-bold text-2xl text-[#00458B]">
                  Billing Information
                </p>
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
                    style={{ maxHeight: "350px", overflowY: "auto" }}>
                    <p>
                      <b>OR Number:</b> {consultation.or_num}
                    </p>
                    <p>
                      <b>Payment Method:</b> {consultation.payment_method}
                    </p>
                    <p>
                      <b>Payment Status:</b> {consultation.payment_status}
                    </p>
                    <p>
                      <b>Payment Due Date:</b> {consultation.due_date}
                    </p>
                    <p>
                      <b>HMO No:</b> {consultation.hmo_number}
                    </p>
                    <p>
                      <b>HMO Provider:</b> {consultation.hmo_name}
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

              <div className="mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mt-3 gap-3">
                  <p className="font-bold text-2xl text-[#00458B]">
                    Payments (If Installment):
                  </p>
                  <button
                    disabled={balance <= 0 || consultation?.payment_confirmation === "Complete"}
                    className={`font-semibold px-6 py-2 rounded-lg w-full sm:w-auto ${balance <= 0 || consultation?.payment_confirmation === "Complete"
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    onClick={() => {
                      if (balance > 0) {
                        navigate(`/adminconsultationpartialpay/${appointId}`, {
                          state: {
                            patientName: `${consultation.p_fname} ${consultation.p_mname || ""} ${consultation.p_lname}`,
                            invoiceNo: consultation.or_num || "",
                            procedureType: consultation.procedure_type || "",
                            appointId: consultation.appoint_id || "",
                          },
                        });
                      }
                    }}
                  >
                    Add Payment
                  </button>
                </div>
                <br />
                <hr />

                {/* Responsive wrapper for horizontal scroll on small devices */}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full min-w-[600px] table-auto border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100 text-[#00458B]">
                        <th className="border border-gray-300 px-4 py-2 text-center">Date</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Description</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Amount</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length > 0 ? (
                        payments.map((p, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {new Date(p.date).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{p.particulars}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              ₱ {Number(p.credit || 0).toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              ₱ {Number(p.balance || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-center" colSpan={4}>
                            No payments recorded
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                  className="bg-white text-[#00458B] font-semibold border border-[#00458b] px-6 py-2 rounded-lg"
                  onClick={() => navigate("/admincashierpartial")}
                >
                  Back to List
                </button>
                <button
                  disabled={balance > 0 || consultation?.payment_confirmation === "Complete"}
                  className={`px-6 py-2 rounded-lg font-semibold w-full sm:w-auto ${balance > 0 || consultation?.payment_confirmation === "Complete"
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  onClick={() => {
                    if (balance === 0 && consultation?.payment_confirmation !== "Complete") {
                      handleComplete();
                    }
                  }}
                >
                  {consultation?.payment_confirmation === "complete"
                    ? "Completed"
                    : "Complete"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminConsultationPartial;
