import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AdminInventoryAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [registerData, setRegisterData] = useState({
    inv_item_type: "",
    inv_item_name: "",
    inv_price_per_item: "",
    inv_quantity: "",
    inv_ml: "",
    inv_exp_date: "",
  });

  const updateFormData = (field, value) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/additem",
        registerData
      );
      setSuccessMessage(response.data.message || "Item added successfully!");
      setTimeout(() => navigate("/admininventory"), 1500);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Something went wrong");
        console.error("Response error:", error.response.data);
      } else if (error.request) {
        setErrorMessage("No response from server. Please try again later.");
        console.error("Request error:", error.request);
      } else {
        setErrorMessage("Error: " + error.message);
        console.error("Axios error:", error.message);
      }
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

              {/* Ledger Dropdown */}
              <button
                onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100"
                style={{ color: "#00458B" }}
              >
                <span>
                  <i className="fa fa-book" aria-hidden="true"></i> Ledger
                </span>
                <i
                  className={`fa fa-chevron-${
                    isLedgerOpen ? "up" : "down"
                  }`}
                  aria-hidden="true"
                ></i>
              </button>

              {isLedgerOpen && (
                <div className="ml-8 text-sm">
                  <Link to="/admincoa">
                    <p
                      className="py-1 hover:underline"
                      style={{ color: "#00458B" }}
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
                  style={{ color: "#00c3b8" }}
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

            {/* Main Content */}
            <div className="col-sm-7">
              <div className="row">
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <div className="row">
                    <div className="col-sm-9">
                      <h1 className="text-2xl font-bold">
                        Inventory Management
                      </h1>
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

                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  <div className="row">
                    <h1
                      className="text-xl font-bold"
                      style={{ color: "#00458B" }}
                    >
                      Add New Item
                    </h1>

                    <div className="col-sm-3"></div>

                    <div className="col-sm-6">
                      <br />
                      <br />
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">
                            Item Type
                          </label>
                          <select
                            value={registerData.inv_item_type || ""}
                            onChange={(e) => updateFormData("inv_item_type", e.target.value)}
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          >
                            <option value="">-- Select Type --</option>
                            <option value="tool">Tool</option>
                            <option value="medicine">Medicine</option>
                          </select>
                        </div>

                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">
                            Item Name
                          </label>
                          <input
                            type="text"
                            value={registerData.inv_item_name}
                            onChange={(e) =>
                              updateFormData("inv_item_name", e.target.value)
                            }
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>

                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">
                            Price Per Item
                          </label>
                          <input
                            type="number"
                            value={registerData.inv_price_per_item || ""}
                            onChange={(e) =>
                              updateFormData("inv_price_per_item", e.target.value)
                            }
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>

                        <div className="mb-4 text-left">
                          <label className="block text-[#00458b] font-semibold mb-1">
                            Quantity
                          </label>
                          <input
                            type="text"
                            value={registerData.inv_quantity}
                            onChange={(e) =>
                              updateFormData("inv_quantity", e.target.value)
                            }
                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          />
                        </div>

                        {/* Show only when medicine is selected */}
                        {registerData.inv_item_type === "medicine" && (
                          <>
                            <div className="mb-4 text-left">
                              <label className="block text-[#00458b] font-semibold mb-1">
                                Amount of mL
                              </label>
                              <input
                                type="number"
                                value={registerData.inv_ml || ""}
                                onChange={(e) =>
                                  updateFormData("inv_ml", e.target.value)
                                }
                                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                              />
                            </div>

                            <div className="mb-4 text-left">
                              <label className="block text-[#00458b] font-semibold mb-1">
                                Expiration Date
                              </label>
                              <input
                                type="date"
                                value={registerData.inv_expiration_date || ""}
                                onChange={(e) =>
                                  updateFormData("inv_expiration_date", e.target.value)
                                }
                                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                              />
                            </div>
                          </>
                        )}

                        {errorMessage && (
                          <p className="text-red-500 font-medium mt-4">
                            {errorMessage}
                          </p>
                        )}
                        {successMessage && (
                          <p className="text-green-600 font-medium mt-4">
                            {successMessage}
                          </p>
                        )}

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
    </div>
  );
};

export default AdminInventoryAdd;