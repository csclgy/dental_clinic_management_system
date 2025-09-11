import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const transviewmed = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
                <Link to ="/transmed" >
                    <button  className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100" style={{color:"#00c3b8"}}><i class="fa fa-user-circle-o" aria-hidden="true"></i> Medical Records</button>
                </Link>
                <br />
                <Link to ="/transappointment">
                    <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100 " style={{color:"#00458B"}}><i class="fa fa-history" aria-hidden="true"></i> Appointment History</button>
                </Link>
            </div>
            <div className="col-sm-7">
                <div className="row">
                    <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                        <div className="row">
                            <div className="col-sm-10">
                                <h1 className="text-2xl font-bold">Medical Records</h1>
                            </div>
                            <div className="col-sm-2">
                                <h1 className="text-2xl font-bold" style={{color:"transparent"}}></h1>
                            </div>
                        </div>
                    </div>
                    <p style={{color:"transparent"}}>...</p>
                    <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                        <h1 className="font-bold text-2xl" style={{color:"#00458B"}}>Patients Information</h1>
                        <br />
                        <hr></hr>
                        <div className="row">
                            <div className="col-sm-12">
                                        <br />
                                    <p className="font-bold text-xl" style={{color:"#00c3b8"}}>Santos Maria</p>
                                    <p style={{color:"#00458B"}}>Female | 28 years old | Frebruary 15, 1997</p>
                                        <br />
                                        <br />
                                        <br />
                                <div className="row">
                                    <div className="col-sm-6" style={{color:"#00458B"}}>
                                        <p className="font-bold text-2xl">Address and Contact Information</p>
                                        <hr></hr>
                                        <br />
                                        <p className="font-bold">Address:</p><p>...</p>
                                        <br />
                                        <p className="font-bold">Email Address:</p><p>...</p>
                                        <br />
                                        <p className="font-bold">Contact Number:</p><p>...</p>
                                    </div>

                                    <div className="col-sm-6" style={{color:"#00458B"}}>
                                        <p className="font-bold text-2xl">Health Information & Medical History</p>
                                        <hr></hr>
                                        <br />
                                        <p className="font-bold">Blood Type:</p><p>...</p>
                                    </div>
                                </div>

                                    <br />
                                    <br />
                                    <p className="font-bold text-2xl" style={{color:"#00458B"}}>Consultation Details</p>
                                    <hr></hr>
                                    <br />

                                    <div className="row">
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold">Date of Visit:</p><p>...</p>
                                            <br />
                                            <p className="font-bold">Attending Dentist:</p><p>...</p>
                                            <br />
                                            <p className="font-bold">Diagnosis:</p><p>...</p>
                                            <br />
                                            <p className="font-bold">Services:</p><p>...</p>
                                            <br />
                                            <p className="font-bold">Follow-Up:</p><p>...</p>
                                            <br />
                                        </div>
                                        <div className="col-sm-6" style={{color:"#00458B"}}>
                                            <p className="font-bold">Billing Information</p>
                                            <br />
                                            <ul>
                                                <li>...</li>
                                            </ul>
                                        </div>
                                    </div>

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
                                                <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/")}>Print</button>

                                            </div>
                                            <div className="col-sm-6">
                                                <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/transmed")}>Back to List</button>
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

export default transviewmed;
