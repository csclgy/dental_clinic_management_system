import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext"; // adjust path

const Appointment2 = () => {
  const navigate = useNavigate();
  const { appointmentData, updateAppointment } = useAppointment(); // ✅ include updateAppointment

  const handleSubmit = () => {
    console.log("Final Appointment Data:", appointmentData);
    navigate("/appointmentsubmit"); // Go to confirmation page
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
                checked={appointmentData.payment_method === "Yes"}
                onChange={() => updateAppointment("payment_method", "Yes")}
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
                checked={appointmentData.payment_method === "No"}
                onChange={() => updateAppointment("payment_method", "No")}
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
        {appointmentData.payment_method === "Yes" && (
          <>
            <h2 className="text-[#00458B] text-sm my-6">
              Scan this QR Code with your GCash App
            </h2>
            <img src="gcashcode.png" alt="Gcash QR Code" className="w-full" />

            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Upload your receipt here
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  updateAppointment("downpayment_proof", e.target.files[0])
                }
              />
            </div>
          </>
        )}

        <div className="col-sm-12">
          <center>
            <button
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mt-4"
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
