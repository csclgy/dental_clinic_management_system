
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";

const AdminCoaViewEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // get id from URL
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // COA form state
    const [sub, setAccount] = useState({
      account_name: "",
    });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Scroll to section if needed
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

  useEffect(() => {
  
    const fetchSubAccounts = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/subacc/${id}`);
        setAccount(res.data);
      } catch (err) {
        console.error("Error fetching subaccounts:", err);
      }
    };
    if (id) {
      fetchSubAccounts();
    }
  }, [id]);

  // Save COA
  const handleSave = async () => {
    setErrorMessage("");
  setSuccessMessage("");

  try {
    const response = await axios.put(`http://localhost:3000/auth/sub/${id}`, {
      account_name: sub.account_name, 
    });

    setSuccessMessage(response.data.message || "Account saved successfully!");

    
    setTimeout(() => navigate(-1), 1500);
  } catch (err) {
    console.error(err);
    setErrorMessage(err.response?.data?.message || "Something went wrong");
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

              {/* Ledger Dropdown */}
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
                    <Link to='/adminsubsidiary'>
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

              {/* Other Links */}
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
                  style={{ color: "#00458B" }}
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

            {/* Main Content */}
            <div className="col-sm-7">
              <div className="row">
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <div className="row">
                    <div className="col-sm-10">
                      <h1 className="text-2xl font-bold">Charts of Account</h1>
                       <h1 className="text-1xl font-bold">Sub Accounts</h1>
                    </div>
                    
                  </div>
                </div>

                <p style={{ color: "transparent" }}>...</p>

                {/* Add New Account Form */}
                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>
                    Edit Sub-Account
                  </h1>
                    
                  <div className="col-sm-6 mx-auto">
                    <div className="mb-4 text-left">
                        <br/>
                      <label className="block text-[#00458b] font-semibold mb-1">
                        Name
                      </label>
                      <input type="text"
                        value={sub.account_name}
                        onChange={(e) => setAccount({ ...sub, account_name: e.target.value })}
                        className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                      />
                    </div>

                   

                    {errorMessage && (
                      <p className="text-red-500 font-medium">{errorMessage}</p>
                    )}
                    {successMessage && (
                      <p className="text-green-600 font-medium">{successMessage}</p>
                    )}

                    <div className="row mt-6">
                      <div className="col-sm-6">
                        <button
                          className="bg-[#FFFFFF] text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full w-full mb-4"
                          onClick={() => navigate(-1)}>
                          Back to List
                        </button>
                        
                      </div>
                      <div className="col-sm-6">
                        <button
                          className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                      </div>
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

export default AdminCoaViewEdit; 