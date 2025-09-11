import React, { useState } from "react";

const AlertBox = ({ type, message }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] text-center relative">
        {/* ✅ Title only */}
        <h2
          className={`text-lg font-bold mb-2 ${
            type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {type === "success" ? "Success!" : "Error!"}
        </h2>

        {/* ✅ Message */}
        <p className="text-gray-700 mb-4">{message}</p>
      </div>
    </div>
  );
};

const Login = () => {
  const [user_name, setUserName] = useState("");
  const [user_password, setUserPassword] = useState("");
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const handleLogin = async () => {
    setError("");

    // ✅ Check if fields are empty
    if (!user_name || !user_password) {
      setAlertType("error");
      setAlertMessage("Please fill in both Username and Password.");
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name, user_password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.user_name);
        localStorage.setItem("role", data.user.role);

        // ✅ Show success alert
        setAlertType("success");
        setAlertMessage(`Welcome ${data.user.user_name}!`);
        setShowAlert(true);

        setTimeout(() => {
          setShowAlert(false);
          const role = localStorage.getItem("role");
          if (role === "admin") {
            window.location.href = "/admincoa";
          } else if (role === "dentist") {
            window.location.href = "/adminpatients";
          } else if (role === "inventory") {
            window.location.href = "/admininventory";
          } else if (role === "receptionist") {
            window.location.href = "/adminschedule";
          } else {
            window.location.href = "/";
          }
        }, 2000);
      } else {
        setAlertType("error");
        setAlertMessage(data.error || "Login failed. Please check your credentials.");
        setShowAlert(true);

        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setAlertType("error");
      setAlertMessage("No response from server. Please try again later.");
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
      <div className="w-[400px] bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl font-bold mb-2">LOGIN NOW</h2>
        <p className="text-[#00458B] text-sm mb-6">
          Please enter your login information to set your appointment now.
        </p>

        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Username
          </label>
          <input
            type="text"
            value={user_name}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
          />
        </div>

        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            value={user_password}
            onChange={(e) => setUserPassword(e.target.value)}
            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={handleLogin}
          className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
        >
          Login
        </button>

        <p className="text-xs text-[#01D5C4]">
          Don't have an account?
          <br />
          <a href="/register" className="text-[#006EFF] font-semibold">
            Register
          </a>
        </p>
      </div>

      {/* ✅ Auto-closing alert popup */}
      {showAlert && <AlertBox type={alertType} message={alertMessage} />}
    </div>
  );
};

export default Login;
