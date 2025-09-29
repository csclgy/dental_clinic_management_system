import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const AdminScheduleCancel = () => {
  const navigate = useNavigate();
  const { appointId } = useParams(); // ✅ get from URL
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

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
        `http://localhost:3000/auth/processRefund/${appointId}`, // ✅ using param
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
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
            <div
              className="col-sm-3 p-5 rounded-lg shadow-lg"
              style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
            >
              <Link to="/">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-tachometer"></i> Dashboard
                </button>
              </Link>

              {/* Ledger dropdown */}
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
                style={{ color: "#00458B" }}
              >
                <span>
                  <i className="fa fa-book"></i> Ledger
                </span>
                <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`}></i>
              </button>

              {isLedgerOpen && (
                <div className="ml-8 text-sm">
                  <Link to="/admincoa"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Chart of Accounts</p></Link>
                  <Link to="/adminjournal"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Journal Entries</p></Link>
                   <Link to='/adminsubsidiaryreceivable'> <p className="py-1 hover:underline" style={{ color: "#00458B" }}> Subsidiary</p>
                  </Link> 
                  <Link to="/admingeneral"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>General Ledger</p></Link>
                  <Link to="/admintrial"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Trial Balance</p></Link>
                </div>
              )}

              {/* Other buttons */}
              <Link to="/adminusers"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-users"></i> Users</button></Link>
              <Link to="/admininventory"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-archive"></i> Inventory</button></Link>
              <Link to="/adminpatients"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-user-plus"></i> Patients</button></Link>
              <Link to="/adminschedule"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-calendar"></i> Schedules</button></Link>
              <Link to="/adminaudit"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-eye"></i> Audit Trail</button></Link>
            </div>

            {/* Main */}
            <div className="col-sm-8">
              <div className="row">
                {/* Header */}
                <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{ color: "white" }}>
                  <h1 className="text-2xl font-bold">Cancel Appointment</h1>
                  <p className="mt-2 text-sm">Appointment ID: {appointId}</p> {/* ✅ show it */}
                </div>

                <p style={{ color: "transparent" }}>...</p>

                {/* Confirmation */}
                <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
                  <div className="row">
                    <div className="col-sm-6">
                      <h4 className="text-xl font-bold" style={{ color: "#00458B" }}>Cancel Information</h4>
                      <hr></hr>
                      <br></br>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">
                            Reasons of Cancellation:
                          </label>
                          <select
                            value={reason}
                            onChange={handleReasonChange}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          >
                            <option value="">Select Reason</option>
                            <option value="Patient no-show">Patient no-show</option>
                            <option value="Dentist unavailable">Dentist unavailable</option>
                            <option value="Refund">Refund</option>
                          </select>
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Note:</label>
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                    </div>
                    {showRefund && (
                      <div className="col-sm-6">
                        <h4 className="text-xl font-bold" style={{ color: "#00458B" }}>Refund Information</h4>
                        <hr />
                        <br />
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Method Refund:</label>
                          <select
                            name="refund_method"
                            value={refundMethod}
                            onChange={(e) => setRefundMethod(e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          >
                            <option value="">Select Method</option>
                            <option value="Cash">Cash</option>
                            <option value="GCash">GCash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">
                            Upload Photo of Proof of Refund
                          </label>
                          <input
                            type="file"
                            name="refund_photo"
                            accept="image/*"
                            onChange={(e) => setRefundPhoto(e.target.files[0])}
                          />
                        </div>
                      </div>
                    )}
                    <div className="col-sm-6">
                      
                    </div>
                    <div className="col-sm-6">
                      <button
                        onClick={handleSave}
                        className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminScheduleCancel;
