import { Routes, Route } from 'react-router-dom';
import './index.css';
import './App.css';
import Navbar from "./components/Navbar";
import Home from "./Routes/home";
import Login from "./Routes/login";
import Register from "./Routes/register";
import Register2 from "./Routes/register2";
import Presubmit from "./Routes/presubmit";

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
      </Routes>
    </div>
  );
}

export default App;

