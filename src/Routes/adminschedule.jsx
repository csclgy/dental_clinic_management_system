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
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-tachometer" aria-hidden="true"></i>{" "}
                  Dashboard
                </button>
              </Link>

              {/* Ledger */}
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
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-users" aria-hidden="true"></i> Users
                </button>
              </Link>
              <Link to="/admininventory">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-archive" aria-hidden="true"></i> Inventory
                </button>
              </Link>
              <Link to="/adminpatients">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                </button>
              </Link>
              <Link to="/adminschedule">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00c3b8" }}
                >
                  <i className="fa fa-calendar" aria-hidden="true"></i> Schedules
                </button>
              </Link>
              <Link to="/adminaudit">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
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
                  <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                    <div className="flex justify-between items-center mb-1">
                      <div></div>
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
                          <th className="px-4 py-2 text-center">Visit Date</th>
                          <th className="px-4 py-2 text-center">Last Name</th>
                          <th className="px-4 py-2 text-center">First Name</th>
                          <th className="px-4 py-2 text-center">Services</th>
                          <th className="px-4 py-2 text-center">Dentist</th>
                          <th className="px-4 py-2 text-center">Status</th>
                          <th colSpan="4" className="px-4 py-2 text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200 text-center"
                            >
                              <td className="px-4 py-2 text-blue-700">{record.date}</td>
                              <td className="px-4 py-2 text-blue-700">{record.lastName}</td>
                              <td className="px-4 py-2 text-blue-700">{record.firstName}</td>
                              <td className="px-4 py-2 text-blue-700">{record.services}</td>
                              <td className="px-4 py-2 text-blue-700">{record.dentist}</td>
                              <td className="px-4 py-2 text-blue-700">{record.status}</td>

                              {/* View */}
                              <td className="px-2 py-2">
                                <Link to="/adminconsultationview" state={{ schedule: record }}>
                                  <button className="bg-[#008CBA] text-white font-semibold w-full px-4 py-1 rounded-full">
                                    View
                                  </button>
                                </Link>
                              </td>

                              {/* Delete */}
                              <td className="px-2 py-2">
                                <Link to="/admininventorydelete" state={{ schedule: record }}>
                                  <button className="bg-[#f44336] text-white px-4 py-1 rounded-full hover:bg-red-600">
                                    Delete
                                  </button>
                                </Link>
                              </td>

                              {/* Cancel (disabled if Completed) */}
                              <td className="px-2 py-2">
                                {record.status === "Completed" ? (
                                  <button
                                    disabled
                                    className="bg-gray-300 text-gray-600 px-4 py-1 rounded-full cursor-not-allowed"
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <Link
                                    to="/adminschedulecancel"
                                    state={{ schedule: record }}
                                  >
                                    <button className="bg-[#e7e7e7] text-black px-4 py-1 rounded-full hover:bg-gray-300">
                                      Cancel
                                    </button>
                                  </Link>
                                )}
                              </td>

                              {/* Follow Up */}
                              <td className="px-2 py-2">
                                <Link to="/admininventoryedit" state={{ schedule: record }}>
                                  <button className="bg-[#00c3b8] text-white font-semibold w-full px-4 py-1 rounded-full">
                                    + Follow Up
                                  </button>
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="text-center text-gray-500 py-4">
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

            <div className="col-sm-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedule;
