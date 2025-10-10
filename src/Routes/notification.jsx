import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Notification = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);

  // Scroll to section
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:3000/auth/notificaitions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Error fetching notifications:", err));
  }, []);

  return (
    <div className="p-4">
      <div className="container-fluid">
        <div className="row justify-center">
          <div className="col-sm-7">
            <div className="bg-[#00458B] p-6 rounded-lg shadow-lg text-white">
              <h1 className="text-2xl font-bold">Notifications</h1>
            </div>

            <p className="my-3 text-transparent">...</p>

            <div
              className="p-6 rounded-lg shadow-lg space-y-4 overflow-y-auto"
              style={{ border: "solid", borderColor: "#01D5C4", maxHeight: "500px" }}
            >
              {notifications.length > 0 ? (
                notifications.map((note) => (
                  <div key={note.ntf_id} className="p-4 border-b border-gray-200 last:border-0">
                    <h2 className="text-lg font-semibold text-[#00458B]">
                      {note.ntf_subject}
                    </h2>
                    <p className="text-gray-700">{note.ntf_description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(note.ntf_created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No notifications yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
