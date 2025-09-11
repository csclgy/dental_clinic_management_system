import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // 👈 useParams here

const AdminUsersEdit = () => {
  const { id } = useParams(); // 👈 get user id from URL
  const navigate = useNavigate();
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
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false); // 👈 alert state

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/auth/displayuserinfo/${id}`, {
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
      const res = await fetch(`http://localhost:3000/auth/updateuserinfo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();

      // 👇 Show alertbox instead of browser alert
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        navigate("/adminusers"); // go back after showing alert
      }, 1500);

    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Could not update profile. Please try again.");
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
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
                  <i className="fa fa-tachometer" aria-hidden="true"></i> Dashboard
                </button>
              </Link>

              {/* Ledger Dropdown */}
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
                style={{ color: "#00458B" }}
              >
                <span>
                  <i className="fa fa-book" aria-hidden="true"></i> Ledger
                </span>
                <i
                  className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`}
                  aria-hidden="true"
                ></i>
              </button>

              {isLedgerOpen && (
                <div className="ml-8 text-sm">
                  <Link to="/admincoa">
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Chart of Accounts
                    </p>
                  </Link>
                  <Link to="/adminjournal">
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Journal Entries
                    </p>
                  </Link>
                  <Link to="/admingeneral">
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      General Ledger
                    </p>
                  </Link>
                  <Link to="/admintrial">
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Trial Balance
                    </p>
                  </Link>
                </div>
              )}

              {/* Users */}
              <Link to="/adminusers">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00c3b8" }}
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
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                </button>
              </Link>

              {/* Schedule */}
              <Link to="/adminschedule">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i class="fa fa-calendar" aria-hidden="true"></i> Schedules
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
            <div className="col-sm-7">
              <div className="row">
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <div className="row">
                    <div className="col-sm-4">
                      <h1 className="text-2xl font-bold">Users Management</h1>
                    </div>
                    <div className="col-sm-4">
                      <button
                        class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                        onClick={() => navigate("/adminusersadd")}
                      >
                        + Add New Patient
                      </button>
                    </div>
                    <div className="col-sm-4">
                      <button
                        class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                        onClick={() => navigate("/adminusersadd")}
                      >
                        + Add New User
                      </button>
                    </div>
                  </div>
                </div>
                <p style={{ color: "transparent" }}>...</p>
                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  <div className="row">
                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>
                      Edit User
                    </h1>
                    <div className="col-sm-3"></div>
                    <div className="col-sm-6">
                      <br />
                      <br />
                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={user.user_name}
                          onChange={(e) =>
                            setUser({ ...user, user_name: e.target.value })
                          }
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>

                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          onChange={(e) =>
                            setUser({ ...user, email: e.target.value })
                          }
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>

                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={user.currentPassword}
                          onChange={(e) =>
                            setUser({ ...user, currentPassword: e.target.value })
                          }
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>

                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={user.newPassword}
                          onChange={(e) =>
                            setUser({ ...user, newPassword: e.target.value })
                          }
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>

                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={user.confirmPassword}
                          onChange={(e) =>
                            setUser({ ...user, confirmPassword: e.target.value })
                          }
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>
                      <div class="mb-4 text-left">
                        <label class="block text-[#00458b] font-semibold mb-1">
                          Contact Number
                        </label>
                        <input
                          type="number"
                          value={user.contact_no}
                          onChange={(e) =>
                            setUser({ ...user, contact_no: e.target.value })
                          }
                          class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>
                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                          Access Level
                        </label>
                        <select
                          value={user.role}
                          onChange={(e) => setUser({ ...user, role: e.target.value })}
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        >
                          <option value="patient">Patient</option>
                          <option value="dentist">Dentist</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="inventory">Inventory Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div class="mb-4 text-left">
                        <label class="block text-[#00458b] font-semibold mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={user.fname}
                          onChange={(e) =>
                            setUser({ ...user, fname: e.target.value })
                          }
                          class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>
                      <div class="mb-4 text-left">
                        <label class="block text-[#00458b] font-semibold mb-1">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          value={user.mname}
                          onChange={(e) =>
                            setUser({ ...user, mname: e.target.value })
                          }
                          class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>
                      <div class="mb-4 text-left">
                        <label class="block text-[#00458b] font-semibold mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={user.lname}
                          onChange={(e) =>
                            setUser({ ...user, lname: e.target.value })
                          }
                          class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>
                    </div>
                    <div className="col-sm-3"></div>
                    <div className="col-sm-12">
                      <br />
                      <br />
                      <div className="row">
                        <div className="col-sm-6"></div>
                        <div className="col-sm-6">
                          <div className="row">
                            <div className="col-sm-6">
                              <button
                                class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4"
                                onClick={() => navigate("/adminusers")}
                              >
                                Back
                              </button>
                            </div>
                            <div className="col-sm-6">
                              <button
                                class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                                onClick={handleSave}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
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

      {/* 👇 Alertbox */}
{showAlert && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <h2 className="text-lg font-bold text-green-600">Success</h2>
      <p className="text-gray-700">User updated successfully!</p>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminUsersEdit;
