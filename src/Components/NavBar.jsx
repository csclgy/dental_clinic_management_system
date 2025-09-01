import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // user menu dropdown
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [user_name, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userName");
    if (token) {
      setIsLoggedIn(true);
      if (storedUser) setUserName(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("role");

    if (token) {
      setIsLoggedIn(true);
      if (storedUser) setUserName(storedUser);
      if (storedRole) setRole(storedRole);
    }
  }, []);

  return (
    <nav className="bg-white shadow-lg" style={{ color: "#00458B" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left side: Logo */}
          <div className="flex items-center space-x-8">
            <div>
              <img src="./favicon.png" style={{ width: "140px" }} alt="Logo" />
            </div>

            {/* Desktop menu */}
            
            {role === "patient" && (
            <div className="hidden md:flex space-x-4"> 
              <Link to="/" state={{ scrollTo: "section1" }} className="px-3 py-2 rounded">Home</Link> 
              <Link to="/" state={{ scrollTo: "section2" }} className="px-3 py-2 rounded">About Us</Link> 
              <Link to="/" state={{ scrollTo: "section3" }} className="px-3 py-2 rounded">Services</Link> 
              <Link to="/" state={{ scrollTo: "section4" }} className="px-3 py-2 rounded">Contact Us</Link> 
            </div>
            )}
            {role === "admin" && (
            <div className="hidden md:flex space-x-4"> 
            </div>
            )}
          </div>

          {/* RIGHT side: Desktop */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {!isLoggedIn ? (
              <>
              <Link to="/login" className="px-3 py-2 rounded">Login</Link> 
              <Link to="/register" className="px-3 py-2 rounded">Register</Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span>
                    Welcome,{" "}
                    <span className="font-semibold text-teal-500">{user_name || "User"}!</span>
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Only shows when logged in */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45"></div>

                    <div className="py-2">
                      <Link to="/profilelogin" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                      {role === "patient" && (
                      <Link to="/transmed" className="block px-4 py-2 hover:bg-gray-100">Transaction History</Link>
                      )}
                      <Link to="/notification" className="block px-4 py-2 hover:bg-gray-100">Notifications</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">Logout</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Right side: Mobile Button */}
        <div className="md:hidden mt-2 space-y-2 text-center" style={{ color: "#00458B" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
        <div className="md:hidden mt-4 space-y-4">
            <Link to="/" state={{ scrollTo: "section1" }} className="block px-3 py-2 rounded">Home</Link>
            <Link to="/" state={{ scrollTo: "section2" }} className="block px-3 py-2 rounded">About Us</Link>
            <Link to="/" state={{ scrollTo: "section3" }} className="block px-3 py-2 rounded">Services</Link>
            <Link to="/" state={{ scrollTo: "section4" }} className="block px-3 py-2 rounded">Contact Us</Link>

            {/* Check login status */}
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="block px-3 py-2 rounded">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded">Register</Link>
                <br />
              </>
            ) : (
              <div className="border-t pt-4">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span>
                    Welcome,{" "}
                    <span className="font-semibold text-teal-500">{user_name || "User"}!</span>
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <br />

                {isDropdownOpen && (
                  <div className="mt-3 space-y-2">
                    <Link to="/profilelogin" className="block px-4 py-2 hover:bg-gray-100 rounded">Profile</Link>
                    <Link to="/transmed" className="block px-4 py-2 hover:bg-gray-100 rounded">Transaction History</Link>
                    <Link to="/notification" className="block px-4 py-2 hover:bg-gray-100 rounded">Notifications</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 rounded"
                    >
                      Logout
                    </button>
                    <br />
                    <br />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
