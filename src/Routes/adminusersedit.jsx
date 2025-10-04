import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminUsersEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const [user, setUser] = useState({
    user_name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
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
      const res = await fetch(
        `http://localhost:3000/auth/updateuserinfo/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        }
      );

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      alert(data.message);
      navigate("/adminusers");
    } catch (err) {
      console.error(err);
      alert("Could not update profile. Please try again.");
    }
  };

    const handleDateChange = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if the birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    setUser((prev) => ({
      ...prev,
      date_birth: dob,
      age: age >= 0 ? age : 0, // prevent negative ages
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
              <Link to="/admincoa" className="hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:bg-[white] hover:text-[#00458B]">
                Trial Balance
              </Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B] bg-white text-[#00458B]"
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
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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

      {/* Sidebar (mobile) */}
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
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        {/* Edit Form */}
        <div className="bg-white p-8 rounded-xl shadow-md border border-[#01D5C4]">
          <h2 className="text-xl font-bold text-[#00458B] mb-6">Edit User</h2>
          {errorMessage && (
            <p className="text-red-500 font-medium mb-4">{errorMessage}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                Username
              </label>
              <input
                type="text"
                value={user.user_name}
                onChange={(e) =>
                  setUser({ ...user, user_name: e.target.value })
                }
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={user.currentPassword}
                onChange={(e) =>
                  setUser({ ...user, currentPassword: e.target.value })
                }
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                New Password
              </label>
              <input
                type="password"
                value={user.newPassword}
                onChange={(e) =>
                  setUser({ ...user, newPassword: e.target.value })
                }
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={user.confirmPassword}
                onChange={(e) =>
                  setUser({ ...user, confirmPassword: e.target.value })
                }
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={user.contact_no}
                onChange={(e) => {
                  // allow only numbers
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 11) {
                    setUser({ ...user, contact_no: value });
                  }
                }}
                pattern="\d{11}" // regex: exactly 11 digits
                required
                placeholder="Enter 11-digit number"
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                Access Level
              </label>
              <select
                value={user.role}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              >
                <option value="patient">Patient</option>
                <option value="dentist">Dentist</option>
                <option value="receptionist">Receptionist</option>
                <option value="inventory">Inventory Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                First Name
              </label>
              <input
                type="text"
                value={user.fname}
                onChange={(e) => setUser({ ...user, fname: e.target.value })}
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={user.mname}
                onChange={(e) => setUser({ ...user, mname: e.target.value })}
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#00458B] font-semibold mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={user.lname}
                onChange={(e) => setUser({ ...user, lname: e.target.value })}
                className="w-full border border-[#00458B] rounded-full px-4 py-2 outline-none"
              />
            </div>

                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Gender
                  </label>
                  <select
                    value={user.gender}
                    onChange={(e) => setUser({ ...user, gender: e.target.value })}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  >
                    <option value="">-- Select --</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={user.date_birth}
                    onChange={(e) => handleDateChange(e.target.value)}
                    max={new Date().toISOString().split("T")[0]} // today's date
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={user.age}
                    readOnly
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#00458b] font-semibold mb-1">
                    User Status
                  </label>
                  <select
                    value={user.user_status}
                    onChange={(e) => setUser({ ...user, user_status: e.target.value })}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              className="bg-white text-[#00c3b8] font-semibold border border-[#00458B] px-6 py-2 rounded-full"
              onClick={() => navigate("/adminusers")}
            >
              Back
            </button>
            <button
              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full"
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

export default AdminUsersEdit; 