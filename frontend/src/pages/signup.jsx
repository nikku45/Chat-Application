import React  from "react";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


function Signup(){
     const [username,setUsername]=useState();
     const[email,setEmail]=useState();
     const[password,setPassword]=useState();
     const navigate=useNavigate();
     
     const handleSubmit=async(e)=>{
        e.preventDefault();
        console.log("submit")
        const res=await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`,
           {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({username,email, password})
           }
        )
        const data=await res.json();
        console.log(data)
        if(!data.token){
          return alert(res.status);
        }else{
            localStorage.setItem("token",data.token);
            navigate('/')
            return alert("User signed in succesfully");
        }
       


     }
    return(
       <>
        {/* <form onSubmit={handleSubmit}>
        <h1 class="underline">Signup</h1>
        <input type="text" onChange ={(e)=>setUsername(e.target.value)}name="username" value={username} placeholder="Enter username" required></input>
        <input type="email"  onChange={(e) => setEmail(e.target.value)} value={email}name="email" placeholder="Enter email"/>
        <input type="password"  onChange={(e) => setPassword(e.target.value)} value={password}name="password" placeholder="Enter password"/>
        <button>Submit</button>
        </form> */}
        <section class="bg-gray-50 dark:bg-gray-900">
  <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo"/>
          Flowbite    
      </a>
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Create an account
              </h1>
              <form onSubmit={handleSubmit}class="space-y-4 md:space-y-6" >
                 <div>
                      <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Username</label>
                      <input  onChange={(e)=>setUsername(e.target.value)} name="username" id="email" value={username}class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="true"/>
                  </div>
                  <div>
                      <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                      <input  onChange={(e)=>setEmail(e.target.value)} type="email" name="email" id="email"value={email} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required="true"/>
                  </div>
                  <div>
                      <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input  onChange={(e)=>setPassword(e.target.value)} type="password" name="password" id="password" value={password} placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="true" />
                  </div>
                 
                  <div class="flex items-start">
                      <div class="flex items-center h-5">
                        <input id="terms" aria-describedby="terms" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
                      </div>
                      <div class="ml-3 text-sm">
                        <label for="terms" class="font-light text-gray-500 dark:text-gray-300">I accept the <a class="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a></label>
                      </div>
                  </div>
                  <button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create an account</button>

                  <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                      Already have an account? <a href="/login" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>
       </>
    )
}
export default Signup