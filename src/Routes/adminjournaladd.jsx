import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const adminjournaladd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

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
                                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>Journal Entry</h1>
                                    <div className="col-sm-2">

                                    </div>
                                    <div className="col-sm-8">
                                        <br />
                                        <br />

                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Date</label>
                                                    <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Account</label>
                                                    <select  class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                        <option value="...">Asset</option>
                                                        <option value="...">Liability</option>
                                                        <option value="...">Equity</option>
                                                        <option value="...">Income</option>
                                                        <option value="...">Expense</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Description</label>
                                            <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                        </div>

                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Debit/Credit</label>
                                                    <select  class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                        <option value="...">Debit</option>
                                                        <option value="...">Credit</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Amount</label>
                                                    <input type="number" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Comment</label>
                                            <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                        </div>

                                    </div>
                                    <div className="col-sm-2">

                                    </div>
                                    <div className="col-sm-12">
                                        <br />
                                        <br /> 
                                        <div className="row">
                                            <div className="col-sm-6">
                                            </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-8">
                                                    <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminjournal")}>Back</button>
                                                </div>
                                            <div className="col-sm-4">
                                                <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/adminjournal")}>Save</button>
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

export default adminjournaladd;
