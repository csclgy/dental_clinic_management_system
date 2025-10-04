import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminScheduleCancel = () => {
  const navigate = useNavigate();
  const { appointId } = useParams();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reason, setReason] = useState("");
  const [showRefund, setShowRefund] = useState(false);
  const [note, setNote] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [refundPhoto, setRefundPhoto] = useState(null);

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    setShowRefund(e.target.value === "Refund");
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

      alert(response.data.message);
      navigate("/adminschedule");
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel appointment");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
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

          {/* Ledger dropdown */}
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
              <Link to="/admincoa" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
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
            to="/admincashier"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Calendar size={18} /> Cashier
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Sidebar (mobile with toggle) */}
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
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
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

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
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
                Reason for Cancellation
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
                Note
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
                  Refund Method
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
                  Upload Proof of Refund
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