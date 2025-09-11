import { createContext, useContext, useState } from "react";

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  // Appointment + patient info (NO downpayment_proof here)
  const [appointmentData, setAppointmentData] = useState({
    procedure_type: "",
    pref_date: "",
    pref_time: "",
    payment_method: "",
    downpayment_proof: null,
    attending_dentist: "",
    or_num: "",
    payment_status: "pending",
    total_charged: 0,
    appointment_status: "pending",

    // Patient info
    p_fname: "",
    p_mname: "",
    p_lname: "",
    p_gender: "",
    p_age: "",
    p_date_birth: "",
    p_home_address: "",
    p_email: "",
    p_contact_no: "",
    p_blood_type: "",
    photos: [],
  });

  // Generic updater
  const updateAppointment = (field, value) => {
    setAppointmentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AppointmentContext.Provider value={{ appointmentData, updateAppointment }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error("useAppointment must be used within an AppointmentProvider");
  }
  return context;
};
