import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [user_name, setUserName] = useState("");
  const [user_password, setUserPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError(""); // clear old error
    try {
      const res = await fetch("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name, user_password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // backend sent no JSON
      }

      if (res.ok) {
        // ✅ Save all important user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.user_name);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userId", data.user.user_id); // ✅ <-- add this line!

        // 🔑 Redirect based on role
        if (data.user.role === "admin") {
          window.location.href = "/admindashboard";
        } else if (data.user.role === "dentist") {
          window.location.href = "/receptionistdashboard";
        } else if (data.user.role === "inventory") {
          window.location.href = "/admininventory";
        } else if (data.user.role === "receptionist") {
          window.location.href = "/receptionistdashboard";
        } else {
          window.location.href = "/";
        }
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("No response from server. Please try again later.");
    }
  };


  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(96,242,231,0.75), rgba(65,145,227,0.75)), url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-[400px] bg-white p-10 rounded-lg shadow-lg text-center">
        <h2 className="text-[#00c3b8] text-2xl font-bold mb-2">LOGIN NOW</h2>
        <p className="text-[#00458B] text-sm mb-6">
          Please enter your login information to set your appointment now.
        </p>

        {/* Username Input */}
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

        {/* Password Input */}
        <div className="mb-4 text-left">
          <label className="block text-[#00458b] font-semibold mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // toggle type
              value={user_password}
              onChange={(e) => setUserPassword(e.target.value)}
              className="w-full border border-[#00458b] rounded-full px-4 py-2 pr-10 outline-none"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>


        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Login Button */}
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
    </div>
  );
};

export default Login;
