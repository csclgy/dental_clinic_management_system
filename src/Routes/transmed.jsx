import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const TransMed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Scroll to section if state.scrollTo is passed
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

  // Filter records by search
  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-lg shadow-md p-4 md:col-span-1">
          <h2 className="text-2xl font-bold text-[#00458B] mb-6">
            Transaction History
          </h2>
          <nav className="flex flex-col gap-2">
            <Link to="/transmed">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium bg-[#E6FCF9] text-[#00c3b8] hover:bg-[#d0f8f5]">
                <i className="fa fa-user-circle-o mr-2" aria-hidden="true"></i>
                Medical Records
              </button>
            </Link>
            <Link to="/transappointment">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-history mr-2" aria-hidden="true"></i>
                Appointment History
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-[#00458B] text-white p-6 rounded-lg shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold">Medical Records</h1>
          </div>

          <div className="p-6 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="font-bold text-[#00458B]">Records</h3>
              <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-full sm:w-64">
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-sm sm:text-base">
                <thead>
                  <tr className="bg-white text-[#00458B] border-b border-gray-200">
                    <th className="px-4 py-2 text-left">Visit Date</th>
                    <th className="px-4 py-2 text-left">Diagnosis</th>
                    <th className="px-4 py-2 text-left">Services</th>
                    <th className="px-4 py-2 text-left">Dentist</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-center">Action</th>
                    <th className="px-4 py-2 text-center">Action</th>
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
                        <td className="px-4 py-2 text-center">
                          <Link to="/transviewmed">
                            <button className="bg-[#00c3b8] text-white px-4 py-1 rounded-full w-full sm:w-auto hover:bg-teal-500">
                              View
                            </button>
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Link to="/transviewmed">
                            <button className="bg-[#f44336] text-white px-4 py-1 rounded-full w-full sm:w-auto hover:bg-red-600">
                              Cancel
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-gray-500 py-4">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Button */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full hover:bg-teal-600 w-full sm:w-auto"
                onClick={() => navigate("/register2")}
              >
                Print
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TransMed;