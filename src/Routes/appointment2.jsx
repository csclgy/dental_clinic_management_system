import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext"; // adjust path

const Appointment2 = () => {
  const navigate = useNavigate();
  const { appointmentData, updateAppointment } = useAppointment();

  const handleSubmit = () => {
    console.log("Final Appointment Data:", appointmentData);
    navigate("/appointmentsubmit"); // Go to confirmation page
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4"
      style={{
      backgroundImage:
        "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center"}}
    >
      <div className="w-full max-w-lg bg-white p-6 sm:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-xl sm:text-2xl font-bold mb-2">
          APPOINTMENT REQUEST FORM
        </h2>
        <p className="text-[#00458B] text-xs sm:text-sm mb-6">
          Please note that your appointment is not yet confirmed. Our dental
          clinic will get in touch with you shortly to confirm the schedule.
        </p>

        <p className="text-[#00458B] text-sm sm:text-base font-semibold mb-6">
          Do you want to make a downpayment to reserve your appointment?
        </p>

        {/* Radio buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className="flex items-center justify-center border border-[#00c3b8] rounded-full py-2 cursor-pointer hover:bg-[#e6f9f8]">
            <input
              type="radio"
              id="yes"
              name="downpayment"
              checked={appointmentData.payment_method === "Yes"}
              onChange={() => updateAppointment("payment_method", "Yes")}
              className="mr-2"
            />
            Yes
          </label>

          <label className="flex items-center justify-center border border-[#00c3b8] rounded-full py-2 cursor-pointer hover:bg-[#e6f9f8]">
            <input
              type="radio"
              id="no"
              name="downpayment"
              checked={appointmentData.payment_method === "No"}
              onChange={() => updateAppointment("payment_method", "No")}
              className="mr-2"
            />
            No
          </label>
        </div>

        {/* If Yes → show GCash QR and file upload */}
        {appointmentData.payment_method === "Yes" && (
          <>
            <h2 className="text-[#00458B] text-sm sm:text-base my-6">
              Scan this QR Code with your GCash App
            </h2>
            <img
              src="gcashcode.png"
              alt="Gcash QR Code"
              className="w-full max-w-xs mx-auto mb-6"
            />

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
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none 
                  file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                  file:text-sm file:font-semibold file:bg-[#00458b] file:text-white 
                  hover:file:bg-[#003567]"
              />
            </div>
          </>
        )}

        {/* Next Button */}
        <button
          className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mt-6"
          onClick={handleSubmit}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Appointment2;