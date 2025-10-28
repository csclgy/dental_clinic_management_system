import axios from 'axios'; // for API requests
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Printer } from "lucide-react";

const TransMed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]); // dynamic records
  const [loading, setLoading] = useState(true);

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

  // Fetch records from API
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token"); // or however you store it
        const res = await axios.get("https://dental-clinic-management-system-backend-jlz9.onrender.com/auth/my-upcoming", {
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
              <h1>Medical Records Report</h1>
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
                  <th>Visit Date</th>
                  <th>Time</th>
                  <th>Service</th>
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

  // Filter records by search
  const filteredRecords = records.filter(record =>
    Object.values(record).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
              <button className="w-full text-left px-4 py-2 rounded-md font-medium bg-[#E6FCF9] text-[#00c3b8] hover:bg-[#d0f8f5]">
                <i className="fa fa-user-circle-o mr-2"></i>
                Medical Records
              </button>
            </Link>
            <Link to="/transappointment">
              <button className="w-full text-left px-4 py-2 rounded-md font-medium text-[#00458B] hover:bg-blue-100">
                <i className="fa fa-history mr-2"></i>
                Appointment History
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3 space-y-6">
          <div className="bg-[#00458B] text-white p-6 rounded-lg shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold">Medical Records</h1>
          </div>

          <div
            className="p-6 rounded-lg shadow-lg"
            style={{ border: 'solid', borderColor: '#01D5C4' }}
          >
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="font-bold text-[#00458B]">Records</h3>
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
            <div className="overflow-auto" style={{ maxHeight: "500px", border: "1px solid #ddd" }}>
              {loading ? (
                <p className="text-center py-4 text-gray-500">Loading...</p>
              ) : (
                <table className="w-full border-collapse border border-gray-200 text-sm sm:text-base">
                  <thead>
                    <tr className="bg-white text-[#00458B] border-b border-gray-200">
                      <th className="px-4 py-2 text-left">Visit Date</th>
                      <th className="px-4 py-2 text-left">Services</th>
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-center"></th>
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
                            {record.procedure_type}
                          </td>
                          <td className="px-4 py-2 text-blue-700">
                            {record.pref_time}
                          </td>
                          <td className="px-4 py-2">{record.appointment_status}</td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => navigate(`/transviewmed/${record.appoint_id}`)}
                              className="bg-[#008CBA] text-white px-4 py-1 rounded-lg hover:bg-[#008CBA]">
                              View
                            </button>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => navigate(`/cancelappointment/${record.appoint_id}`)}
                              className="bg-[#f44336] text-white px-4 py-1 rounded-lg hover:bg-red-600">
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center text-gray-500 py-4"
                        >
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Print Button */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-[#00458B] text-white font-semibold px-6 py-2 rounded-lg hover:bg-teal-600"
                onClick={handlePrintReport}
              >
                <Printer size={18} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TransMed;