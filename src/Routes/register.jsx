import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);

  // Handles input changes for password and confirm password
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // ✅ Check for real-time password match
      if (name === "user_password" || name === "confirm_password") {
        if (updatedData.user_password && updatedData.confirm_password) {
          setPasswordMatch(
            updatedData.user_password === updatedData.confirm_password
          );
        } else {
          setPasswordMatch(null); // no comparison yet
        }
      }

      return updatedData;
    });
  };

  const checkPasswordStrength = (password) => {
    let strength = "Weak";

    if (password.length >= 8) {
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSymbol = /[@$!%*?&]/.test(password);

      const conditions = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean)
        .length;

      if (conditions === 4) strength = "Strong";
      else if (conditions >= 2) strength = "Medium";
    }

    setPasswordStrength(strength);
  };


  const handleNext = () => {
    setError("");

    // Basic validations
    if (
      !registerData.user_name ||
      !registerData.user_password ||
      !registerData.email ||
      !registerData.contact_no
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (registerData.user_password !== registerData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(registerData.user_password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    // ✅ If validation passes, move to next page
    navigate("/register2");
  };


  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <br></br>
      <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl sm:text-3xl font-bold mb-2">SIGN UP</h2>
        <p className="text-[#00458B] text-sm sm:text-base mb-6">
          Fill in the information below to sign up.
        </p>
        <hr></hr>
        <br></br>

        <p className="text-[#00c3b8] text-left text-xl font-bold mb-4">Login Information</p>

        {/* Username */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Username: <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            value={registerData.user_name || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, user_name: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Password: <span style={{ color: "red" }}>*</span></label>

          {/* Input + Eye Icon */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="user_password"
              value={registerData.user_password}
              onChange={(e) => {
                handleChange(e);
                checkPasswordStrength(e.target.value);
              }}
              placeholder="Enter password"
              className="w-full border border-[#00458b] rounded-full px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password Strength Meter (Moved OUTSIDE the relative div) */}
          {registerData.user_password && (
            <>
              <div className="h-2 w-full bg-gray-200 rounded-full mb-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${passwordStrength === "Weak"
                    ? "bg-red-500 w-1/3"
                    : passwordStrength === "Medium"
                      ? "bg-yellow-500 w-2/3"
                      : passwordStrength === "Strong"
                        ? "bg-green-500 w-full"
                        : "w-0"
                    }`}
                ></div>
              </div>
              <p
                className={`text-sm font-medium ${passwordStrength === "Weak"
                  ? "text-red-500"
                  : passwordStrength === "Medium"
                    ? "text-yellow-500"
                    : "text-green-600"
                  }`}
              >
                Password strength: {passwordStrength}
              </p>
            </>
          )}

          {/* Password Requirements */}
          {registerData.user_password && (
            <p className="text-xs text-gray-600 mt-1">
              Must be at least 8 characters, include uppercase, lowercase, number, and symbol.
            </p>
          )}
        </div>


        {/* Confirm Password */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Confirm Password: <span style={{ color: "red" }}>*</span></label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              value={registerData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full border border-[#00458b] rounded-full px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordMatch !== null && (
            <p
              className={`text-sm mt-1 ${passwordMatch ? "text-green-600" : "text-red-500"
                }`}
            >
              {passwordMatch ? "✅ Passwords match" : "❌ Passwords do not match"}
            </p>
          )}

        </div>

        {/* Email */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Email: <span style={{ color: "red" }}>*</span></label>
          <input
            type="email"
            value={registerData.email || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
            required
          />
        </div>

        {/* Contact No */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Contact Number: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="tel"
            value={registerData.contact_no || ""}
            onChange={(e) =>
              setRegisterData({ ...registerData, contact_no: e.target.value })
            }
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
            pattern="\d{11}" // only allows exactly 11 digits
            maxLength={11}   // prevents typing more than 11 digits
            required
            placeholder="Enter 11-digit number"
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg w-full sm:w-1/2"
            onClick={() => navigate("/login")}
          >
            Cancel
          </button>
          <button
            className={`${passwordMatch === false
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#00c3b8] hover:bg-[#00a79d]"
              } text-white font-semibold px-6 py-2 rounded-lg w-full sm:w-1/2`}
            onClick={handleNext}
            disabled={passwordMatch === false}
          >
            Next
          </button>

        </div>
      </div>
      <br></br>
    </div>
  );
};

export default Register;