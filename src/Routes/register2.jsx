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
        age--; // subtract one if birthday hasn't occurred yet this year
      }
      updateFormData("age", age);
    } else {
      updateFormData("age", "");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <br />
      <div className="w-[50%] bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl font-bold mb-2">SIGN UP</h2>
        <p className="text-[#00458B] text-sm mb-6">
          Fill in the information below to sign up.
        </p>

        <p className="text-[#00c3b8] font-bold mb-2">Personal Information</p>

        <div className="col-sm-12">
          <div className="row">
            {/* LEFT SIDE */}
            <div className="col-sm-6">
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={registerData.fname || ""}
                  onChange={(e) => updateFormData("fname", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={registerData.lname || ""}
                  onChange={(e) => updateFormData("lname", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Gender
                </label>
                <select
                  value={registerData.gender || ""}
                  onChange={(e) => updateFormData("gender", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Religion
                </label>
                <input
                  type="text"
                  value={registerData.religion || ""}
                  onChange={(e) => updateFormData("religion", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Home Address
                </label>
                <input
                  type="text"
                  value={registerData.home_address || ""}
                  onChange={(e) => updateFormData("home_address", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Province
                </label>
                <input
                  type="text"
                  value={registerData.province || ""}
                  onChange={(e) => updateFormData("province", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-sm-6">
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={registerData.mname || ""}
                  onChange={(e) => updateFormData("mname", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={registerData.date_birth || ""}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min={1}
                  value={registerData.age || ""}
                  readOnly
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={registerData.nationality || ""}
                  onChange={(e) =>
                    updateFormData("nationality", e.target.value)
                  }
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={registerData.city || ""}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-[#00458b] font-semibold mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={registerData.occupation || ""}
                  onChange={(e) => updateFormData("occupation", e.target.value)}
                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-12 mt-6">
          <div className="row">
            <div className="col-sm-6">
              <button
                className="bg-[#FFFFFF] text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full mb-4"
                onClick={() => navigate("/registergcash")}
              >
                Back
              </button>
            </div>
            <div className="col-sm-6">
              <button
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                onClick={() => navigate("/presubmit")}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <br />
    </div>
  );
};

export default Register2;
