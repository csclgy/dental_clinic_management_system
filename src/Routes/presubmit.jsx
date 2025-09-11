import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";
import axios from "axios";

const Presubmit = () => {
  const navigate = useNavigate();
  const { registerData } = useRegister();
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const handleSubmit = async () => {
    setAlert({ show: false, type: "", message: "" });

    try {
      const response = await axios.post("http://localhost:3000/auth/register", registerData);
      setAlert({
        show: true,
        type: "success",
        message: response.data.message || "Registration successful!",
      });

      // ✅ success alert then auto-redirect
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      if (error.response) {
        setAlert({
          show: true,
          type: "error",
          message: error.response.data.message || "Something went wrong",
        });
      } else if (error.request) {
        setAlert({
          show: true,
          type: "error",
          message: "No response from server. Please try again later.",
        });
      } else {
        setAlert({
          show: true,
          type: "error",
          message: "Error: " + error.message,
        });
      }

      // ❌ error alert disappears after 2.5s
      setTimeout(() => {
        setAlert({ show: false, type: "", message: "" });
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4">
      <div className="w-full max-w-3xl bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-xl sm:text-2xl font-bold mb-2">SIGN UP</h2>
        <p className="text-[#00458B] text-sm sm:text-base mb-6">
          Please double check your information
        </p>

        <div className="text-left text-[#00458B] space-y-1 text-sm sm:text-base">
          <p><b>Username:</b> {registerData.user_name}</p>
          <p><b>Password:</b> *****</p>
          <p><b>Email:</b> {registerData.email}</p>
          <p><b>Contact Number:</b> {registerData.contact_no}</p>
          <p><b>First Name:</b> {registerData.fname}</p>
          <p><b>Middle Name:</b> {registerData.mname}</p>
          <p><b>Last Name:</b> {registerData.lname}</p>
          <p><b>Date of Birth:</b> {registerData.date_birth}</p>
          <p><b>Gender:</b> {registerData.gender}</p>
          <p><b>Age:</b> {registerData.age}</p>
          <p><b>Religion:</b> {registerData.religion}</p>
          <p><b>Nationality:</b> {registerData.nationality}</p>
          <p><b>Home Address:</b> {registerData.home_address}</p>
          <p><b>City:</b> {registerData.city}</p>
          <p><b>Province:</b> {registerData.province}</p>
          <p><b>Occupation:</b> {registerData.occupation}</p>
          <p><b>Gcash:</b> {registerData.gcash_num}</p>
        </div>

        <div className="flex flex-col sm:flex-row mt-6 gap-3 sm:gap-4">
          <button
            className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full"
            onClick={() => navigate("/register2")}
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Custom Alert Box */}
      {alert.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center relative shadow-lg">
            {alert.type === "success" ? (
              <h3 className="text-lg font-bold mb-2 text-green-600">Success!</h3>
            ) : (
              <h3 className="text-lg font-bold mb-2 text-red-500">Invalid!</h3>
            )}
            <p
              className={`text-sm ${
                alert.type === "success"
                  ? "text-green-600"
                  : "text-gray-700"
              }`}
            >
              {alert.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presubmit;
