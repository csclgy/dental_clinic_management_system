import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

// ✅ Simple AlertBox (green success, no left border)
const AlertBox = ({ message }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-lg font-bold text-green-600">Success!!!</h2>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};



const admincoaedit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const { id } = useParams();

  const [account, setAccount] = useState({
    account_name: "",
    account_type: "",
  });

  // ✅ Alert state
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch account
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/coa/${id}`);
        setAccount(res.data);
      } catch (err) {
        console.error("Error fetching account:", err);
      }
    };
    fetchAccount();
  }, [id]);

  // ✅ Update handler
  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/auth/coa/${id}`, account);
      setAlertMessage("Account updated successfully!");
      setTimeout(() => {
        setAlertMessage("");
        navigate("/admincoa");
      }, 1500);
    } catch (err) {
      console.error("Error updating account:", err);
      setAlertMessage("Failed to update account");
      setTimeout(() => setAlertMessage(""), 1500);
    }
  };

  // Scroll to section if passed from location.state
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
                  <i className="fa fa-tachometer" aria-hidden="true"></i>{" "}
                  Dashboard
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
                    <p
                      className="py-1 hover:underline"
                      style={{ color: "#00c3b8" }}
                    >
                      Chart of Accounts
                    </p>
                  </Link>
                  <Link to="/adminjournal">
                    <p
                      className="py-1 hover:underline"
                      style={{ color: "#00458B" }}
                    >
                      Journal Entries
                    </p>
                  </Link>
                  <Link to="/admingeneral">
                    <p
                      className="py-1 hover:underline"
                      style={{ color: "#00458B" }}
                    >
                      General Ledger
                    </p>
                  </Link>
                  <Link to="/admintrial">
                    <p
                      className="py-1 hover:underline"
                      style={{ color: "#00458B" }}
                    >
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
                  <i className="fa fa-user-plus" aria-hidden="true"></i>{" "}
                  Patients
                </button>
              </Link>

              {/* Schedule */}
              <Link to="/adminschedule">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-calendar" aria-hidden="true"></i>{" "}
                  Schedules
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
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <div className="row">
                    <div className="col-sm-10">
                      <h1 className="text-2xl font-bold">Charts of Account</h1>
                    </div>
                    <div className="col-sm-2">
                      {/* ✅ Add button without alertbox */}
                      <button
                        className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                        onClick={() => navigate("/admincoaadd")}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <p style={{ color: "transparent" }}>...</p>
                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  <div className="row">
                    <h1
                      className="text-xl font-bold"
                      style={{ color: "#00458B" }}
                    >
                      Edit Account
                    </h1>
                    <div className="col-sm-3"></div>
                    <div className="col-sm-6">
                      <br />
                      <br />
                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="account_name"
                          value={account.account_name}
                          onChange={(e) =>
                            setAccount({
                              ...account,
                              [e.target.name]: e.target.value,
                            })
                          }
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>
                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">
                          Account Type
                        </label>
                        <select
                          name="account_type"
                          value={account.account_type}
                          onChange={(e) =>
                            setAccount({
                              ...account,
                              [e.target.name]: e.target.value,
                            })
                          }
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        >
                          <option value="Asset">Asset</option>
                          <option value="Liability">Liability</option>
                          <option value="Equity">Equity</option>
                          <option value="Income">Income</option>
                          <option value="Expense">Expense</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-3"></div>
                    <div className="col-sm-12">
                      <br />
                      <br />
                      <div className="row">
                        <div className="col-sm-6"></div>
                        <div className="col-sm-6">
                          <div className="row">
                            <div className="col-sm-6">
                              <button
                                className="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4"
                                onClick={() => navigate("/admincoa")}
                              >
                                Back to List
                              </button>
                            </div>
                            <div className="col-sm-6">
                              <button
                                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                                onClick={handleUpdate}
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        </div>
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

      {/* ✅ Show AlertBox only when message exists */}
      {alertMessage && <AlertBox message={alertMessage} />}
    </div>
  );
};

export default admincoaedit;
