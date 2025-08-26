import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";

const Register = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();
  const [error, setError] = useState("");

  const handleNext = () => {
    if (registerData.user_password !== registerData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

  const handleNext = () => {
    if (!registerData.user_name || !registerData.user_password || !registerData.email || !registerData.contact_no) {
      alert("Please fill in all required fields.");
      return;
    }
    navigate("/register2");
  };

    navigate("/registergcash");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
      <br />
      <br />
      <div className="w-[35%] bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl font-bold mb-2">SIGN UP</h2>
        <p className="text-[#00458B] text-sm mb-6">
          Fill in the information below to sign up.
        </p>

        <br />
        <p className="text-[#00c3b8] font-bold mb-2">Login Information</p>

        {/* Username */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Username</label>
          <input
            type="text"
            value={registerData.user_name || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, user_name: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Password</label>
          <input
            type="password"
            value={registerData.user_password || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, user_password: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Confirm Password</label>
          <input
            type="password"
            value={registerData.confirm_password || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, confirm_password: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Email</label>
          <input
            type="email"
            value={registerData.email || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            required
          />
        </div>

        {/* Contact No */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Contact Number</label>
          <input
            type="number"
            value={registerData.contact_no || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, contact_no: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            required
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Buttons */}
        <div className="col-sm-12">
          <div className="row">
            <div className="col-sm-6">
              <button
                className="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
            </div>
            <div className="col-sm-6">
              <button
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
    </div>
  );
};

export default Register;
