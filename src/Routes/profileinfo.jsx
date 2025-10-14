import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

const ProfileInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    fname: "",
    mname: "",
    lname: "",
    date_birth: "",
    gender: "",
    age: "",
    religion: "",
    nationality: "",
    home_address: "",
    city: "",
    province: "",
    occupation: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false); // ✅ Added for fade animation

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser({
          fname: data.fname,
          mname: data.mname,
          lname: data.lname,
          date_birth: data.date_birth,
          gender: data.gender,
          age: data.age,
          religion: data.religion,
          nationality: data.nationality,
          home_address: data.home_address,
          city: data.city,
          province: data.province,
          occupation: data.occupation,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Could not fetch user. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // ✅ Same popup animation logic as ProfileLogin
  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);

    // Start fade-out after 2.5s
    setTimeout(() => setFade(false), 2500);
    // Remove popup after 3s
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/updateinfo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();

      // ✅ Show success popup (same style as ProfileLogin)
      showPopup("Profile information updated successfully.", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      // ❌ Show error popup
      showPopup("Could not update profile. Please try again.", "error");
    }
  };

  // Smooth scroll on mount
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  if (loading) 
    return (
    <div className="flex justify-center items-center h-screen">
      <svg
        aria-hidden="true"
        className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          className="text-gray-300"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          className="text-[#00c3b8]"
          fill="currentFill"
        />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-4 md:col-span-1">
          <h2 className="text-2xl font-bold text-[#00458B] mb-6">Profile</h2>
          <div className="flex flex-col gap-2">
            <Link to="/profilelogin">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-user-circle-o mr-2" /> Login Information
              </button>
            </Link>
            <Link to="/profileinfo">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium bg-[#E6FCF9] text-[#00c3b8] hover:bg-[#d0f8f5]">
                <i className="fa fa-info-circle mr-2" /> User Information
              </button>
            </Link>
            <Link to="/profilechange">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-lock mr-2" /> Change Password
              </button>
            </Link>
          </div>
        </div>

        {/* ✅ Popup Notification (exact same animation as ProfileLogin) */}
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-3"
              } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}

        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-[#00458B] p-6 rounded-lg shadow-lg text-white">
            <h1 className="text-xl md:text-2xl font-bold">User Information</h1>
          </div>

          {/* Form Card */}
          <div
            className="p-6 rounded-lg shadow-lg"
            style={{ border: "solid", borderColor: "#01D5C4" }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left side */}
              <div>
                <Input label="First Name" value={user.fname} />
                <Input label="Last Name" value={user.lname} />
                <Input label="Gender" value={user.gender} />
                <Input label="Religion" value={user.religion} />
                <Input
                  label="Home Address"
                  value={user.home_address}
                  onChange={(e) =>
                    setUser({ ...user, home_address: e.target.value })
                  }
                />
                <Input
                  label="Province"
                  value={user.province}
                  onChange={(e) =>
                    setUser({ ...user, province: e.target.value })
                  }
                />
              </div>

              {/* Right side */}
              <div>
                <Input label="Middle Name" value={user.mname} />
                <Input label="Date of Birth" value={user.date_birth} readOnly />
                <Input label="Age" value={user.age} readOnly />
                <Input label="Nationality" value={user.nationality} readOnly />
                <Input
                  label="City"
                  value={user.city}
                  onChange={(e) => setUser({ ...user, city: e.target.value })}
                />
                <Input
                  label="Occupation"
                  value={user.occupation}
                  onChange={(e) =>
                    setUser({ ...user, occupation: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg w-full md:w-auto"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small reusable input field
const Input = ({ label, value, onChange, readOnly }) => (
  <div className="mb-4">
    <label className="block text-[#00458b] font-semibold mb-1">{label}</label>
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={onChange}
      className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
    />
  </div>
);

export default ProfileInfo;
