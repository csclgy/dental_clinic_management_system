import { useState } from "react";
import { Menu, X } from "lucide-react"; // Optional: for icons
import { Link } from 'react-router-dom'; // If using React Router

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg" style={{ color: "#00458B" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left side: Logo + Desktop Menu */}
          <div className="flex items-center space-x-8">
              <div>
                <img src="./favicon.png" style={{ width: "140px" }} alt="Logo" />
              </div>

            <div className="hidden md:flex space-x-4">
              <Link to="/" state={{ scrollTo: "section1" }} className="px-3 py-2 rounded">Home</Link>
              <Link to="/" state={{ scrollTo: "section2" }} className="px-3 py-2 rounded">About Us</Link>
              <Link to="/" state={{ scrollTo: "section3" }} className="px-3 py-2 rounded">Services</Link>
              <Link to="/" state={{ scrollTo: "section4" }} className="px-3 py-2 rounded">Contact Us</Link>
            </div>
          </div>

        {/* Note: if hindi pa nakalog in si user sa web, ipapakita muna yung login & register button. 
        If si user nakalog in na remove login & register then display the welcome with the name of the user. */}
         {/* RIGHT side: Right Links */}
          <div className="hidden md:flex space-x-4">
            <Link to="/login" className="px-3 py-2 rounded">Login</Link>
            <Link to="/register" className="px-3 py-2 rounded">Register</Link>
          </div>

          {/* Right side: Mobile Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-2 text-center" style={{ color: "#00458B" }}>
            <Link 
              to="/" 
              state={{ scrollTo: "section1" }} 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded"
            >
              Home
            </Link>
            <Link 
              to="/" 
              state={{ scrollTo: "section2" }} 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded"
            >
              About Us
            </Link>
            <Link 
              to="/" 
              state={{ scrollTo: "section3" }} 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded"
            >
              Services
            </Link>
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded"
            >
              Register
            </Link>
            <p style={{ paddingBottom: "2%" }}></p>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
