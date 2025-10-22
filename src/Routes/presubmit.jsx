import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../context/RegisterContext";
import axios from "axios";

const Presubmit = () => {
  const navigate = useNavigate();
  const { registerData } = useRegister();
  const [loading, setLoading] = useState(false);

  // ✅ Popup state (same as AdminCoaAdd)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/register",
        registerData
      );

      showPopup(response.data.message || "Registration successful!", "success");
      console.log(response);

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      if (error.response) {
        showPopup(error.response.data.message || "Something went wrong", "error");
        console.error("Response error:", error.response.data);
      } else if (error.request) {
        showPopup("No response from server. Please try again later.", "error");
        console.error("Request error:", error.request);
      } else {
        showPopup("Error: " + error.message, "error");
        console.error("Axios error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4] px-4 relative"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ Popup Notification (copied from AdminCoaAdd) */}
      {popup.show && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${
            fade
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3"
          } ${
            popup.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
          style={{ zIndex: 9999 }}
        >
          {popup.message}
        </div>
      )}

      <br></br>
      <div className="w-full max-w-xl bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-xl sm:text-2xl font-bold mb-2">SIGN UP</h2>
        <p className="text-[#00458B] text-sm sm:text-base mb-6">
          Please double check your information
        </p>

        <div className="text-left text-[#00458B] space-y-1 text-sm sm:text-base">
          <p className="font-bold text-xl text-[#00c3b8]">LOGIN INFORMATION:</p>
          <hr></hr>
          <p><b>Username:</b> {registerData.user_name}</p>
          <p><b>Password:</b> *****</p>
          <p><b>Email:</b> {registerData.email}</p>
          <p><b>Contact Number:</b> {registerData.contact_no}</p>

          <br></br>
          <p className="font-bold text-xl text-[#00c3b8]">PERSONAL INFORMATION:</p>
          <hr></hr>
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
          <p><b>Blood Type:</b> {registerData.blood_type}</p>
          <p style={{ color: "transparent" }}>
            <b>Gcash:</b> {registerData.gcash_num}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row mt-6 gap-3 sm:gap-4">
          <button
            className="bg-white text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-lg w-full"
            onClick={() => navigate("/register2")}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg w-full ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
      <br></br>
    </div>
  );
};

export default Presubmit;
