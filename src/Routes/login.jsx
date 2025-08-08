import React from 'react';

    const login = () => {
        return(
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#20d3d1] to-[#6dd0f4]">
              <div class="w-[400px] bg-white p-10 rounded-lg shadow-lg text-center">
                <h2 class="text-[#00c3b8] text-2xl font-bold mb-2">LOGIN NOW</h2>
                <p class="text-[#00458B] text-sm mb-6">Please enter your login information to set your appointment now.</p>
                
                <div class="mb-4 text-left">
                  <label class="block text-[#00458b] font-semibold mb-1">Username</label>
                  <input type="text" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                </div>
                <div class="mb-4 text-left">
                  <label class="block text-[#00458b] font-semibold mb-1">Password</label>
                  <input type="password" class="w-full border border-[#00458b] rounded-full px-4 py-2 outline-none" />
                </div>

                <button class="bg-[#00c3b8] text-white font-semibold px-6 py-2 rounded-full w-full mb-4">Login</button>
                
                <p class="text-xs text-[#01D5C4]">
                  Doesn't have an account?
                  <br />
                  <a href="#" class="text-[#006EFF] font-semibold">Register</a>
                </p>
              </div>
            </div>
        )
    }

    export default login