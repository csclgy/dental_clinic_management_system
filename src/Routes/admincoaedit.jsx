import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useParams} from "react-router-dom";
import axios from "axios";

const admincoaedit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const { id } = useParams();
  

    const [account, setAccount] = useState({
    account_name: "",
    account_type: "",
    status: ""
  });


//
  useEffect(() => {
    const fetchAccount = async () => {
      try {
      const res = await axios.get(`http://localhost:3000/auth/coa/${id}`);

        setAccount(res.data);
      } catch (err) {
        console.error("Error fetching account:", err);
      }
    };
    fetchAccount();
  }, [id]);
//update
   const handleChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

    const handleUpdate = async () => {
    try {
     await axios.put(`http://localhost:3000/auth/coa/${id}`, account);
      alert("Account updated successfully!");
      navigate("/admincoa"); // go back to list
    } catch (err) {
      console.error("Error updating account:", err);
      alert("Failed to update account");
      }};
  
    
//
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
                        <p className="py-1 hover:underline" style={{ color: "#00c3b8" }}>
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
                                <div className="col-sm-10">
                                    <h1 className="text-2xl font-bold">Charts of Account</h1>
                                </div>
                                
                            </div>
                        </div>
                        <p style={{color:"transparent"}}>...</p>
                        <div className="col-sm-12 p-10 rounded-lg shadow-lg" style={{border:"solid", borderColor:"#01D5C4"}}>
                            <div className="row">
                                    <h1 className="text-xl font-bold" style={{ color: "#00458B" }}>Edit Account</h1>
                                    <div className="col-sm-3">

                                    </div>
                                    <div className="col-sm-6">
                                        <br />
                                        <br />
                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Name</label>
                                            <input 
                                             type="text"
                                             name="account_name"
                                             value={account.account_name}
                                             onChange={handleChange}
                                             class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                                        </div>
                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Account Type</label>
                                            <select  
                                            name="account_type"
                                            value={account.account_type}
                                            onChange={handleChange}
                                            class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                 <option value="Asset">Asset</option>
                                                 <option value="Revenue">Revenue</option>
                                                 <option value="Liability">Liability</option>
                                                 <option value="Equity">Equity</option>
                                                 <option value="Income">Income</option>
                                                 <option value="Expense">Expense</option>
                                            </select>
                                        </div>
                                        <div class="mb-4 text-left">
                                            <label class="block text-[#00458b] font-semibold mb-1">Account Status</label>
                                            <select  
                                            name="status"
                                            value={account.status}
                                            onChange={handleChange}
                                            class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                                 <option value="Active"> Active </option>
                                                 <option value="Inactive">Inactive</option>
                                            </select>
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
                                                    <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/admincoa")}>Back to List</button>
                                                </div>
                                            <div className="col-sm-6">
                                                <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4"  onClick={handleUpdate}>Update</button>
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

export default admincoaedit;
