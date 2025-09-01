import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext";
import axios from "axios";

const AppointmentSubmit = () => {
  const { appointmentData, updateAppointment } = useAppointment();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append text fields
      Object.keys(appointmentData).forEach((key) => {
        if (key !== "photos" && key !== "downpayment_proof") {
          formData.append(key, appointmentData[key]);
        }
      });

      // Append multiple photos to separate table
      appointmentData.photos.forEach((file) => {
        formData.append("photos", file);
      });

      // Append downpayment receipt
      if (appointmentData.downpayment_proof) {
        formData.append("downpayment_proof", appointmentData.downpayment_proof);
      }

      await axios.post("http://localhost:3000/auth/appointments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Appointment submitted successfully!");

      // Reset context data
      Object.keys(appointmentData).forEach((key) => {
        if (Array.isArray(appointmentData[key])) {
          updateAppointment(key, []);
        } else {
          updateAppointment(key, key === "downpayment_proof" ? null : "");
        }
      });

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Error submitting appointment:", err);
      setErrorMessage("Failed to submit appointment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4">
      <div className="w-full sm:w-4/5 md:w-2/3 lg:w-1/2 xl:w-2/5 bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-xl sm:text-2xl font-bold mb-2">
          APPOINTMENT REQUEST FORM
        </h2>

        <p className="text-[#00458B] text-sm sm:text-base mb-6">
          Thank you for booking! Your appointment is not yet confirmed.
        </p>

        {/* Summary */}
        <div className="text-left mb-6 text-sm sm:text-base">
          <h4 className="text-[#00c3b8] font-bold text-base sm:text-lg mb-2">
            Summary
          </h4>
          <p><b>Procedure:</b> {appointmentData.procedure_type || "N/A"}</p>
          <p><b>Date:</b> {appointmentData.pref_date || "N/A"}</p>
          <p><b>Time:</b> {appointmentData.pref_time || "N/A"}</p>
          <p><b>Payment Method:</b> {appointmentData.payment_method || "N/A"}</p>

          {/* Patient Info */}
          <h4 className="text-[#00c3b8] font-bold text-base sm:text-lg mt-4 mb-2">
            Patient Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p><b>First Name:</b> {appointmentData.p_fname || "N/A"}</p>
            <p><b>Gender:</b> {appointmentData.p_gender || "N/A"}</p>
            <p><b>Last Name:</b> {appointmentData.p_lname || "N/A"}</p>
            <p><b>Date of Birth:</b> {appointmentData.p_date_birth || "N/A"}</p>
            <p><b>Middle Name:</b> {appointmentData.p_mname || "N/A"}</p>
            <p><b>Age:</b> {appointmentData.p_age || "N/A"}</p>
            <br></br>
            <p className="sm:col-span-2">
              <b>Home Address:</b> {appointmentData.p_home_address || "N/A"}
            </p>
            <p><b>City:</b> {appointmentData.city || "N/A"}</p>
            <p><b>Email:</b> {appointmentData.p_email || "N/A"}</p>
            <p><b>Province:</b> {appointmentData.province || "N/A"}</p>
            <p><b>Contact No:</b> {appointmentData.p_contact_no || "N/A"}</p>
            <br></br>
            <p><b>Blood Type:</b> {appointmentData.p_blood_type || "N/A"}</p>
          </div>
          <br></br>

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
            <p><b>Uploaded Files:</b> None</p>
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

        {/* Error & Success */}
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

        <button
          className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full hover:bg-[#00a9a0] transition"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default AppointmentSubmit;
