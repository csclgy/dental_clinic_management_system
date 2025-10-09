import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

const AdminConsultationAdd = () => {
  const location = useLocation();
  const patient = location.state?.patient;
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  // Form states
  const [dateOfVisit, setDateOfVisit] = useState("");
  const [dentist, setDentist] = useState("");
  const [procedureType, setProcedureType] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [dentists, setDentists] = useState([]);

  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // Disable dates and time slots
  const [bookedSlots, setBookedSlots] = useState({});
  const [fullyBookedDates, setFullyBookedDates] = useState([]);

  const timeSlots = [
    "8:00AM", "9:00AM", "10:00AM", "11:00AM", "12:00PM",
    "1:00PM", "2:00PM", "3:00PM", "4:00PM", "5:00PM",
  ];

  useEffect(() => {
    if (dentist) {
      fetchAppointments();
    }
  }, [dentist]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth/appointments/all");
      const appointments = response.data;

      // Filter for active appointments for selected dentist
      const activeAppointments = appointments.filter(apt => {
        // Normalize date format (handle both Date objects and strings)
        const aptDate = typeof apt.pref_date === 'string'
          ? apt.pref_date.split('T')[0]  // Handle ISO format
          : apt.pref_date;

        return apt.appointment_status !== 'cancelled' &&
          apt.appointment_status !== 'done' &&
          apt.attending_dentist === dentist;
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
    if (!dateOfVisit) return [];

    const bookedTimesForDate = bookedSlots[dateOfVisit] || [];

    // DEBUG: Log to see what's happening
    console.log("Selected date:", dateOfVisit);
    console.log("Booked slots object:", bookedSlots);
    console.log("Booked times for selected date:", bookedTimesForDate);
    console.log("Available time slots:", timeSlots.filter(slot => !bookedTimesForDate.includes(slot)));

    return timeSlots.filter(slot => !bookedTimesForDate.includes(slot));
  };
  const isDateFullyBooked = (date) => {
    return fullyBookedDates.includes(date);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (isDateFullyBooked(selectedDate)) {
      showPopup("⚠️ This date is fully booked. Please choose another date.", "error");
      return;
    }

    setDateOfVisit(selectedDate);
    setPreferredTime("");
  };

  const handleSaveConsultation = async () => {
    if (!dateOfVisit || !dentist || !procedureType || !preferredTime) {
      showPopup("Please fill in all fields", "error");
      return;
    }

    // Double-check date isn't fully booked
    if (isDateFullyBooked(dateOfVisit)) {
      showPopup("Selected date is no longer available. Please choose another date.", "error");
      return;
    }

    // Check if selected time is still available
    const availableSlots = getAvailableTimeSlots();
    if (!availableSlots.includes(preferredTime)) {
      showPopup("Selected time slot is no longer available. Please choose another time.", "error");
      setPreferredTime("");
      return;
    }

    try {
      const payload = {
        procedure_type: procedureType,
        pref_date: dateOfVisit,
        pref_time: preferredTime,
        attending_dentist: dentist,
        appointment_status: "pending",
        user_name: patient?.user_name,
        p_blood_type: patient?.blood_type,
        p_fname: patient?.fname,
        p_mname: patient?.mname,
        p_lname: patient?.lname,
        p_gender: patient?.gender,
        p_age: patient?.age,
        p_date_birth: patient?.date_birth,
        p_home_address: patient?.home_address,
        p_email: patient?.email,
        p_contact_no: patient?.contact_no,
      };

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/auth/createconsultation", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showPopup("Consultation created successfully!", "success");
      // Wait 3 seconds before navigating
      setTimeout(() => {
        navigate("/adminpatients");
      }, 3000);
    } catch (err) {
      console.error("Error saving consultation:", err);
      showPopup("Failed to create consultation", "error");
    }
  };

  const procedureTypes = [
    "TMJ TREATMENT",
    "ODONTECTOMY",
    "ORTHODONTIC TREATMENT",
    "RESTORATIVE FILLING",
    "MYOFUNCTIONAL TREATMENT",
    "FLOURIDE TREATMENT",
    "ROOT CANAL TREATMENT",
    "DENTURES",
    "ORAL PROPHYLAXIS",
    "TEETH WHITENING",
    "TOOTH EXTRACTION",
    "DENTAL X-RAY",
  ];

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/auth/dentists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDentists(res.data);
      } catch (err) {
        console.error("Error fetching dentists:", err);
      }
    };
    fetchDentists();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/inventorydashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Inventory Dashboard
              </Link>
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <span className="flex items-center gap-2">
                  <i className="fa fa-book"></i> Ledger
                </span>
                <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
              </button>

              {isLedgerOpen && (
                <div className="ml-6 flex flex-col gap-1 text-sm">
                  <Link
                    to="/admincoa"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Chart of Accounts
                  </Link>
                  <Link
                    to="/adminjournal"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Journal Entries
                  </Link>
                  <Link
                    to="/adminsubsidiaryreceivable"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Subsidiary
                  </Link>
                  <Link
                    to="/admingeneral"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    General Ledger
                  </Link>
                  <Link
                    to="/admintrial"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Trial Balance
                  </Link>
                </div>
              )}

              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Users size={18} /> Users
              </Link>
            </>
          )}

          {(role === "admin" || role === "inventory") && (
            <>
              <Link
                to="/admininventory"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-archive"></i> Inventory
              </Link>
            </>
          )}

          {(role === "admin" || role === "dentist" || role === "receptionist") && (
            <>
              <Link
                to="/adminpatients"
                className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-user-plus"></i> Patients
              </Link>
              <Link
                to="/adminschedule"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Calendar size={18} /> Schedules
              </Link>
            </>
          )}

          {(role === "admin" || role === "receptionist") && (
            <>
              <Link
                to="/admincashier"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Calendar size={18} /> Cashier
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link
                to="/adminaudit"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-eye"></i> Audit Trail
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {/* ✅ Popup Notification */}
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
              } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-[#00458B] mb-6">
            Create New Consultation
          </h1>

          {/* Dentist Selection Alert */}
          {!dentist && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <p className="text-sm text-blue-800">
                Please select an attending dentist first to view available dates and times.
              </p>
            </div>
          )}

          {/* Consultation Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side */}
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Attending Dentist *
              </label>
              <select
                value={dentist}
                onChange={(e) => {
                  setDentist(e.target.value);
                  setDateOfVisit("");
                  setPreferredTime("");
                }}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none mb-4"
              >
                <option value="">Select Dentist</option>
                {dentists.map((d) => (
                  <option key={d.user_id} value={`${d.fname} ${d.lname}`}>
                    Dr. {d.fname} {d.lname}
                  </option>
                ))}
              </select>

              <label className="block text-[#00458b] font-semibold mb-1">
                Date of Visit *
              </label>
              <input
                type="date"
                value={dateOfVisit}
                onChange={handleDateChange}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none mb-2"
                min={new Date().toISOString().split("T")[0]}
                disabled={!dentist}
              />

              {/* Show fully booked dates warning */}
              {dentist && fullyBookedDates.length > 0 && (
                <p className="text-xs text-orange-600 mb-4">
                  ⚠️ Note: Some dates are fully booked and cannot be selected
                </p>
              )}

              <label className="block text-[#00458b] font-semibold mb-1 mt-4">
                Preferred Time *
              </label>
              <select
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none mb-2"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                disabled={!dateOfVisit}
              >
                <option value="">Select a time</option>
                {getAvailableTimeSlots().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              {/* Show helpful messages */}
              {dateOfVisit && getAvailableTimeSlots().length === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="text-red-600 mt-0.5" size={16} />
                  <p className="text-sm text-red-700">
                    No available time slots for this date. Please select another date.
                  </p>
                </div>
              )}

              {dateOfVisit && getAvailableTimeSlots().length > 0 && (
                <p className="text-xs text-green-600">
                  ✓ {getAvailableTimeSlots().length} time slot(s) available
                </p>
              )}
            </div>

            {/* Right Side */}
            <div>
              <p className="text-xl font-bold text-[#00458B] mb-4">Services *</p>
              <div className="grid grid-cols-2 gap-4">
                {procedureTypes.map((type, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <input
                      type="radio"
                      className="hidden peer"
                      id={`procedure-${index}`}
                      name="procedure_type"
                      value={type}
                      checked={procedureType === type}
                      onChange={() => setProcedureType(type)}
                    />
                    <span className="w-5 h-5 border-2 border-blue-300 rounded-sm flex items-center justify-center peer-checked:bg-blue-700 transition">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-blue-800 tracking-wide text-sm">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d] disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              onClick={handleSaveConsultation}
              disabled={!dateOfVisit || !dentist || !procedureType || !preferredTime || getAvailableTimeSlots().length === 0}
            >
              Save Consultation
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminConsultationAdd;