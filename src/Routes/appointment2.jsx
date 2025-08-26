import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext"; // adjust path

const Appointment2 = () => {
  const navigate = useNavigate();
  const { appointmentData, updateAppointment } = useAppointment();
  const [receipt, setReceipt] = useState(null);

  const handleSubmit = () => {
    // 👇 combine everything into one object
    const finalData = {
      ...appointmentData,
      downpayment: appointmentData.downpayment,
      receipt: receipt,
    };

    console.log("Final Appointment Data:", finalData);

    navigate("/appointmentsubmit"); // Go to confirmation page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
      <br />
      <br />
      <div className="w-[35%] bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl font-bold mb-2">
          APPOINTMENT REQUEST FORM
        </h2>
        <p className="text-[#00458B] text-sm mb-6">
          Please note that your appointment is not yet confirmed. Our dental
          clinic will get in touch with you shortly to confirm the schedule.
        </p>
        <br />
        <b>
          <p className="text-[#00458B] text-sm mb-6">
            Do you want to make a downpayment to reserve your appointment?
          </p>
        </b>

        <div className="col-sm-12">
          <div className="row">
            <div className="col-sm-6">
              <input
                type="radio"
                id="yes"
                name="downpayment"
                value="Yes"
                checked={appointmentData.downpayment === "Yes"}
                onChange={() => updateAppointment("downpayment", "Yes")}
              />
              <label htmlFor="yes" className="ml-2">
                Yes
              </label>
            </div>
            <div className="col-sm-6">
              <input
                type="radio"
                id="no"
                name="downpayment"
                value="No"
                checked={appointmentData.downpayment === "No"}
                onChange={() => updateAppointment("downpayment", "No")}
              />
              <label htmlFor="no" className="ml-2">
                No
              </label>
            </div>
          </div>
        </div>

        <br />
        <br />

        {/* If Yes → show GCash QR and file upload */}
        {appointmentData.downpayment === "Yes" && (
          <>
            <h2 className="text-[#00458B] text-sm mb-6">
              Scan this QR Code with your Gcash App
            </h2>
            <img
              src="gcashcode.png"
              alt="Gcash QR Code"
              style={{ width: "100%" }}
            />

            <br />
            <br />
            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Upload your receipt here
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReceipt(e.target.files[0])}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              />
            </div>
          </>
        )}

        <div className="col-sm-12">
          <center>
            <button
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
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

export default Appointment2;
