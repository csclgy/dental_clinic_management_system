import React from 'react';
import { useNavigate } from "react-router-dom";


    const register2 = () => {
        const navigate = useNavigate();
        
        return(
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
              <br />
              <br />
              <div class="w-[50%] bg-white p-10 rounded-lg shadow-lg text-center">
                <h2 class="text-[#00c3b8] text-2xl font-bold mb-2">SIGN UP</h2>
                <p class="text-[#00458B] text-sm mb-6">Fill in the information below to sign up.</p>
                
                <br />
                <p class="text-[#00c3b8] font-bold mb-2">Personal Information</p>
                <br />

                <div className='col-sm-12'>
                    <div className='row'>
                        <div className='col-sm-6'>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">First Name</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Last Name</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Gender</label>
                                  <select  class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                  </select>
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Religion</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Home Address</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Province</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                        </div>
                        <div className='col-sm-6'>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Middle Name</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Date of Birth</label>
                                <input type="date" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Age</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Nationality</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">City</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                            <div class="mb-4 text-left">
                                <label class="block text-[#00458b] font-semibold mb-1">Occupation</label>
                                <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <br />
                <div className='col-sm-12'>
                    <div className='row'>
                        <div className='col-sm-6'>
                            <button class="bg-[#FFFFFF] text-[#00c3b8] font-semibold w-full border border-[#00458b] px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/register")}>Back</button>
                        </div>
                        <div className='col-sm-6'>
                            <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4" onClick={() => navigate("/presubmit")}>Next</button>
                        </div>
                    </div>
                </div>
              </div>
              <br />
              <br />
            </div>
        )
    }

    export default register2