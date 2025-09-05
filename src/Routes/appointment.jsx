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

  const handleDateChange = (dateValue) => {
    updateAppointment("p_date_birth", dateValue);

    if (dateValue) {
      const today = new Date();
      const birthDate = new Date(dateValue);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--; // subtract one if birthday hasn't occurred yet this year
      }
      updateAppointment("p_age", age);
    } else {
      updateAppointment("p_age", "");
    }
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
      <div className="w-[50%] bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl font-bold mb-2">
          APPOINTMENT REQUEST FORM
        </h2>
        <p className="text-[#00458B] text-sm mb-6">
          Please note that your appointment is not yet confirmed. Our dental
          clinic will get in touch with you shortly to confirm the schedule.
        </p>
        <br />

        <div className="col-sm-12">
          <div className="row">
            <div className="col-sm-6">
              {/* Patient Info */}
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_fname}
                  onChange={(e) => updateAppointment("p_fname", e.target.value)}
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Middle Name</label>
                <input
                  type="text"
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_mname}
                  onChange={(e) => updateAppointment("p_mname", e.target.value)}
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_lname}
                  onChange={(e) => updateAppointment("p_lname", e.target.value)}
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Home Address</label>
                <input
                  type="text"
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_home_address}
                  onChange={(e) => updateAppointment("p_home_address", e.target.value)}
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_email}
                  onChange={(e) => updateAppointment("p_email", e.target.value)}
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Contact Number</label>
                <input
                  type="text"
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_contact_no}
                  onChange={(e) => updateAppointment("p_contact_no", e.target.value)}
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Blood Type</label>
                <input
                  type="text"
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_blood_type}
                  onChange={(e) => updateAppointment("p_blood_type", e.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Gender</label>
                <select
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_gender}
                  onChange={(e) => updateAppointment("p_gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={appointmentData.p_date_birth}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">Age</label>
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
                  value={appointmentData.pref_time}
                  onChange={(e) => updateAppointment("pref_time", e.target.value)}
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
            </div>
          </div>
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
