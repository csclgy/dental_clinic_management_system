import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const profilechange = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async () => {
  setError("");
  setSuccess("");

  if (newPassword !== confirmPassword) {
    setError("New password and confirm password do not match.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to change password");

    setSuccess("Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (err) {
    setError(err.message);
  }
};


  // Scroll to the section if state.scrollTo is passed
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100); // delay ensures DOM is rendered
      }
    }
  }, [location]);

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-3">
                <br />
                <h2 className="text-3xl font-bold text-[#00458B]">Profile</h2>
                <br />
                <br />
                <Link to ="/profilelogin" >
                    <button  className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100" style={{color:"#00458B"}}><i class="fa fa-user-circle-o" aria-hidden="true"></i> Login Information</button>
                </Link>
                <br />
                <Link to ="/profileinfo">
                    <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100 " style={{color:"#00458B"}}><i class="fa fa-info-circle" aria-hidden="true"></i>  User Information</button>
                </Link>
                <br />
                <Link to ="/profilechange">
                    <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100" style={{color:"#00c3b8"}}><i class="fa fa-lock" aria-hidden="true"></i>  Change Password</button> 
                </Link>
            </div>
            <div className="col-sm-7">
                <div className="row">
                    <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                        <div className="row">
                            <div className="col-sm-10">
                                <h1 className="text-2xl font-bold">Change Password</h1>
                            </div>
                            <div className="col-sm-2">
                                <h1 className="text-2xl font-bold" style={{color:"transparent"}}></h1>
                            </div>
                        </div>
                    </div>

                    <p style={{color:"transparent"}}>...</p>
                    <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                        <div className="row">
                            <div className="col-sm-3">
  
                            </div>
                            <div className="col-sm-6">
                                <br />
                                <br />
                              <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Current Password</label>
                                <input
                                  type="password"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                />
                              </div>
                              <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">New Password</label>
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                />
                              </div>
                              <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Confirm Password</label>
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                />
                              </div>

                            </div>
                            <div className="col-sm-3">

                            </div>

                            <div className="col-sm-12">
                                <div className="row">
                                    <div className="col-sm-6">

                                    </div>
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-8">

                                            </div>
                                            <div className="col-sm-4">
                                              <button
                                                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                                                onClick={handleChangePassword}
                                              >
                                                Save
                                              </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-sm-2">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default profilechange;
