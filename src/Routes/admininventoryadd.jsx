import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AdminInventoryAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const [registerData, setRegisterData] = useState({
    inv_item_name: "",
    inv_quantity: "",
  });

  // ✅ Alert Box State
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // "success" | "error"

  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Prevent empty submission
    if (!registerData.inv_item_name.trim() || !registerData.inv_quantity.trim()) {
      setAlertMessage("Please fill in all required fields.");
      setAlertType("error");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/additem",
        registerData
      );

      setAlertMessage(response.data.message || "Item added successfully!");
      setAlertType("success");
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
        navigate("/admininventory");
      }, 2000);
    } catch (error) {
      if (error.response) {
        setAlertMessage(error.response.data.message || "Something went wrong");
      } else if (error.request) {
        setAlertMessage("No response from server. Please try again later.");
      } else {
        setAlertMessage("Error: " + error.message);
      }
      setAlertType("error");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 3000);
    }
  };

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
            {/* Sidebar (unchanged) */}
            <div
              className="col-sm-3 p-5 rounded-lg shadow-lg"
              style={{ margin: "1%", border: "solid", borderColor: "#01D5C4" }}
            >
              <Link to="/">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-tachometer"></i> Dashboard
                </button>
              </Link>

              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
                style={{ color: "#00458B" }}
              >
                <span>
                  <i className="fa fa-book"></i> Ledger
                </span>
                <i
                  className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`}
                ></i>
              </button>

              {isLedgerOpen && (
                <div className="ml-8 text-sm">
                  <Link to="/admincoa"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Chart of Accounts</p></Link>
                  <Link to="/adminjournal"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Journal Entries</p></Link>
                  <Link to="/admingeneral"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>General Ledger</p></Link>
                  <Link to="/admintrial"><p className="py-1 hover:underline" style={{ color: "#00458B" }}>Trial Balance</p></Link>
                </div>
              )}

              <Link to="/adminusers"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-users"></i> Users</button></Link>
              <Link to="/admininventory"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00c3b8" }}><i className="fa fa-archive"></i> Inventory</button></Link>
              <Link to="/adminpatients"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-user-plus"></i> Patients</button></Link>
              <Link to="/adminschedule"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-calendar"></i> Schedules</button></Link>
              <Link to="/adminaudit"><button className="w-full text-left px-4 py-2 hover:bg-blue-100" style={{ color: "#00458B" }}><i className="fa fa-eye"></i> Audit Trail</button></Link>
            </div>

            {/* Main Content */}
            <div className="col-sm-7">
              <div className="row">
                <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{ color: "white" }}>
                  <div className="row">
                    <div className="col-sm-9">
                      <h1 className="text-2xl font-bold">Inventory Management</h1>
                    </div>
                    <div className="col-sm-3">
                      <button
                        className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                        onClick={() => navigate("/admininventoryadd")}
                      >
                        + Add New Item
                      </button>
                    </div>
                  </div>
                </div>

                <p style={{ color: "transparent" }}>...</p>

                <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
                  <div className="row">
                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>Add New Item</h1>
                    <div className="col-sm-3"></div>
                    <div className="col-sm-6">
                      <br /><br />
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Item Name</label>
                          <input
                            type="text"
                            value={registerData.inv_item_name}
                            onChange={(e) => updateFormData("inv_item_name", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">Quantity</label>
                          <input
                            type="text"
                            value={registerData.inv_quantity}
                            onChange={(e) => updateFormData("inv_quantity", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                          <button
                            type="button"
                            className="bg-[#FFFFFF] text-[#00c3b8] font-semibold border border-[#00458b] px-6 py-2 rounded-full"
                            onClick={() => navigate("/admininventory")}
                          >
                            Back to List
                          </button>

                          <button
                            type="submit"
                            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                    <div className="col-sm-3"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-2"></div>
          </div>
        </div>
      </div>

      {/* ✅ Alert Box (success / error) */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[320px] text-center">
            <h2
              className={`text-lg font-bold mb-2 ${
                alertType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {alertType === "success" ? "Success" : "Error"}
            </h2>
            <p className="text-gray-700">{alertMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryAdd;
