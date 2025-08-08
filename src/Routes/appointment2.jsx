import React from 'react';
import { useNavigate } from "react-router-dom";


    const appointment2 = () => {
        const navigate = useNavigate(); 

        return(
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
              <br />
              <br />
              <div class="w-[35%] bg-white p-10 rounded-lg shadow-lg text-center">
                <h2 class="text-[#00c3b8] text-2xl font-bold mb-2">APPOINTMENT REQUEST FORM</h2>
                <p class="text-[#00458B] text-sm mb-6">Please note that your appointment is not yet confirmed. Our dental clinic will get in touch with you shortly to confirm the schedule.</p>
                <br />
                <b>
                <p class="text-[#00458B] text-sm mb-6">Do you want to make a downpayment to reserve your appointment?</p>
                </b>

                <div className='col-sm-12'>
                    <div className='row'>
                        <div className='col-sm-6'>
                            <input type="radio" id="html" name="fav_language" value="Yes"></input>
                            <label for="html">Yes</label><br></br>
                        </div>
                        <div className='col-sm-6'>
                            <input type="radio" id="html" name="fav_language" value="No"></input>
                            <label for="html">No</label><br></br>
                        </div>
                    </div>
                </div>

                <br />
                <br />
                <h2 class="text-[#00458B] text-sm mb-6">Scan this QR Code with your Gcash App</h2>
                    <img src='gcashcode.png' style={{width: "100%"}}></img>

                <br />
                <br />
                <div class="mb-4 text-left">
                  <label class="block text-[#00458b] font-semibold mb-1">Upload your receipt here</label>
                  <input type="file" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none"></input>
                </div>

                <div className='col-sm-12'>
                    <center>
                        <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/appointmentsubmit")}>Submit</button>
                    </center>
                </div>
              </div>
              <br />
              <br />
            </div>
        )
    }

    export default appointment2