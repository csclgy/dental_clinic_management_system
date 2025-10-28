import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { Printer } from "lucide-react";

const transviewmed = () => {
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [chargedItems, setChargedItems] = useState([]);
  const [error, setError] = useState("");

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

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate total amount
    const totalAmount = (
      consultation.total_service_charged +
      chargedItems.reduce((sum, i) => sum + i.ci_amount, 0)
    ).toFixed(2);

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Medical Record - ${consultation.p_lname}, ${consultation.p_fname}</title>
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
        .header h1 {
          color: #00458B;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section-title {
          color: #00458B;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #01D5C4;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 15px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #00458B;
          margin-bottom: 3px;
        }
        .info-value {
          color: #333;
        }
        .patient-name {
          color: #00c3b8;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .patient-basic {
          color: #00458B;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #00458B;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .billing-box {
          background-color: #f0f8ff;
          border: 2px solid #01D5C4;
          border-radius: 8px;
          padding: 15px;
          margin-top: 10px;
        }
        .total-row {
          font-weight: bold;
          font-size: 18px;
          color: #00458B;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #00458B;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        .teeth-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
        }
        .tooth-item {
          border: 1px solid #01D5C4;
          border-radius: 5px;
          padding: 8px;
          background-color: #f9f9f9;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Medical Record Report</h1>
        <p>Arciaga-Juntilla TMJ Ortho Dental Clinic</p>
        <p>Generated on: ${currentDate}</p>
      </div>

      <!-- Patient Information -->
      <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="patient-name">
          ${consultation.p_lname}, ${consultation.p_fname} ${consultation.p_mname}
        </div>
        <div class="patient-basic">
          ${consultation.p_gender} | ${consultation.p_age} years old | ${new Date(consultation.p_date_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        <div class="info-grid">
          <div>
            <div class="info-item">
              <div class="info-label">Address:</div>
              <div class="info-value">${consultation.p_home_address}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email Address:</div>
              <div class="info-value">${consultation.p_email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Contact Number:</div>
              <div class="info-value">${consultation.p_contact_no}</div>
            </div>
          </div>
          <div>
            <div class="info-item">
              <div class="info-label">Blood Type:</div>
              <div class="info-value">${consultation.p_blood_type}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Consultation Details -->
      <div class="section">
        <div class="section-title">Consultation Details</div>
        <div class="info-grid">
          <div>
            <div class="info-item">
              <div class="info-label">Date of Visit:</div>
              <div class="info-value">${new Date(consultation.pref_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | ${consultation.pref_time}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Attending Dentist:</div>
              <div class="info-value">${consultation.attending_dentist}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Diagnosis:</div>
              <div class="info-value">${consultation.p_diagnosis}</div>
            </div>
          </div>
          <div>
            <div class="info-item">
              <div class="info-label">Services:</div>
              <div class="info-value">${consultation.procedure_type}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Consultation Completed:</div>
              <div class="info-value">${consultation.p_date_completed ? new Date(consultation.p_date_completed).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Teeth -->
      ${selectedTeeth.length > 0 ? `
        <div class="section">
          <div class="section-title">Selected Teeth</div>
          <div class="teeth-grid">
            ${selectedTeeth.map(tooth => `
              <div class="tooth-item">
                <strong>Tooth ${tooth.st_number}</strong> - ${tooth.st_name}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Billing Information -->
      <div class="section">
        <div class="section-title">Billing Information</div>
        <div class="billing-box">
          <div class="info-grid" style="margin-bottom: 15px;">
            <div class="info-item">
              <div class="info-label">OR Number:</div>
              <div class="info-value">${consultation.or_num || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Payment Method:</div>
              <div class="info-value">${consultation.payment_method || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Payment Status:</div>
              <div class="info-value">${consultation.payment_status || 'N/A'}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Service:</strong> ${consultation.procedure_type}</td>
                <td style="text-align: right;">₱ ${consultation.total_service_charged.toFixed(2)}</td>
              </tr>
              ${chargedItems.length > 0 ? chargedItems.map(item => `
                <tr>
                  <td>${item.ci_item_name} (x${item.ci_quantity})</td>
                  <td style="text-align: right;">₱ ${item.ci_amount.toFixed(2)}</td>
                </tr>
              `).join('') : '<tr><td colspan="2">No additional items</td></tr>'}
            </tbody>
          </table>

          <div class="total-row">
            Total Amount: ₱ ${totalAmount}
          </div>
        </div>
      </div>

      ${consultation?.appointment_status === "cancelled" && cancelInfo ? `
        <div class="section">
          <div class="section-title">Cancellation Details</div>
          <div class="info-item">
            <div class="info-label">Reason:</div>
            <div class="info-value">${cancelInfo.cc_reason || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Notes:</div>
            <div class="info-value">${cancelInfo.cc_notes || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date Cancelled:</div>
            <div class="info-value">${cancelInfo.cc_date ? new Date(cancelInfo.cc_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Refund Method:</div>
            <div class="info-value">${cancelInfo.refund_method || 'N/A'}</div>
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p>This report was automatically generated for Arciaga-Juntilla TMJ Ortho Dental Clinic.</p>
        <p>Confidential Medical Record - Handle with Care</p>
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

          <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-2xl" style={{ color: "#00458B" }}>
                Patient's Information
              </h1>

              {/* Print Button beside the title */}
              <button
                onClick={handlePrintReport}
                title="Print Medical Record"
                disabled={!consultation || consultation.appointment_status !== "done"}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold border transition ${consultation && consultation.appointment_status === "done"
                  ? "bg-[#00458B] text-white border-[#00458B] hover:bg-[#003870]"
                  : "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                  }`}
              >
                <Printer size={18} /> Print
              </button>
            </div>

            <br />
            <hr></hr>
            <div className="row">
              <div className="col-sm-12">
                <br />
                {consultation ? (
                  <div className="row">
                    <div className="col-sm-12">
                      <p className="font-bold text-xl" style={{ color: "#00c3b8" }}>
                        {consultation.p_lname}, {consultation.p_fname} {consultation.p_mname}
                      </p>
                      <p style={{ color: "#00458B" }}>
                        {consultation.p_gender} | {consultation.p_age} years old | {consultation.p_date_birth}
                      </p>
                      <br /><br />

                      <div className="row">
                        <div className="col-sm-6" style={{ color: "#00458B" }}>
                          <p className="font-bold text-2xl">Address and Contact Information</p>
                          <hr /><br />
                          <p className="font-bold">Address:</p><p>{consultation.p_home_address}</p>
                          <br />
                          <p className="font-bold">Email Address:</p><p>{consultation.p_email}</p>
                          <br />
                          <p className="font-bold">Contact Number:</p><p>{consultation.p_contact_no}</p>
                        </div>

                        <div className="col-sm-6" style={{ color: "#00458B" }}>
                          <p className="font-bold text-2xl">Health Information & Medical History</p>
                          <hr /><br />
                          <p className="font-bold">Blood Type:</p><p>{consultation.p_blood_type}</p>
                        </div>
                      </div>

                      <br /><br />
                      <p className="font-bold text-2xl" style={{ color: "#00458B" }}>Consultation Details</p>
                      <hr /><br />

                      <div className="row">
                        <div className="col-sm-6" style={{ color: "#00458B" }}>
                          <p className="font-bold">Date of Visit:</p><p>{consultation.pref_date} | {consultation.pref_time}</p>
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
                            <p className="text-1xl font-bold" style={{ color: "#00458B" }}>Teeth Anatomy:</p>
                            <img src="../teethmodel.png" style={{ width: "100%" }}></img>
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

                        <div className="col-sm-6" style={{ color: "#00458B" }}>
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
                  <p style={{ color: "#00458B" }}>Loading consultation...</p>
                )}

              </div>
            </div>
            <div className="col-sm-12">
              <br></br>
              <div className="row">
                <div className="col-sm-9">
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
