import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext"; // adjust path

const Appointment = () => {
  const navigate = useNavigate();
  const { appointmentData, updateAppointment } = useAppointment();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    updateAppointment("photos", files);
  };

  const handleDateChange = (dateValue) => {
    updateAppointment("p_date_birth", dateValue);

    if (dateValue) {
      const today = new Date();
      const birthDate = new Date(dateValue);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updateAppointment("p_age", age);
    } else {
      updateAppointment("p_age", "");
    }
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
      <br />
      <div className="w-full max-w-5xl bg-white p-6 sm:p-10 rounded-lg shadow-lg">
        <h2 className="text-[#00c3b8] text-xl sm:text-2xl font-bold mb-2 text-center">
          APPOINTMENT REQUEST FORM
        </h2>
        <p className="text-[#00458B] text-xs sm:text-sm mb-6 text-center">
          Please note that your appointment is not yet confirmed. Our dental
          clinic will get in touch with you shortly to confirm the schedule.
        </p>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
          {[
            { label: "First Name", key: "p_fname", type: "text" },
            { label: "Middle Name", key: "p_mname", type: "text" },
            { label: "Last Name", key: "p_lname", type: "text" },
            { label: "Home Address", key: "p_home_address", type: "text" },
            { label: "Email", key: "p_email", type: "email" },
            { label: "Contact Number", key: "p_contact_no", type: "text" },
          ].map((field) => (
            <div key={field.key} className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                value={appointmentData[field.key]}
                onChange={(e) => {
                  // Optional: allow only numbers for Contact Number
                  if (field.key === "p_contact_no") {
                    const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                    if (value.length <= 11) updateAppointment(field.key, value);
                  } else {
                    updateAppointment(field.key, e.target.value);
                  }
                }}
                required={field.key === "p_contact_no"} // make required
                pattern={field.key === "p_contact_no" ? "[0-9]{11}" : undefined} // require 11 digits
                maxLength={field.key === "p_contact_no" ? 11 : undefined} // limit to 11 digits
                placeholder={field.key === "p_contact_no" ? "Enter 11-digit number" : ""}
              />
            </div>
          ))}
              <label className="block text-[#00458b] font-semibold mb-1">
                Blood Type
              </label>
              <select
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                value={appointmentData.p_blood_type}
                onChange={(e) => updateAppointment("p_blood_type", e.target.value)}
              >
                <option value="">-- Select Blood Type --</option>
                <option value="O">O</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A">A</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B">B</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB">AB</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
          </div>

          {/* Right Column */}
          <div>
            {/* Gender */}
            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Gender
              </label>
              <select
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                value={appointmentData.p_gender}
                onChange={(e) => updateAppointment("p_gender", e.target.value)}
              >
                <option value="">-- Select gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={appointmentData.p_date_birth}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]} // restrict to past dates
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              />
            </div>

            {/* Age */}
            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Age
              </label>
              <input
                type="number"
                min={1}
                value={appointmentData.p_age}
                readOnly
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              />
            </div>

            {/* Procedure */}
            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Procedure
              </label>
              <select
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                value={appointmentData.procedure_type}
                onChange={(e) =>
                  updateAppointment("procedure_type", e.target.value)
                }
              >
                <option value="">Select a procedure</option>
                <option value="TMJ TREATMENT">TMJ TREATMENT</option>
                {/* <option value="ORTHODONTIC TREATMENT">
                  ORTHODONTIC TREATMENT
                </option> */}
                <option value="MYOFUNCTIONAL TREATMENT">
                  MYOFUNCTIONAL TREATMENT
                </option>
                <option value="ROOT CANAL TREATMENT">
                  ROOT CANAL TREATMENT
                </option>
                <option value="ORAL PROPHYLAXIS">ORAL PROPHYLAXIS</option>
                <option value="TOOTH EXTRACTION">TOOTH EXTRACTION</option>
                <option value="ODONTECTOMY">ODONTECTOMY</option>
                <option value="RESTORATIVE FILLING">
                  RESTORATIVE FILLING
                </option>
                <option value="FLOURIDE TREATMENT">FLOURIDE TREATMENT</option>
                <option value="DENTURES">DENTURES</option>
                <option value="TEETH WHITENING">TEETH WHITENING</option>
                <option value="DENTAL X-RAY">DENTAL X-RAY</option>
              </select>
              <p style={{color:"gray"}}>For Orthodontic Treatment services, please contact our clinic first to arrange an agreement.</p>
            </div>

          {/* Preferred Date */}
          <div className="mb-4 text-left">
            <label className="block text-[#00458b] font-semibold mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              value={appointmentData.pref_date}
              onChange={(e) => updateAppointment("pref_date", e.target.value)}
              min={new Date().toISOString().split("T")[0]} // prevents selecting past dates
              required
            />
          </div>

            {/* Preferred Time */}
            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Preferred Time
              </label>
              <select
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                value={appointmentData.pref_time}
                onChange={(e) => updateAppointment("pref_time", e.target.value)}
              >
                <option value="">Select a time</option>
                {[
                  "9:00AM",
                  "10:00AM",
                  "11:00AM",
                  "12:00PM",
                  "1:00PM",
                  "2:00PM",
                  "3:00PM",
                  "4:00PM",
                  "5:00PM",
                ].map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload */}
            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Upload Photos / X-Ray / Dental Records: (Optional)
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
          </div>
        </div>

        {/* Next Button */}
        <div className="mt-6">
          <button
            className={`font-semibold px-6 py-2 rounded-full w-full ${
              appointmentData.procedure_type
                ? "bg-[#00c3b8] text-white hover:bg-teal-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!appointmentData.procedure_type}
            onClick={() => {
              if (appointmentData.procedure_type === "ORTHODONTIC TREATMENT") {
                navigate("/appointment2");
              } else {
                navigate("/appointmentsubmit");
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
      <br />
    </div>
  );
};

export default Appointment;
