import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProfileLogin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    user_name: "",
    email: "",
    contact_no: "",
    fname: "",
    lname: "",
    mname: "",
    gender: "",
    date_birth: "",
    gcash_num: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/auth/me", {
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
          contact_no: data.contact_no,
          fname: data.fname,
          mname: data.mname,
          lname: data.lname,
          gender: data.gender,
          date_birth: data.date_birth,
          gcash_num: data.gcash_num,
          role: data.role,
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
  }, [navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/update", {
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
      alert(data.message);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Could not update profile. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-4 md:col-span-1">
          <h2 className="text-2xl font-bold text-[#00458B] mb-6">Profile</h2>
          <div className="flex flex-col gap-2">
            <Link to="/profilelogin">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium bg-[#E6FCF9] text-[#00c3b8] hover:bg-[#d0f8f5]">
                <i className="fa fa-user-circle-o mr-2" /> Login Information
              </button>
            </Link>
            {user.role === "patient" && (
                <Link to="/profileinfo">
                  <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                    <i className="fa fa-info-circle mr-2" /> User Information
                  </button>
                </Link>
              )}
            <Link to="/profilechange">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-lock mr-2" /> Change Password
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-[#00458B] text-white p-6 rounded-lg shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold">Login Information</h1>
            {error && <p className="text-red-300 mt-2">{error}</p>}
          </div>

          {/* Form */}
          <div className="p-6 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
            <div className="space-y-4">
              {user.role !== "patient" && (
                <div>
                  <p className="block text-[#00458b] font-semibold text-xl">Personal Information</p>
                  <br></br>
                  <div>
                    <label className="block text-[#00458b] font-semibold mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={user.fname}
                      readOnly
                      className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#00458b] font-semibold mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={user.lname}
                      readOnly
                      className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#00458b] font-semibold mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={user.mname}
                      readOnly
                      className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#00458b] font-semibold mb-1">
                      Gender
                    </label>
                    <input
                      type="text"
                      value={user.gender}
                      readOnly
                      className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#00458b] font-semibold mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={user.date_birth}
                      readOnly
                      className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                    />
                  </div>
                  <br />
                  <hr />
                  <br />
                  <p className="block text-[#00458b] font-semibold text-xl">Login Information</p>
                </div>
              )}
              {/* Username */}
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={user.user_name}
                  readOnly
                  onChange={(e) =>
                    setUser({ ...user, user_name: e.target.value })
                  }
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  Contact Number (Edit)
                </label>
                <input
                  type="text"
                  value={user.contact_no}
                  onChange={(e) => {
                    // Remove non-numeric characters
                    const value = e.target.value.replace(/\D/g, "");
                    // Limit to 11 digits
                    if (value.length <= 11) setUser({ ...user, contact_no: value });
                  }}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  required
                  pattern="[0-9]{11}" // requires exactly 11 digits
                  maxLength={11}
                  placeholder="Enter 11-digit number"
                />
              </div>

              {/* GCash Number
              <div>
                <label className="block text-[#00458b] font-semibold mb-1">
                  GCash Number
                </label>
                <input
                  type="text"
                  value={user.gcash_num}
                  onChange={(e) =>
                    setUser({ ...user, gcash_num: e.target.value })
                  }
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div> */}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
              <button
                className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full sm:w-auto"
                onClick={() => navigate("/profilechange")}
              >
                Change Password
              </button>
              <button
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full sm:w-auto"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLogin;