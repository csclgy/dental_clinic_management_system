import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Package, PlusCircle, FileText, ClipboardList, Eye, ChevronDown, ChevronUp, PhilippinePeso, IdCard, Settings, FolderKanban, BriefcaseMedical } from "lucide-react";

const AdminPatientsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  const [patient, setPatient] = useState({
    fname: "",
    mname: "",
    lname: "",
    gender: "",
    age: "",
    date_birth: "",
    home_address: "",
    city: "",
    province: "",
    email: "",
    contact_no: "",
    user_name: "",
    user_password: "",
    user_status: "",
  });

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--; // not yet had birthday this year
    }
    return age;
  };


  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);
  const [isSettingopen, setIsSettingOpen] = useState(false);


  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/displaypatient/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await res.json();
        setPatient({
          fname: data.patient.fname,
          mname: data.patient.mname,
          lname: data.patient.lname,
          gender: data.patient.gender,
          age: data.patient.age,
          date_birth: data.patient.date_birth,
          home_address: data.patient.home_address,
          city: data.patient.city,
          province: data.patient.province,
          email: data.patient.email,
          contact_no: data.patient.contact_no,
          user_name: data.patient.user_name,
          user_password: "", // never return plain passwords
          user_status: data.patient.user_status || "active", // ✅ default if null
        });


        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Could not fetch user. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/updatepatientinfo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patient),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update profile");
      }

      const data = await res.json();
      showPopup(data.message || "Profile updated successfully!", "success");

      setTimeout(() => navigate("/adminpatients"), 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      showPopup(err.message || "Could not update profile. Please try again.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-sxl font-bold mb-8">Arciaga-Juntilla TMJ Ortho Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          {/* Dashboard Dropdown */}
          <button onClick={() => setOpenDashboard(!openDashboard)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ?
              <ChevronUp size={16} /> :
              <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              {role === "admin" && (
                <Link to="/admindashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Admin Dashboard</Link>
              )}
              {(role === "admin" || role === "inventory") && (
                <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard
                </Link>
              )}
              {(role === "admin" || role === "receptionist" || role === "dentist") && (
                <Link to="/receptionistdashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Appointments
                  Dashboard</Link>
              )}
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
              {/* Ledger Dropdown */}
              <button onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <span className="flex items-center gap-2">
                  <i className="fa fa-book"></i> Ledger
                </span>
                {isLedgerOpen ?
                  <ChevronUp size={16} /> :
                  <ChevronDown size={16} />}
              </button>

              {isLedgerOpen && (
                <div className="ml-6 flex flex-col gap-1 text-sm">
                  <Link to="/admincoa" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Chart of Accounts
                  </Link>
                  <Link to="/adminjournal"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Journal Entries
                  </Link>
                  <Link to="/adminsubsidiaryreceivable"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Subsidiary
                  </Link>
                  <Link to="/admingeneral"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    General Ledger
                  </Link>
                  <Link to="/admintrial" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                    Trial Balance
                  </Link>
                </div>
              )}
              <Link to="/adminusers" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <Users size={18} /> Users
              </Link>
            </>
          )}

          {(role === "admin" || role === "inventory") && (
            <>
              <Link to="/admininventory" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-archive"></i> Inventory
              </Link>
            </>
          )}

          {(role === "admin" || role === "dentist" || role === "receptionist") && (
            <>
              <Link to="/adminpatients" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-user-plus"></i> Patients
              </Link>

              <Link to="/adminschedule" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <Calendar size={18} />{" "}
                {role === "dentist" ? "Appointments" : "Appointments & Billing"}
              </Link>
            </>
          )}
          {role === "admin" && (
            <>
              <button onClick={() => setIsSettingOpen(!isSettingopen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <span className="flex items-center gap-2">
                  <Settings size={18} /> Settings
                </span>
                {isSettingopen ?
                  <ChevronUp size={16} /> :
                  <ChevronDown size={16} />}
              </button>
              {isSettingopen && (
                <div className="ml-6 flex flex-col gap-1 text-sm">
                  <Link to="/adminhmo" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <IdCard size={18} /> HMO
                  </Link>

                  <Link to="/orRangeSetup" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <FolderKanban size={18} /> OR Range
                  </Link>

                  <Link to="/adminServices"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                    <BriefcaseMedical size={18} /> Services
                  </Link>
                </div>
              )}
            </>
          )}
          {role === "admin" && (
            <>
              <Link to="/adminaudit"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <i className="fa fa-eye"></i> Audit Trail
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
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

        <div className="bg-white p-8 rounded-lg shadow-md border border-[#01D5C4]">
          <h2 className="text-2xl font-bold text-[#00458B] mb-6">Edit Profile</h2>
          <hr></hr>
          <br></br>
          <h2 className="text-1xl font-bold text-[#00458B] mb-6">Login Information:</h2>
          {/* Form */}
          <div className="grid grid-cols-2 gap-6">
            <div className="mt-2">
              <label className="block text-[#00458b] font-semibold mb-1">Username</label>
              <input
                type="text"
                value={patient.user_name}
                onChange={(e) => setPatient({ ...patient, user_name: e.target.value })}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div className="mt-2">
              <label className="block text-[#00458b] font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={patient.email}
                onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div className="mt-2">
              <label className="block text-[#00458b] font-semibold mb-1">Password</label>
              <input
                type="password"
                value={patient.user_password}
                onChange={(e) => setPatient({ ...patient, user_password: e.target.value })}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div className="mt-2">
              <label className="block text-[#00458b] font-semibold mb-1">Status</label>
              <select
                value={patient.user_status}
                onChange={(e) => setPatient({ ...patient, user_status: e.target.value })}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">First Name</label>
              <input type="text" value={patient.fname} onChange={(e) => setPatient({ ...patient, fname: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Middle Name</label>
              <input type="text" value={patient.mname} onChange={(e) => setPatient({ ...patient, mname: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Last Name</label>
              <input type="text" value={patient.lname} onChange={(e) => setPatient({ ...patient, lname: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Gender</label>
              <select value={patient.gender} onChange={(e) => setPatient({ ...patient, gender: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
              <input
                type="date"
                value={patient.date_birth}
                onChange={(e) => {
                  const dob = e.target.value;
                  setPatient({
                    ...patient,
                    date_birth: dob,
                    age: calculateAge(dob)
                  });
                }}

                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                max={new Date().toISOString().split("T")[0]} // only allow past dates
              />
            </div>
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Age</label>
              <input
                type="text"
                value={patient.age}
                onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                readOnly
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">Home Address</label>
            <input
              type="text"
              value={patient.home_address}
              onChange={(e) => setPatient({ ...patient, home_address: e.target.value })}
              className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">City</label>
            <input
              type="text"
              value={patient.city}
              onChange={(e) => setPatient({ ...patient, city: e.target.value })}
              className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">Province</label>
            <input type="text"
              value={patient.province}
              onChange={(e) => setPatient({ ...patient, province: e.target.value })}
              className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              placeholder="none"
            />
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">Contact Number</label>
            <input
              type="text"
              value={patient.contact_no}
              onChange={(e) => {
                const val = e.target.value;
                // Only allow digits and max length 11
                if (/^\d{0,11}$/.test(val)) {
                  setPatient({ ...patient, contact_no: val });
                }
              }}
              placeholder="Enter 11-digit number"
              className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
              required
              pattern="\d{11}"
              title="Contact number must be exactly 11 digits"
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button className="bg-white text-[#00458B] font-semibold border border-[#00458b] px-6 py-2 rounded-lg" onClick={() => navigate("/adminpatients")}>Back</button>
            <button className="bg-[#00458B] text-white font-semibold px-6 py-2 rounded-lg" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPatientsEdit;
