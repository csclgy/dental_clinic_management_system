import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X, PlusCircle } from "lucide-react";

function AdminUsers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All"); 
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scroll behavior (same as inventory page)
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const rawToken = localStorage.getItem("token");
        if (!rawToken) throw new Error("No token found in localStorage");

        const token = rawToken.startsWith("Bearer ") ? rawToken.split(" ")[1] : rawToken;

        const res = await fetch("http://localhost:3000/auth/displayusers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Fetch users error:", err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const rawToken = localStorage.getItem("token");
      const token = rawToken && rawToken.startsWith("Bearer ") ? rawToken.split(" ")[1] : rawToken;

      const res = await fetch(`http://localhost:3000/auth/deleteuserinfo/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.user_id !== id));
      alert("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Could not delete user");
    }
  };

  // 🔹 Apply both search and role filter
  const filteredUsers = users.filter((user) => {
    // Exclude Patients entirely
    if (user.role.toLowerCase() === "patient") return false;

    const matchesSearch = Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "All" || user.role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });


  return (
    <div className="flex min-h-screen bg-gray-100">
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
              <Link to="/admincoa" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Trial Balance
              </Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 bg-[white] text-[#00458B] p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
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
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
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
            to="/admincashier"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Calendar size={18} /> Cashier
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
      <main className="flex-1 p-6 md:p-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">Users Management</h1>

          <div className="flex gap-3">
            <Link
              to="/adminusersadd"
              className="flex items-center gap-2 font-bold bg-[#00458B] text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Add New User
            </Link>
          </div>
        </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
           <div className="flex justify-between items-center gap-4">
            {/* Role Filter Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-[#00458B] rounded-lg px-3 py-2 text-sm text-[#00458B] font-medium"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Dentist">Dentist</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Inventory Staff">Inventory Staff</option>
            </select>

            {/* Search Bar */}
            <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-64">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-700"
              />
              <i className="fa fa-search text-[#00458B]"></i>
            </div>
          </div>

            {loading ? (
              <p className="text-center text-gray-500">Loading users…</p>
            ) : (
              <div className="overflow-x-auto mt-6">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-[#00458B]">
                      <th className="px-4 py-2 text-center">Username</th>
                      <th className="px-4 py-2 text-center">Access Level</th>
                      <th className="px-4 py-2 text-center">Name</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.user_id} className="border-b border-gray-200 text-center">
                          <td className="px-4 py-2 text-blue-700">{user.user_name}</td>
                          <td className="px-4 py-2">{user.role}</td>
                          <td className="px-4 py-2">{`${user.fname} ${user.mname || ""} ${user.lname}`}</td>
                          <td className="px-4 py-2">{user.user_status}</td>
                          <td className="px-4 py-2 flex gap-2 justify-center">
                            <Link to={`/adminusersedit/${user.user_id}`}>
                              <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Edit</button>
                            </Link>
                            <button onClick={() => handleDelete(user.user_id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-gray-500 py-4">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </main>
    </div>
  );
}

export default AdminUsers;
