import React from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";

const Registergcash = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();

  const isGcashValid = /^\d{11}$/.test(registerData.gcash_num || "");

  const canProceed =
    registerData.downpayment === "Yes" ||
    (registerData.downpayment === "No" && isGcashValid);

  const handleSkip = () => {
    setRegisterData((prev) => ({
      ...prev,
      downpayment: "",   // clears Yes/No
      gcash_num: "",     // clears GCash number too
    }));
    navigate("/register2");
  };

  const handleNext = () => {
    if (canProceed) {
      navigate("/register2");
    }
  };

  const handleRadioChange = (value) => {
    setRegisterData((prev) => ({
      ...prev,
      downpayment: value,
      gcash_num: value === "Yes" ? prev.contact_no : "", // auto-fill if Yes
    }));
  };

  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4"
      style={{
      backgroundImage:
        "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center"}}  
    >
      <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl sm:text-3xl font-bold mb-2">SIGN UP</h2>
        <p className="text-[#00458B] text-sm sm:text-base mb-6">
          Kindly confirm that your contact number is the one registered with your GCash account before moving to the next step.
        </p>

        {/* Radio Buttons*/}
        <div className="flex justify-center gap-6 mb-4">
          <label
            className={`px-6 py-2 rounded-full border font-semibold cursor-pointer transition ${
              registerData.downpayment === "Yes"
                ? "bg-[#00c3b8] text-white border-[#00c3b8]"
                : "bg-white text-[#00458b] border-[#00458b]"
            }`}
          >
            <input
              type="radio"
              name="downpayment"
              value="Yes"
              checked={registerData.downpayment === "Yes"}
              onChange={() => handleRadioChange("Yes")}
              className="hidden"
            />
            Yes
          </label>

          <label
            className={`px-6 py-2 rounded-full border font-semibold cursor-pointer transition ${
              registerData.downpayment === "No"
                ? "bg-[#00c3b8] text-white border-[#00c3b8]"
                : "bg-white text-[#00458b] border-[#00458b]"
            }`}
          >
            <input
              type="radio"
              name="downpayment"
              value="No"
              checked={registerData.downpayment === "No"}
              onChange={() => handleRadioChange("No")}
              className="hidden"
            />
            No
          </label>
        </div>

        {/* GCash Number */}
        {registerData.downpayment === "No" && (
          <div className="mb-4 text-left">
            <label className="block text-[#00458b] font-semibold mb-1">
              GCash Account Number:
            </label>
            <input
              type="number"
              value={registerData.gcash_num || ""}
              onChange={(e) => updateFormData("gcash_num", e.target.value)}
              className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#00c3b8]"
              readOnly={registerData.downpayment === "Yes"}
            />
            {!isGcashValid && registerData.gcash_num?.length > 0 && (
              <p className="text-red-500 text-xs mt-1">GCash number must be 11 digits.</p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-6 w-full">
          <button
            className={`px-6 py-2 rounded-full font-semibold w-full ${
              canProceed
                ? "bg-[#00c3b8] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleNext}
            disabled={!canProceed}
          >
            Next
          </button>

          <button
            className="bg-gray-200 text-[#00458b] font-semibold px-6 py-2 rounded-full w-full"
            onClick={handleSkip}
          >
            Skip
          </button>

          <button
            className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full"
            onClick={() => navigate("/register")}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registergcash;
