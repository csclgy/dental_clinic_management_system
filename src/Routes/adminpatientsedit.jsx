import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // 👈 useParams here

const AdminPatientsEdit = () => {
  const { id } = useParams(); // 👈 get user id from URL
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const [patient, setPatient] = useState({
    fname: "",
    mname: "",
    lname: "",
    gender: "",
    age: "",
    date_birth: "",
    home_address: "",
    city: "",
    email: "",
    contact_no: "",
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
        const res = await fetch(`http://localhost:3000/auth/displaypatient/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await res.json();
        setPatient({
        fname: data.patient.fname,
        mname: data.patient.mname,
        lname: data.patient.lname,
        gender: data.patient.gender,
        age: data.patient.age,
        date_birth: data.patient.date_birth,
        home_address: data.patient.home_address,
        city: data.patient.city,
        email: data.patient.email,
        contact_no: data.patient.contact_no,
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
  }, [id, navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
    const res = await fetch(`http://localhost:3000/auth/updatepatientinfo/${id}`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patient), // ✅ use patient, not user
    });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      alert(data.message);
      navigate("/adminpatients"); // 👈 go back after saving
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Could not update profile. Please try again.");
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            <div
                className="col-sm-3 p-5 rounded-lg shadow-lg"
                style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
                >
                {/* Dashboard */}
                <Link to="/">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i className="fa fa-tachometer" aria-hidden="true"></i> Dashboard
                    </button>
                </Link>

                {/* Ledger with Dropdown */}
                <button
                    onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                    className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                >
                    <span>
                    <i className="fa fa-book" aria-hidden="true"></i> Ledger
                    </span>
                    <i
                    className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`}
                    aria-hidden="true"
                    ></i>
                </button>

                {isLedgerOpen && (
                    <div className="ml-8 text-sm">
                    <Link to="/admincoa">
                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                        Chart of Accounts
                        </p>
                    </Link>
                    <Link to="/adminjournal">
                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                        Journal Entries
                        </p>
                    </Link>
                     <Link to='/adminsubsidiaryreceivable'>
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Subsidiary 
                    </p>
                  </Link> 
                    <Link to="/admingeneral">
                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                        General Ledger
                        </p>
                    </Link>
                    <Link to="/admintrial">
                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                        Trial Balance
                        </p>
                    </Link>
                    </div>
                )}

                {/* Users */}
                <Link to="/adminusers">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i className="fa fa-users" aria-hidden="true"></i> Users
                    </button>
                </Link>

                {/* Inventory */}
                <Link to="/admininventory">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i className="fa fa-archive" aria-hidden="true"></i> Inventory
                    </button>
                </Link>

                {/* Patients */}
                <Link to="/adminpatients">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00c3b8" }}
                    >
                    <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                    </button>
                </Link>

                {/* Schedule */}
                <Link to="/adminschedule">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i class="fa fa-calendar" aria-hidden="true"></i> Schedules
                    </button>
                </Link>

                {/* Audit Trail */}
                <Link to="/adminaudit">
                    <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-100"
                    style={{ color: "#00458B" }}
                    >
                    <i className="fa fa-eye" aria-hidden="true"></i> Audit Trail
                    </button>
                </Link>
                </div>
                <div className="col-sm-8">
                    <div className="row">
                        <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                            <div className="row">
                                <div className="col-sm-10">
                                    <h1 className="text-2xl font-bold">Patients Record</h1>
                                </div>
                                <div className="col-sm-2">
                                </div>
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>Edit Profile</h1>
                                    <div className="col-sm-3">

                                    </div>
                                    <div className="col-sm-6">
                                        <br />
                                        <br />
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">First Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={patient.fname}
                                                        onChange={(e) => setPatient({ ...patient, fname: e.target.value })} 
                                                        class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Middle Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={patient.mname}
                                                        onChange={(e) => setPatient({ ...patient, mname: e.target.value })} 
                                                        class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Last Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={patient.lname}
                                                        onChange={(e) => setPatient({ ...patient, lname: e.target.value })} 
                                                        class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Gender</label>
                                                    <select  
                                                        value={patient.gender}
                                                        onChange={(e) => setPatient({ ...patient, gender: e.target.value })} 
                                                        class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Age</label>
                                                    <input 
                                                        type="text" 
                                                        value={patient.age}
                                                        onChange={(e) => setPatient({ ...patient, age: e.target.value })} 
                                                        class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
                                                    <input 
                                                        type="date" 
                                                        value={patient.date_birth}
                                                        onChange={(e) => setPatient({ ...patient, date_birth: e.target.value })} 
                                                        class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Home Address</label>
                                            <input 
                                                type="text" 
                                                value={patient.home_address}
                                                onChange={(e) => setPatient({ ...patient, home_address: e.target.value })} 
                                                class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                        </div>
                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">City</label>
                                            <input 
                                                type="text" 
                                                value={patient.city}
                                                onChange={(e) => setPatient({ ...patient, city: e.target.value })} 
                                                class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                        </div>
                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Email Address</label>
                                            <input 
                                                type="email" 
                                                value={patient.email}
                                                onChange={(e) => setPatient({ ...patient, email: e.target.value })} 
                                                class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                        </div>
                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Contact Number</label>
                                            <input 
                                                type="number" 
                                                value={patient.contact_no}
                                                onChange={(e) => setPatient({ ...patient, contact_no: e.target.value })} 
                                                class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                        </div>
                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Blood Type</label>
                                            <select
                                                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                            >
                                                <option value="">-- Select Blood Type --</option>
                                                <option value="O">O</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="A">A</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B">B</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB">AB</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="Unknown">Unknown</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-sm-3">

                                    </div>
                                    <div className="col-sm-12">
                                        <br />
                                        <br /> 
                                        <div className="row">
                                            <div className="col-sm-6">
                                            </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminpatients")}>Back</button>
                                                </div>
                                            <div className="col-sm-6">
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

export default AdminPatientsEdit;
