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

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/auth/me", {
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

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/updateinfo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Could not update profile. Please try again.");
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

  if (loading) return <p>Loading...</p>;

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

        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-[#00458B] p-6 rounded-lg shadow-lg text-white">
            <h1 className="text-xl md:text-2xl font-bold">User Information</h1>
          </div>

          {/* Form Card */}
          <div className="p-6 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left side */}
              <div>
                <Input label="First Name" value={user.fname} readOnly />
                <Input label="Last Name" value={user.lname} readOnly />
                <Input label="Gender" value={user.gender} readOnly />
                <Input label="Religion" value={user.religion} readOnly />
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
                <Input label="Middle Name" value={user.mname} readOnly />
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
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full md:w-auto"
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
