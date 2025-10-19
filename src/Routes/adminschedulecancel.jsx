import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, ChevronDown, ChevronUp, PhilippinePeso, IdCard } from "lucide-react";

const AdminScheduleCancel = () => {
  const navigate = useNavigate();
  const { appointId } = useParams();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  const [reason, setReason] = useState("");
  const [showRefund, setShowRefund] = useState(false);
  const [note, setNote] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [refundPhoto, setRefundPhoto] = useState(null);

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    setShowRefund(e.target.value === "Refund");
  };

  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500); // fade out animation
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000); // hide popup
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("cc_reason", reason);
      formData.append("cc_notes", note);
      formData.append("cc_label", "cancelled");

      if (showRefund) {
        formData.append("refund_method", refundMethod);
        if (refundPhoto) formData.append("refund_photo", refundPhoto);
      }

      const response = await axios.post(
        `http://localhost:3000/auth/processRefund/${appointId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      showPopup(response.data.message, "success");

      // Wait 3 seconds before navigating
      setTimeout(() => navigate("/adminschedule"), 3000);
    } catch (error) {
      console.error("Cancel failed:", error);
      showPopup("Failed to cancel appointment", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-sxl font-bold mb-8">Arciaga-Juntilla TMJ Ortho Dental Clinic</h2>

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
              <Link to="/adminhmo" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <IdCard size={18} /> HMO
              </Link>
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
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {/* ✅ Popup Notification */}
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
              } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        {/* Cancellation Form */}
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-2">
            Cancel Appointment
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Appointment ID: {appointId}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cancel Info */}
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Reason for Cancellation: <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={reason}
                onChange={handleReasonChange}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none mb-4"
              >
                <option value="">Select Reason</option>
                <option value="Patient no-show">Patient no-show</option>
                <option value="Dentist unavailable">Dentist unavailable</option>
                <option value="Refund">Refund</option>
              </select>

              <label className="block text-[#00458b] font-semibold mb-1">
                Note: <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              />
            </div>

            {/* Refund Info */}
            {showRefund && (
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Refund Method: <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none mb-4"
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>

                <label className="block text-[#00458b] font-semibold mb-1">
                  Upload Proof of Refund: <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRefundPhoto(e.target.files[0])}
                  className="block mt-2"
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminScheduleCancel;