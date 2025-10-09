import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "../context/AppointmentContext";
import axios from "axios";
import { AlertCircle } from "lucide-react";

const Appointment = () => {
  const navigate = useNavigate();
  const { appointmentData, updateAppointment } = useAppointment();

  // Availability checking states
  const [bookedSlots, setBookedSlots] = useState({});
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [dentists, setDentists] = useState([]);

  // ✅ Popup state and fade animation (same as AppointmentSubmit)
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

  const timeSlots = [
    "9:00AM", "10:00AM", "11:00AM", "12:00PM",
    "1:00PM", "2:00PM", "3:00PM", "4:00PM", "5:00PM",
  ];

  // Fetch dentists on component mount
  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/dentists");
        setDentists(response.data);
      } catch (err) {
        console.error("Error fetching dentists:", err);
      }
    };
    fetchDentists();
  }, []);

  const validateForm = () => {
    const requiredFields = [
      "procedure_type",
      "pref_date",
      "pref_time",
      "p_fname",
      "p_lname",
      "p_home_address",
      "p_email",
      "p_contact_no",
      "p_gender",
      "p_date_birth",
      "p_blood_type",
    ];

    const missingFields = requiredFields.filter(
      (field) => !appointmentData[field] || appointmentData[field].trim() === ""
    );

    if (missingFields.length > 0) {
      showPopup("Please fill out all required fields before continuing.", "error");
      return false;
    }

    // Validate contact number format
    if (!/^[0-9]{11}$/.test(appointmentData.p_contact_no)) {
      showPopup("Please enter a valid 11-digit contact number.", "error");
      return false;
    }

    return true;
  };

  // Fetch appointments when procedure type changes (to check availability)
  useEffect(() => {
    if (appointmentData.procedure_type) {
      fetchAppointments();
    }
  }, [appointmentData.procedure_type]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth/appointments/all");
      const appointments = response.data;

      // Filter for active appointments (not cancelled or done)
      const activeAppointments = appointments.filter(apt => {
        return apt.appointment_status !== 'cancelled' &&
          apt.appointment_status !== 'done';
      });

      const slotsByDate = {};
      activeAppointments.forEach(apt => {
        // Normalize the date to YYYY-MM-DD format
        let date = apt.pref_date;
        if (typeof date === 'string' && date.includes('T')) {
          date = date.split('T')[0];
        }

        if (!slotsByDate[date]) slotsByDate[date] = [];
        slotsByDate[date].push(apt.pref_time);
      });

      // Find dates where ALL time slots are booked
      const fullyBooked = Object.keys(slotsByDate).filter(date =>
        slotsByDate[date].length >= timeSlots.length
      );

      setBookedSlots(slotsByDate);
      setFullyBookedDates(fullyBooked);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const getAvailableTimeSlots = () => {
    if (!appointmentData.pref_date) return timeSlots;

    const bookedTimesForDate = bookedSlots[appointmentData.pref_date] || [];
    return timeSlots.filter(slot => !bookedTimesForDate.includes(slot));
  };

  const isDateFullyBooked = (date) => {
    return fullyBookedDates.includes(date);
  };

  const handleDateChange = (selectedDate) => {
    if (isDateFullyBooked(selectedDate)) {
      showPopup("This date is fully booked. Please choose another date.", "error");
      return;
    }

    updateAppointment("pref_date", selectedDate);
    updateAppointment("pref_time", ""); // Reset time when date changes
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    updateAppointment("photos", files);
  };

  const handleTimeChange = (selectedTime) => {
    const bookedTimesForDate = bookedSlots[appointmentData.pref_date] || [];
    if (bookedTimesForDate.includes(selectedTime)) {
      showPopup("This time slot is already booked. Please choose another time.", "error");
      return;
    }
    updateAppointment("pref_time", selectedTime);
  };


  const handleDateOfBirthChange = (dateValue) => {
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
        backgroundPosition: "center"
      }}
    >
      {/* ✅ Popup Notification (same as AppointmentSubmit) */}
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
      <div className="w-full max-w-5xl bg-white p-6 sm:p-10 rounded-lg shadow-lg">
        <h2 className="text-[#00c3b8] text-xl sm:text-2xl font-bold mb-2 text-center">
          APPOINTMENT REQUEST FORM
        </h2>
        <p className="text-[#00458B] text-xs sm:text-sm mb-6 text-center">
          Please note that your appointment is not yet confirmed. Our dental
          clinic will get in touch with you shortly to confirm the schedule.
        </p>

        <div className="col-sm-12">
          <hr></hr>
          <br></br>
          <p className="text-[#00458b] text-xl font-bold">Consultation Details</p>
          <br></br>
          <div className="row">
            <div className="col-sm-6">
              {/* Procedure */}
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Procedure
                </label>
                <select
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.procedure_type}
                  onChange={(e) => {
                    updateAppointment("procedure_type", e.target.value);
                    updateAppointment("pref_date", "");
                    updateAppointment("pref_time", "");
                  }}
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
                <p style={{ color: "gray" }} className="text-xs mt-1">
                  For Orthodontic Treatment services, please contact our clinic first to arrange an agreement.
                </p>
              </div>

              {/* Availability Alert */}
              {!appointmentData.procedure_type && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-xs text-blue-800">
                    Please select a procedure first to check available dates and times.
                  </p>
                </div>
              )}

            </div>
            <div className="col-sm-6">
              {/* Preferred Date */}
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.pref_date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={!appointmentData.procedure_type}
                  required
                />
                {appointmentData.procedure_type && fullyBookedDates.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Some dates are fully booked and cannot be selected
                  </p>
                )}
              </div>

              {/* Preferred Time */}
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Preferred Time
                </label>
                <select
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  value={appointmentData.pref_time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={!appointmentData.pref_date}
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => {
                    const bookedTimesForDate = bookedSlots[appointmentData.pref_date] || [];
                    const isBooked = bookedTimesForDate.includes(time);
                    return (
                      <option
                        key={time}
                        value={time}
                        disabled={isBooked}
                        style={{
                          color: isBooked ? "gray" : "black",
                          backgroundColor: isBooked ? "#f2f2f2" : "white",
                        }}
                      >
                        {time} {isBooked ? "(Booked)" : ""}
                      </option>
                    );
                  })}
                </select>

                {/* Availability alerts */}
                {appointmentData.pref_date && getAvailableTimeSlots().length === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2 flex items-start gap-2">
                    <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-red-700">
                      No available time slots for this date. Please select another date.
                    </p>
                  </div>
                )}

                {appointmentData.pref_date && getAvailableTimeSlots().length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {getAvailableTimeSlots().length} time slot(s) available
                  </p>
                )}
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
          <br></br>
          <hr></hr>
          <br></br>
          <p className="text-[#00458b] text-xl font-bold">Personal Information</p>
          <br></br>
        </div>
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
                onChange={(e) => handleDateOfBirthChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
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
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none bg-gray-50"
              />
            </div>
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
        </div>

        <div className="col-sm-12">
          <div className="row">
            <div className="col-sm-6">

            </div>
            <div className="col-sm-6">
              {/* Next Button */}
              <div className="mt-6">
                <button
                  className={`font-semibold px-6 py-2 rounded-full w-full ${validateForm
                      ? "bg-[#00c3b8] text-white hover:bg-teal-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  onClick={() => {
                    if (!validateForm()) return;

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