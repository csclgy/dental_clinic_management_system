import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Package, PlusCircle, FileText, ClipboardList, Eye } from "lucide-react";

const AdminPatientsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
  });

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
        const res = await fetch(`http://localhost:3000/auth/displaypatient/${id}`, {
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
      const res = await fetch(`http://localhost:3000/auth/updatepatientinfo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patient),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      alert(data.message);
      navigate("/adminpatients");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Could not update profile. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger with dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
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
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link
            to="/adminpatients"
            className="flex items-center gap-2 bg-[white] text-[#00458B] p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link
            to="/adminschedule"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Calendar size={18} /> Schedules
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
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
            {/* Same nav as desktop */}
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 bg-[#01D5C4] text-black p-2 rounded-lg"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <Users size={18} /> Users
              </Link>
              {/* ... add other links here */}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-8">

        <div className="bg-white p-8 rounded-lg shadow-md border border-[#01D5C4]">
          <h2 className="text-xl font-bold text-[#00458B] mb-6">Edit Profile</h2>

          {/* Form */}
          <div className="grid grid-cols-2 gap-6">
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
              <label className="block text-[#00458b] font-semibold mb-1">Age</label>
              <input type="text" value={patient.age} onChange={(e) => setPatient({ ...patient, age: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
              <input type="date" value={patient.date_birth} onChange={(e) => setPatient({ ...patient, date_birth: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">Home Address</label>
            <input type="text" value={patient.home_address} onChange={(e) => setPatient({ ...patient, home_address: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">City</label>
            <input type="text" value={patient.city} onChange={(e) => setPatient({ ...patient, city: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">Province</label>
            <input type="text" value={patient.province} onChange={(e) => setPatient({ ...patient, province: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">Email Address</label>
            <input type="email" value={patient.email} onChange={(e) => setPatient({ ...patient, email: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
          </div>

          <div className="mt-6">
            <label className="block text-[#00458b] font-semibold mb-1">Contact Number</label>
            <input type="number" value={patient.contact_no} onChange={(e) => setPatient({ ...patient, contact_no: e.target.value })} className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button className="bg-white text-[#00c3b8] border border-[#00458b] px-6 py-2 rounded-full" onClick={() => navigate("/adminpatients")}>Back</button>
            <button className="bg-[#00c3b8] text-white px-6 py-2 rounded-full" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPatientsEdit;
