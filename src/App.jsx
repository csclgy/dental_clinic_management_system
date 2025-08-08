import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <div className='min-h-screen flex flex-col bg-white-50'>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/register2' element={<Register2 />} />
        <Route path='/presubmit' element={<Presubmit />} />
        <Route path='/appointment' element={<Appointment />} />
        <Route path='/appointment2' element={<Appointment2 />} />
        <Route path='/appointmentsubmit' element={<Appointmentsubmit />} />
      </Routes>
    </div>
  );
}

export default App;

