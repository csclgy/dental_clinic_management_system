import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Users, Calendar, Menu, X } from "lucide-react";

const AdminPatients = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch patients
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await fetch("http://localhost:3000/auth/displaypatients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch patients");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Scroll if needed
    // Print Report function
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
          <title>Dental Clinic Management System</title>
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
            .report-info {
              margin-bottom: 20px;
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
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f0f8ff;
              border-left: 4px solid #00c3b8;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Patient Management Report</h1>
            <p>Generated on: ${currentDate}</p>
          </div>
          
          <div class="summary">
            <strong>Report Summary:</strong><br>
            Total Items: ${filteredRecords.length}<br>
            Search Filter: ${searchTerm ? `"${searchTerm}"` : 'None'}
          </div>

          <table>
            <thead>
              <tr>
                <th>Patient's Full Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact Number</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(record => `
                <tr>
                  <td>${record.lname}, ${record.fname} ${record.mname}</td>
                  <td>${record.age}</td>
                  <td>${record.gender}</td>
                  <td>${record.contact_no}</td>
                  <td>${record.email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report was automatically generated for Arciaga-Juntilla TMJ Ortho Dental Clinic. </p>
          </div>

          <script>
            window.addEventListener('afterprint', function() {
              window.close();
            });

            window.addEventListener('beforeunload', function() {
            });

            setTimeout(function() {
              if (!window.closed) {
                window.close();
              }
            }, 10000);
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();

        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.addEventListener('focus', () => {
              setTimeout(() => {
                if (!printWindow.closed) {
                  printWindow.close();
                }
              }, 1000);
            });
          }
        }, 500);
      }, 250);
  };

  // 🔹 Scroll to section if location.state.scrollTo exists
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

  const filteredRecords = users.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-[#00458B] text-white flex-col p-6">
        <h2 className="text-xl font-bold mb-8">Dental Clinic</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/admindashboard"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <BarChart3 size={18} /> Dashboard
          </Link>

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
              <Link to="/admincoa" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Chart of Accounts
              </Link>
              <Link to="/adminjournal" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Journal Entries
              </Link>
              <Link to="/adminsubsidiaryreceivable" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                Subsidiary
              </Link>
              <Link to="/admingeneral" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
                General Ledger
              </Link>
              <Link to="/admintrial" className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]">
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
            to="/admincashier"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:text-[#00458B]"
          >
            <Calendar size={18} /> Cashier
          </Link>
          <Link
            to="/adminaudit"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[white] hover:text-[#00458B]"
          >
            <i className="fa fa-eye"></i> Audit Trail
          </Link>
        </nav>
      </aside>

      {/* Sidebar Mobile */}
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
              {/* add other links */}
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

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00458B]">Patients</h1>

          {/* Button Group */}
          <div className="flex space-x-3">
            <button
              className="bg-[#00c3b8] font-bold text-white px-4 py-2 rounded-lg"
              onClick={handlePrintReport}
            >
              Generate Report
            </button>
            <button
              className="bg-[#00458B] font-bold text-white px-4 py-2 rounded-lg"
              onClick={() => navigate("/adminusersaddpatient")}
            >
              + Add New Patient
            </button>
          </div>
        </div>

        {/* Search + Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-x-auto">
            <div className="flex justify-end mb-4">
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

            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-[#00458B]">
                  <th className="px-4 py-2 text-center">Last Name</th>
                  <th className="px-4 py-2 text-center">First Name</th>
                  <th className="px-4 py-2 text-center">Middle Name</th>
                  <th className="px-4 py-2 text-center">Age</th>
                  <th className="px-4 py-2 text-center">Gender</th>
                  <th className="px-4 py-2 text-center">Contact No.</th>
                  <th className="px-4 py-2 text-center">Email</th>
                  <th className="px-4 py-2 text-center"></th>
                  <th className="px-4 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.user_id} className="border-b border-gray-200 text-center">
                      <td className="px-4 py-2 text-blue-700">{record.lname}</td>
                      <td className="px-4 py-2">{record.fname}</td>
                      <td className="px-4 py-2">{record.mname}</td>
                      <td className="px-4 py-2">{record.age}</td>
                      <td className="px-4 py-2">{record.gender}</td>
                      <td className="px-4 py-2">{record.contact_no}</td>
                      <td className="px-4 py-2">{record.email}</td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <Link to={`/adminpatientsview/${record.user_id}`}>
                          <button className="bg-[#008CBA] text-white px-4 py-2 rounded-lg">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPatients;