import React from 'react';
import { useNavigate } from "react-router-dom";


    const presubmit = () => {
        const navigate = useNavigate();
        
        return(
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
              <br />
              <br />
              <div class="w-[50%] bg-white p-10 rounded-lg shadow-lg text-center">
                <h2 class="text-[#00c3b8] text-2xl font-bold mb-2">SIGN UP</h2>
                <p class="text-[#00458B] text-sm mb-6">Please double check your information</p>
                
                <br />

                <div className='col-sm-12'>
                    <div className='row'>
                        <div className='col-sm-6'>
                        <p class="text-[#00c3b8] font-bold mb-2">Login Information</p>
                        <br />
                            <div class="mb-4 text-[#00458B] text-left">
                                <p><b>Username:</b> ...</p>
                                <br />
                                <p><b>Password:</b> *****</p>
                                <br />
                                <p><b>Confirm Password:</b> *****</p>
                                <br />
                                <p><b>Email:</b> ...</p>
                                <br />
                                <p><b>Contact Number:</b> +63...</p>
                            </div>
                        </div>
                        <div className='col-sm-6'>
                        <p class="text-[#00c3b8] font-bold mb-2">Personal Information</p>
                        <br />
                            <div class="mb-4 text-[#00458B] text-left">
                                <p><b>First Name:</b> ...</p>
                                <br />
                                <p><b>Middle Name:</b> ...</p>
                                <br />
                                <p><b>Last Name:</b> ...</p>
                                <br />
                                <p><b>Date of Birth:</b> ...</p>
                                <br />
                                <p><b>Gender:</b> ...</p>
                                <br />
                                <p><b>Religion:</b> ...</p>
                                <br />
                                <p><b>Home Address:</b> ...</p>
                                <br />
                                <p><b>City:</b> ...</p>
                                <br />
                                <p><b>Province:</b> ...</p>
                                <br />
                                <p><b>Occupation:</b> ...</p>
                                <br />
                            </div>
                        </div>
                    </div>
                </div>
                
                <br />
                <div className='col-sm-12'>
                    <div className='row'>
                        <div className='col-sm-6'>
                            <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/register2")}>Back</button>
                        </div>
                        <div className='col-sm-6'>
                            <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/")}>Submit</button>
                        </div>
                    </div>
                </div>
              </div>
              <br />
              <br />
            </div>
        )
    }

    export default presubmit