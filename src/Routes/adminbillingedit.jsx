import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";   // ✅ make sure axios is installed

const Adminbillingedit = () => {
    const location = useLocation();
  const navigate = useNavigate();
  const { appointId } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [chargedItems, setChargedItems] = useState([]);

  // Payment / service fields
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  // Service charge (receptionist-entered)
  const [serviceCharge, setServiceCharge] = useState(0);

  // New item inputs
  const [newInvId, setNewInvId] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newAmount, setNewAmount] = useState(0);
  const [newItemName, setNewItemName] = useState("");

const fetchBillingData = async () => {
  try {
    const token = localStorage.getItem("token");

    const [billingRes, invRes] = await Promise.all([
      axios.get(`http://localhost:3000/auth/billing/${appointId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:3000/auth/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    // ✅ correct extraction
    setChargedItems(billingRes.data.chargedItems || []);
    setInventory(invRes.data || []);

    const appoint = billingRes.data.appointment;
    if (appoint) {
      setPaymentMode(appoint.payment_mode || "");
      setPaymentStatus(appoint.payment_status || "");
      setServiceCharge(Number(appoint.total_service_charged || 0));
    }
  } catch (err) {
    console.error("Error fetching billing data:", err);
  }
};

  useEffect(() => {
    fetchBillingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointId]);

  // computed totals
  const itemsTotal = chargedItems.reduce((sum, item) => {
    const qty = Number(item.ci_quantity ?? item.quantity ?? 0);
    const price = Number(item.ci_amount ?? item.amount ?? 0);
    return sum + qty * price;
  }, 0);

  const totalCharged = itemsTotal + Number(serviceCharge || 0);

  // add item
  const handleAddItem = async () => {
    if (!newInvId || !newQuantity || !newAmount) {
      return alert("Please select item, quantity, and amount.");
    }
    try {
      const token = localStorage.getItem("token");
      const inv = inventory.find((i) => String(i.inv_id) === String(newInvId));
      await axios.post(
        `http://localhost:3000/auth/billing/${appointId}`,
        {
          inv_id: inv.inv_id,
          ci_item_name: inv.inv_item_name,
          ci_quantity: newQuantity,
          ci_amount: parseFloat(newAmount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refresh charged items (so itemsTotal updates)
      await fetchBillingData();

      // reset new item fields
      setNewInvId("");
      setNewQuantity(1);
      setNewAmount(0);
      setNewItemName("");
    } catch (err) {
      console.error("Error adding billing item:", err);
      alert("Failed to add item");
    }
  };

  // delete item
  const handleDeleteItem = async (ci_id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/auth/deletebilling/${ci_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchBillingData(); // refresh
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
    }
  };

  // Save appointment billing (backend will compute total_charged using chargeditems + total_service_charged)
  const handleSaveBilling = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3000/auth/billing/${appointId}`,
        {
          payment_method: paymentMode,
          payment_status: paymentStatus,
          total_service_charged: Number(serviceCharge || 0),
          // backend will compute total_charged by summing chargeditem totals + total_service_charged
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Billing saved successfully");
      // refresh data (so UI shows backend-computed totals)
      await fetchBillingData();
    } catch (err) {
      console.error("Error saving billing:", err);
      alert("Failed to save billing");
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
                        <div className="col-sm-12 bg-[#00458B] p-10 rounded-lg shadow-lg" style={{color:"white"}}>
                            <div className="row">
                                <div className="col-sm-12">
                                    <h1 className="text-2xl font-bold">Patients Record</h1>
                                </div>
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-9">
                                            <h2 className="text-2xl font-bold mb-4">Billing for Appointment #{appointId}</h2>
                                            <br />
                                        </div>
                                        <div className="col-sm-3">
                                        </div>
                                    </div>
                                </div>
                                <hr></hr>
                                    <br></br>
                                     {/* Payment Info */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Mode of Payment</label>
          <select
            className="border p-2 w-full rounded"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Cash">Cash</option>
            <option value="GCash">GCash</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Payment Status</label>
          <select
            className="border p-2 w-full rounded"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
          </select>
        </div>
        <div>
            <label className="block font-semibold">Service Charge</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              min="0"
            />
          </div>
      </div>

      {/* Charged Items Table */}
      <table className="w-full border mb-4">
        <thead className="bg-gray-100">
          <tr>
                <th className="px-4 py-2 text-center">Charged Item</th>
                <th className="px-4 py-2 text-center">Quantity</th>
                <th className="px-4 py-2 text-center">Unit Price</th>
                <th className="px-4 py-2 text-center">Total Price</th>
                <th className="px-4 py-2 text-center"></th>
          </tr>
        </thead>
<tbody>
              {chargedItems.length > 0 ? (
                chargedItems.map((item) => {
                  const name = item.ci_item_name ?? item.item ?? "(no name)";
                  const qty = Number(item.ci_quantity ?? 0);
                  const price = Number(item.ci_amount ?? 0);
                  return (
                    <tr key={item.ci_id} className="border-b border-gray-200 text-center">
                      <td className="px-4 py-2 text-blue-700">{name}</td>
                      <td className="px-4 py-2 text-blue-700">{qty}</td>
                      <td className="px-4 py-2 text-blue-700">₱{price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-blue-700">₱{(qty * price).toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => navigate(`/adminbillingedititem/${item.ci_id}`)}
                          className="bg-green-500 text-white px-3 py-1 rounded-full mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.ci_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-full"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No items found
                  </td>
                </tr>
              )}

              {/* Grand totals row */}
              <tr className="font-bold bg-gray-100">
                <td colSpan="3" className="px-4 py-2 text-right text-[#00458B]">Items Total:</td>
                <td className="px-4 py-2 text-blue-700">₱{itemsTotal.toFixed(2)}</td>
                <td></td>
              </tr>

              <tr className="font-bold bg-gray-100">
                <td colSpan="3" className="px-4 py-2 text-right text-[#00458B]">Service Charge:</td>
                <td className="px-4 py-2 text-blue-700">₱{Number(serviceCharge || 0).toFixed(2)}</td>
                <td></td>
              </tr>

              <tr className="font-bold bg-gray-200">
                <td colSpan="3" className="px-4 py-2 text-right text-[#00458B]">Total Charged:</td>
                <td className="px-4 py-2 text-blue-700">₱{Number(totalCharged).toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
      </table>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <select
            className="border rounded px-3 py-2"
            value={newInvId}
            onChange={(e) => {
              const id = e.target.value;
              setNewInvId(id);
              const sel = inventory.find((i) => String(i.inv_id) === String(id));
              if (sel) {
                setNewAmount(sel.inv_price_per_item);
                setNewItemName(sel.inv_item_name);
              } else {
                setNewAmount(0);
                setNewItemName("");
              }
            }}
          >
            <option value="">Select Item</option>
            {inventory.map((inv) => (
              <option key={inv.inv_id} value={inv.inv_id}>
                {inv.inv_item_name} (₱{inv.inv_price_per_item}, Stock: {inv.inv_quantity})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            className="px-3 py-2 border rounded"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value || "1"))}
            placeholder="Quantity"
          />

          <input
            type="number"
            className="px-3 py-2 border rounded"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Unit Price"
          />

          <button onClick={handleAddItem} className="bg-[#00c3b8] text-white px-4 py-2 rounded">
            Add
          </button>
        </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
         <button onClick={() => navigate(`/adminconsultationview/${appointId}`)} className="bg-gray-500 text-white px-6 py-2 rounded-full">
            Done
          </button>

          <button onClick={handleSaveBilling} className="bg-[#00458B] text-white px-6 py-2 rounded-full">
            Save Billing
          </button>
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

export default Adminbillingedit;
