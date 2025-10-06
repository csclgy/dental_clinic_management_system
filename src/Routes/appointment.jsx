import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext"; // adjust path

const Appointment = () => {
  const navigate = useNavigate();
  const { appointmentData, updateAppointment } = useAppointment();

  // ✅ Popup state and fade animation (same as ProfileChange)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // Disable dates and time slots
  const [bookedSlots, setBookedSlots] = useState({});
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const timeSlots = ["9:00AM","10:00AM","11:00AM","12:00PM","1:00PM","2:00PM","3:00PM","4:00PM","5:00PM"];


  // ✅ Reusable popup function
  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);

    // Fade out before removing
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

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

  // ✅ Validation function (updated to use popup instead of alert)
  const validateForm = () => {
    const requiredFields = [
      "pref_date",
      "pref_time",
      "procedure_type",
      "p_fname",
      "p_mname",
      "p_lname",
      "p_home_address",
      "p_email",
      "p_contact_no",
      "p_gender",
      "p_date_birth",
      "p_blood_type",
    ];

    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        showPopup(`Please fill out the required fields.`, "error");
        return false;
      }
    }

    showPopup("All fields are valid! Proceeding...", "success");
    return true;
  };

  useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth/appointments/all");
      const appointments = response.data;

      const activeAppointments = appointments.filter(apt => apt.appointment_status !== 'cancelled' && apt.appointment_status !== 'done');

      const slotsByDate = {};
      activeAppointments.forEach(apt => {
        let date = typeof apt.pref_date === 'string' ? apt.pref_date.split('T')[0] : apt.pref_date;
        if (!slotsByDate[date]) slotsByDate[date] = [];
        slotsByDate[date].push(apt.pref_time);
      });

      const fullyBooked = Object.keys(slotsByDate).filter(date => slotsByDate[date].length >= timeSlots.length);

      setBookedSlots(slotsByDate);
      setFullyBookedDates(fullyBooked);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  fetchAppointments();
}, []);

const getAvailableTimeSlots = () => {
  if (!appointmentData.pref_date) return [];
  const bookedTimes = bookedSlots[appointmentData.pref_date] || [];
  return timeSlots.filter(slot => !bookedTimes.includes(slot));
};

const isDateFullyBooked = (date) => fullyBookedDates.includes(date);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4"
      style={{
      backgroundImage:
        "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center"}}
    >

      {/* ✅ Popup Notification (copied from ProfileChange) */}
      {popup.show && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${
            fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
          } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
          style={{ zIndex: 9999 }}
        >
          {popup.message}
        </div>
      )}
      
      <br />
      <div className="w-full max-w-5xl bg-white p-6 sm:p-10 rounded-lg shadow-lg">
        <h2 className="text-[#00c3b8] text-xl sm:text-2xl font-bold mb-2 text-center">
          APPOINTMENT REQUEST FORM
        </h2>
        <p className="text-[#00458B] text-xs sm:text-sm mb-6 text-center">
          Please note that your appointment is not yet confirmed. Our dental
          clinic will get in touch with you shortly to confirm the schedule.
        </p>

        {/* ================= Appointment Details Section ================= */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#00458b] border-b pb-2 mb-4">
            Appointment Details
          </h3>

          {/* Preferred Date */}
          <div className="mb-4">
            <label className="block text-[#00458b] font-semibold mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              value={appointmentData.pref_date}
              onChange={(e) => {
                const selectedDate = e.target.value;

                if (isDateFullyBooked(selectedDate)) {
                  showPopup("⚠️ This date is fully booked. Please choose another date.", "error");
                  return;
                }

                updateAppointment("pref_date", selectedDate);
                updateAppointment("pref_time", ""); // reset time
              }}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Preferred Time */}
          <div className="mb-4">
            <label className="block text-[#00458b] font-semibold mb-1">
              Preferred Time
            </label>
              <select
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                value={appointmentData.pref_time}
                onChange={(e) => updateAppointment("pref_time", e.target.value)}
                required
                disabled={!appointmentData.pref_date || getAvailableTimeSlots().length === 0}
              >
                <option value="">Select a time</option>
                {getAvailableTimeSlots().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>

              {/* Show warning if no slots available */}
              {appointmentData.pref_date && getAvailableTimeSlots().length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ No available time slots for this date. Please select another date.
                </p>
              )}
          </div>

          {/* Upload */}
          <div className="mb-4">
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

          {/* Procedure */}
          <div className="mb-4">
            <label className="block text-[#00458b] font-semibold mb-1">
              Procedure
            </label>
            <select
              className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              value={appointmentData.procedure_type}
              onChange={(e) => updateAppointment("procedure_type", e.target.value)}
              required
            >
              <option value="">Select a procedure</option>
              <option value="TMJ TREATMENT">TMJ TREATMENT</option>
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
            <p className="text-gray-500 text-sm mt-1">
              For Orthodontic Treatment services, please contact our clinic first to arrange an agreement.
            </p>
          </div>
        </div>

        {/* ================= Personal Details Section ================= */}
        <div>
          <h3 className="text-lg font-bold text-[#00458b] border-b pb-2 mb-4">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              {/* First, Middle, Last, Address, Email, Contact No */}
              {[
                { label: "First Name", key: "p_fname", type: "text" },
                { label: "Middle Name", key: "p_mname", type: "text" },
                { label: "Last Name", key: "p_lname", type: "text" },
                { label: "Home Address", key: "p_home_address", type: "text" },
                { label: "Email", key: "p_email", type: "email" },
                { label: "Contact Number", key: "p_contact_no", type: "text" },
              ].map((field) => (
                <div key={field.key} className="mb-4">
                  <label className="block text-[#00458b] font-semibold mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                    value={appointmentData[field.key]}
                    onChange={(e) => {
                      if (field.key === "p_contact_no") {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 11) updateAppointment(field.key, value);
                      } else {
                        updateAppointment(field.key, e.target.value);
                      }
                    }}
                    required={field.key === "p_contact_no"}
                    pattern={field.key === "p_contact_no" ? "[0-9]{11}" : undefined}
                    maxLength={field.key === "p_contact_no" ? 11 : undefined}
                    placeholder={field.key === "p_contact_no" ? "Enter 11-digit number" : ""}
                  />
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div>
              {/* Gender */}
              <div className="mb-4">
                <label className="block text-[#00458b] font-semibold mb-1">Gender</label>
                <select
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.p_gender}
                  onChange={(e) => updateAppointment("p_gender", e.target.value)}
                  required
                >
                  <option value="">-- Select gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="mb-4">
                <label className="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={appointmentData.p_date_birth}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  required
                />
              </div>

              {/* Age */}
              <div className="mb-4">
                <label className="block text-[#00458b] font-semibold mb-1">Age</label>
                <input
                  type="number"
                  min={1}
                  value={appointmentData.p_age}
                  readOnly
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>

              {/* Blood Type */}
              <label className="block text-[#00458b] font-semibold mb-1">
                Blood Type
              </label>
              <select
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                value={appointmentData.p_blood_type}
                onChange={(e) => updateAppointment("p_blood_type", e.target.value)}
                required
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
          </div>
        </div>

        <div className="col-sm-12">
          <div className="row">
            <div className="col-sm-9">

            </div>
            <div className="col-sm-3">
            {/* ================= Next Button ================= */}
            <div className="mt-6">
              <button
                className={`font-semibold px-6 py-2 rounded-lg w-full ${
                  appointmentData.procedure_type
                    ? "bg-[#00c3b8] text-white hover:bg-teal-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!appointmentData.procedure_type}
                onClick={() => {
                  if (!validateForm()) return; // stop if any field is empty
                  
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
          </div>
        </div>
      </div>
      <br />
    </div>
  );
};

export default Appointment;
