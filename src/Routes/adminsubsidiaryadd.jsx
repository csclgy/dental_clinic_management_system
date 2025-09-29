import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

const adminsubsidiaryadd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const  [account,setAccount] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [sub,setSub] = useState([]);

    const [formData, setFormData] = useState({
    date: "",
    description: "",
    invoice_no:"",
    account: "",
    subaccount: "",
    type: "debit",
    amount: "",
    comment: ""
  });

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

const fetchAccountReceivable = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/auth/accountReceivable`);
      if (res.data.length > 0) {
        const { account_id, account_name } = res.data[0];
        setFormData(prev => ({
          ...prev,
          account: account_id,
          accountName: account_name,
        }));
      }
    } catch (err) {
      console.error("Error fetching Account Receivable:", err);
    }
  };

  fetchAccountReceivable();
}, [location]);
  
const fetchSuggestions = async (query) => {
  if (!query) {
    setNameSuggestions([]);
    return;
  }

  try {
    const res = await axios.get(`http://localhost:3000/auth/patients/search?name=${query}`);
    setNameSuggestions(res.data);
  } catch (err) {
    console.error("Error fetching name suggestions:", err);
  }
};

   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.date || !formData.description || !formData.account || !formData.amount) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    // Determine debit and credit amounts
    const debit = formData.type === "debit" ? Number(formData.amount) : 0;
    const credit = formData.type === "credit" ? Number(formData.amount) : 0;

    // 2️⃣ Save to subsidiary_ledger
 await axios.post("http://localhost:3000/auth/subsidiary", {
  date: formData.date,
  name: formData.description,    // 👈 map description → name
  account_id: formData.account,
  invoice_no: formData.invoice_no,
  debit,
  credit
});

    alert("Journal + Subsidiary entry saved successfully!");
    navigate("/adminsubsidiary");
  } catch (err) {
    console.error("Error saving entry:", err);
    alert(err.response?.data?.message || "Something went wrong");
  }
};

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
                    style={{ color: "#00c3b8" }}
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
                        <p className="py-1 hover:underline" style={{ color: "#00c3b8" }}>
                        Journal Entries
                        </p>
                    </Link>
                      <Link to='/adminsubsidiary'>
                                        <p className="py-1 hover:underline" style={{ color: "#00458B" }}>
                                          Subsidiary 
                                        </p>
                                       </Link>  
                    <Link to='/adminsubsidiaryreceivable'>
                                        <p className="py-1 hover:underline" style={{ color: "#00c3b8" }}>
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
                    style={{ color: "#00458B" }}
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
                    style={{ color: "#00458B" }}>
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
                                    <h1 className="text-2xl font-bold">Subsidiary Ledger</h1>
                                </div>
                               
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <form onSubmit={handleSubmit}>
                            <div className="row">
                                 
                                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}> Add New Entry</h1>
                                    <div className="col-sm-2">
                                    </div>
                                
                                    <div className="col-sm-9">
                                        <br />
                                        <br />
                                        
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Date</label>
                                                    <input type="date" name="date" value={formData.date} onChange={handleChange}  class="w-full border border-[#00458b] rounded-full px-3 py-2 outline-none" />
                                                </div>
                                            </div>
                                            <div className="col-sm-8">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Invoice Number</label>
                                                   <input type="text" name="invoice_no" value={formData.invoice_no} onChange={handleChange} class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                          <label className="block text-[#00458b] font-semibold mb-1">Patient Name</label>
                                          <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={(e) => {
                                              handleChange(e);
                                              fetchSuggestions(e.target.value);
                                            }}
                                            className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                                            autoComplete="off"
                                          />

                                          {/* Suggestions dropdown */}
                                          {nameSuggestions.length > 0 && (
                                            <ul className="absolute z-10 bg-white border border-gray-300 rounded">
                                              {nameSuggestions.map((user) => (
                                                <li
                                                  key={user.user_id}
                                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                  onClick={() => {
                                                    setFormData(prev => ({ ...prev, description: user.full_name }));
                                                    setSelectedPatientId(user.user_id);
                                                    setNameSuggestions([]); // hide suggestions
                                                  }}
                                                >
                                                  {user.full_name}
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        <div className="row">
                                              <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Debit/Credit</label>
                                                    <select  name="type" value={formData.type} onChange={handleChange}   class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none">
                                                        <option value="debit">Debit</option>
                                                        <option value="credit">Credit</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div class="mb-4 text-left">
                                                    <label class="block text-[#00458b] font-semibold mb-1">Amount</label>
                                                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                      <  div className="row">
                                            <div className="col-sm-6">
                                              <div className="mb-4 text-left">
                                              <label className="block text-[#00458b] font-semibold mb-1">Account</label>
                                              <input
                                                type="text"
                                                value={formData.accountName || ""}
                                                readOnly
                                                className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none bg-gray-100 cursor-not-allowed"
                                              />
                                              {/* Hidden input to submit account_id */}
                                              <input type="hidden" name="account" value={formData.account || ""} />
                                            </div>
                                                
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <div className="col-sm-2">

                                    </div>
                                    <div className="col-sm-12">
                                        <br />
                                        <br /> 
                                        <div className="row">
                                            <div className="col-sm-6">
                                            </div>
                                        <div className="col-sm-6">
                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <button type="button" className="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full mb-4" onClick={() => navigate("/adminsubsidiary")}>Back</button>
                          </div>
                          <div className="col-sm-4">
                            <button type="submit" className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full mb-4">Save</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            </div>
                            </form>
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

export default adminsubsidiaryadd; 