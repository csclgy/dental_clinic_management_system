import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  Calendar,
  Package,
  PlusCircle,
  BookOpen,
  Eye,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  PhilippinePeso,
  IdCard
} from "lucide-react";

const AdminPatientsView = () => {
  const { id } = useParams();
  const { appointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = localStorage.getItem("role");
  const [openDashboard, setOpenDashboard] = useState(false);

  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [error, setError] = useState("");

  // ✅ Popup state and fade animation
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          return;
        }

        const res = await fetch(
          `https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/displaypatient/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.message || "Failed to fetch patient");
          return;
        }

        const data = await res.json();
        setPatient(data.patient);
        setConsultations(data.consultations || []);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError("Server error");
      }
    };

    fetchPatient();
  }, [id]);

  const handleFollowUp = async (appoint_id, p_fname, p_lname) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/followup/${appoint_id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: `Reminder: Today is your appointment, ${p_fname} ${p_lname}.` }),
      });

      if (!res.ok) throw new Error("Failed to send follow-up notification");
      const data = await res.json();

      // ✅ Show popup instead of alert
      showPopup(data.message || "Follow-up notification sent!", "success");
    } catch (err) {
      console.error("Follow-up error:", err);
      showPopup("Error sending follow-up notification.", "error");
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

  if (error) return <p className="text-red-500">{error}</p>;
  if (!patient)
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          aria-hidden="true"
          className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            className="text-gray-300"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            className="text-[#00c3b8]"
            fill="currentFill"
          />
        </svg>
      </div>
    );


  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Consultation Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #00458B;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #00458B;
            margin: 0;
          }
          .patient-info {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f0f8ff;
            border-left: 4px solid #00c3b8;
          }
          .summary {
            margin: 20px 0;
            padding: 15px;
            background-color: #f0f8ff;
            border-left: 4px solid #00c3b8;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: center;
          }
          th {
            background-color: #00458B;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Patient Consultation Report</h1>
          <p>Generated on: ${currentDate}</p>
        </div>
        
        <div class="patient-info">
          <strong>Patient Information:</strong><br>
          Name: ${patient.fname} ${patient.mname} ${patient.lname}<br>
          Age: ${patient.age} | Gender: ${patient.gender}<br>
          Contact: ${patient.contact_no}<br>
          Email: ${patient.email}
        </div>

        <div class="summary">
          <strong>Report Summary:</strong><br>
          Total Consultations: ${filteredConsultations.length}<br>
          Status Filter: ${statusFilter || 'All'}<br>
          Search Filter: ${searchTerm ? `"${searchTerm}"` : 'None'}
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Procedure</th>
              <th>Dentist</th>
              <th>Payment Status</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredConsultations.map(c => `
              <tr>
                <td>${new Date(c.pref_date).toLocaleDateString()}</td>
                <td>${c.procedure_type}</td>
                <td>${c.attending_dentist}</td>
                <td style="text-transform: capitalize;">${c.payment_status}</td>
                <td>₱${c.total_charged}</td>
                <td style="text-transform: capitalize;">${c.appointment_status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was automatically generated for Arciaga-Juntilla TMJ Ortho Dental Clinic.</p>
        </div>
        
        <script>
          window.addEventListener('afterprint', function() {
            window.close();
          });

          setTimeout(function() {
            window.print();
          }, 250);
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  // ✅ Filter + sort consultations
  const filteredConsultations = consultations
    .filter((c) =>
      Object.values(c).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter((c) =>
      statusFilter ? c.appointment_status === statusFilter : true
    )
    .sort((a, b) => b.appoint_id - a.appoint_id);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
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
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/inventorydashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
              >
                Inventory Dashboard
              </Link>
              <Link to="/receptionistdashboard"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Receptionist Dashboard
              </Link>
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
              <Link to="/adminhmo" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]">
                <IdCard size={18} /> HMO
              </Link>
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
                className="flex items-center gap-2 p-2 bg-white text-[#00458B] rounded-lg hover:bg-white hover:text-[#00458B]"
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
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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

        {/* Content */}
        <main className="p-6 overflow-y-auto space-y-6">
          {/* Patient Info */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00458B]">
                Patient Information
              </h2>
              <button
                className="bg-[#00458B] text-white px-4 py-2 rounded-lg font-semibold"
                onClick={() => navigate(`/adminpatientsedit/${patient?.user_id}`)}
              >
                Edit Profile
              </button>
            </div>
            <p className="text-2xl font-semibold text-[#00c3b8]">
              {patient.fname} {patient.mname} {patient.lname}
            </p>
            <p className="text-[#00458B]">
              {patient.gender} | {patient.age} | {patient.date_birth}
            </p>

            <br></br>
            <hr></hr>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-[#00458B]">
              <div>
                <h3 className="text-lg font-bold mb-2">
                  Address & Contact Information
                </h3>
                <p><span className="font-semibold">Address:</span> {patient.home_address}, {patient.city}</p>
                <p><span className="font-semibold">Email:</span> {patient.email}</p>
                <p><span className="font-semibold">Contact:</span> {patient.contact_no}</p>
                <p><span className="font-semibold">Username:</span> {patient.user_name}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">
                  Health Information
                </h3>
                <p><span className="font-semibold">Blood Type:</span> {patient.blood_type}</p>
              </div>
            </div>
          </div>

          {/* Consultation History */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00458B]">
                Consultation History
              </h2>
              <button
                className="bg-[#00458B] text-white px-4 py-2 rounded-lg flex items-center font-semibold"
                onClick={() => navigate("/adminconsultationadd", { state: { patient } })}
              >
                <PlusCircle className="mr-2" /> New Consultation
              </button>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-[#00458B] rounded px-2 py-1"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="done">Done</option>
                <option value="incomplete">Incomplete</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>

            {/* Table */}
            {filteredConsultations.length === 0 ? (
              <p className="text-gray-500">No consultations found.</p>
            ) : (
              <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-lg">
                <table className="w-full text-sm text-center">
                  <thead className="bg-gray-100 text-[#00458B]">
                    <tr>
                      <th className="px-2 py-2">Date</th>
                      <th className="px-2 py-2">Procedure</th>
                      <th className="px-2 py-2">Dentist</th>
                      <th className="px-2 py-2">Payment</th>
                      <th className="px-2 py-2">Total</th>
                      <th className="px-2 py-2">Status</th>
                      <th colSpan="4" className="px-2 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsultations.map((c) => (
                      <tr key={c.appoint_id} className="border-b">
                        <td className="px-2 py-2 text-blue-700">{c.pref_date}</td>
                        <td className="px-2 py-2">{c.procedure_type}</td>
                        <td className="px-2 py-2">{c.attending_dentist}</td>
                        <td className="px-2 py-2 capitalize">{c.payment_status}</td>
                        <td className="px-2 py-2">₱{c.total_charged}</td>
                        <td className="px-2 py-2 capitalize">{c.appointment_status}</td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => navigate(`/adminconsultationview/${c.appoint_id}`)}
                            className="bg-[#008CBA] hover:bg-[#0079A5] text-white px-3 py-1 rounded-lg"
                          >
                            View
                          </button>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => navigate(`/adminschedulecancel/${c.appoint_id}`)}
                            disabled={
                              !(
                                c.appointment_status === "incomplete" ||
                                c.appointment_status === "pending"
                              )
                            }
                            className={`px-3 py-1 rounded-lg ${c.appointment_status === "incomplete" ||
                              c.appointment_status === "pending"
                              ? "bg-gray-200 hover:bg-gray-300"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                          >
                            Cancel
                          </button>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            disabled={!(c.appointment_status === "incomplete" || c.appointment_status === "pending")}
                            onClick={() => handleFollowUp(c.appoint_id, patient.fname, patient.lname)}
                            className={`px-4 py-2 rounded-lg ${c.appointment_status === "incomplete" || c.appointment_status === "pending"
                              ? "bg-[#00c3b8] hover:bg-[#00a89d] text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                          >
                            + Follow Up
                          </button>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            disabled={c.appointment_status !== "incomplete"}
                            onClick={() => navigate(`/adminconsultationcomplete/${c.appoint_id}`)}
                            className={`px-3 py-1 rounded-lg ${c.appointment_status === "incomplete"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                          >
                            Complete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Report Button */}
          <div className="flex justify-end">
            <button
              className="bg-[#00c3b8] text-white px-6 py-2 font-bold rounded-lg"
              onClick={handlePrintReport}
            >
              Generate Report
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPatientsView;
