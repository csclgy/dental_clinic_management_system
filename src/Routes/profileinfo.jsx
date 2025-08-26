import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";

const profileinfo = () => {
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
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: user.user_name,
          fname: user.fname,
          mname: user.mname,
          lname: user.lname,
          date_birth: user.date_birth,
          gender: user.gender,
          age: user.age,
          religion: user.religion,
          nationality: user.nationality,
          home_address: user.home_address,
          city: user.city,
          province: user.province,
          occupation: user.occupation,
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
                    <button  className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100" style={{color:"#00458B"}}><i class="fa fa-user-circle-o" aria-hidden="true"></i> Login Information</button>
                </Link>
                <br />
                <Link to ="/profileinfo">
                    <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100 " style={{color:"#00c3b8"}}><i class="fa fa-info-circle" aria-hidden="true"></i>  User Information</button>
                </Link>
                <br />
                <Link to ="/profilechange">
                    <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100" style={{color:"#00458B"}}><i class="fa fa-lock" aria-hidden="true"></i>  Change Password</button> 
                </Link>
            </div>
            <div className="col-sm-7">
                <div className="row">
                    <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                        <div className="row">
                            <div className="col-sm-10">
                                <h1 className="text-2xl font-bold">User Information</h1>
                            </div>
                            <div className="col-sm-2">
                                <h1 className="text-2xl font-bold" style={{color:"transparent"}}></h1>
                            </div>
                        </div>
                    </div>

                    <p style={{color:"transparent"}}>...</p>
                    <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                        <div className="row">
                            <div className="col-sm-2">
  
                            </div>
                            <div className="col-sm-8">
                                <br />
                                <br />
                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">First Name</label>
                                                <input 
                                                    type="text" 
                                                    value={user.fname}
                                                    onChange={(e) => setUser({ ...user, fname: e.target.value })}
                                                    readOnly
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Last Name</label>
                                                <input 
                                                    type="text"
                                                    value={user.lname}
                                                    onChange={(e) => setUser({ ...user, lname: e.target.value })} 
                                                    readOnly
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Gender</label>
                                                <input 
                                                    type="text"
                                                    value={user.gender}
                                                    onChange={(e) => setUser({ ...user, gender: e.target.value })} 
                                                    readOnly
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Religion</label>
                                                <input 
                                                    type="text" 
                                                    value={user.religion}
                                                    onChange={(e) => setUser({ ...user, religion: e.target.value })} 
                                                    readOnly
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Home Address</label>
                                                <input 
                                                    type="text"
                                                    value={user.home_address}
                                                    onChange={(e) => setUser({ ...user, home_address: e.target.value })} 
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Province</label>
                                                <input 
                                                    type="text" 
                                                    value={user.province}
                                                    onChange={(e) => setUser({ ...user, province: e.target.value })} 
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                        </div>

                                        <div className="col-sm-6">
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Middle Name</label>
                                                <input 
                                                    type="text" 
                                                    value={user.mname}
                                                    onChange={(e) => setUser({ ...user, mname: e.target.value })} 
                                                    readOnly
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
                                                <input 
                                                    type="text" 
                                                    value={user.date_birth}
                                                    onChange={(e) => setUser({ ...user, date_birth: e.target.value })} 
                                                    readOnly
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Age</label>
                                                <input 
                                                    type="text" 
                                                    value={user.age}
                                                    onChange={(e) => setUser({ ...user, age: e.target.value })} 
                                                    readOnly
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Nationality</label>
                                                <input 
                                                    type="text" 
                                                    value={user.nationality}
                                                    onChange={(e) => setUser({ ...user, nationality: e.target.value })} 
                                                    readOnly
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">City</label>
                                                <input 
                                                    type="text" 
                                                    value={user.city}
                                                    onChange={(e) => setUser({ ...user, city: e.target.value })} 
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>
                                            <div class="mb-4 text-left">
                                                <label class="block text-[#00458b] font-semibold mb-1">Occupation</label>
                                                <input 
                                                    type="text" 
                                                    value={user.occupation}
                                                    onChange={(e) => setUser({ ...user, occupation: e.target.value })} 
                                                    class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="col-sm-2">

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
                                              <br />
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

export default profileinfo;
