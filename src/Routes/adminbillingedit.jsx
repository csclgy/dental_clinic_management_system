import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X, Package, PlusCircle } from "lucide-react";
import axios from "axios";   // ✅ make sure axios is installed

const Adminbillingedit = () => {
    const location = useLocation();
  const navigate = useNavigate();
  const { appointId } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [chargedItems, setChargedItems] = useState([]);

  // Payment / service fields
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentOR, setPaymentOR] = useState("");

  // Service charge (receptionist-entered)
  const [serviceCharge, setServiceCharge] = useState(0);

  // New item inputs
  const [newInvId, setNewInvId] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newAmount, setNewAmount] = useState(0);
  const [newItemName, setNewItemName] = useState("");

  const [gcashProof, setGcashProof] = useState(null);

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
      setPaymentOR(appoint.or_num || "");
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

      const res = await axios.post(
        `http://localhost:3000/auth/billing/${appointId}`,
        {
          inv_id: inv.inv_id,
          ci_item_name: inv.inv_item_name,
          ci_quantity: newQuantity,
          ci_amount: parseFloat(newAmount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Instead of re-fetching everything, just append the new item locally
      const newItem = {
        ci_id: res.data.ci_id, // assuming backend returns the new item ID
        ci_item_name: inv.inv_item_name,
        ci_quantity: newQuantity,
        ci_amount: parseFloat(newAmount),
      };
      setChargedItems((prev) => [...prev, newItem]);

      // Reset new item fields
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

      const formData = new FormData();
      formData.append("payment_method", paymentMode);
      formData.append("payment_status", paymentStatus);
      formData.append("or_num", paymentOR);
      formData.append("total_service_charged", Number(serviceCharge || 0));

      // only attach file if GCash and proof is selected
      if (paymentMode === "GCash" && gcashProof) {
        formData.append("gcash_proof", gcashProof);
      }

      await axios.post(
        `http://localhost:3000/auth/billing/${appointId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Billing saved successfully");
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
 <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <i className="fa fa-book"></i> Ledger
            </span>
            <i className={`fa fa-chevron-${isLedgerOpen ? "up" : "down"}`} />
          </button>
          {isLedgerOpen && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              <Link to="/admincoa" className="hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="hover:bg-[white] hover:text-[#00458B]">
                Trial Balance
              </Link>
            </div>
          )}

          <Link
            to="/adminusers"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Package size={18} /> Inventory
          </Link>
          <Link
            to="/adminpatients"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link
            to="/adminschedule"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Calendar size={18} /> Schedules
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Sidebar (mobile with toggle) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#00458B] text-white flex flex-col p-6 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end mb-6"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
            {/* Copy links same as desktop */}
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Users size={18} /> Users
              </Link>
              <Link
                to="/admininventory"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Package size={18} /> Inventory
              </Link>
              <Link
                to="/adminpatients"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-user-plus"></i> Patients
              </Link>
              <Link
                to="/adminschedule"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Calendar size={18} /> Schedules
              </Link>
              <Link
                to="/adminaudit"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-eye"></i> Audit Trail
              </Link>
            </nav>
          </aside>
        </div>
      )}
       <main className="flex-1 p-6 md:p-8">
                        <p style={{color:"transparent"}}>...</p>
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-9">
                                            <h2 className="text-2xl text-[#00458B] font-bold mb-4">Billing for Appointment #{appointId}</h2>
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
                                          <label className="block font-semibold">OR Number:</label>
                                          <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2"
                                            value={paymentOR}
                                            onChange={(e) => setPaymentOR(e.target.value)}
                                          />
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
                                          <label className="block font-semibold">Service Charge</label>
                                          <input
                                            type="number"
                                            className="w-full border rounded px-3 py-2"
                                            value={serviceCharge}
                                            onChange={(e) => setServiceCharge(e.target.value)}
                                            min="0"
                                          />
                                        </div>
                                        {/* Show upload input ONLY if paymentMode === "GCash" */}
                                        {paymentMode === "GCash" && (
                                          <div className="mb-4">
                                            <label className="block font-medium">Upload GCash Proof</label>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="border p-2 w-full rounded"
                                              onChange={(e) => setGcashProof(e.target.files[0])}
                                            />
                                          </div>
                                        )}
                                    </div>

                                    {/* Charged Items Table */}
                                    <table className="w-full border mb-4">
                                      <thead className="font-bold bg-gray-200">
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
      </main>
      </div>
  );
};

export default Adminbillingedit;
