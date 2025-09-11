import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const AdminInventory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ AlertBox state (for confirm delete)
  const [alertBox, setAlertBox] = useState({
    show: false,
    message: "",
    onConfirm: null,
  });

  // ✅ Success alert state
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    message: "",
  });

  // Scroll behavior
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

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/auth/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch inventory");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Delete handler with confirm + success alert
  const handleDelete = (id) => {
    setAlertBox({
      show: true,
      message: "Are you sure you want to delete this item?",
      onConfirm: async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`http://localhost:3000/auth/deleteitem/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to delete Item");
          }
          setItems((prev) => prev.filter((item) => item.inv_id !== id));
          setAlertBox({ show: false, message: "", onConfirm: null });

          // ✅ Show success alert after delete
          setSuccessAlert({ show: true, message: "Item deleted successfully!" });
          setTimeout(() => {
            setSuccessAlert({ show: false, message: "" });
          }, 2000);
        } catch (err) {
          console.error("Error deleting item:", err);
          setAlertBox({
            show: true,
            message: err.message || "Could not delete item",
            onConfirm: () => setAlertBox({ show: false }),
          });
        }
      },
    });
  };

  // ✅ Success AlertBox (same design as AdminUsers)
  const SuccessAlertBox = ({ message }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[320px] text-center">
        <h2 className="text-lg font-bold text-green-600 mb-2">Success</h2>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );

  // Filter items
  const filteredItems = items.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar (✅ untouched) */}
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
              <Link to="/adminusers">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-users"></i> Users
                </button>
              </Link>
              <Link to="/admininventory">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00c3b8" }}
                >
                  <i className="fa fa-archive"></i> Inventory
                </button>
              </Link>
              <Link to="/adminpatients">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-user-plus"></i> Patients
                </button>
              </Link>
              <Link to="/adminschedule">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-calendar"></i> Schedules
                </button>
              </Link>
              <Link to="/adminaudit">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-blue-100"
                  style={{ color: "#00458B" }}
                >
                  <i className="fa fa-eye"></i> Audit Trail
                </button>
              </Link>
            </div>

            {/* Main content (✅ untouched design) */}
            <div className="col-sm-7">
              <div className="row">
                <div
                  className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg"
                  style={{ color: "white" }}
                >
                  <div className="row">
                    <div className="col-sm-9">
                      <h1 className="text-2xl font-bold">Inventory Management</h1>
                    </div>
                    <div className="col-sm-3">
                      {/* ✅ Direct navigate for Add New Item */}
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
                    <div className="col-sm-12">
                      {/* Table */}
                      <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                        <div className="flex justify-between items-center">
                          <div></div>
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

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-white text-[#00458B] border-b border-gray-200">
                              <th className="px-4 py-2 text-center">Item Name</th>
                              <th className="px-4 py-2 text-center">Status</th>
                              <th className="px-4 py-2 text-center">Quantity</th>
                              <th className="px-4 py-2 text-center">Edit</th>
                              <th className="px-4 py-2 text-center">Delete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="text-center py-4 text-gray-500"
                                >
                                  Loading...
                                </td>
                              </tr>
                            ) : filteredItems.length > 0 ? (
                              filteredItems.map((item) => (
                                <tr
                                  key={item.inv_id}
                                  className="border-b border-gray-200 text-center"
                                >
                                  <td className="px-4 py-2 text-blue-700">
                                    {item.inv_item_name}
                                  </td>
                                  <td className="px-4 py-2">{item.inv_status}</td>
                                  <td className="px-4 py-2">{item.inv_quantity}</td>
                                  <td className="px-4 py-2">
                                    {/* ✅ Direct navigate for Edit */}
                                    <button
                                      className="bg-[#04AA6D] text-white font-semibold w-full border border-[#00458b] px-4 py-1 rounded-full"
                                      onClick={() =>
                                        navigate(`/admininventoryedit/${item.inv_id}`)
                                      }
                                    >
                                      Edit
                                    </button>
                                  </td>
                                  <td className="px-4 py-2">
                                    <button
                                      onClick={() => handleDelete(item.inv_id)}
                                      className="bg-[#f44336] text-white px-4 py-1 rounded-full"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="text-center text-gray-500 py-4"
                                >
                                  No items found
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
                      <div className="col-sm-6"></div>
                      <div className="col-sm-6">
                        <div className="row">
                          <div className="col-sm-4"></div>
                          <div className="col-sm-8">
                            <br />
                            <br />
                            <button
                              className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                              onClick={() => navigate("/register2")}
                            >
                              Generate Report
                            </button>
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

      {/* ✅ Confirm Alert Box (for delete) */}
      {alertBox.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <p className="text-lg text-gray-800 mb-4">{alertBox.message}</p>
            <button
              onClick={() => {
                if (alertBox.onConfirm) alertBox.onConfirm();
                else setAlertBox({ show: false });
              }}
              className="bg-[#00c3b8] text-white px-4 py-2 rounded-full mr-2"
            >
              Confirm
            </button>
            <button
              onClick={() => setAlertBox({ show: false })}
              className="bg-gray-400 text-white px-4 py-2 rounded-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ✅ Success Alert Box (after delete) */}
      {successAlert.show && <SuccessAlertBox message={successAlert.message} />}
    </div>
  );
};

export default AdminInventory;
