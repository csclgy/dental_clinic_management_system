import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, X } from "lucide-react";

const transviewsoa = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [chargedItems, setChargedItems] = useState([]);
  const [error, setError] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [cancelInfo, setCancelInfo] = useState(null);

  const [dentists, setDentists] = useState([]);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(0);

  const [loading, setLoading] = useState(false);

  const printRef = useRef();


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
        const res = await fetch(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/viewmyconsultation/${appointId}`, {
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

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        setLoading(true); // <-- now this works
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
    const fetchPayments = async () => {
      try {
        setLoading(true); // <-- now this works
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/consultationpayments/${appointId}`,
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

      const res = await axios.post(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/complete/${appoint_id}`, {
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


  if (!consultation) return <p>Loading...</p>;

  const totalAmount = (
    Number(consultation?.total_charged || 0) +
    payments.reduce((sum, p) => sum + Number(p.credit || 0), 0)
  ).toFixed(2);

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
        <main className="md:col-span-3 space-y-6">
          <div className="bg-[#00458B] text-white p-6 rounded-lg shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold">Statement of Account</h1>
          </div>

          <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }} ref={printRef}>
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
                      <b>HMO No:</b> {consultation.hmo_number}
                    </p>
                    <p>
                      <b>PWD No:</b> {consultation.pwd_number}
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
                    Payments for installment:
                  </p>
                </div>
                <br />
                <hr />

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
                            <td className="border border-gray-300 px-4 py-2 text-center">{p.particulars}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              ₱ {Number(p.credit || 0).toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              ₱ {Number(p.balance || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-center" colSpan={4}>
                            No Record
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
                <div className="col-sm-2">
                  <button
                    className="px-6 py-2 rounded-lg font-semibold w-full mb-4 border "
                    onClick={() => navigate(-1)}
                  >
                    Back to List
                  </button>
                </div>
                <div className="col-sm-2">
                  <button
                    disabled={!consultation || consultation.appointment_status !== "done"}
                    onClick={handlePrintReport}
                    className={`px-6 py-2 rounded-lg font-semibold w-full border ${consultation && consultation.appointment_status === "done"
                      ? "bg-[#00458B] text-white border-[#00458B] hover:bg-[#00458B]-100 cursor-pointer"
                      : "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                      }`}
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

export default transviewsoa;
