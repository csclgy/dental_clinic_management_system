import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext";
import axios from "axios";

const AppointmentSubmit = () => {
  const { appointmentData } = useAppointment();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token"); 

    const res = await axios.post(
        "http://localhost:3000/auth/appointments",
        {
            procedure_type,
            date,
            time,
            downpayment,
            photos,
            receipt,
        },
        {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
        );

        console.log("Appointment saved:", res.data);
    } catch (err) {
        console.error("Error submitting appointment:", err.response?.data || err.message);
    }
    };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
      <div className="w-[40%] bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl font-bold mb-2">
          APPOINTMENT REQUEST FORM
        </h2>
        <br />
        <b>
          <h3 className="text-[#00458B] text-2xl font-bold mb-2">
            Thank you for booking with us!
          </h3>
        </b>
        <p className="text-[#00458B] text-sm mb-6">
          Please note that your appointment is not yet confirmed. Our dental
          clinic will get in touch with you shortly to confirm the schedule.
        </p>

        {/* Appointment Summary */}
        <div className="text-left mb-6">
        <h4 className="text-[#00c3b8] font-bold text-lg mb-2">Summary</h4>
        <p>
            <b>Procedure:</b> {appointmentData?.procedure || "N/A"}
        </p>
        <p>
            <b>Date:</b> {appointmentData?.date || "N/A"}
        </p>
        <p>
            <b>Time:</b> {appointmentData?.time || "N/A"}
        </p>
        <p>
            <b>Downpayment:</b> {appointmentData?.downpayment || "N/A"}
        </p>

        {/* Photos */}
        {appointmentData?.photos?.length > 0 ? (
            <div>
            <b>Uploaded Files:</b>
            <ul>
                {appointmentData.photos.map((file, idx) => (
                <li key={idx}>{file.name}</li>
                ))}
            </ul>
            </div>
        ) : (
            <p>
            <b>Uploaded Files:</b> None
            </p>
        )}

        {/* Receipt */}
        {appointmentData?.receipt && (
            <p>
            <b>Receipt:</b> {appointmentData.receipt.name}
            </p>
        )}
        </div>

        <div className="col-sm-12">
          <center>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            <button
                type="submit"
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full"
                onClick={handleSubmit}
            >
                Submit
          </button>
          </center>
        </div>
      </div>
      <br />
      <br />
    </div>
  );
};

export default AppointmentSubmit;
