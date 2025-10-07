import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, X } from "lucide-react";

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
    
    const totalCharged =  consultation.total_charged
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <i className="fa fa-book"></i> Ledger
            </span>
            <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
          </button>
          {isLedgerOpen && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link to="/admincoa" className="hover:bg-white hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:bg-white hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link
                to="/adminsubsidiaryreceivable"
                className="hover:bg-white hover:text-[#00458B]"
              >
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="hover:bg-white hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:bg-white hover:text-[#00458B]">
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
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
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
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
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
                Payments:
                </p>
                <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-full w-full sm:w-auto"
                onClick={() =>
                    navigate(`/adminconsultationpartialpay/${appointId}`, {
                    state: {
                        patientName: `${consultation.p_fname} ${consultation.p_mname || ""} ${consultation.p_lname}`,
                        invoiceNo: consultation.or_num || "", 
                        procedureType: consultation.procedure_type || "",
                        appointId: consultation.appoint_id || ""
                    },
                    })
                }
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
                  disabled={consultation.appointment_status !== "done"}
                  className={`px-6 py-2 rounded-full font-semibold border w-full sm:w-auto ${
                    consultation.appointment_status === "done"
                      ? "bg-white text-[#00c3b8] border-[#00458b] hover:bg-gray-100 cursor-pointer"
                      : "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (consultation.appointment_status === "done") {
                      navigate("/");
                    }
                  }}
                >
                  Print
                </button>
                <button
                  className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full sm:w-auto"
                  onClick={() => navigate("/admincashierpartial")}
                >
                  Back to List
                </button>
                <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-full w-full sm:w-auto"
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

export default AdminConsultationPartial;
