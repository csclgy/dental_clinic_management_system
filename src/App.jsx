import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppointmentProvider } from "./context/AppointmentContext";
import './index.css';
import './App.css';
import Navbar from "./components/Navbar";
import Home from "./Routes/home";
import Login from "./Routes/login";
import Register from "./Routes/register";
import Register2 from "./Routes/register2";
import Presubmit from "./Routes/presubmit";
import Appointment from "./Routes/appointment";
import Appointment2 from "./Routes/appointment2";
import Appointmentsubmit from "./Routes/appointmentsubmit";
import Profilelogin from "./Routes/profilelogin";
import Profileinfo from "./Routes/profileinfo";
import Profilechange from "./Routes/profilechange";
import Transmed from "./Routes/transmed";
import Transviewmed from "./Routes/transviewmed";
import Transappointment from "./Routes/transappointment";
import Admincoa from "./Routes/admincoa";
import Admincoaadd from "./Routes/admincoaadd";
import AdminCoaEdit from "./Routes/admincoaedit";
import Adminjournal from "./Routes/adminjournal";
import Adminjournaladd from "./Routes/adminjournaladd";
import Admingeneral from "./Routes/admingeneral";
import Admintrial from "./Routes/admintrial";
import Adminusers from "./Routes/adminusers";
import Adminusersadd from "./Routes/adminusersadd";
import Adminusersaddpatient from "./Routes/adminusersaddpatient";
import AdminUsersEdit from "./Routes/adminusersedit";
import Admininventory from "./Routes/admininventory";
import Admininventoryadd from "./Routes/admininventoryadd";
import Admininventoryedit from "./Routes/admininventoryedit";
import Adminaudit from "./Routes/adminaudit";
import Adminpatients from "./Routes/adminpatients";
import Adminpatientsview from "./Routes/adminpatientsview";
import Adminpatientsedit from "./Routes/adminpatientsedit";
import Adminconsultationview from "./Routes/adminconsultationview";
import Adminconsultationadd from "./Routes/adminconsultationadd";
import Adminbillingedit from "./Routes/adminbillingedit";
import AdminBillingEditItem from "./Routes/adminbillingedititem";
import Notification from "./Routes/notification";
import Registergcash from "./Routes/registergcash";
import Adminschedule from "./Routes/adminschedule";
import { RegisterProvider } from "./context/RegisterContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminScheduleCancel from "./Routes/adminschedulecancel";
import Adminconsultationcomplete from "./Routes/adminconsultationcomplete";
import Cancelappointment from "./Routes/cancelappointment";
import Admininventorypending from "./Routes/admininventorypending";
import AdminCoaView from "./Routes/admincoaview";
import AdminCoaViewAdd from "./Routes/admincoaviewadd";
import AdminCoaViewEdit from "./Routes/admincoaviewedit";
import InventoryDashboard from "./Routes/inventorydashboard";
import Inventory from "./Routes/inventory";
import InventoryEdit from "./Routes/inventoryedit";
import InventoryAdd from "./Routes/inventoryadd";
import AdminDashboard from "./Routes/admindashboard";
import AdminSubsidiary from "./Routes/adminsubsidiary";
import AdminSubsidiaryadd from "./Routes/adminsubsidiaryadd";
import Adminsubsidiaryreceivable from "./Routes/adminsubsidiaryreceivable";
import AdminSubsidiarypayable from "./Routes/adminsubsidiaryPayable";
import Adminsubsidiarypayableadd from "./Routes/adminsubsidiaryaddpayable";
import Adminsupplier from "./Routes/adminsupplier";
import AdminSupplierAdd from "./Routes/adminsupplieradd";
import AdminSupplierEdit from "./Routes/adminsupplieredit.jsx";
import AdminInventoryView from "./Routes/admininventoryview.jsx";
import AdminCashier from "./Routes/admincashier.jsx";
import AdminConsultationPaid from './Routes/adminconsultationpaid.jsx'
import AdminCashierPaid from "./Routes/admincashierpaid.jsx";
import AdminCashierPartial from "./Routes/admincashierpartial.jsx";
import AdminConsultationPartial from "./Routes/adminconsultationpartial.jsx";
import AdminConsultationPartialPayment from "./Routes/adminconsultationpartialpay.jsx";
import ReceptionistDashboard from "./Routes/receptionistdashboard";
import TransViewSoa from "./Routes/transviewsoa.jsx";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white-50">
      <Navbar />
      <RegisterProvider>
        <AppointmentProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Register flow pages */}
            <Route path="/register" element={<Register />} />
            <Route path="/register2" element={<Register2 />} />
            <Route path="/registergcash" element={<Registergcash />} />
            <Route path="/presubmit" element={<Presubmit />} />

            {/* ------------------ Patient's Routes ------------------ */}
            {/* APPOINTMENT ROUTES */}
            <Route
              path="/appointment"
              element={
                <ProtectedRoute>
                  <Appointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointment2"
              element={
                <ProtectedRoute>
                  <Appointment2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointmentsubmit"
              element={
                <ProtectedRoute>
                  <Appointmentsubmit />
                </ProtectedRoute>
              }
            />

            {/* PROFILE ROUTES */}
            <Route
              path="/profilelogin"
              element={
                <ProtectedRoute>
                  <Profilelogin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profileinfo"
              element={
                <ProtectedRoute>
                  <Profileinfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profilechange"
              element={
                <ProtectedRoute>
                  <Profilechange />
                </ProtectedRoute>
              }
            />

            {/* TRANSACTION ROUTES */}
            <Route
              path="/transmed"
              element={
                <ProtectedRoute>
                  <Transmed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transviewmed/:appointId"
              element={
                <ProtectedRoute>
                  <Transviewmed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transappointment"
              element={
                <ProtectedRoute>
                  <Transappointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cancelappointment/:appointId"
              element={
                <ProtectedRoute>
                  <Cancelappointment />
                </ProtectedRoute>
              }
            />

            <Route path="/transviewsoa/:appointId"
             element={
              <ProtectedRoute>
             <TransViewSoa />
            </ProtectedRoute>
            }
            
            />

            {/* ------------------ Admin's Routes ------------------ */}
            {/* LEDGER MANAGEMENT ROUTES */}
            <Route
              path="/admincoa"
              element={
                <ProtectedRoute>
                  <Admincoa />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admincoaadd"
              element={
                <ProtectedRoute>
                  <Admincoaadd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admincoaview/:id"
              element={
                <ProtectedRoute>
                  <AdminCoaView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admincoaviewadd/:id"
              element={
                <ProtectedRoute>
                  <AdminCoaViewAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admincoaviewedit/:id"
              element={
                <ProtectedRoute>
                  <AdminCoaViewEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admincoaedit/:id"
              element={
                <ProtectedRoute>
                  <AdminCoaEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminjournal"
              element={
                <ProtectedRoute>
                  <Adminjournal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminjournaladd"
              element={
                <ProtectedRoute>
                  <Adminjournaladd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admingeneral"
              element={
                <ProtectedRoute>
                  <Admingeneral />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsubsidiaryreceivable"
              element={
                <ProtectedRoute>
                  <Adminsubsidiaryreceivable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsubsidiary"
              element={
                <ProtectedRoute>
                  <AdminSubsidiary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsubsidiaryadd"
              element={
                <ProtectedRoute>
                  <AdminSubsidiaryadd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsubsidiaryreceivable"
              element={
                <ProtectedRoute>
                  <Adminsubsidiaryreceivable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsubsidiaryPayable"
              element={
                <ProtectedRoute>
                  <AdminSubsidiarypayable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsubsidiaryaddpayable"
              element={
                <ProtectedRoute>
                  <Adminsubsidiarypayableadd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admintrial"
              element={
                <ProtectedRoute>
                  <Admintrial />
                </ProtectedRoute>
              }
            />

            {/* USER MANAGEMENT ROUTES */}
            <Route
              path="/adminusers"
              element={
                <ProtectedRoute>
                  <Adminusers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminusersadd"
              element={
                <ProtectedRoute>
                  <Adminusersadd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminusersedit/:id"
              element={
                <ProtectedRoute>
                  <AdminUsersEdit />
                </ProtectedRoute>
              }
            />

            {/* INVENTORY MANAGEMENT ROUTES */}
            <Route
              path="/admininventory"
              element={
                <ProtectedRoute>
                  <Admininventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admininventoryadd"
              element={
                <ProtectedRoute>
                  <Admininventoryadd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admininventoryedit/:id"
              element={
                <ProtectedRoute>
                  <Admininventoryedit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventoryedit/:id"
              element={
                <ProtectedRoute>
                  <InventoryEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventoryadd"
              element={
                <ProtectedRoute>
                  <InventoryAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admininventorypending"
              element={
                <ProtectedRoute>
                  <Admininventorypending />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsupplier"
              element={
                <ProtectedRoute>
                  <Adminsupplier />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsupplieradd"
              element={
                <ProtectedRoute>
                  <AdminSupplierAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminsupplieredit/:id"
              element={
                <ProtectedRoute>
                  <AdminSupplierEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admininventoryview/:id"
              element={
                <ProtectedRoute>
                  <AdminInventoryView />
                </ProtectedRoute>
              }
            />

            {/* PATIENT RECORDS ROUTES */}
            <Route
              path="/adminpatients"
              element={
                <ProtectedRoute>
                  <Adminpatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminpatientsview/:id"
              element={
                <ProtectedRoute>
                  <Adminpatientsview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminpatientsedit/:id"
              element={
                <ProtectedRoute>
                  <Adminpatientsedit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminusersaddpatient"
              element={
                <ProtectedRoute>
                  <Adminusersaddpatient />
                </ProtectedRoute>
              }
            />

            {/* SCHEDULE MANAGEMENT ROUTES */}
            <Route
              path="/adminschedule"
              element={
                <ProtectedRoute>
                  <Adminschedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminconsultationview/:appointId"
              element={
                <ProtectedRoute>
                  <Adminconsultationview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminconsultationadd"
              element={
                <ProtectedRoute>
                  <Adminconsultationadd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminbillingedit/:appointId"
              element={
                <ProtectedRoute>
                  <Adminbillingedit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminbillingedititem/:ci_id"
              element={
                <ProtectedRoute>
                  <AdminBillingEditItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminschedulecancel/:appointId"
              element={
                <ProtectedRoute>
                  <AdminScheduleCancel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminconsultationcomplete/:appointId"
              element={
                <ProtectedRoute>
                  <Adminconsultationcomplete />
                </ProtectedRoute>
              }
            />

            {/* NOTIFICATION ROUTE */}
            <Route
              path="/notification"
              element={
                <ProtectedRoute>
                  <Notification />
                </ProtectedRoute>
              }
            />

            {/* CASHIER ROUTES */}
            <Route
              path="/admincashier"
              element={
                <ProtectedRoute>
                  <AdminCashier />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminconsultationpaid/:appointId"
              element={
                <ProtectedRoute>
                  <AdminConsultationPaid />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminconsultationpartial/:appointId"
              element={
                <ProtectedRoute>
                  <AdminConsultationPartial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminconsultationpartialpay/:appointId"
              element={
                <ProtectedRoute>
                  <AdminConsultationPartialPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admincashierpaid"
              element={
                <ProtectedRoute>
                  <AdminCashierPaid />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admincashierpartial"
              element={
                <ProtectedRoute>
                  <AdminCashierPartial />
                </ProtectedRoute>
              }
            />

            {/* AUDIT TRAIL ROUTE */}
            <Route
              path="/adminaudit"
              element={
                <ProtectedRoute>
                  <Adminaudit />
                </ProtectedRoute>
              }
            />

            {/* DASHBOARD ROUTES */}
            <Route
              path="/admindashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventorydashboard"
              element={
                <ProtectedRoute>
                  <InventoryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionistdashboard"
              element={
                <ProtectedRoute>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppointmentProvider>
      </RegisterProvider>
    </div>
  );
}


export default App;