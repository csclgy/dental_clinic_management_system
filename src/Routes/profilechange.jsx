import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const ProfileChange = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState({ role: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // Fetch logged-in user info
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);

    // Fade out before removing
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showPopup("New password and confirm password do not match.", "error");
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

      showPopup("Password changed successfully.", "success");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showPopup(err.message || "Failed to change password.", "error");
    }
  };

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

            {user.role === "patient" && (
              <Link to="/profileinfo">
                <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                  <i className="fa fa-info-circle mr-2" /> User Information
                </button>
              </Link>
            )}

            <Link to="/profilechange">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium bg-[#E6FCF9] text-[#00c3b8] hover:bg-[#d0f8f5]">
                <i className="fa fa-lock mr-2" /> Change Password
              </button>
            </Link>
          </div>
        </div>

        {/* ✅ Popup Notification */}
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${
              fade
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-3"
            } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}

        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-[#00458B] p-6 rounded-lg shadow-lg text-white">
            <h1 className="text-xl md:text-2xl font-bold">Change Password</h1>
          </div>

          <div
            className="p-6 rounded-lg shadow-lg"
            style={{ border: "solid", borderColor: "#01D5C4" }}
          >
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
                  className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg w-full md:w-auto"
                  onClick={handleChangePassword}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Input
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
