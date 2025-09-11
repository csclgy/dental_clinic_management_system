import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Notification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to the section if state.scrollTo is passed
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

  // Sample notifications (replace with props or API later if needed)
  const notifications = [
    {
      subject: "Appointment Confirmed",
      description: "Your dental appointment has been confirmed for August 25, 2025 at 10:00 AM."
    },
    {
      subject: "Reminder",
      description: "Please bring your previous dental records and arrive 15 minutes early."
    }
  ];

  return (
    <div className="p-4">
      <div className="container-fluid">
        <div className="row justify-center">
          <div className="col-sm-7">
            {/* Header */}
            <div className="bg-[#00458B] p-6 rounded-lg shadow-lg text-white">
              <h1 className="text-2xl font-bold">Notifications</h1>
            </div>

            <p className="my-3 text-transparent">...</p>

            {/* Notifications List */}
            <div
              className="p-6 rounded-lg shadow-lg space-y-4"
              style={{ border: "solid", borderColor: "#01D5C4" }}
            >
              {notifications.map((note, index) => (
                <div
                  key={index}
                  className="p-4 border-b border-gray-200 last:border-0"
                >
                  <h2 className="text-lg font-semibold text-[#00458B]">
                    {note.subject}
                  </h2>
                  <p className="text-gray-700">{note.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
