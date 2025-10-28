import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext";
import axios from "axios";

const AppointmentSubmit = () => {
  const { appointmentData, updateAppointment } = useAppointment();
  const navigate = useNavigate();

  // ✅ Popup state and fade animation (same as ProfileChange)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // ✅ Popup function
  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);

    // Fade out before removing
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // 1️⃣ Force payment_method = cash if not dentures
      if (appointmentData.procedure_type !== "Dentures") {
        appointmentData.payment_method = "cash";
        appointmentData.downpayment_proof = null;
      }

      // 2️⃣ Append text fields
      Object.keys(appointmentData).forEach((key) => {
        if (key !== "photos" && key !== "downpayment_proof") {
          formData.append(key, appointmentData[key]);
        }
      });

      // 3️⃣ Append photos
      appointmentData.photos.forEach((file) => {
        formData.append("photos", file);
      });

      // 4️⃣ Append downpayment proof if applicable
      if (
        appointmentData.procedure_type === "Dentures" &&
        appointmentData.downpayment_proof
      ) {
        formData.append("downpayment_proof", appointmentData.downpayment_proof);
      }

      await axios.post("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/appointments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ Success popup
      showPopup("Appointment submitted successfully! A confirmation email has been sent.", "success");

      // Reset data
      Object.keys(appointmentData).forEach((key) => {
        if (Array.isArray(appointmentData[key])) {
          updateAppointment(key, []);
        } else {
          updateAppointment(key, key === "downpayment_proof" ? null : "");
        }
      });

      // Redirect after 2s
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Error submitting appointment:", err);
      // ❌ Error popup
      showPopup("Failed to submit appointment. Please try again.", "error");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ Popup Notification (copied from ProfileChange) */}
      {popup.show && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
          style={{ zIndex: 9999 }}
        >
          {popup.message}
        </div>
      )}

      <br />
      <div className="w-full sm:w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-xl sm:text-2xl font-bold mb-2">
          APPOINTMENT REQUEST FORM
        </h2>

        <p className="text-[#00458B] text-semibold sm:text-base mb-6">
          Thank you for booking! Your appointment is not yet confirmed.
        </p>

        <hr></hr>
        <br></br>

        {/* Summary */}
        <div className="text-left mb-6 text-sm sm:text-base">
          <h4 className="text-[#00c3b8] font-bold text-base sm:text-lg mb-2">
            Appointment Details
          </h4>
          <p className="text-[#00458B]"><b>Procedure:</b> {appointmentData.procedure_type || "..."}</p>
          <p className="text-[#00458B]"><b>Date:</b> {appointmentData.pref_date || "..."}</p>
          <p className="text-[#00458B]"><b>Time:</b> {appointmentData.pref_time || "..."}</p>
          <p className="text-[#00458B]"><b>Payment Method:</b> {appointmentData.payment_method || "Cash"}</p>

          <h4 className="text-[#00c3b8] font-bold text-base sm:text-lg mt-4 mb-2">
            Patient Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p className="text-[#00458B]"><b>First Name:</b> {appointmentData.p_fname || "..."}</p>
            <p className="text-[#00458B]"><b>Gender:</b> {appointmentData.p_gender || "..."}</p>
            <p className="text-[#00458B]"><b>Last Name:</b> {appointmentData.p_lname || "..."}</p>
            <p className="text-[#00458B]"><b>Date of Birth:</b> {appointmentData.p_date_birth || "..."}</p>
            <p className="text-[#00458B]"><b>Middle Name:</b> {appointmentData.p_mname || "..."}</p>
            <p className="text-[#00458B]"><b>Age:</b> {appointmentData.p_age || "..."}</p>
            <p className="text-[#00458B]"><b>Email:</b> {appointmentData.p_email || "..."}</p>
            <p className="text-[#00458B]"><b>Contact No:</b> {appointmentData.p_contact_no || "..."}</p>
            <p className="text-[#00458B]"><b>Blood Type:</b> {appointmentData.p_blood_type || "..."}</p>
            <p className="sm:col-span-2 text-[#00458B]">
              <b>Home Address:</b> {appointmentData.p_home_address || "..."}
            </p>
          </div>

          <br />

          {/* Uploaded photos */}
          {appointmentData.photos?.length > 0 ? (
            <div className="mt-3">
              <b>Uploaded Files:</b>
              <ul className="list-disc ml-5">
                {appointmentData.photos.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[#00458B]"><b>Uploaded Files:</b> None</p>
          )}

          {/* Downpayment receipt */}
          {appointmentData.downpayment_proof && (
            <div className="mt-3">
              <b>Receipt:</b>
              <img
                src={URL.createObjectURL(appointmentData.downpayment_proof)}
                alt="Downpayment Proof"
                className="mt-2 w-40 sm:w-48 h-auto rounded shadow"
              />
            </div>
          )}
        </div>

        <button
          className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full hover:bg-[#00a9a0] transition"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      <br />
    </div>
  );
};

export default AppointmentSubmit;
