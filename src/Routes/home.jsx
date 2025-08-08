import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Home = () => {
  const location = useLocation();

  // Scroll to the section if state.scrollTo is passed
  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100); // delay ensures DOM is rendered
      }
    }
  }, [location]);

  return (
    <div>
      <div className="p-4">
        <div className="container-fluid">
          <div className="row">
            {/* Section 1 */}
            <section id="section1">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-sm-6 text-center" style={{ color: "#00458B" }}>
                    <p style={{ paddingBottom: "30%" }}></p>
                    <h1 className="text-5xl font-bold">Arciaga-Juntilla TMJ</h1>
                    <h1 className="text-5xl font-bold">Ortho Dental Clinic</h1>
                    <br />
                    <p className="text-3xl">"Our Passion is Your Smile"</p>
                    <br />
                    <button
                      className="px-3 py-2 rounded"
                      style={{ backgroundColor: "#01D5C4", color: "white" }}
                    >
                      Book an Appointment
                    </button>
                  </div>
                  <div className="col-sm-6">
                    <img src="./main.png" style={{ width: "100%" }} alt="Main" />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section2">
              <br />
              <div
                className="col-sm-12"
                style={{
                  backgroundColor: "#99DDFF40",
                  borderRadius: "15px",
                  padding: "1%",
                }}
              >
                <div className="row">
                  <div className="col-sm-6">
                    <img src="homeclinic.png" style={{ width: "100%" }} alt="Clinic" />
                  </div>
                  <div className="col-sm-6" style={{ padding: "5%" }}>
                    <b>
                      <p
                        style={{
                          color: "#01D5C4",
                          textAlign: "center",
                          fontSize: "25px",
                        }}
                      >
                        ABOUT US
                      </p>
                    </b>
                    <br />
                    <b style={{ color: "#00458B" }}>
                      Arciaga-Juntilla TMJ Ortho Dental Clinic
                    </b>
                    <br />
                    <p style={{ color: "#00458B" }}>
                      Arciaga-Juntilla TMJ Ortho Dental Clinic is an affiliate of the
                      Asian-American Association of Functional Orthodontics and TMJ.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section3">
              <div className="col-sm-12" style={{ padding: "5%" }}>
                <div className="row">
                  <div className="col-sm-12">
                    <b>
                      <p
                        style={{
                          color: "#00458B",
                          fontSize: "25px",
                          textAlign: "center",
                        }}
                      >
                        OUR SERVICES
                      </p>
                    </b>
                  </div>
                  <div className="col-sm-12">
                    <div className="row">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div className="col-sm-3" key={i}>
                          <img
                            src={`s${i + 1}.png`}
                            style={{ width: "100%" }}
                            alt={`Service ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer / Section 4 */}
      <footer>
        <section
          style={{ backgroundColor: "#00458B", color: "white", padding: "5%" }}
          id="section4"
        >
          <div className="row">
            <div className="col-sm-8">
              <b>
                <p style={{ fontSize: "25px" }}>CONTACT US</p>
              </b>
              <p>For more details & inquiries, Please contact or visit us:</p>
              <br />
              <div className="col-sm-12">
                <b>
                  <p>
                    <i className="fa fa-phone" aria-hidden="true"></i> +639338639828
                  </p>
                </b>
              </div>
              <br />
              <div className="col-sm-12">
                <b>
                  <p>
                    <i className="fa fa-map-marker" aria-hidden="true"></i> Unit 109 V &
                    G, Legaspi Bldg, 9 Pedro Diaz St, Poblacion, Muntinlupa, Metro Manila
                  </p>
                </b>
              </div>
              <div className="col-sm-12">
                <b>
                  <p>Monday - Sunday: 9:00am - 5:00pm</p>
                </b>
              </div>
            </div>
            <div className="col-sm-4">
              <b>
                <p style={{ fontSize: "20px" }}>Links</p>
              </b>
              <b>
                <a href="#section1">Home</a>
              </b>
              <br />
              <b>
                <a href="#section2">About Us</a>
              </b>
              <br />
              <b>
                <a href="#section3">Services</a>
              </b>
              <br />
              <b>
                <a href="#section4">Contact Us</a>
              </b>
              <br />
              <br />
              <b>
                <p style={{ fontSize: "20px" }}>Social Media</p>
              </b>
              <p style={{ fontSize: "35px" }}>
                <a>
                  <i className="fa fa-facebook-official" aria-hidden="true"></i>
                </a>
              </p>
              <p>
                © 2025 Arciaga-Juntilla TMJ Ortho Dental Clinic. All Rights Reserved.
              </p>
            </div>
          </div>
        </section>
      </footer>
    </div>
  );
};

export default Home;
