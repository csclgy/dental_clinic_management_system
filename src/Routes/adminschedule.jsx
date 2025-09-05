import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const AdminSchedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Scroll support
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

  // Sample records
  const records = [
    {
      date: "05-30-2025",
      lastName: "Dela Cruz",
      firstName: "Juan",
      services: "Oral Exam & Periapical X-ray",
      dentist: "Dr. A. Reyes",
      status: "Completed",
    },
    {
      date: "07-15-2025",
      lastName: "Santos",
      firstName: "Maria",
      services: "Extraction of Wisdom Tooth",
      dentist: "Dr. M. Santos",
      status: "Ongoing",
    },
  ];

  // Filter
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
            {/* Sidebar */}
            <div
              className="col-sm-3 p-5 rounded-lg shadow-lg"
              style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
            >
              {/* Dashboard */}
              <Link to="/">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-tachometer" aria-hidden="true"></i>{" "}
                  Dashboard
                </button>
              </Link>

              {/* Ledger */}
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100 transition"
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

              {/* Other nav */}
              <Link to="/adminusers">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-users" aria-hidden="true"></i> Users
                </button>
              </Link>
              <Link to="/admininventory">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-archive" aria-hidden="true"></i> Inventory
                </button>
              </Link>
              <Link to="/adminpatients">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                </button>
              </Link>
              <Link to="/adminschedule">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                  style={{ color: "#00c3b8" }}
                >
                  <i className="fa fa-calendar" aria-hidden="true"></i> Schedules
                </button>
              </Link>
              <Link to="/adminaudit">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-eye" aria-hidden="true"></i> Audit Trail
                </button>
              </Link>
            </div>

            {/* Main */}
            <div className="col-sm-8">
              <div className="row">
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <h1 className="text-2xl font-bold">Schedules</h1>
                </div>

                <p style={{ color: "transparent" }}>...</p>

                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  {/* Search */}
                  <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400 mb-6">
                    <div className="flex justify-end">
                      <div className="flex items-center border border-[#00458B] rounded-full px-3 py-2 w-80">
                        <input
                          type="text"
                          placeholder="Search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1 outline-none text-base text-gray-700"
                        />
                        <i className="fa fa-search text-[#00458B] text-lg"></i>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-max w-full border-collapse border border-gray-200 text-base">
                        <thead className="bg-white text-[#00458B] border-b border-gray-200 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-center whitespace-nowrap">Visit Date</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap">Last Name</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap">First Name</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap">Services</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap">Dentist</th>
                            <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
                            <th colSpan={5} className="px-4 py-3 text-center whitespace-nowrap">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecords.length > 0 ? (
                            filteredRecords.map((record, index) => (
                              <tr
                                key={index}
                                className={`border-b border-gray-200 text-center ${
                                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                              >
                                <td className="px-4 py-3 text-blue-700 whitespace-nowrap">{record.date}</td>
                                <td className="px-4 py-3 text-blue-700 whitespace-nowrap">{record.lastName}</td>
                                <td className="px-4 py-3 text-blue-700 whitespace-nowrap">{record.firstName}</td>
                                <td className="px-4 py-3 text-blue-700 whitespace-nowrap">{record.services}</td>
                                <td className="px-4 py-3 text-blue-700 whitespace-nowrap">{record.dentist}</td>
                                <td className="px-4 py-3 text-blue-700 whitespace-nowrap">{record.status}</td>

                                {/* View */}
                                <td className="px-2 py-3 whitespace-nowrap">
                                  <Link to="/adminconsultationview" state={{ schedule: record }}>
                                    <button className="bg-[#008CBA] hover:bg-[#0079A5] transition text-white font-semibold px-4 py-2 rounded-full">
                                      View
                                    </button>
                                  </Link>
                                </td>

                                {/* Delete */}
                                <td className="px-2 py-3 whitespace-nowrap">
                                  <Link to="/admininventorydelete" state={{ schedule: record }}>
                                    <button className="bg-[#f44336] hover:bg-[#d32f2f] transition text-white px-4 py-2 rounded-full">
                                      Delete
                                    </button>
                                  </Link>
                                </td>

                                {/* Cancel */}
                                <td className="px-2 py-3 whitespace-nowrap">
                                  {record.status === "Completed" ? (
                                    <button
                                      disabled
                                      className="bg-gray-300 text-gray-600 px-4 py-2 rounded-full cursor-not-allowed"
                                    >
                                      Cancel
                                    </button>
                                  ) : (
                                    <Link to="/adminschedulecancel" state={{ schedule: record }}>
                                      <button className="bg-[#e7e7e7] hover:bg-gray-300 transition text-black px-4 py-2 rounded-full">
                                        Cancel
                                      </button>
                                    </Link>
                                  )}
                                </td>

                                {/* Follow Up */}
                                <td className="px-2 py-3 whitespace-nowrap">
                                  {record.status === "Completed" ? (
                                    <button
                                      disabled
                                      className="bg-[#00a89d] text-white px-4 py-2 rounded-full cursor-not-allowed"
                                    >
                                      + Follow Up
                                    </button>
                                  ) : (
                                    <Link to="/admininventoryedit" state={{ schedule: record }}>
                                      <button className="bg-[#00c3b8] hover:bg-[#00a89d] transition text-white font-semibold px-4 py-2 rounded-full">
                                        + Follow Up
                                      </button>
                                    </Link>
                                  )}
                                </td>

                                {/* Complete */}
                                <td className="px-2 py-3 whitespace-nowrap">
                                  {record.status === "Completed" ? (
                                    <button
                                      disabled
                                      className="bg-green-200 text-white px-4 py-2 rounded-full cursor-not-allowed"
                                    >
                                      Complete
                                    </button>
                                  ) : (
                                    <Link to="/adminschedulecomplete" state={{ schedule: record }}>
                                      <button className="bg-green-600 hover:bg-green-700 transition text-white font-semibold px-4 py-2 rounded-full">
                                        Complete
                                      </button>
                                    </Link>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={11} className="text-center text-gray-500 py-4">
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

            <div className="col-sm-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedule;
