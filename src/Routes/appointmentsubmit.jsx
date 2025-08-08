import React from 'react';
import { useNavigate } from "react-router-dom";


    const appointmentsubmit = () => {
        const navigate = useNavigate(); 

        return(
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
              <div class="w-[30%] bg-white p-10 rounded-lg shadow-lg text-center">
                <h2 class="text-[#00c3b8] text-2xl font-bold mb-2">APPOINTMENT REQUEST FORM</h2>
                <br />
                <b>
                <h3 class="text-[#00458B] text-2xl font-bold mb-2">Thank you for booking with us!</h3>
                </b>
                <p class="text-[#00458B] text-sm mb-6">Please note that your appointment is not yet confirmed. Our dental clinic will get in touch with you shortly to confirm the schedule.</p>
                <br />
                <div className='col-sm-12'>
                    <center>
                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/")}>Done</button>
                    </center>
                </div>
              </div>
              <br />
              <br />
            </div>
        )
    }

    export default appointmentsubmit