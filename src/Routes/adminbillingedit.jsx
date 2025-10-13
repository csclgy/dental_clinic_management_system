import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { Calendar, Users, BarChart3, ChevronDown, ChevronUp, Menu, X, Package, AlertTriangle, PlusCircle, PhilippinePeso } from "lucide-react";
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

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

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

  const [extraServices, setExtraServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceAmount, setNewServiceAmount] = useState(0);

  // const [hmoNumber, setHmoNumber] = useState("");
  // const [pwdDiscount, setPwdDiscount] = useState("");

  const [billingDate, setBillingDate] = useState("");

  const [appointment, setAppointment] = useState(null);

  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

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

      // ✅ Use billingRes instead of res
      setAppointment(billingRes.data.appointment);
      setChargedItems(billingRes.data.chargedItems || []);
      setInventory(invRes.data || []);

      const appoint = billingRes.data.appointment;
      if (appoint) {
        setPaymentMode(appoint.payment_method || "");   // <- check your backend column name
        setPaymentStatus(appoint.payment_status || "");
        setPaymentOR(appoint.or_num || "");
        setServiceCharge(Number(appoint.total_service_charged || 0));
      }

      if (appoint?.billing_date) {
        setBillingDate(appoint.billing_date.split("T")[0]);
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

  // const totalCharged = itemsTotal + Number(serviceCharge || 0);

  // add item
  const handleAddItem = async () => {
    if (!newInvId || !newQuantity || !newAmount) {
      return showPopup("Please select item and quantity.", "error");
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


  const handleAddService = async () => {
    if (!newServiceName || !newServiceAmount) {
      return showPopup("Please enter service name and amount.", "error");
    }

    try {
      const token = localStorage.getItem("token");

      // Call backend to save the service
      const res = await axios.post(
        `http://localhost:3000/auth/billing/${appointId}`,
        {
          ci_item_name: newServiceName,
          ci_quantity: 1, // services usually count as 1
          ci_amount: parseFloat(newServiceAmount),
          ci_type: "service", // explicitly mark it as a service
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Append newly saved service to UI
      const newService = {
        ci_id: res.data.ci_id, // backend returns insertId
        ci_item_name: newServiceName,
        ci_quantity: 1,
        ci_amount: parseFloat(newServiceAmount),
        ci_type: "service",
      };
      setChargedItems((prev) => [...prev, newService]);

      // Reset inputs
      setNewServiceName("");
      setNewServiceAmount(0);

    } catch (err) {
      console.error("Error adding service:", err);
      alert("Failed to add service");
    }
  };

  const handleDeleteService = (id) => {
    setExtraServices((prev) => prev.filter((s) => s.id !== id));
  };

  const servicesTotal = extraServices.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalCharged = itemsTotal + servicesTotal;

  const handleSaveBilling = async () => {
    // ✅ Validation
    if (!paymentOR.trim()) {
      return showPopup("OR Number is required", "error");
    }
    if (!paymentStatus) {
      return showPopup("Payment Status is required", "error");
    }
    if (!paymentMode) {
      return showPopup("Mode of Payment is required", "error");
    }
    if (!serviceCharge || Number(serviceCharge) <= 0) {
      return showPopup("Main Service Charge must be greater than 0", "error");
    }

    // ✅ Optional: additional validation for GCash proof or HMO number
    if (paymentMode === "GCash" && !gcashProof) {
      return showPopup("Please upload GCash proof", "error");
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("payment_method", paymentMode);
      formData.append("payment_status", paymentStatus);
      formData.append("or_num", paymentOR);
      try {
        const token = localStorage.getItem("token");
        const checkRes = await axios.get(
          `http://localhost:3000/auth/checkOR/${paymentOR}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (checkRes.data.exists && checkRes.data.appoint_id !== Number(appointId)) {
          return showPopup(
            `OR Number ${paymentOR} is already used for another appointment`,
            "error"
          );
        }
      } catch (err) {
        console.error("Error checking OR number:", err);
        return showPopup("Failed to validate OR number", "error");
      }
      formData.append("total_service_charged", Number(serviceCharge));

      if (billingDate) formData.append("billing_date", billingDate);

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


      showPopup("Billing saved successfully", "success");
      await fetchBillingData();
    } catch (err) {
      console.error("Error saving billing:", err);
      alert("Failed to save billing");
    }
  };

  const handleDone = () => {
    // reset inputs before navigating (optional)
    setPaymentMode("");
    setPaymentStatus("");
    setPaymentOR("");
    setServiceCharge(0);
    // setHmoNumber("");
    // setPwdDiscount("");
    setBillingDate("");

    navigate(`/adminconsultationview/${appointId}`);
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
          {/* Dashboard Dropdown */}
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} /> Dashboard
            </span>
            {openDashboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openDashboard && (
            <div className="ml-6 flex flex-col gap-1 text-sm">
              {role === "admin" && (
                <Link to="/admindashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Admin Dashboard</Link>
              )}
              {(role === "admin" || role === "inventory") && (
                <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard</Link>
              )}
              {(role === "admin" || role === "receptionist" || role === "dentist") && ( 
                <Link to="/receptionistdashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Receptionist Dashboard</Link>
              )}
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
              {/* Ledger Dropdown */}
              <button onClick={() => setIsLedgerOpen(!isLedgerOpen)}
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <span className="flex items-center gap-2">
                  <i className="fa fa-book"></i> Ledger
                </span>
                {isLedgerOpen ?
                  <ChevronUp size={16} /> :
                  <ChevronDown size={16} />}
              </button>

              {isLedgerOpen && (
                <div className="ml-6 flex flex-col gap-1 text-sm">
                  <Link
                    to="/admincoa"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Chart of Accounts
                  </Link>
                  <Link
                    to="/adminjournal"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Journal Entries
                  </Link>
                  <Link
                    to="/adminsubsidiaryreceivable"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    Subsidiary
                  </Link>
                  <Link
                    to="/admingeneral"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
                    General Ledger
                  </Link>
                  <Link
                    to="/admintrial"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                  >
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
            </>
          )}

          {(role === "admin" || role === "inventory") && (
            <>
              <Link
                to="/admininventory"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-archive"></i> Inventory
              </Link>
            </>
          )}

          {(role === "admin" || role === "dentist" || role === "receptionist") && (
            <>
              <Link
                to="/adminpatients"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-user-plus"></i> Patients
              </Link>
              <Link
                to="/adminschedule"
                className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <Calendar size={18} /> Schedules
              </Link>
            </>
          )}

          {(role === "admin" || role === "receptionist") && (
            <>
              <Link
                to="/admincashier"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <PhilippinePeso size={18} /> Cashier
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link
                to="/adminaudit"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <i className="fa fa-eye"></i> Audit Trail
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Sidebar (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#00458B] text-white flex flex-col p-6 z-50 overflow-y-auto">
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end mb-6"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>

              {/* Ledger dropdown */}
              {role === "admin" && (
                <>
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
                      <Link
                        to="/admincoa"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                      >
                        Chart of Accounts
                      </Link>
                      <Link
                        to="/adminjournal"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                      >
                        Journal Entries
                      </Link>
                      <Link
                        to="/adminsubsidiaryreceivable"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                      >
                        Subsidiary
                      </Link>
                      <Link
                        to="/admingeneral"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                      >
                        General Ledger
                      </Link>
                      <Link
                        to="/admintrial"
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
                      >
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
                </>
              )}

              {(role === "admin" || role === "inventory") && (
                <>
                  <Link
                    to="/admininventory"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
                  >
                    <i className="fa fa-archive"></i> Inventory
                  </Link>
                </>
              )}

              {(role === "admin" || role === "dentist" || role === "receptionist") && (
                <>
                  <Link
                    to="/adminpatients"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
                  >
                    <i className="fa fa-user-plus"></i> Patients
                  </Link>
                  <Link
                    to="/adminschedule"
                    className="flex items-center gap-2 bg-white text-[#00458B] p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
                  >
                    <Calendar size={18} /> Schedules
                  </Link>
                </>
              )}

              {(role === "admin" || role === "receptionist") && (
                <>
                  <Link
                    to="/admincashier"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
                  >
                    <Calendar size={18} /> Cashier
                  </Link>
                </>
              )}

              {role === "admin" && (
                <>
                  <Link
                    to="/adminaudit"
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
                  >
                    <i className="fa fa-eye"></i> Audit Trail
                  </Link>
                </>
              )}
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 p-6 md:p-8">
        {/* ✅ Popup Notification */}
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
              } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}
        <p style={{ color: "transparent" }}>...</p>
        <div className="row">
          <div className="col-sm-12">
            <div className="row">
              <div className="col-sm-9">
                {appointment && (
                  <h2 className="text-2xl text-[#00458B] font-bold mb-4">
                    Billing for {appointment.p_fname} {appointment.p_lname}'s Appointment
                  </h2>
                )}
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
                required
              >
                <option value="">--Select--</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            <div>
              <label className="block font-medium">Mode of Payment</label>
              <select
                className="border p-2 w-full rounded"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                required
              >
                <option value="">--Select--</option>
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                {/* <option value="HMO">HMO</option> fixed value */}
              </select>
            </div>

            <div>
              <label className="block font-semibold">Main Service Charge(₱) :</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                min="0"
              />
            </div>

            {/* ✅ Show upload input ONLY if paymentMode === "GCash" */}
            {paymentMode === "GCash" && (
              <div className="col-span-2">
                <label className="block font-medium">Upload GCash Proof</label>
                <input
                  type="file"
                  accept="image/*"
                  className="col-sm-6 border p-2 rounded"
                  onChange={(e) => setGcashProof(e.target.files[0])}
                />
              </div>
            )}

            {/* ✅ Show HMO Number ONLY if paymentMode === "HMO" */}
            {/* {paymentMode === "HMO" && (
              <div className="col-span-2">
                <label className="block font-medium">HMO Number</label>
                <input
                  type="text"
                  className="col-sm-6 border rounded px-3 py-2"
                  value={hmoNumber}
                  onChange={(e) => setHmoNumber(e.target.value)}
                  placeholder="Enter HMO Number"
                />
              </div>
            )} */}

            {/* ✅ Always show PWD Discount field */}
            {/* <div className="col-span-2">
              <label className="block font-medium">PWD #No. (Optional)</label>
              <input
                type="text"
                className="col-sm-6 border rounded px-3 py-2"
                value={pwdDiscount}
                onChange={(e) => setPwdDiscount(e.target.value)}
                placeholder="Enter PWD Number"
              />
            </div> */}
            <div>
              <label className="block font-semibold">Billing Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
              />
            </div>
          </div>

          {/* Service Selection */}
          <hr></hr>
          <br></br>
          <p className="text-2xl text-[#00458B] font-bold mb-4">Additional Items & Services</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-sm text-gray-700">Select Service:</label>
              <select
                className="border rounded px-3 py-2"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
              >
                <option value="">Select a procedure</option>
                <option value="TMJ TREATMENT">TMJ TREATMENT</option>
                {/* <option value="ORTHODONTIC TREATMENT">ORTHODONTIC TREATMENT</option> */}
                <option value="MYOFUNCTIONAL TREATMENT">MYOFUNCTIONAL TREATMENT</option>
                <option value="ROOT CANAL TREATMENT">ROOT CANAL TREATMENT</option>
                <option value="ORAL PROPHYLAXIS">ORAL PROPHYLAXIS</option>
                <option value="TOOTH EXTRACTION">TOOTH EXTRACTION</option>
                <option value="ODONTECTOMY">ODONTECTOMY</option>
                <option value="RESTORATIVE FILLING">RESTORATIVE FILLING</option>
                <option value="FLOURIDE TREATMENT">FLOURIDE TREATMENT</option>
                <option value="DENTURES">DENTURES</option>
                <option value="TEETH WHITENING">TEETH WHITENING</option>
                <option value="DENTAL X-RAY">DENTAL X-RAY</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-sm text-gray-700">Service Charge:(₱)</label>
              <input
                type="number"
                className="px-3 py-2 border rounded"
                value={newServiceAmount}
                onChange={(e) => setNewServiceAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={handleAddService}
                className="bg-[#00c3b8] text-white px-4 py-2 rounded"
              >
                + Add Service
              </button>
            </div>
          </div>

          {/* Item Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-sm text-gray-700">Select Item:</label>
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
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-sm text-gray-700">Item Quantity:</label>
              <input
                type="number"
                min="1"
                className="px-3 py-2 border rounded"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value || "1"))}
                placeholder="Quantity"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={handleAddItem}
                className="bg-[#00c3b8] text-white px-4 py-2 rounded"
              >
                + Add Item
              </button>
            </div>
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button onClick={handleDone} className="bg-gray-500 text-white px-6 py-2 rounded-full">
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
