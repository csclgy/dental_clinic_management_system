import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";   // ✅ make sure axios is installed

const Adminbillingedit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const { appointId } = useParams();  // ✅ Accept appointId from route
  const [newInvId, setNewInvId] = useState(null);
  const [inventory, setInventory] = useState([]);

  const [chargedServices, setChargedServices] = useState([]);
  const [chargedItems, setChargedItems] = useState([]);

  const [newItem, setNewItem] = useState("");
  const [newAmount, setNewAmount] = useState("");

    useEffect(() => {
    const fetchBilling = async () => {
        try {
        const token = localStorage.getItem("token"); // or wherever you store it
        const response = await axios.get(
            `http://localhost:3000/auth/billing/${appointId}`,
            {
            headers: { Authorization: `Bearer ${token}` }, // <--- important
            }
        );
        console.log("Billing data:", response.data);
        setChargedItems(response.data);
        } catch (err) {
        console.error("Error fetching billing:", err);
        }
    };

    fetchBilling();
    }, [appointId]);

const handleAddItem = async () => {
  if (!newItem || !newAmount || !newInvId) return;

  try {
    const response = await axios.post(
      "http://localhost:3000/auth/billing",
      {
        appoint_id: appointId,
        inv_id: newInvId,
        ci_item_name: newItem,
        ci_quantity: 1, // or you can add another input for quantity
        ci_amount: parseFloat(newAmount),
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    setChargedItems([...chargedItems, response.data]);
    setNewItem("");
    setNewAmount("");
    setNewInvId(null);
  } catch (err) {
    console.error("Error adding billing item:", err);
  }
};

useEffect(() => {
  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth/inventory", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInventory(response.data); // assuming the API returns an array of inventory items
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  fetchInventory();
}, []);

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
                                            <h1 className="text-2xl font-bold" style={{color:"#00458B"}}>Manage Billing</h1>
                                            <br />
                                        </div>
                                        <div className="col-sm-3">
                                        </div>
                                    </div>
                                </div>
                                <hr></hr>

                                <div className="col-sm-12">
                                    <div className="row">
                                              <div className="mb-6">
                                                {/* Charge Item Dropdown */}
                                                <label className="block text-[#00458b] font-semibold mb-1">
                                                Charge Item
                                                </label>
                                                <select
                                                value={newItem}
                                                onChange={(e) => {
                                                    const selected = inventory.find(
                                                    (inv) => inv.inv_item_name === e.target.value
                                                    );
                                                    if (selected) {
                                                    setNewItem(selected.inv_item_name);
                                                    setNewAmount(selected.inv_price_per_item); // default unit price
                                                    setNewInvId(selected.inv_id); // store inv_id for backend
                                                    }
                                                }}
                                                >
                                                <option value="">Select Item</option>
                                                {inventory.map((item) => (
                                                    <option key={item.inv_id} value={item.inv_item_name}>
                                                    {item.inv_item_name} (₱{item.inv_price_per_item}, Stock: {item.inv_quantity})
                                                    </option>
                                                ))}
                                                </select>
                                                <label className="block text-[#00458b] font-semibold mb-1">
                                                Amount
                                                </label>
                                                <input
                                                type="number"
                                                value={newAmount}
                                                onChange={(e) => setNewAmount(e.target.value)}
                                                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none mb-3"
                                                />
                                            </div>
                                        <div className="col-sm-6">

                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-10">
                                            <h1 className="text-2xl font-bold" style={{color:"#00458B"}}></h1>
                                        </div>
                                        <div className="col-sm-2">
                                                <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={handleAddItem}>Add</button>
                                        </div>
                                    </div>
                                </div>

                                <hr></hr>
                                    <br />
                                <div className="col-sm-12">
                                {/* Search bar */}
                                <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-1">
                                        <h1 className=" font-bold text-[#00458B]"></h1>
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

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-gray-200">
                                        <thead>
                                            <tr className="bg-white text-[#00458B] border-b border-gray-200">
                                            <th className="px-4 py-2 text-center">Charged Item</th>
                                            <th className="px-4 py-2 text-center">Amount</th>
                                            <th className="px-4 py-2 text-center">Action</th>
                                            <th className="px-4 py-2 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chargedItems.length > 0 ? (
                                            chargedItems.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-200 text-center">
                                                    <td className="px-4 py-2 text-blue-700">{item.item}</td>
                                                    <td className="px-4 py-2 text-blue-700">₱{item.amount}</td>
                                                </tr>
                                            ))
                                            ) : (
                                            <tr>
                                                <td colSpan="2" className="text-center text-gray-500 py-4">
                                                No items found
                                                </td>
                                            </tr>
                                            )}
                                            <tr className="px-4 py-2 text-blue-700">
                                            <td>Total: ₱{chargedItems.reduce((sum, item) => sum + Number(item.amount), 0)}</td>
                                            </tr>
                                        </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="row">
                                    <div className="col-sm-12">
                                    </div>
                                        <div className="col-sm-12">
                                            <br></br>
                                            <div className="row">
                                                <button
                                                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full"
                                                onClick={() => navigate(`/adminconsultationview/${appointId}`)}
                                                >
                                                Done
                                                </button>
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

export default Adminbillingedit;
