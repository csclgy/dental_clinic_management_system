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
import  Adminsubsidiaryreceivable from "./Routes/adminsubsidiaryreceivable";
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

            {/* Appointment routes (protected) */}
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

            {/* Profile routes */}
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

            {/* Transaction routes */}
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

            {/* Admin routes */}
            <Route path="/admincoa" element={<Admincoa />} />
            <Route path="/admincoaadd" element={<Admincoaadd />} />
            <Route path="/adminjournal" element={<Adminjournal />} />
            <Route path="/adminjournaladd" element={<Adminjournaladd />} />
            <Route path="/admingeneral" element={<Admingeneral />} />
            <Route path="/admintrial" element={<Admintrial />} />
            <Route path="/adminusers" element={<Adminusers />} />
            <Route path="/adminusersadd" element={<Adminusersadd />} />
            <Route path="/adminusersaddpatient" element={<Adminusersaddpatient />} />
            <Route path="/adminusersedit/:id" element={<AdminUsersEdit />} />
            <Route path="/admininventory" element={<Admininventory />} />
            <Route path="/admininventoryadd" element={<Admininventoryadd />} />
            <Route path="/admininventoryedit/:id" element={<Admininventoryedit />} />
            <Route path="/adminaudit" element={<Adminaudit />} />
            <Route path="/adminpatients" element={<Adminpatients />} />
            <Route path="/adminpatientsview/:id" element={<Adminpatientsview />} />
            <Route path="/adminpatientsedit/:id" element={<Adminpatientsedit />} />
            <Route path="/adminconsultationview/:appointId" element={<Adminconsultationview />} />
            <Route path="/adminconsultationadd" element={<Adminconsultationadd />} />
            <Route path="/adminbillingedit/:appointId" element={<Adminbillingedit />} />
            <Route path="/adminbillingedititem/:ci_id" element={<AdminBillingEditItem />} />  
            <Route path="/notification" element={<Notification />} />
            <Route path="/adminschedule" element={<Adminschedule />} />
             <Route path="/admincoaedit/:id" element={<AdminCoaEdit />} />
             <Route path="/adminschedulecancel/:appointId" element={<AdminScheduleCancel />} />
             <Route path="/adminconsultationcomplete/:appointId" element={<Adminconsultationcomplete />} />
             <Route path="/admininventorypending" element={<Admininventorypending />} />
             <Route path="/admincoaview/:id" element={<AdminCoaView/>} />
             <Route path="/admincoaviewadd/:id" element={<AdminCoaViewAdd/>} />
             <Route path="/admincoaviewedit/:id" element={<AdminCoaViewEdit/>} />
             <Route path="/admindashboard" element={<AdminDashboard />}/>
            <Route path="/inventorydashboard" element={<InventoryDashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventoryedit/:id" element={<InventoryEdit />} />
            <Route path="/inventoryadd" element={<InventoryAdd />} />
            <Route path="/adminsubsidiaryreceivable" element={<Adminsubsidiaryreceivable />}/>
            <Route path="/adminsubsidiary" element={<AdminSubsidiary />}/>
             <Route path="/adminsubsidiaryadd" element={<AdminSubsidiaryadd />}/>
             <Route path="/adminsubsidiaryreceivable" element={<Adminsubsidiaryreceivable />}/>
             <Route path="/adminsubsidiaryPayable" element={<AdminSubsidiarypayable />}/>
             <Route path="/adminsubsidiaryaddpayable" element={<Adminsubsidiarypayableadd />}/>
             <Route path="/adminsupplier" element={<Adminsupplier />}/>
             <Route path="/adminsupplieradd" element={<AdminSupplierAdd />}/>
             <Route path="/adminsupplieredit/:id" element={<AdminSupplierEdit />}/>
             <Route path="/admininventoryview/:id" element={<AdminInventoryView />}/>
             <Route path="/admincashier" element={<AdminCashier />}/>
             <Route path="/adminconsultationpaid/:appointId" element={<AdminConsultationPaid />}/>
             <Route path="/adminconsultationpartial/:appointId" element={<AdminConsultationPartial />}/>
             <Route path="/adminconsultationpartialpay/:appointId" element={<AdminConsultationPartialPayment />}/>
             <Route path="/admincashierpaid" element={<AdminCashierPaid />}/>
             <Route path="/admincashierpartial" element={<AdminCashierPartial />}/>

          </Routes>
        </AppointmentProvider>
      </RegisterProvider>
    </div>
  );
}


export default App;