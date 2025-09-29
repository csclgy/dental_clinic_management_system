import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

const adminjournal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [journalData, setJournalData] = useState([]);

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

   // Fetch journal entries from backend 
    useEffect(() => { const fetchJournalEntries = async () => {
    try { const response = await axios.get("http://localhost:3000/auth/journal1"); 
    setJournalData(response.data);  } 
    catch (err) {
         console.error(err); 
         alert("Failed to fetch journal entries"); 
        } }; 
        fetchJournalEntries(); 
    }, 
    []);

  const filteredRecords = journalData.filter((record) => {
      if (!searchTerm && !startDate && !endDate) return true;
    const recordDate = new Date(record.date); 

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesSearch = Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesDate = (!start || recordDate >= start) && (!end || recordDate <= end);

    return matchesSearch && matchesDate;
  });
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
                    style={{ color: "#00c3b8" }}
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
                        <p className="py-1 hover:underline" style={{ color: "#00c3b8" }}>
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
                    style={{ color: "#00458B" }}
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
                <div className="col-sm-7">
                    <div className="row">
                        <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                            <div className="row">
                                <div className="col-sm-6">
                                    <h1 className="text-2xl font-bold">Journal Entries</h1>
                                </div>
                                <div className="col-sm-4">
                                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/")}>Generate Report</button>
                                </div>
                                <div className="col-sm-2">
                                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminjournaladd")}>Add</button>
                                </div>
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                <div className="col-sm-12">
                                {/* Search bar */}
                                <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        {/* Start Date */}
                                        <div>
                                        <label className="block text-sm font-semibold text-[#00458B] mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            input type="date" 
                                            value={startDate} 
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full border border-[#00458B] rounded-lg px-3 py-2 outline-none"
                                        />
                                        </div>

                                        {/* End Date */}
                                        <div>
                                        <label className="block text-sm font-semibold text-[#00458B] mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full border border-[#00458B] rounded-lg px-3 py-2 outline-none"
                                        />
                                        </div>

                                        {/* Search */}
                                        <div>
                                        <label className="block text-sm font-semibold text-[#00458B] mb-1">
                                            Search
                                        </label>
                                        <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1">
                                            <input
                                            input type="text" 
                                            placeholder="Search"
                                             value={searchTerm} 
                                             onChange={(e) => setSearchTerm(e.target.value)}
                                             className="flex-1 outline-none text-sm text-gray-700"
                                            />
                                            <i className="fa fa-search text-[#00458B]"></i>
                                        </div>
                                        <div>
                                            
                                        </div>
                                        </div>
                                    </div>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <br />
                                        <table className="w-full border-collapse border border-gray-200">
                                        <thead>
                                            <tr className="bg-white text-[#00458B] border-b border-gray-200">
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-4 text-left">Account</th>
                                             <th className="px-4 py-4 text-left">Description</th>
                                            <th className="px-4 py-4 text-left">Debit</th>
                                            <th className="px-4 py-4 text-left">Credit</th>
                                            <th className="px-4 py-2 text-left">Comment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRecords.length > 0 ? (
                                            filteredRecords.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-200">
                                                <td className="px-4 py-2 text-blue-700">{record.date}</td>
                                                <td className="px-4 py-2 text-blue-700">{record.Account}</td>
                                                <td className="px-4 py-2 text-blue-700">{record.description}</td>
                                                <td className="px- py-2 text-blue-700">₱ {record.debit}</td>
                                                <td className="px-4 py-2 text-blue-700">₱ {record.credit}</td>
                                                <td className="px-4 py-2 text-blue-700">{record.comment}</td>


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
                                    <br/>
                                        <div className="row">
                                        {/* <div className="col-sm-3">
                                                <button class="bg-[#00c3b8] text-white font-semibold px-3 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminjournalupload")}>Upload Entry</button>
                                        </div> */}
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

export default adminjournal;