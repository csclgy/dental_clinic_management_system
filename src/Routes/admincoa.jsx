import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

const admincoa = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

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

     useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/coa"); // Make sure your endpoint matches
        setAccounts(res.data); // res.data should be an array of accounts
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

 // Filter accounts by search term
  const filteredAccounts = accounts.filter((account) => {
    if (!searchTerm) return true; // if search bar empty, show all
    return (
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this account?")) {
    try {
      await axios.delete(`http://localhost:3000/auth/coa/${id}`);
      setAccounts(accounts.filter((a) => a.account_id !== id)); // update UI
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account");
    }
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
                        <p className="py-1 hover:underline" style={{ color: "#00c3b8" }}>
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
                                <div className="col-sm-10">
                                    <h1 className="text-2xl font-bold">Charts of Account</h1>
                                </div>
                                <div className="col-sm-2">
                                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/admincoaadd")}>Add</button>
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
                                            <th className="px-4 py-2 text-center">Account Name</th>
                                            <th className="px-4 py-2 text-center">Account Type</th>
                                            <th className="px-4 py-2 text-center">Action</th>
                                            <th className="px-4 py-2 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAccounts.length > 0 ? (
                                            filteredAccounts.map((account, index) => (
                                                <tr key={index} className="border-b border-gray-200 text-center item-center">
                                                <td className="px-4 py-2 text-blue-700">{account.account_name}</td>
                                                <td className="px-4 py-2 text-blue-700">{account.account_type}</td>
                                                <td className="px-4 py-2">
                                                    <Link to={`/admincoaedit/${account.account_id}`}>
                                                    <button className="bg-[#04AA6D] text-white font-semibold w-full border border-[#00458b] px-4 py-1 rounded-full">
                                                    Edit
                                                    </button>
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Link to="/admincoa">
                                                    <button  onClick={() => handleDelete(account.account_id)} className="bg-[#f44336] text-white px-4 py-1 rounded-full hover:bg-teal-500">
                                                    Delete
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

export default admincoa;
