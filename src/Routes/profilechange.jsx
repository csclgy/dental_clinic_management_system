import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const ProfileChange = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const handleChangePassword = async () => {
    setAlert({ show: false, type: "", message: "" });

    if (newPassword !== confirmPassword) {
      showAlert("error", "New password and confirm password do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      showAlert("success", "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showAlert("error", err.message);
    }
  };

  // Function to show alert and auto-close after 2s
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 2000);
  };

  // Smooth scroll if location.state.scrollTo exists
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-4 md:col-span-1">
          <h2 className="text-2xl font-bold text-[#00458B] mb-6">Profile</h2>
          <div className="flex flex-col gap-2">
            <Link to="/profilelogin">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-user-circle-o mr-2" /> Login Information
              </button>
            </Link>
            <Link to="/profileinfo">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-info-circle mr-2" /> User Information
              </button>
            </Link>
            <Link to="/profilechange">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium bg-[#E6FCF9] text-[#00c3b8] hover:bg-[#d0f8f5]">
                <i className="fa fa-lock mr-2" /> Change Password
              </button>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-[#00458B] p-6 rounded-lg shadow-lg text-white">
            <h1 className="text-xl md:text-2xl font-bold">Change Password</h1>
          </div>

          {/* Form Card */}
          <div
            className="p-6 rounded-lg shadow-lg"
            style={{ border: "solid", borderColor: "#01D5C4" }}
          >
            <br />
            <div className="max-w-md mx-auto">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="flex justify-end mt-6">
                <button
                  className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full md:w-auto"
                  onClick={handleChangePassword}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Alert Box */}
      {alert.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center relative shadow-lg">
            <h3
              className={`text-lg font-bold mb-2 ${
                alert.type === "success" ? "text-[#00c3b8]" : "text-red-500"
              }`}
            >
              {alert.type === "success" ? "Success!" : "Error!"}
            </h3>
            <p className="text-sm">{alert.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable input
const Input = ({ label, type, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-[#00458b] font-semibold mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
    />
  </div>
);

export default ProfileChange;
