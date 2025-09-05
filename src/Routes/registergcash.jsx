import React from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";

const Registergcash = () => {
  const navigate = useNavigate();
  const { registerData, setRegisterData } = useRegister();

  const isGcashValid = /^\d{11}$/.test(registerData.gcash_num || "");

  const canProceed =
    (registerData.downpayment === "Yes") ||
    (registerData.downpayment === "No" && isGcashValid);

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
    setRegisterData((prev) => {
      const updated = { ...prev, [field]: value };

      return updated;
    });
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
      <br />
      <div className="w-[35%] bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl font-bold mb-2">SIGN UP</h2>
        <p className="text-[#00458B] text-sm mb-6">
          Kindly confirm that your contact number is the one registered with your GCash account before moving to the next step.
        </p>

        <div className="col-sm-12">
          <div className="row">
            <div className="col-sm-6">
              <input
                type="radio"
                id="yes"
                name="downpayment"
                value="Yes"
                checked={registerData.downpayment === "Yes"}
                onChange={() => handleRadioChange("Yes")}
              />
              <label htmlFor="yes" className="ml-2">Yes</label>
            </div>
            <div className="col-sm-6">
              <input
                type="radio"
                id="no"
                name="downpayment"
                value="No"
                checked={registerData.downpayment === "No"}
                onChange={() => handleRadioChange("No")}
              />
              <label htmlFor="no" className="ml-2">No</label>
            </div>
          </div>
        </div>

        <br />
        {registerData.downpayment === "No" && (
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">GCash Account Number:</label>
          <input
            type="number"
            id="gcash_num"
            value={registerData.gcash_num || ""}
            onChange={(e) => updateFormData("gcash_num", e.target.value)}
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
            readOnly={registerData.downpayment === "Yes"}
          />
          {!isGcashValid && registerData.gcash_num?.length > 0 && (
            <p className="text-red-500 text-xs mt-1">GCash number must be 11 digits.</p>
          )}
        </div>
        )}

        <div className="col-sm-12 mt-6">
          <div className="row">
            <div className="col-sm-6">
              <button
                className="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full mb-4"
                onClick={() => navigate("/register")}
              >
                Back
              </button>
            </div>
            <div className="col-sm-6">
              <button
                className={`px-6 py-2 rounded-full w-full mb-4 font-semibold 
                  ${canProceed ? "bg-[#00c3b8] text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registergcash;
