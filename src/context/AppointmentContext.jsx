import { createContext, useContext, useState } from "react";

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointmentData, setAppointmentData] = useState({
    downpayment: "",
    receipt: null,
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
    });

  // update fields
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
