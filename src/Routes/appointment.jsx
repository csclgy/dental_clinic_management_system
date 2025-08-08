import React from 'react';
import { useNavigate } from "react-router-dom";


    const appointment = () => {
        const navigate = useNavigate(); 

        return(
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
              <br />
              <br />
              <div class="w-[35%] bg-white p-10 rounded-lg shadow-lg text-center">
                <h2 class="text-[#00c3b8] text-2xl font-bold mb-2">APPOINTMENT REQUEST FORM</h2>
                <p class="text-[#00458B] text-sm mb-6">Please note that your appointment is not yet confirmed. Our dental clinic will get in touch with you shortly to confirm the schedule.</p>
                <br />

                <div class="mb-4 text-left">
                  <label class="block text-[#00458b] font-semibold mb-1">Procedure</label>
                  <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                </div>
                <div class="mb-4 text-left">
                  <label class="block text-[#00458b] font-semibold mb-1">Preferred Date</label>
                  <input type="password" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                </div>
                <div class="mb-4 text-left">
                  <label class="block text-[#00458b] font-semibold mb-1">Preferred Time</label>
                  <input type="password" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                </div>
                <div class="mb-4 text-left">
                  <label class="block text-[#00458b] font-semibold mb-1">Upload Photos/ X-Ray/ Dental Records</label>
                  <input type="password" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                </div>

                <div className='col-sm-12'>
                    <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/appointment2")}>Next</button>
                </div>
              </div>
              <br />
              <br />
            </div>
        )
    }

    export default appointment