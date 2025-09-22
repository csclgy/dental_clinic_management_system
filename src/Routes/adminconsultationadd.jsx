import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";

const AdminConsultationAdd = () => {
  const location = useLocation();
  const patient = location.state?.patient;
  const navigate = useNavigate();
  const { id } = useParams(); // patient_id or appoint_id if passed in route

  // Form states
  const [dateOfVisit, setDateOfVisit] = useState("");
  const [dentist, setDentist] = useState("");
  const [procedureType, setProcedureType] = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  // Patient data
  const [fname, setFname] = useState(patient?.fname || "");
  const [lname, setLname] = useState(patient?.lname || "");
  const [email, setEmail] = useState(patient?.email || "");

  const handleSaveConsultation = async () => {
    try {
      const payload = {
        procedure_type: procedureType,
        pref_date: dateOfVisit,
        pref_time: "",
        attending_dentist: dentist,
        appointment_status: "pending",

        // patient info
        user_name: patient?.user_name,        // ✅ add this
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
        pref_time: preferredTime,
      };

      console.log("Payload being sent:", payload);

      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/auth/createconsultation",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Consultation created:", res.data);
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

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
            <div
              className="col-sm-3 p-5 rounded-lg shadow-lg"
              style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
            >
              {/* Dashboard */}
              <Link to="/">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-tachometer" aria-hidden="true"></i>{" "}
                  Dashboard
                </button>
              </Link>

              {/* Users */}
              <Link to="/adminusers">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-users" aria-hidden="true"></i> Users
                </button>
              </Link>

              {/* Inventory */}
              <Link to="/admininventory">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-archive" aria-hidden="true"></i> Inventory
                </button>
              </Link>

              {/* Patients */}
              <Link to="/adminpatients">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00c3b8" }}
                >
                  <i className="fa fa-user-plus" aria-hidden="true"></i>{" "}
                  Patients
                </button>
              </Link>

              {/* Schedule */}
              <Link to="/adminschedule">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-calendar" aria-hidden="true"></i>{" "}
                  Schedules
                </button>
              </Link>

              {/* Audit Trail */}
              <Link to="/adminaudit">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-eye" aria-hidden="true"></i> Audit Trail
                </button>
              </Link>
            </div>

            {/* Main Content */}
            <div className="col-sm-8">
              <div className="row">
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <div className="row">
                    <div className="col-sm-10">
                      <h1 className="text-2xl font-bold">Patients Record</h1>
                    </div>
                  </div>
                </div>
                <p style={{ color: "transparent" }}>...</p>
                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  <div className="row">
                    <div className="col-sm-12">
                      <h1
                        className="text-2xl font-bold"
                        style={{ color: "#00458B" }}
                      >
                        Create New Consultation
                      </h1>
                    </div>
                  </div>

                  <hr />

                  {/* Consultation Form */}
                  <div className="col-sm-12">
                    <br />
                    <div className="row">
                      <div className="col-sm-6">
                        {/* Date + Dentist */}
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">
                            Date of Visit
                          </label>
                          <input
                            type="date"
                            value={dateOfVisit}
                            onChange={(e) => setDateOfVisit(e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>

                        {/* Preferred Time */}
                        <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                            Preferred Time
                        </label>
                        <select
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
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
                        </div>

                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] mb-1">
                            Attending Dentist
                          </label>
                          <select
                            value={dentist}
                            onChange={(e) => setDentist(e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          >
                            <option value="">Select Dentist</option>
                            <option value="Dr. A. Reyes">Dr. A. Reyes</option>
                            <option value="Dr. M. Santos">Dr. M. Santos</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <p className="text-2xl font-bold" style={{ color: "#00458B" }}>
                          Services
                        </p>
                        <br />
                        <form className="grid grid-cols-2 gap-x-12 gap-y-4">
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
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="col-sm-12 mt-6">
                    <div className="row">
                      <div className="col-sm-6"></div>
                      <div className="col-sm-6">
                        <button
                          className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                          onClick={handleSaveConsultation}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsultationAdd;