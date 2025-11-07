import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";

const Register2 = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();
  const [showAlert, setShowAlert] = useState(false);
  const [agree, setAgree] = useState(false);

  // helper updater
  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (dateValue) => {
    updateFormData("date_birth", dateValue);

    if (dateValue) {
      const today = new Date();
      const birthDate = new Date(dateValue);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updateFormData("age", age);
    } else {
      updateFormData("age", "");
    }
  };

  const handleNext = () => {
    const requiredFields = [
      "fname",
      "lname",
      "mname",
      "gender",
      // "religion",
      "date_birth",
      "home_address",
      "city",
      "nationality",
      "occupation",
      "blood_type",
    ];

    const missing = requiredFields.filter(
      (field) => !registerData[field] || registerData[field].trim() === ""
    );

    if (missing.length > 0) {
      setShowAlert(true); // show modal instead of native alert
      return;
    }

    // ✅ Check if user agreed to the privacy policy
    if (!agree) {
      setShowAlert(true);
      return;
    }

    navigate("/presubmit");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <br />
      <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl sm:text-3xl font-bold mb-2">
          SIGN UP
        </h2>
        <p className="text-[#00458B] text-sm sm:text-base mb-6">
          Fill in the information below to sign up.
        </p>
        <hr></hr>
        <br></br>

        <p className="text-[#00c3b8] text-left text-xl font-bold mb-4">Personal Information</p>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* LEFT SIDE */}
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                First Name: <span style={{color:"red"}}>*</span>
              </label>
              <input
                type="text"
                value={registerData.fname || ""}
                onChange={(e) => updateFormData("fname", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Last Name: <span style={{color:"red"}}>*</span>
              </label>
              <input
                type="text"
                value={registerData.lname || ""}
                onChange={(e) => updateFormData("lname", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Gender: <span style={{color:"red"}}>*</span>
              </label>
              <select
                value={registerData.gender || ""}
                onChange={(e) => updateFormData("gender", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              >
                <option value="">-- Select Gender --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Religion: (Optional)
              </label>
              <select
                value={registerData.religion || ""}
                onChange={(e) => updateFormData("religion", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              >
                <option value="">-- Select Religion --</option>
                <option value="Catholic">Catholic</option>
                <option value="Islam">Islam</option>
                <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
                <option value="Evangelicals">Evangelicals</option>
                <option value="Protestant">Protestant</option>
                <option value="Seventh-day Adventist">
                  Seventh-day Adventist
                </option>
                <option value="Bible Baptist Church">Bible Baptist Church</option>
                <option value="Aglipayan">Aglipayan</option>
                <option value="UCCP">UCCP</option>
                <option value="Jehovah's Witnesses">Jehovah's Witnesses</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Home Address: <span style={{color:"red"}}>*</span>
              </label>
              <input
                type="text"
                value={registerData.home_address || ""}
                onChange={(e) => updateFormData("home_address", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                City: <span style={{color:"red"}}>*</span>
              </label>
              <input
                type="text"
                value={registerData.city || ""}
                onChange={(e) => updateFormData("city", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Province: 
              </label>
              <input
                type="text"
                value={registerData.province || ""}
                onChange={(e) => updateFormData("province", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Middle Name: <span style={{color:"red"}}>*</span>
              </label>
              <input
                type="text"
                value={registerData.mname || ""}
                onChange={(e) => updateFormData("mname", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Date of Birth: <span style={{color:"red"}}>*</span>
              </label>
              <input
                type="date"
                value={registerData.date_birth || ""}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Age
              </label>
              <input
                type="number"
                min={1}
                value={registerData.age || ""}
                readOnly
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Nationality: <span style={{color:"red"}}>*</span>
              </label>
              <input
                type="text"
                value={registerData.nationality || ""}
                onChange={(e) => updateFormData("nationality", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">
                Occupation: <span style={{color:"red"}}>*</span>
              </label>
              <input
                type="text"
                value={registerData.occupation || ""}
                onChange={(e) => updateFormData("occupation", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div className="mb-4 text-left">
              <label className="block text-[#00458b] font-semibold mb-1">
                Blood Type: <span style={{color:"red"}}>*</span>
              </label>
              <select
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                value={registerData.blood_type || ""}
                onChange={(e) => updateFormData("blood_type", e.target.value)}
              >
                <option value="">-- Select Blood Type --</option>
                <option value="O">O</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A">A</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B">B</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB">AB</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>

        {/* ✅ Data Privacy Agreement */}
        <div className="flex items-center text-left mt-6 mb-4">
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

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg w-full sm:w-1/2"
            onClick={() => navigate("/register")}
          >
            Back
          </button>
          <button
            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg w-full sm:w-1/2"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>

      {/* ✅ Custom Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h3 className="text-lg font-bold text-[#00458b] mb-2">⚠️ Missing Information</h3>
            <p className="text-sm text-gray-700 mb-4">
              Please complete all required fields and agree to the Data Privacy Policy before proceeding.
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
      <br />
    
    </div>
  );
};

export default Register2;
