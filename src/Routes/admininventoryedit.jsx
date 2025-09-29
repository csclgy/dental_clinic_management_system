import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AdminInventoryEditItem = () => {
  const { id } = useParams();   // ✅ use inv_id instead of ci_id
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  const [loading, setLoading] = useState(true);   // ✅ added
  const [error, setError] = useState("");   
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);      

  // form states
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [ml, setML] = useState("");
  const [expiration, setExpiration] = useState("");

 // fetch item details
useEffect(() => {
  const fetchItem = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/auth/displayitem/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // or sessionStorage
          },
        }
      );
      setItem(res.data);
    } catch (err) {
      console.error("Error fetching item:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchItem();
}, [id]);

  // populate states when item is loaded
  useEffect(() => {
    if (item) {
      setItemName(item.inv_item_name || "");
      setItemType(item.inv_item_type || "");
      setQuantity(item.inv_quantity ?? "");
      setPrice(item.inv_price_per_item !== null ? String(item.inv_price_per_item) : "");
      setML(item.inv_ml ?? "");
      setExpiration(item.inv_exp_date || "");
    }
  }, [item]);

  // handle update
const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    await axios.put(
      `http://localhost:3000/auth/edititem/${id}`,
      {
        inv_item_name: itemName,
        inv_item_type: itemType,
        inv_quantity: Number(quantity),
        inv_price_per_item: Number(price),
        inv_ml: itemType === "medicine" ? ml : null,
        inv_exp_date: itemType === "medicine" ? expiration : null,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("✅ Item updated successfully!");
    navigate(-1);
  } catch (err) {
    console.error("Error updating item:", err);
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

  if (loading) return <p>Loading...</p>;

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
                   <Link to='/adminsubsidiaryreceivable'>
                    <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                      Subsidiary 
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

                <div
                  className="col-sm-12 p-10 rounded-lg shadow-lg"
                  style={{ border: "solid", borderColor: "#01D5C4" }}
                >
                  <div className="row">
                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>
                      Edit Item
                    </h1>

                    <div className="col-sm-3"></div>
                    <div className="col-sm-6">
                      <br />
                      <form onSubmit={handleUpdate} className="space-y-4">
                        {/* Item Name */}
                        <div>
                          <label className="block font-semibold mb-1" style={{ color: "#00458B" }}>
                            Item Name:
                          </label>
                          <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            required
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3b8]"
                          />
                        </div>

                        {/* Item Type */}
                        <div>
                          <label className="block font-semibold mb-1" style={{ color: "#00458B" }}>
                            Item Type:
                          </label>
                          <select
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value)}
                            required
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3b8]"
                          >
                            <option value="">--Select--</option>
                            <option value="medicine">Medicine</option>
                            <option value="tool">Tool</option>
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block font-semibold mb-1" style={{ color: "#00458B" }}>
                            Quantity:
                          </label>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3b8]"
                          />
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block font-semibold mb-1" style={{ color: "#00458B" }}>
                            Price per Item: ₱
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3b8]"
                          />
                        </div>

                        {/* Medicine-specific fields */}
                        {itemType === "medicine" && (
                          <>
                            <div>
                              <label className="block font-semibold mb-1" style={{ color: "#00458B" }}>
                                mL:
                              </label>
                              <input
                                type="text"
                                value={ml}
                                onChange={(e) => setML(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3b8]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1" style={{ color: "#00458B" }}>
                                Expiration Date:
                              </label>
                              <input
                                type="date"
                                value={expiration}
                                onChange={(e) => setExpiration(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c3b8]"
                              />
                            </div>
                          </>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-between mt-6">
                          <button
                            type="submit"
                            className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#01d5c4] transition"
                          >
                            Update Item
                          </button>

                          <Link to="/admininventory">
                            <button
                              type="button"
                              className="bg-gray-400 text-white font-semibold px-6 py-2 rounded-full hover:bg-gray-500 transition"
                            >
                              Cancel
                            </button>
                          </Link>
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

export default AdminInventoryEditItem;
