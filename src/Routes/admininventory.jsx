import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const admininventory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [items, setItems] = useState([]); // inventory state
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Fetch inventory items on load
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token"); // include token if needed
        const res = await fetch("http://localhost:3000/auth/inventory", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
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

const handleDelete = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:3000/auth/inactiveitem/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to approve item");
    }

    // Update state to remove approved item from pending list
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.inv_id === id ? { ...item, inv_item_status: "inactive" } : item
      )
    );

    alert("Item Inactive successfully");
  } catch (err) {
    console.error("Error Inactive item:", err);
    alert(err.message || "Could not approve item");
  }
};

// 🔹 Apply both search + status filter
  const filteredItems = items.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus =
      statusFilter === "all" || item.inv_item_status === statusFilter;

    return matchesSearch && matchesStatus;
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
                    style={{ color: "#00458B" }}
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
                                    <h1 className="text-2xl font-bold">Inventory Management</h1>
                                </div>
                                <div className="col-sm-3">
                                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/admininventoryadd")}>+ Add New Item</button>
                                </div>
                                <div className="col-sm-3">
                                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/admininventorypending")}>Pending Items</button>
                                </div>
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                <div className="col-sm-12">
                                {/* Table */}
                                <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                                    {/* Search bar */}
                                    {/* 🔹 Search + Filter */}
                                <div className="flex justify-between items-center mb-4">
                                  {/* Status filter dropdown */}
                                  <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-[#00458B] rounded-full px-4 py-2 text-sm text-gray-700"
                                  >
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                  </select>

                                    <div className="col-sm-3">
                                        <button class="border border-[#00458B] rounded-full px-4 py-2 text-sm text-blue-700" onClick={() => navigate("/adminsupplier")}>Suppliers</button>
                                     </div>

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

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-white text-[#00458B] border-b border-gray-200">
                                        <th className="px-4 py-2 text-center">Item Name</th>
                                        <th className="px-4 py-2 text-center">Stock Status</th>
                                        <th className="px-4 py-2 text-center">Quantity</th>
                                        <th className="px-4 py-2 text-center">Item Status</th>
                                        <th className="px-4 py-2 text-center"></th>
                                        <th className="px-4 py-2 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      {loading ? (
                                        <tr>
                                          <td colSpan="6" className="text-center py-4 text-gray-500">
                                            Loading...
                                          </td>
                                        </tr>
                                      ) : filteredItems.length > 0 ? (
                                        filteredItems.map((item) => (
                                          <tr key={item.inv_id} className="border-b border-gray-200 text-center">
                                            <td className="px-4 py-2 text-blue-700">{item.inv_item_name}</td>
                                            <td className="px-4 py-2">{item.inv_status}</td>
                                            <td className="px-4 py-2">{item.inv_quantity}</td>
                                            <td className="px-4 py-2">{item.inv_item_status}</td>

                                            {/* Edit Button */}
                                            <td className="px-2 py-3 whitespace-nowrap">
                                              <Link to={`/admininventoryedit/${item.inv_id}`}>
                                                <button
                                                  disabled={item.inv_item_status === "inactive"}
                                                  className={`px-4 py-2 rounded-full transition ${
                                                    item.inv_item_status === "inactive"
                                                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                      : "bg-[#04AA6D] text-white border-[#00458b]"
                                                  }`}
                                                >
                                                  View & Edit
                                                </button>
                                              </Link>
                                            </td>

                                            {/* Inactive Button */}
                                            <td className="px-4 py-2">
                                              <button
                                                onClick={() => handleDelete(item.inv_id)}
                                                disabled={item.inv_item_status === "inactive"}
                                                className={`w-full px-4 py-1 rounded-full ${
                                                  item.inv_item_status === "inactive"
                                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                    : "bg-[#f44336] text-white"
                                                }`}
                                              >
                                                Inactive
                                              </button>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="6" className="text-center text-gray-500 py-4">
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

export default admininventory;
