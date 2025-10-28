import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const AdminBillingEditItem = () => {   // ✅ uppercase
  const location = useLocation();
  const { ci_id } = useParams();
  const navigate = useNavigate();
  const [selectedInvId, setSelectedInvId] = useState(null);
  const [item, setItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [unitPrice, setUnitPrice] = useState(0);
  const [total, setTotal] = useState(0);

  // hooks must always be called unconditionally
  useEffect(() => {
    if (ci_id) {
      axios
        .get(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/billing/item/${ci_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          setItem(res.data);
          setItemName(res.data.ci_item_name);
          setQuantity(res.data.ci_quantity);
          setAmount(res.data.ci_amount);
          setSelectedInvId(res.data.inv_id);

          // ✅ Save unit price based on initial data
          const unitPrice = res.data.ci_amount / res.data.ci_quantity;
          setAmount(res.data.ci_amount);
          setUnitPrice(unitPrice);

        })
        .catch((err) => {
          console.error("Error fetching item:", err);
        });
    }
  }, [ci_id]);

  useEffect(() => {
    if (quantity && amount) {
      setTotal(quantity * amount);
    }
  }, [quantity, amount]);


  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/updatebilling/${ci_id}`,
        {
          inv_id: selectedInvId,
          ci_item_name: itemName,
          ci_quantity: quantity,
          ci_amount: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ send JWT
          },
        }
      );

      alert("✅ Billing item updated successfully!");
      navigate(-1); // go back after confirmation
    } catch (err) {
      console.error("Error updating charged item:", err);
      alert("❌ Failed to update billing item.");
    }
  };

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
                    <p className="hover:bg-[white] hover:text-[#00458B]" style={{ color: "#00458B" }}>
                      Chart of Accounts
                    </p>
                  </Link>
                  <Link to="/adminjournal">
                    <p className="hover:bg-[white] hover:text-[#00458B]" style={{ color: "#00458B" }}>
                      Journal Entries
                    </p>
                  </Link>
                  <Link to="/adminsubsidiaryreceivable">
                    <p className="hover:bg-[white] hover:text-[#00458B]" style={{ color: "#00458B" }}>
                      Subsidiary
                    </p>
                  </Link>
                  <Link to="/admingeneral">
                    <p className="hover:bg-[white] hover:text-[#00458B]" style={{ color: "#00458B" }}>
                      General Ledger
                    </p>
                  </Link>
                  <Link to="/admintrial">
                    <p className="hover:bg-[white] hover:text-[#00458B]" style={{ color: "#00458B" }}>
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
                  style={{ color: "#00c3b8" }}
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
            <div className="col-sm-8">
              <div className="row">
                <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{ color: "white" }}>
                  <div className="row">
                    <div className="col-sm-10">
                      <h1 className="text-2xl font-bold">Patient record</h1>
                    </div>
                    <div className="col-sm-2">
                    </div>
                  </div>
                </div>
                <p style={{ color: "transparent" }}>...</p>
                <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{ border: "solid", borderColor: "#01D5C4" }}>
                  <div className="row">
                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>Edit Charge Item</h1>
                    <div className="col-sm-3">

                    </div>
                    <div className="col-sm-6">
                      <br />
                      <br />
                      <div class="mb-4 text-left">
                        <label class="block text-[#00458b] font-semibold mb-1">Charge Item</label>
                        <input
                          type="text"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                          readOnly
                        />
                      </div>
                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">Quantity</label>
                        <input
                          type="number"
                          value={quantity ?? ""}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          min="1"
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>

                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">Price per Item</label>
                        <input
                          type="number"
                          value={amount ?? ""}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          min="0"
                          readOnly
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                        />
                      </div>

                      <div className="mb-4 text-left">
                        <label className="block text-[#00458b] font-semibold mb-1">Total</label>
                        <input
                          type="number"
                          value={total ?? ""}
                          readOnly
                          className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none bg-gray-100"
                        />
                      </div>
                    </div>
                    <div className="col-sm-3">

                    </div>
                    <div className="col-sm-12">
                      <br />
                      <br />
                      <div className="row">
                        <div className="col-sm-6">
                        </div>
                        <div className="col-sm-6">
                          <div className="row">
                            <div className="col-sm-6">
                              <button
                                className="bg-gray-300 text-black px-6 py-2 rounded-full"
                                onClick={() => navigate("/adminbillingedit")}
                              >
                                Back
                              </button>
                            </div>
                            <div className="col-sm-6">
                              <button
                                className="bg-[#00c3b8] text-white px-6 py-2 rounded-full"
                                onClick={handleUpdate}
                              >
                                Save
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
            <div className="col-sm-2">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBillingEditItem;
