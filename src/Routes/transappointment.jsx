import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const TransAppointment = () => {
   const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch appointments from API
  // Fetch records from API
  useEffect(() => {
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token"); // or however you store it
      const res = await axios.get("http://localhost:3000/auth/myappointmenthistory", {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 send token
        },
        withCredentials: true,
      });
      setRecords(res.data);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchRecords();
}, []);

  // Scroll to section if state.scrollTo is passed
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

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
              <h1>Appointment History Report</h1>
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
                  <th>Date</th>
                  <th>Time</th>
                  <th>Service</th>
                  <th>Dentist</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRecords.map(record => `
                  <tr>
                  <!-fix after->
                    <td>
                      ${new Date(record.pref_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>     
                    <td>${record.pref_time}</td>
                    <td>${record.procedure_type}</td>
                    <td>${record.attending_dentist}</td>
                    <td style="text-transform: capitalize;">${record.appointment_status}</td>
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

  // Filter records by search and status
  const filteredRecords = records.filter(record => {
    // Search filter
    const matchesSearch = Object.values(record).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Status filter
    const matchesStatus =
      statusFilter === "all" || record.appointment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-lg shadow-md p-4 md:col-span-1">
          <h2 className="text-2xl font-bold text-[#00458B] mb-6">
            Transaction History
          </h2>
          <nav className="flex flex-col gap-2">
            <Link to="/transmed">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-user-circle-o mr-2"></i>
                Medical Records
              </button>
            </Link>
            <Link to="/transappointment">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium bg-[#E6FCF9] text-[#00c3b8] hover:bg-[#d0f8f5]">
                <i className="fa fa-history mr-2"></i>
                Appointment History
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-[#00458B] text-white p-6 rounded-lg shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold">
              Appointment History
            </h1>
          </div>

          <div
            className="p-6 rounded-lg shadow-lg"
            style={{ border: 'solid', borderColor: '#01D5C4' }}
          >
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="my-4">
              <label className="mr-2 font-semibold">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white text-gray-700"
              >
                <option value="all">All</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

              <div className="flex items-center border border-[#00458B] rounded-full px-3 py-1 w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700"
                />
                <i className="fa fa-search text-[#00458B]"></i>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-sm sm:text-base">
                <thead>
                  <tr className="bg-white text-[#00458B] border-b border-gray-200">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Services</th>
                    <th className="px-4 py-2 text-left">Dentist</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-blue-700">
                          {record.pref_date}
                        </td>
                        <td className="px-4 py-2 text-blue-700">
                          {record.pref_time}
                        </td>
                        <td className="px-4 py-2 text-blue-700">
                          {record.procedure_type}
                        </td>
                        <td className="px-4 py-2">Dr. {record.attending_dentist}</td>
                        <td className="px-4 py-2">{record.appointment_status}</td>
                        <td className="px-4 py-2 text-center">
                            <button 
                            onClick={() => navigate(`/transviewmed/${record.appoint_id}`)}
                            className="bg-[#008CBA] text-white px-4 py-1 rounded-lg w-full sm:w-auto hover:bg-[#008CBA]">
                              View
                            </button>
                            <button 
                              onClick={() => navigate(`/transviewsoa/${record.appoint_id}`)}
                              className="bg-[#008CBA] text-white px-4 py-1 rounded-lg hover:bg-[#008CBA] ml-5">
                                SOA
                              </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-gray-500 py-4"
                      >
                        No record found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Button */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg hover:bg-teal-600 w-full sm:w-auto"
                onClick={handlePrintReport}
              >
                Print
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TransAppointment;