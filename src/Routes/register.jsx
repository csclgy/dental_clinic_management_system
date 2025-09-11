import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";

const Register = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();
  const [alertBox, setAlertBox] = useState({
    show: false,
    message: "",
  });

  // 🔹 Auto-hide alert after 2 seconds (for error only)
  useEffect(() => {
    if (alertBox.show) {
      const timer = setTimeout(() => {
        setAlertBox({ show: false, message: "" });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [alertBox]);

  const handleNext = () => {
    if (
      !registerData.user_name ||
      !registerData.user_password ||
      !registerData.email ||
      !registerData.contact_no
    ) {
      setAlertBox({
        show: true,
        message: "Invalid! Please fill in all required fields.",
      });
      return;
    }
    if (registerData.user_password !== registerData.confirm_password) {
      setAlertBox({
        show: true,
        message: "Passwords do not match!",
      });
      return;
    }

    // ✅ Direct navigation if valid (no success alert)
    navigate("/registergcash");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl sm:text-3xl font-bold mb-2">
          SIGN UP
        </h2>
        <p className="text-[#00458B] text-sm sm:text-base mb-6">
          Fill in the information below to sign up.
        </p>

        <p className="text-[#00c3b8] font-bold mb-2">Login Information</p>

        {/* Username */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Username
          </label>
          <input
            type="text"
            value={registerData.user_name || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, user_name: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
          />
        </div>

        {/* Password */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            value={registerData.user_password || ""}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                user_password: e.target.value,
              })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={registerData.confirm_password || ""}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirm_password: e.target.value,
              })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
          />
        </div>

        {/* Email */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            value={registerData.email || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
          />
        </div>

        {/* Contact No */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Contact Number
          </label>
          <input
            type="number"
            value={registerData.contact_no || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, contact_no: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full sm:w-1/2"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
          <button
            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full sm:w-1/2"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>

      {/* 🔹 Only Invalid Alert Box */}
      {alertBox.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <div className="text-red-500 text-4xl mb-2"></div>
            <h3 className="text-lg font-bold mb-2 text-red-500">Invalid!</h3>
            <p className="text-sm text-gray-700">{alertBox.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
