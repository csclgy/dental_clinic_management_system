import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const transmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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

   const records = [
    {
      date: "05-30-2025",
      diagnosis: "Dental Caries",
      services: "Oral Exam & Periapical X-ray",
      dentist: "Dr. A. Reyes",
      status: "Completed",
    },
    {
      date: "07-15-2025",
      diagnosis: "Tooth Extraction",
      services: "Extraction of Wisdom Tooth",
      dentist: "Dr. M. Santos",
      status: "Ongoing",
    },
  ];

  // Filter based on search term (case-insensitive)
  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-3">
                <br />
                <h2 className="text-3xl font-bold text-[#00458B]">Transaction History</h2>
                <br />
                <br />
                <Link to ="/transmed" >
                    <button  className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100" style={{color:"#00c3b8"}}><i class="fa fa-user-circle-o" aria-hidden="true"></i> Medical Records</button>
                </Link>
                <br />
                <Link to ="/transappointment">
                    <button className="w-full text-left px-4 py-2 text-500 hover:bg-blue-100 " style={{color:"#00458B"}}><i class="fa fa-history" aria-hidden="true"></i> Appointment History</button>
                </Link>
                <br />
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
                        <div className="row">
                            <div className="col-sm-12">
                            {/* Search bar */}
                            <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-1">
                                    <h1 className=" font-bold text-[#00458B]"></h1>
                                    {/* Search bar */}
                                    <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-64">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1 outline-none text-sm text-gray-700"
                                    />
                                    <i className="fa fa-search text-[#00458B]"></i>
                                    </div>
                                </div>
                            </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-200">
                                        <thead>
                                            <tr className="bg-white text-[#00458B] border-b border-gray-200">
                                            <th className="px-4 py-2 text-left">Visit Date</th>
                                            <th className="px-4 py-2 text-left">Diagnosis</th>
                                            <th className="px-4 py-2 text-left">Services</th>
                                            <th className="px-4 py-2 text-left">Dentist</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left text-center">Action</th>
                                            <th className="px-4 py-2 text-left text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRecords.length > 0 ? (
                                            filteredRecords.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-200">
                                                <td className="px-4 py-2 text-blue-700">{record.date}</td>
                                                <td className="px-4 py-2 text-blue-700">{record.diagnosis}</td>
                                                <td className="px-4 py-2 text-blue-700">{record.services}</td>
                                                <td className="px-4 py-2">{record.dentist}</td>
                                                <td className="px-4 py-2">{record.status}</td>
                                                <td className="px-4 py-2">
                                                    <Link to="/transviewmed">
                                                    <button className="bg-[#00c3b8] text-white px-4 py-1 rounded-full hover:bg-teal-500">
                                                    View
                                                    </button>
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Link to="/transviewmed">
                                                    <button className="bg-[#f44336] text-white px-4 py-1 rounded-full hover:bg-teal-500">
                                                    Cancel
                                                    </button>
                                                    </Link>
                                                </td>
                                                </tr>
                                            ))
                                            ) : (
                                            <tr>
                                                <td
                                                colSpan="6"
                                                className="text-center text-gray-500 py-4"
                                                >
                                                No records found
                                                </td>
                                            </tr>
                                            )}
                                        </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                            <br />
                                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/register2")}>Print</button>
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

export default transmed;
