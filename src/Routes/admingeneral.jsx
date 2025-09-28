import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Admingeneral = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
 const [selectedAccount, setSelectedAccount] = useState("");

  // Scroll to the section if state.scrollTo is passed
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

  // Fetch general ledger
  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/general");
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching general ledger:", err);
      }
    };
    fetchLedger();
  }, []);

  // Fetch accounts for dropdown
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/coa");
        setAccounts(res.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  // Filter based on search term (case-insensitive)
  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

const filterRecord = async (account_id) => {
  try {
    if (!account_id) {
      // If "All" is selected, fetch the full ledger
      const res = await axios.get("http://localhost:3000/auth/general");
      setRecords(res.data);
      return;
    }

    const res = await axios.get("http://localhost:3000/auth/general_ledger1", {
      params: { account_id },
    });
    setRecords(res.data);   // ✅ update records, not accounts
  } catch (err) {
    console.error("Error fetching filtered ledger:", err);
  }
};
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
              <Link to="/">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-tachometer" aria-hidden="true"></i> Dashboard
                </button>
              </Link>

              {/* Ledger dropdown */}
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
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Journal Entries
                    </p>
                  </Link>
                    <Link to='/adminsubsidiary'>
                                      <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                                        Subsidiary 
                                      </p>
                                     </Link>  
                  <Link to="/admingeneral">
                    <p className="py-1 hover:underline" style={{ color: "#00c3b8" }}>
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

              {/* Other nav links */}
              <Link to="/adminusers">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-users" aria-hidden="true"></i> Users
                </button>
              </Link>
              <Link to="/admininventory">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-archive" aria-hidden="true"></i> Inventory
                </button>
              </Link>
              <Link to="/adminpatients">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-user-plus" aria-hidden="true"></i> Patients
                </button>
              </Link>
              <Link to="/adminschedule">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-calendar" aria-hidden="true"></i> Schedules
                </button>
              </Link>
              <Link to="/adminaudit">
                <button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}>
                  <i className="fa fa-eye" aria-hidden="true"></i> Audit Trail
                </button>
              </Link>
            </div>

            {/* Main content */}
            <div className="col-sm-7">
              <div className="row">
                <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{ color: "white" }}>
                  <div className="row">
                    <div className="col-sm-9">
                      <h1 className="text-2xl font-bold">General Ledger</h1>
                    </div>
                    <div className="col-sm-3">
                      <label htmlFor="accounts" className="block mb-2 dark:text-white">Account Name</label>
                      <select id="accounts" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                      value={selectedAccount}onChange={(e) => {
                      setSelectedAccount(e.target.value);
                      filterRecord(e.target.value);
                       }}>
                      <option value="">All</option>
                      {accounts.map((acc) => (
                        <option key={acc.account_id} value={acc.account_id}>
                          {acc.account_name}
                        </option>
  ))}
</select>
                    </div>
                  </div>
                </div>

                <p style={{ color: "transparent" }}>...</p>

                <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
                  <div className="row">
                    <div className="col-sm-12">
                      {/* Search bar */}
                      <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                        <div className="flex justify-between items-center mb-1">
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

                      {/* Ledger Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-white text-[#00458B] border-b border-gray-200">
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">Account Name</th>
                              <th className="px-4 py-2 text-left">Account Type</th>
                              <th className="px-4 py-2 text-left">Debit</th>
                              <th className="px-4 py-2 text-left">Credit</th>
                              <th className="px-4 py-2 text-left">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRecords.length > 0 ? (
                              filteredRecords.map((record, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                  <td className="px-4 py-2 text-blue-700">{record.date}</td>
                                  <td className="px-4 py-2 text-blue-700">{record.account}</td>
                                  <td className="px-4 py-2 text-blue-700">{record.account_type || "-"}</td>
                                  <td className="px-4 py-2 text-blue-700"> 	₱ {(Number(record.debit) || 0).toFixed(2)}</td>
                                  <td className="px-4 py-2 text-blue-700">	₱ {(Number(record.credit) || 0).toFixed(2)}</td>
                                  <td className="px-4 py-2 text-blue-700">{(Number(record.balance) || 0).toFixed(2)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="text-center text-gray-500 py-4">
                                  No records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
               <div className="col-sm-12">
                                <div className="row">
                                    <div className="col-sm-6">
                                    </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-4">

                                                </div>
                                            <div className="col-sm-8">
                                                    <br />
                                                    <br />
                                                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/register2")}>Generate Report</button>
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

export default Admingeneral;
