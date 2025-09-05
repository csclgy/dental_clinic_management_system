import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const AdminScheduleCancel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Get passed schedule
  const schedule = location.state?.schedule || {
    date: "Unknown Date",
    lastName: "N/A",
    firstName: "N/A",
    services: "N/A",
    dentist: "N/A",
    status: "N/A",
  };

  const handleYes = () => {
    console.log("Cancelled schedule:", schedule);
    navigate("/adminschedule");
  };

  const handleNo = () => {
    navigate("/adminschedule");
  };

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar (same as before) */}
            <div
              className="col-sm-3 p-5 rounded-lg shadow-lg"
              style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
            >
              <Link to="/">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-tachometer"></i> Dashboard
                </button>
              </Link>

              {/* Ledger dropdown */}
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
                style={{ color: "#00458B" }}
              >
                <span>
                  <i className="fa fa-book"></i> Ledger
                </span>
                <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`}></i>
              </button>

              {isLedgerOpen && (
                <div className="ml-8 text-sm">
                  <Link to="/admincoa"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Chart of Accounts</p></Link>
                  <Link to="/adminjournal"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Journal Entries</p></Link>
                  <Link to="/admingeneral"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>General Ledger</p></Link>
                  <Link to="/admintrial"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Trial Balance</p></Link>
                </div>
              )}

              {/* Other buttons */}
              <Link to="/adminusers"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-users"></i> Users</button></Link>
              <Link to="/admininventory"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-archive"></i> Inventory</button></Link>
              <Link to="/adminpatients"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-user-plus"></i> Patients</button></Link>
              <Link to="/adminschedule"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00c3b8" }}><i className="fa fa-calendar"></i> Schedules</button></Link>
              <Link to="/adminaudit"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-eye"></i> Audit Trail</button></Link>
            </div>

            {/* Main */}
            <div className="col-sm-8">
              <div className="row">
                {/* Header */}
                <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{ color: "white" }}>
                  <h1 className="text-2xl font-bold">Cancel Schedule?</h1>
                </div>

                <p style={{ color: "transparent" }}>...</p>

                {/* Confirmation */}
                <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
                  <p className="text-lg mb-6">
                    Do you want to cancel the schedule for{" "}
                    <span className="font-semibold">{schedule.firstName} {schedule.lastName}</span>{" "}
                    (Service: <span className="font-semibold">{schedule.services}</span>) with{" "}
                    <span className="font-semibold">{schedule.dentist}</span> on{" "}
                    <span className="font-semibold">{schedule.date}</span>?
                  </p>

                  <div className="flex gap-4">
                    <button onClick={handleYes} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                      Yes
                    </button>
                    <button onClick={handleNo} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500">
                      No
                    </button>
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

export default AdminScheduleCancel;
