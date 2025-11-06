import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Users,
  Calendar,
  Menu,
  X,
  PlusCircle,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PhilippinePeso,
  IdCard,
  Settings,
  FolderKanban, 
  BriefcaseMedical
} from "lucide-react";

const AdminHMOService = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isSettingopen, setIsSettingOpen] = useState(true);
  const [hmos, setHmos] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);
  const { hmo_id } = useParams();
  const [services, setServices] = useState([]);
  const [hmo, setHMO] = useState({});

  // ✅ Popup state and fade animation (same as AdminCoaEdit)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // ✅ Confirmation Modal
  const [confirmBox, setConfirmBox] = useState({
    show: false,
    hmoId: null,
    hmoName: "",
  });

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  // // Convert hmoId to number if needed
  // const selectedHMO = hmos.find(hmo => hmo.hmo_id === parseInt(hmo_id));


  useEffect(() => {
    const handleClickOutside = (e) => {
      const tooltip = document.getElementById("floatingTooltipBox");
      if (tooltip && !tooltip.contains(e.target)) {
        setSelectedRecord(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  useEffect(() => {

    const fetchHMO = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/hmo1/${hmo_id}`);
        setHMO(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching HMO:", err);
        showPopup("Failed to fetch HMO.", "error");
      }
    };

    const fetchServices = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/auth/hmo_services/${hmo_id}`);
        setServices(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching HMO services:", err);
        showPopup("Failed to fetch HMO services.", "error");
      }
    };
    fetchServices();
    fetchHMO();
  }, [hmo_id]);


  // const filteredHmos = hmos.filter((hmo) =>
  //   hmo.hmo_name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showPopup("No token found. Please login again.", "error");
        return;
      }

      // PUT request to change status to inactive
      await axios.put(
        `http://localhost:3000/auth/hmo_service_status/${confirmBox.hmoId}`,
        { status: "Inactive" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setConfirmBox({ show: false, hmoId: null, hmoName: "" });

      showPopup("Service deactivated successfully.", "success");

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error("Error deactivating service:", err);
      showPopup("Failed to deactivate service.", "error");
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/*  Popup Notification (same style as AdminCoaEdit) */}
      {popup.show && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
          style={{ zIndex: 9999 }}
        >
          {popup.message}
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {confirmBox.show && (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-[9998]">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 text-center relative animate-fadeIn">
            <AlertTriangle className="text-red-500 mx-auto mb-3" size={50} />
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Are you sure you want to deactive this account?
            </h2>
            <p className="text-gray-600 mb-6">
              <span className="font-semibold text-[#00458B]">
                {confirmBox.accountName}
              </span>{" "}
              will be inactive.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmBox({ show: false, accountId: null, accountName: "" })}
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-sxl font-bold mb-8">Arciaga-Juntilla TMJ Ortho Dental Clinic</h2>

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
                <Link to="/inventorydashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Inventory Dashboard
                </Link>
              )}
              {(role === "admin" || role === "receptionist" || role === "dentist") && (
                <Link to="/receptionistdashboard" className="hover:text-[#00458B] hover:bg-white p-2 rounded-lg">Receptionist
                  Dashboard</Link>
              )}
            </div>
          )}

          {/* Ledger dropdown */}
          {role === "admin" && (
            <>
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
                    className="flex items-center justify-between gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-gray-200"
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
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
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
         {role === "admin" && (
             <>
                <button onClick={() => setIsSettingOpen(!isSettingopen)}
                 className="flex justify-between items-center p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
               >
                 <span className="flex items-center gap-2">
                    <Settings size={18} /> Settings
                 </span>
                 {isSettingopen?
                   <ChevronUp size={16} /> :
                   <ChevronDown size={16} />}
               </button>
                {isSettingopen && (
                 <div className="ml-6 flex flex-col gap-1 text-sm">
                   <Link to="/adminhmo" className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-white hover:text-[#00458B]">
                     <IdCard size={18} /> HMO
                   </Link>
 
                   <Link to="/orRangeSetup" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                         <FolderKanban size={18} /> OR Range
                    </Link>
 
                    <Link to="/adminServices" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                         <BriefcaseMedical  size={18} /> Services
                    </Link>
                 </div>
               )}
             </>
           )}               
        </nav>
      </aside>

      {/* Sidebar (mobile) */}
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
            <nav className="flex flex-col gap-2">
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 bg-[#01D5C4] text-black p-2 rounded-lg"
              >
                <BarChart3 size={18} /> Dashboard
              </Link>
              <Link
                to="/adminusers"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#01D5C4] hover:text-black"
              >
                <Users size={18} /> Users
              </Link>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 flex items-center gap-2 text-[#00458B]"
        >
          <Menu size={24} /> Menu
        </button>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#00458B]">
            HMO Management
          </h2>

          <div className="flex gap-3">
            <Link
              to={`/adminhmoserviceadd/${hmo.hmo_id}`}
              className="flex items-center gap-2 bg-[#00458B] font-bold text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={18} /> Add Service
            </Link>
          </div>
        </div>

        {loading ? (
          <p>Loading accounts...</p>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            {/* Search Bar */}
            <div className="flex justify-between mb-4">
              <h1 className="text-2xl font-bold text-[#00458B]">
                {hmo?.hmo_name}
              </h1>
              <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-64 bg-white">
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
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100 text-[#00458B] sticky top-0 z-10">
                    <tr className="bg-gray-100 text-[#00458B]">
                      <th className="px-4 py-2 text-left">Service</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-center">Coverage</th>

                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {services.length > 0 ? (
                      services.map((service) => {
                        const isInactive = service.status?.toLowerCase() === "inactive";
                        return (
                          <tr key={service.service_id}>
                            <td className="px-4 py-2 text-blue-700">{service.service}</td>
                            <td
                              className={`px-4 py-2 text-center font-semibold ${isInactive ? "text-red-500" : "text-green-600"
                                }`}
                            >
                              {isInactive ? "Inactive" : "Active"}
                            </td>
                            <td className="px-4 py-2 text-center">{service.coverage}</td>
                            <td className="px-4 py-2 text-center space-x-2">
                              <Link to={`/adminhmoserviceedit/${service.service_id}`}>
                                <button className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600">
                                  Edit
                                </button>
                              </Link>
                              <button
                                disabled={isInactive}
                                onClick={() => {
                                  if (!isInactive) {
                                    setConfirmBox({
                                      show: true,
                                      hmoId: service.service_id,
                                      hmoName: service.service_name,
                                    });
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg ${isInactive
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-red-500 text-white hover:bg-red-600"
                                  }`}
                              >
                                Deactivate
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-gray-500 py-4">
                          No services found
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Link to="/adminhmo">
                <button className="bg-white text-[#00458B] font-semibold border border-[#00458b] px-6 py-2 rounded-lg">
                  Back to List
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminHMOService;
