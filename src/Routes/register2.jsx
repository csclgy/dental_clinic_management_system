import React from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";

const Register2 = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4">
      <br />
      <div className="w-full max-w-4xl bg-white p-6 sm:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl sm:text-3xl font-bold mb-2">SIGN UP</h2>
        <p className="text-[#00458B] text-sm sm:text-base mb-6">
          Fill in the information below to sign up.
        </p>

        <p className="text-[#00c3b8] font-bold mb-4">Personal Information</p>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* LEFT SIDE */}
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-[#00458b] font-semibold mb-1">First Name</label>
              <input
                type="text"
                value={registerData.fname || ""}
                onChange={(e) => updateFormData("fname", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Last Name</label>
              <input
                type="text"
                value={registerData.lname || ""}
                onChange={(e) => updateFormData("lname", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Gender</label>
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
              <label className="block text-[#00458b] font-semibold mb-1">Religion</label>
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
                <option value="Seventh-day Adventist">Seventh-day Adventist</option>
                <option value="Bible Baptist Church">Bible Baptist Church</option>
                <option value="Aglipayan">Aglipayan</option>
                <option value="UCCP">UCCP</option>
                <option value="Jehovah's Witnesses">Jehovah's Witnesses</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Home Address</label>
              <input
                type="text"
                value={registerData.home_address || ""}
                onChange={(e) => updateFormData("home_address", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Province</label>
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
              <label className="block text-[#00458b] font-semibold mb-1">Middle Name</label>
              <input
                type="text"
                value={registerData.mname || ""}
                onChange={(e) => updateFormData("mname", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
              <input
                type="date"
                value={registerData.date_birth || ""}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Age</label>
              <input
                type="number"
                min={1}
                value={registerData.age || ""}
                readOnly
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Nationality</label>
              <input
                type="text"
                value={registerData.nationality || ""}
                onChange={(e) => updateFormData("nationality", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">City</label>
              <input
                type="text"
                value={registerData.city || ""}
                onChange={(e) => updateFormData("city", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>

            <div>
              <label className="block text-[#00458b] font-semibold mb-1">Occupation</label>
              <input
                type="text"
                value={registerData.occupation || ""}
                onChange={(e) => updateFormData("occupation", e.target.value)}
                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full sm:w-1/2"
            onClick={() => navigate("/registergcash")}
          >
            Back
          </button>
          <button
            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full sm:w-1/2"
            onClick={() => navigate("/presubmit")}
          >
            Next
          </button>
        </div>
      </div>
      <br></br>
    </div>
  );
};

export default Register2;
