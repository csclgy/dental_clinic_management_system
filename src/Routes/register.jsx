import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // Handles input changes for password and confirm password
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

    if (!agree) {
      setShowAlert(true);
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
          <label className="block text-[#00458b] font-semibold mb-1">Username: <span style={{color:"red"}}>*</span></label>
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
          <label className="block text-[#00458b] font-semibold mb-1">Password: <span style={{color:"red"}}>*</span></label>

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
          <label className="block text-[#00458b] font-semibold mb-1">Confirm Password: <span style={{color:"red"}}>*</span></label>
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
        </div>

        {/* Email */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">Email: <span style={{color:"red"}}>*</span></label>
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
            Contact Number: <span style={{color:"red"}}>*</span>
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

        {/* Agreement Checkbox */}
        <div className="flex items-center text-left mb-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
            className="mr-2 w-4 h-4 accent-[#00c3b8]"
          />
          <label className="text-sm text-[#00458b]">
            I have read and fully understand the{" "}
            <span className="text-[#00c3b8] font-semibold">
              <a
                href="https://privacy.gov.ph/data-privacy-act/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Data Privacy Policy
              </a>
            </span>.
          </label>
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
            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg w-full sm:w-1/2"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>

      {/* Custom Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h3 className="text-lg font-bold text-[#00458b] mb-2">⚠️ Agreement Required</h3>
            <p className="text-sm text-gray-700 mb-4">
              You must agree to the Data Privacy Policy before proceeding.
            </p>
            <button
              onClick={() => setShowAlert(false)}
              className="bg-[#00c3b8] text-white px-4 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <br></br>
    </div>
  );
};

export default Register;