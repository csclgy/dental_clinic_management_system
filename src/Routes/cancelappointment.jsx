import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const CancelAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointId } = useParams(); // ✅ get from URL

  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  // control visibility
  const [showNote, setShowNote] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  // small extras used by your fetchRecords effect (prevent undefined errors)
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Popup state and fade animation (copied from ProfileChange)
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [fade, setFade] = useState(false);

  // ✅ Same popup function as in ProfileChange
  const showPopup = (message, type) => {
    setPopup({ show: true, message, type });
    setFade(true);

    // Fade out before removing
    setTimeout(() => setFade(false), 2500);
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const handleReasonChange = (e) => {
    const selectedReason = e.target.value;
    setReason(selectedReason);

    // Show note only if it's not refund and not empty
    setShowNote(selectedReason !== "" && selectedReason !== "Refund request");

    // Mark refund specifically
    setShowRefund(selectedReason === "Refund request");
  };

  const handleSave = async () => {
    if (!reason) {
      showPopup("Please select a reason for cancellation.", "error");
      return;
    }

    try {
      const body = {
        cc_reason: reason,
        cc_notes: note,
      };

      const response = await axios.post(
        `http://localhost:3000/auth/cancelappointment/${appointId}`,
        body,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      showPopup(response.data.message, "success");

      setTimeout(() => {
        navigate("/transmed");
      }, 3000);
    } catch (error) {
      console.error("Cancel failed:", error);
      showPopup("Failed to cancel appointment. Please try again.", "error");
    }
  };

  // Fetch records from API
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/auth/my-upcoming", {
          headers: {
            Authorization: `Bearer ${token}`,
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

        {/* ✅ Popup Notification (same as ProfileChange) */}
        {popup.show && (
          <div
            className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform transition-all duration-700 ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
              } ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            style={{ zIndex: 9999 }}
          >
            {popup.message}
          </div>
        )}

        {/* Main Content */}
        <main className="md:col-span-3 space-y-6">
          <div className="bg-[#00458B] text-white p-6 rounded-lg shadow-md">
            <h1 className="text-xl sm:text-2xl font-bold">Cancel Appointment</h1>
          </div>

          {/* Confirmation */}
          <div
            className="col-sm-12 p-10 rounded-lg shadow-lg"
            style={{ border: "solid", borderColor: "#01D5C4" }}
          >
            <div className="row">
              <div className="col-sm-3"></div>

              <div className="col-sm-6">
                <h4
                  className="text-xl font-bold"
                  style={{ color: "#00458B" }}
                >
                  Cancel Information
                </h4>
                <hr />
                <br />
                <div className="mb-4 text-left">
                  <label className="block text-[#00458b] font-semibold mb-1">
                    Reasons of Cancellation: <span style={{color:"red"}}>*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={handleReasonChange}
                    className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                  >
                    <option value="">Select Reason</option>
                    <option value="Not feeling well">Not feeling well</option>
                    <option value="Schedule conflict / busy at work">
                      Schedule conflict / busy at work
                    </option>
                    <option value="Family emergency">Family emergency</option>
                    <option value="Transportation issues">
                      Transportation issues
                    </option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Financial reasons">Financial reasons</option>
                    <option value="Found another clinic">
                      Found another clinic
                    </option>
                    <option value="Booked by mistake">Booked by mistake</option>
                    <option value="Personal reasons">Personal reasons</option>
                    {/* <option value="Refund request">Refund request</option> */}
                  </select>
                </div>

                {/* Note only shows when reason is not empty & not refund */}
                {showNote && (
                  <div className="mb-4 text-left">
                    <label className="block text-[#00458b] font-semibold mb-1">
                      Note: (Optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={handleSave}
                  className="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-lg w-full"
                >
                  Submit
                </button>
              </div>

              <div className="col-sm-3"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CancelAppointment;
