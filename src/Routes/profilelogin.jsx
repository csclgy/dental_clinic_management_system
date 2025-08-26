import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProfileLogin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    user_name: "",
    email: "",
    contact_no: "",
    gcash_num: "",
  });
  const [loading, setLoading] = useState(true); // optional: show loading state
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login"); // redirect if no token
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await res.json();
        setUser({
          user_name: data.user_name,
          email: data.email,
          contact_no: data.contact_no,
          gcash_num: data.gcash_num,
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
    const res = await fetch("http://localhost:3000/auth/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_name: user.user_name,
        email: user.email,
        contact_no: user.contact_no,
        gcash_num: user.gcash_num,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to update profile");
    }

    const data = await res.json();
    alert(data.message); // show success message
  } catch (err) {
    console.error("Error updating profile:", err);
    alert("Could not update profile. Please try again.");
  }
};

  if (loading) return <p>Loading...</p>;

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
                        <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100" style={{color:"#00c3b8"}}><i className="fa fa-user-circle-o" aria-hidden="true"></i> Login Information</button> 
                    </Link> 
                        <br /> 
                        <Link to ="/profileinfo"> 
                            <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100 " style={{color:"#00458B"}}><i className="fa fa-info-circle" aria-hidden="true"></i> User Information</button> 
                        </Link> 
                        <br /> 
                        <Link to ="/profilechange"> 
                            <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100" style={{color:"#00458B"}}><i className="fa fa-lock" aria-hidden="true"></i> Change Password</button> 
                        </Link> 
                    </div> 
                    <div className="col-sm-7"> 
                        <div className="row"> 
                            <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}> 
                                <div className="row"> 
                                    <div className="col-sm-10"> <h1 className="text-2xl font-bold">Login Information</h1> 
                                    {error && <p className="text-red-500">{error}</p>}
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
                                    <div class="mb-4 text-left"> 
                                        <br /> 
                                        <br /> 
                                        <label class="block text-[#00458b] font-semibold mb-1">Username</label> 
                                        <input
                                          type="text"
                                          value={user.user_name}
                                          readOnly
                                          onChange={(e) => setUser({ ...user, user_name: e.target.value })}
                                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                        />
                                    </div> 
                                    <div class="mb-4 text-left"> 
                                        <label class="block text-[#00458b] font-semibold mb-1">Email</label> 
                                        <input
                                          type="email"
                                          value={user.email}
                                          readOnly
                                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                        />
                                    </div> 
                                    <div class="mb-4 text-left"> 
                                        <label class="block text-[#00458b] font-semibold mb-1">Contact Number</label> 
                                        <input
                                          type="text"
                                          value={user.contact_no}
                                          onChange={(e) => setUser({ ...user, contact_no: e.target.value })}
                                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                        />
                                    </div> 
                                    <div class="mb-4 text-left"> 
                                        <label class="block text-[#00458b] font-semibold mb-1">Gcash Number</label> 
                                        <input
                                          type="text"
                                          value={user.gcash_num}
                                          onChange={(e) => setUser({ ...user, gcash_num: e.target.value })}
                                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                        />
                                    </div> 
                                </div> 
                                <div className="col-sm-3"> 

                                </div> <div className="col-sm-12"> 
                                    <div className="row"> <div className="col-sm-6"> 

                                    </div> 
                                    <div className="col-sm-6"> 
                                      <br />
                                        <div className="row"> 
                                        <div className="col-sm-8"> 
                                            <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/profilechange")}>
                                                Change Password
                                            </button> 
                                        </div> 
                                        <div className="col-sm-4"> 
                                            <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" 
                                              onClick={handleSave} 
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

export default ProfileLogin;
