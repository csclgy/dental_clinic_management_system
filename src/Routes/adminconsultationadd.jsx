import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";

const adminconsultationadd = () => {
  const location = useLocation();
  const patient = location.state?.patient;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const { id } = useParams(); // patient_id or appoint_id if passed in route

// Form states
  const [dateOfVisit, setDateOfVisit] = useState("");
  const [dentist, setDentist] = useState("");
  const [orNumber, setOrNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [amount, setAmount] = useState("");
  const [chargedServices, setChargedServices] = useState([]);
  const [chargedItems, setChargedItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [procedureType, setProcedureType] = useState("");

  const [inventory, setInventory] = useState([]);

  console.log("Patient data from AdminPatientsView:", patient);

  const [fname, setFname] = useState(patient?.fname || "");
  const [lname, setLname] = useState(patient?.lname || "");
  const [email, setEmail] = useState(patient?.email || "");


    useEffect(() => {
    fetch("http://localhost:3000/auth/inventory")
        .then((res) => res.json())
        .then((data) => setInventory(data))
        .catch((err) => console.error("Error fetching inventory:", err));
    }, []);


    // Service → Required Items with quantity
    const serviceItems = {
    "TMJ TREATMENT": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "ORTHODONTIC TREATMENT": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "MYOFUNCTIONAL TREATMENT": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "ROOT CANAL TREATMENT": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "ORAL PROPHYLAXIS": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "TOOTH EXTRACTION": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "ODONTECTOMY": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "RESTORATIVE FILLING": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "FLOURIDE TREATMENT": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "DENTURES": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "TEETH WHITENING": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    "DENTAL X-RAY": [
        { name: "Disposable Gloves", quantity: 1 },
        { name: "Disposable Hairnet", quantity: 1 },
        { name: "Disposable Foot Cover", quantity: 1 }
    ],
    };

  const handleSaveConsultation = async () => {
    try {
        const payload = {
        procedure_type: procedureType,
        pref_date: dateOfVisit,
        pref_time: "",
        payment_method: paymentMode,
        attending_dentist: dentist,
        or_num: orNumber,
        payment_status: paymentStatus,
        appointment_status: "pending",
        total_service_charged: chargedServices.reduce((sum, s) => sum + (s.amount || 0), 0),

        // patient info
        p_fname: patient?.fname,
        p_mname: patient?.mname,
        p_lname: patient?.lname,
        p_gender: patient?.gender,
        p_age: patient?.age,
        p_date_birth: patient?.date_birth,
        p_home_address: patient?.home_address,
        p_email: patient?.email,
        p_contact_no: patient?.contact_no,

        // ✅ transform charged items to backend format
        chargedItems: chargedItems.map((item) => ({
            inv_id: inventory.find((inv) => inv.inv_item_name === item.name)?.inv_id || null,
            ci_item_name: item.name,
            ci_quantity: item.quantity,
            ci_amount: item.totalPrice,
        })),
        };

        console.log("Payload being sent:", payload);

        const token = localStorage.getItem("token");
        const res = await axios.post(
        "http://localhost:3000/auth/createconsultation",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Consultation created:", res.data);
        alert("Consultation created successfully!");
        navigate("/adminpatients");
    } catch (err) {
        console.error("Error saving consultation:", err);
        alert("Failed to create consultation");
    }
    };

    const handleAddService = () => {
    if (!procedureType || !amount) return;

    setErrorMessage(""); // clear old errors

    const requiredItems = serviceItems[procedureType] || [];
    const newItems = [];
    let hasError = false;

    requiredItems.forEach((req) => {
        const found = inventory.find((inv) => inv.inv_item_name === req.name);

        if (!found) {
        setErrorMessage(`Error: Item "${req.name}" does not exist in inventory.`);
        hasError = true;
        return;
        }

        if (found.inv_quantity < req.quantity) {
        setErrorMessage(
            `Error: Not enough stock for "${req.name}". Required: ${req.quantity}, Available: ${found.inv_quantity}`
        );
        hasError = true;
        return;
        }

        newItems.push({
        name: req.name,
        quantity: req.quantity,
        unitPrice: found.inv_price_per_item,
        totalPrice: req.quantity * found.inv_price_per_item,
        linkedService: procedureType,
        });
    });

    if (hasError) {
        // auto clear error after 5s
        setTimeout(() => setErrorMessage(""), 5000);
        return; // don’t add service
    }

    // ✅ only update if no error
    setChargedServices([{ procedure_type: procedureType, amount: parseFloat(amount) }]);
    setChargedItems(newItems);

    setAmount("");
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

  const procedureTypes = [
    "TMJ TREATMENT",
    "ODONTECTOMY",
    "ORTHODONTIC TREATMENT",
    "RESTORATIVE FILLING",
    "MYOFUNCTIONAL TREATMENT",
    "FLOURIDE TREATMENT",
    "ROOT CANAL TREATMENT",
    "DENTURES",
    "ORAL PROPHYLAXIS",
    "TEETH WHITENING",
    "TOOTH EXTRACTION",
    "DENTAL X-RAY"
  ];

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
                                <div className="col-sm-10">
                                    <h1 className="text-2xl font-bold">Patients Record</h1>
                                </div>
                                <div className="col-sm-2">
                                </div>
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <h1 className="text-2xl font-bold" style={{color:"#00458B"}}>Create New Consultation</h1>
                                        </div>
                                    </div>
                                </div>

                                <hr></hr>

                                <div className="col-sm-12">
                                    <br />
                                    <div className="row">
                                        <div className="col-sm-6">
                                        {/* Date + Dentist */}
                                        <div className="mb-4 text-left">
                                            <label className="block text-[#00458b] font-semibold mb-1">Date of Visit</label>
                                            <input
                                            type="date"
                                            value={dateOfVisit}
                                            onChange={(e) => setDateOfVisit(e.target.value)}
                                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                            />
                                        </div>

                                        <div className="mb-4 text-left">
                                            <label className="block text-[#00458b] mb-1">Attending Dentist</label>
                                            <select
                                            value={dentist}
                                            onChange={(e) => setDentist(e.target.value)}
                                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                            >
                                            <option value="">Select Dentist</option>
                                            <option value="Dr. A. Reyes">Dr. A. Reyes</option>
                                            <option value="Dr. M. Santos">Dr. M. Santos</option>
                                            </select>
                                        </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <p className="block text-[#00458b] font-bold mb-1">Billing Information</p>
                                            {/* Billing */}
                                            <div className="mb-4 text-left">
                                                <label className="block text-[#00458b] mb-1">OR Number</label>
                                                <input
                                                type="number"
                                                value={orNumber}
                                                onChange={(e) => setOrNumber(e.target.value)}
                                                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                                />
                                            </div>
                                            <div className="mb-4 text-left">
                                                <label className="block text-[#00458b] mb-1">Mode of Payment</label>
                                                <select
                                                value={paymentMode}
                                                onChange={(e) => setPaymentMode(e.target.value)}
                                                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                                >
                                                <option value="">Select Payment</option>
                                                <option value="Advance Payment">Advance Payment</option>
                                                <option value="Pay at Counter">Pay at Counter</option>
                                                </select>
                                            </div>
                                            <div className="mb-4 text-left">
                                                <label className="block text-[#00458b] mb-1">Payment Status</label>
                                                <select
                                                value={paymentStatus}
                                                onChange={(e) => setPaymentStatus(e.target.value)}
                                                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                                >
                                                <option value="">Select Status</option>
                                                <option value="Pending check receipt">Pending check receipt</option>
                                                <option value="Received">Received</option>
                                                <option value="Refunded">Refunded</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Completed">Completed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <br />
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <p className="text-2xl font-bold" style={{ color: "#00458B" }}>
                                                Services
                                            </p>
                                            <br />
                                            <form className="grid grid-cols-2 gap-x-12 gap-y-4">
                                                
                                            {procedureTypes.map((type, index) => (
                                            <label
                                                key={index}
                                                className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
                                            >
                                                <input
                                                type="radio"
                                                className="hidden peer"
                                                id={`procedure-${index}`}
                                                name="procedure_type"
                                                value={type}
                                                checked={procedureType === type} // ✅ compare with state
                                                onChange={() => setProcedureType(type)} // ✅ update state
                                                />
                                                <span className="w-5 h-5 border-2 border-blue-300 rounded-sm flex items-center justify-center peer-checked:bg-blue-700 transition">
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                </span>
                                                <span className="text-blue-800 tracking-wide">{type}</span>
                                            </label>
                                            ))}
                                            </form>
                                            <br />
                                            <hr />
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <p className="text-1xl font-bold" style={{ color: "#00458B" }}>
                                                        Amount:
                                                    </p>
                                                    <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                                    />
                                                </div>
                                                <div className="col-sm-6">
                                                    <br></br>
                                                    <button
                                                    type="button"
                                                    className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                                                    onClick={handleAddService}
                                                    >
                                                    Add Service
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-6">

                                                </div>
                                                <br></br>
                                            </div>
                                            <div
                                            className="col-sm-12 p-10 rounded-lg shadow-lg"
                                            style={{ border: "solid", borderColor: "#01D5C4", color: "#00458B" }}
                                            >
                                            {errorMessage && (
                                            <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700">
                                                {errorMessage}
                                            </div>
                                            )}
                                            {/* Charged Service */}
                                            <div className="row">
                                                <div className="col-sm-6">
                                                <p className="block text-[#00458b] font-bold mb-1">Charged Service</p>
                                                </div>
                                                <div className="col-sm-6">
                                                <p className="block text-[#00458b] font-bold mb-1">Amount</p>
                                                </div>
                                            </div>
                                            <hr />
                                            {chargedServices.map((service, index) => (
                                                <div key={index} className="row">
                                                <div className="col-sm-6">
                                                    <p>{service.procedure_type}</p>
                                                </div>
                                                <div className="col-sm-6">
                                                    <p>{service.amount.toFixed(2)}</p>
                                                </div>
                                                </div>
                                            ))}

                                            <br />

                                            {/* Charged Items */}
                                            <div className="row">
                                                <div className="col-sm-4">
                                                <p className="block text-[#00458b] font-bold mb-1">Item</p>
                                                </div>
                                                <div className="col-sm-4">
                                                <p className="block text-[#00458b] font-bold mb-1">Quantity</p>
                                                </div>
                                                <div className="col-sm-4">
                                                <p className="block text-[#00458b] font-bold mb-1">Total Price</p>
                                                </div>
                                            </div>
                                            <hr />

                                            {/* Scrollable container for items */}
                                            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                {chargedItems.map((item, index) => (
                                                <div key={index} className="row">
                                                    <div className="col-sm-4">
                                                    <p>{item.name}</p>
                                                    </div>
                                                    <div className="col-sm-4">
                                                    <p>{item.quantity}</p>
                                                    </div>
                                                    <div className="col-sm-4">
                                                    <p>{item.totalPrice.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                ))}
                                            </div>
                                            <br></br>
                                            <hr />
                                            {/* Total */}
                                            <div className="row">
                                                <div className="col-sm-6">
                                                <p className="block text-[#00458b] font-bold mb-1">Total Charge Amount</p>
                                                </div>
                                                <div className="col-sm-6">
                                                <p className="block text-[#00458b] font-bold mb-1">
                                                    {(
                                                    chargedServices.reduce((sum, s) => sum + s.amount, 0) +
                                                    chargedItems.reduce((sum, i) => sum + i.totalPrice, 0)
                                                    ).toFixed(2)}
                                                </p>
                                                </div>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="row">
                                    <div className="col-sm-6">
                                    </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-6">

                                                </div>
                                                <div className="col-sm-6">
                                                <button
                                                    className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"
                                                    onClick={handleSaveConsultation}
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
            <div className="col-sm-2">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default adminconsultationadd;
