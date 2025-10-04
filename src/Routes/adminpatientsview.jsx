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

  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          return;
        }

        const res = await fetch(
          `http://localhost:3000/auth/displaypatient/${id}`,
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
    const res = await fetch(`http://localhost:3000/auth/followup/${appoint_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: `Reminder: Today is your appointment, ${p_fname} ${p_lname}.` }),
    });

    if (!res.ok) throw new Error("Failed to send follow-up notification");
    const data = await res.json();
    alert(data.message || "Follow-up notification sent!");
  } catch (err) {
    console.error("Follow-up error:", err);
    alert("Error sending follow-up notification.");
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
  if (!patient) return <p>Loading...</p>;

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
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

          {/* Ledger with dropdown */}
          <button
            onClick={() => setIsLedgerOpen(!isLedgerOpen)}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
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
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admininventory"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-archive"></i> Inventory
          </Link>
          <Link
            to="/adminpatients"
            className="flex items-center gap-2 bg-[white] text-[#00458B] p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-user-plus"></i> Patients
          </Link>
          <Link
            to="/adminschedule"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <Calendar size={18} /> Schedules
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
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
            {/* Same nav as desktop */}
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
              {/* ... add other links here */}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Content */}
        <main className="p-6 overflow-y-auto space-y-6">
          {/* Patient Info */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-teal-400">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00458B]">
                Patient Information
              </h2>
              <button
                className="bg-[#00c3b8] text-white px-4 py-2 rounded-lg font-semibold"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-[#00458B]">
              <div>
                <h3 className="text-lg font-bold mb-2">
                  Address & Contact
                </h3>
                <p><span className="font-semibold">Address:</span> {patient.home_address}, {patient.city}</p>
                <p><span className="font-semibold">Email:</span> {patient.email}</p>
                <p><span className="font-semibold">Contact:</span> {patient.contact_no}</p>
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
                className="bg-[#00c3b8] text-white px-4 py-2 rounded-lg flex items-center font-semibold"
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
                        <td className="px-2 py-2">{c.payment_status}</td>
                        <td className="px-2 py-2">₱{c.total_charged}</td>
                        <td className="px-2 py-2">{c.appointment_status}</td>
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
                            className={`px-3 py-1 rounded-lg ${
                              c.appointment_status === "incomplete" ||
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
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            c.appointment_status === "incomplete" || c.appointment_status === "pending"
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
                            className={`px-3 py-1 rounded-lg ${
                              c.appointment_status === "incomplete"
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
              className="bg-[#00c3b8] text-white px-6 py-2 rounded-full"
              onClick={() => navigate("/register2")}
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
