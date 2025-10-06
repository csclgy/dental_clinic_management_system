import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminUsersEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // ✅ Popup state
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const [user, setUser] = useState({
    user_name: "",
    email: "",
    contact_no: "",
    role: "",
    fname: "",
    mname: "",
    lname: "",
    date_birth: "",
    gender: "",
    age: "",
    user_status: "",
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:3000/auth/displayuserinfo/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser({
          user_name: data.user_name,
          email: data.email,
          contact_no: data.contact_no,
          role: data.role,
          fname: data.fname,
          mname: data.mname,
          lname: data.lname,
          date_birth: data.date_birth,
          gender: data.gender,
          age: data.age,
          user_status: data.user_status,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMessage("Could not fetch user. Please login again.");
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
      const res = await fetch(`http://localhost:3000/auth/updateuserinfo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      showPopup(data.message || "User updated successfully!", "success");
      setTimeout(() => navigate("/adminusers"), 1500);
    } catch (err) {
      console.error(err);
      showPopup("Could not update profile. Please try again.", "error");
    }
  };

  const handleDateChange = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

    setUser((prev) => ({
      ...prev,
      date_birth: dob,
      age: age >= 0 ? age : 0,
    }));
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;

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
              <Link to="/admincoa" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Chart of Accounts</Link>
              <Link to="/adminjournal" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Journal Entries</Link>
              <Link to="/adminsubsidiaryreceivable" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Subsidiary</Link>
              <Link to="/admingeneral" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">General Ledger</Link>
              <Link to="/admintrial" className="p-2 rounded-lg hover:bg-white hover:text-[#00458B]">Trial Balance</Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg bg-white text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link to="/admininventory" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link to="/adminpatients" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link to="/adminschedule" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <Calendar size={18} /> Schedules
          </Link>
          <Link to="/admincashier" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <Calendar size={18} /> Cashier
          </Link>
          <Link to="/adminaudit" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${
              fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
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

        <div className="bg-white p-8 rounded-xl shadow-md border border-[#01D5C4]">
          <h2 className="text-xl font-bold text-[#00458B] mb-6">Edit User</h2>
          {errorMessage && (
            <p className="text-red-500 font-medium mb-4">{errorMessage}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <Input label="Username" value={user.user_name} onChange={(e) => setUser({ ...user, user_name: e.target.value })} />
            <Input label="Email" type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
            <Input
              label="Contact Number"
              value={user.contact_no}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 11) setUser({ ...user, contact_no: value });
              }}
              placeholder="Enter 11-digit number"
            />

            <Select
              label="Access Level"
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
              options={["patient", "dentist", "receptionist", "inventory", "admin"]}
            />

            <Input label="First Name" value={user.fname} onChange={(e) => setUser({ ...user, fname: e.target.value })} />
            <Input label="Middle Name" value={user.mname} onChange={(e) => setUser({ ...user, mname: e.target.value })} />
            <Input label="Last Name" value={user.lname} onChange={(e) => setUser({ ...user, lname: e.target.value })} />

            <Select
              label="Gender"
              value={user.gender}
              onChange={(e) => setUser({ ...user, gender: e.target.value })}
              options={["male", "female"]}
              placeholder="-- Select --"
            />

            <Input
              label="Date of Birth"
              type="date"
              value={user.date_birth}
              onChange={(e) => handleDateChange(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />

            <Input label="Age" type="number" value={user.age} readOnly />
            <Select
              label="User Status"
              value={user.user_status}
              onChange={(e) => setUser({ ...user, user_status: e.target.value })}
              options={["active", "inactive"]}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              className="bg-white text-[#00c3b8] font-semibold border border-[#00458B] px-6 py-2 rounded-lg"
              onClick={() => navigate("/adminusers")}
            >
              Back
            </button>
            <button
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Small helper components for cleaner UI
const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-[#00458B] font-semibold mb-1">{label}</label>
    <input
      {...props}
      className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
    />
  </div>
);

const Select = ({ label, options, placeholder, ...props }) => (
  <div>
    <label className="block text-[#00458B] font-semibold mb-1">{label}</label>
    <select
      {...props}
      className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

export default AdminUsersEdit;
