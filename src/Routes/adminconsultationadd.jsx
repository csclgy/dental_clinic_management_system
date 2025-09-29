import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminConsultationAdd = () => {
  const location = useLocation();
  const patient = location.state?.patient;
  const navigate = useNavigate();
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Form states
  const [dateOfVisit, setDateOfVisit] = useState("");
  const [dentist, setDentist] = useState("");
  const [procedureType, setProcedureType] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [dentists, setDentists] = useState([]);

  const handleSaveConsultation = async () => {
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

      alert("Consultation created successfully!");
      navigate("/adminpatients");
    } catch (err) {
      console.error("Error saving consultation:", err);
      alert("Failed to create consultation");
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
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger dropdown */}
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
              <Link to="/admincoa" className="hover:underline">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:underline">
                Journal Entries
              </Link>
              <Link to="/admingeneral" className="hover:underline">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:underline">
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
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link
            to="/adminpatients"
            className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg"
          >
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link
            to="/adminschedule"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Calendar size={18} /> Schedules
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Sidebar (mobile with toggle) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#00458B] text-white flex flex-col p-6 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end mb-6"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <Users size={18} /> Users
              </Link>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {/* Mobile menu button */}
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

          {/* Consultation Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side */}
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Date of Visit
              </label>
              <input
                type="date"
                value={dateOfVisit}
                onChange={(e) => setDateOfVisit(e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none mb-4"
              />

              <label className="block text-[#00458b] font-semibold mb-1">
                Preferred Time
              </label>
              <select
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none mb-4"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              >
                <option value="">Select a time</option>
                {[
                  "8:00AM",
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

              <label className="block text-[#00458b] font-semibold mb-1">
                Attending Dentist
              </label>
              <select
                value={dentist}
                onChange={(e) => setDentist(e.target.value)}
                className="w-full border border-[#00458b] rounded-lg px-4 py-2 outline-none"
              >
                <option value="">Select Dentist</option>
                {dentists.map((d) => (
                  <option key={d.user_id} value={`${d.fname} ${d.lname}`}>
                    Dr. {d.fname} {d.lname}
                  </option>
                ))}
              </select>
            </div>

            {/* Right Side */}
            <div>
              <p className="text-xl font-bold text-[#00458B] mb-4">Services</p>
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
                    <span className="text-blue-800 tracking-wide">
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
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#00a99d]"
              onClick={handleSaveConsultation}
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