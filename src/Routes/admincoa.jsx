import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

// ✅ Confirmation AlertBox (for delete)
const AlertBox = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-lg font-bold text-[#00c3b8]">Confirmation</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-[#00c3b8] text-white px-4 py-2 rounded-full font-semibold"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded-full font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Success AlertBox (auto close, no buttons)
const SuccessAlertBox = ({ message }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-lg font-bold text-green-600">Success</h2>
        <p className="text-gray-700 mt-2">{message}</p>
      </div>
    </div>
  );
};

const Admincoa = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // ✅ Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertAction, setAlertAction] = useState(null);

  // ✅ Success alert states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/auth/coa/${id}`);
      setAccounts(accounts.filter((a) => a.account_id !== id));

      // ✅ Show success alert
      setSuccessMessage("Account deleted successfully!");
      setShowSuccess(true);

      // ✅ Auto close after 2s
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account");
    }
  };

  // ✅ Filter accounts
  const filteredAccounts = accounts.filter((account) => {
    if (!searchTerm) return true;
    return (
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar untouched */}
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

            {/* Main content */}
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
                      {/* ✅ Add button (no alert now) */}
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
                    <div className="col-sm-12">
                      {/* Search bar */}
                      <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                        <div className="flex justify-between items-center mb-1">
                          <h1 className=" font-bold text-[#00458B]"></h1>
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
                              <th className="px-4 py-2 text-center">
                                Account Name
                              </th>
                              <th className="px-4 py-2 text-center">
                                Account Type
                              </th>
                              <th className="px-4 py-2 text-center">Action</th>
                              <th className="px-4 py-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAccounts.length > 0 ? (
                              filteredAccounts.map((account, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-200 text-center item-center"
                                >
                                  <td className="px-4 py-2 text-blue-700">
                                    {account.account_name}
                                  </td>
                                  <td className="px-4 py-2 text-blue-700">
                                    {account.account_type}
                                  </td>
                                  <td className="px-4 py-2">
                                    {/* ✅ Edit (no alert now) */}
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/admincoaedit/${account.account_id}`
                                        )
                                      }
                                      className="bg-[#04AA6D] text-white font-semibold w-full border border-[#00458b] px-4 py-1 rounded-full"
                                    >
                                      Edit
                                    </button>
                                  </td>
                                  <td className="px-4 py-2">
                                    {/* ✅ Delete with confirmation alert */}
                                    <button
                                      onClick={() => {
                                        setAlertMessage(
                                          "Are you sure you want to delete this account?"
                                        );
                                        setAlertAction(() => () =>
                                          handleDelete(account.account_id)
                                        );
                                        setShowAlert(true);
                                      }}
                                      className="bg-[#f44336] text-white px-4 py-1 rounded-full hover:bg-teal-500"
                                    >
                                      Delete
                                    </button>
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
            </div>

            <div className="col-sm-2"></div>
          </div>
        </div>
      </div>

      {/* ✅ Confirmation Alert */}
      {showAlert && (
        <AlertBox
          message={alertMessage}
          onConfirm={() => {
            if (alertAction) alertAction();
            setShowAlert(false);
          }}
          onCancel={() => setShowAlert(false)}
        />
      )}

      {/* ✅ Success Alert after delete */}
      {showSuccess && <SuccessAlertBox message={successMessage} />}
    </div>
  );
};

export default Admincoa;
