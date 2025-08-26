import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext"; // adjust path

const appointment = () => {
  const navigate = useNavigate();
  const { appointmentData, updateAppointment } = useAppointment();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    updateAppointment("photos", files);
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

        {/* Procedure */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Procedure
          </label>
          <select
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            value={appointmentData.procedure_type}
            onChange={(e) => updateAppointment("procedure_type", e.target.value)}
          >
            <option value="">Select a procedure</option>
            <option value="TMJ TREATMENT">TMJ TREATMENT</option>
            <option value="ORTHODONTIC TREATMENT">ORTHODONTIC TREATMENT</option>
            <option value="MYOFUNCTIONAL TREATMENT">MYOFUNCTIONAL TREATMENT</option>
            <option value="ROOT CANAL TREATMENT">ROOT CANAL TREATMENT</option>
            <option value="ORAL PROPHYLAXIS">ORAL PROPHYLAXIS</option>
            <option value="TOOTH EXTRACTION">TOOTH EXTRACTION</option>
            <option value="ODONTECTOMY">ODONTECTOMY</option>
            <option value="RESTORATIVE FILLING">RESTORATIVE FILLING</option>
            <option value="FLOURIDE TREATMENT">FLOURIDE TREATMENT</option>
            <option value="DENTURES">DENTURES</option>
            <option value="TEETH WHITENING">TEETH WHITENING</option>
            <option value="DENTAL X-RAY">DENTAL X-RAY</option>
          </select>
        </div>

        {/* Date */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Preferred Date
          </label>
          <input
            type="date"
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            value={appointmentData.pref_date}
            onChange={(e) => updateAppointment("pref_date", e.target.value)}
          />
        </div>

        {/* Time */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Preferred Time
          </label>
          <select
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            value={appointmentData.time}
            onChange={(e) => updateAppointment("time", e.target.value)}
          >
            <option value="">Select a time</option>
            <option value="9:00AM">9:00AM</option>
            <option value="10:00AM">10:00AM</option>
            <option value="11:00AM">11:00AM</option>
            <option value="12:00PM">12:00PM</option>
            <option value="1:00PM">1:00PM</option>
            <option value="2:00PM">2:00PM</option>
            <option value="3:00PM">3:00PM</option>
            <option value="4:00PM">4:00PM</option>
            <option value="5:00PM">5:00PM</option>
          </select>
        </div>

        {/* Upload */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Upload Photos / X-Ray / Dental Records
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none 
              file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
              file:text-sm file:font-semibold file:bg-[#00458b] file:text-white 
              hover:file:bg-[#003567]"
          />
        </div>

        {/* Next */}
        <div className="col-sm-12">
          <button
            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
            onClick={() => navigate("/appointment2")}
          >
            Next
          </button>
        </div>
      </div>
      <br />
      <br />
    </div>
  );
};

export default appointment;
