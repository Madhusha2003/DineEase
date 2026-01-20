import React from 'react'
import '../App.css'
import { FaUser } from 'react-icons/fa'


function Login() {
  return (
    <div className="flex flex-col justify-center items-center h-screen overflow-hidden bg-gray-100">
        <div className="flex items-end justify-end mb-6 border">
          <h2 className="text-4xl font-bold text-red-600">
            Elees <span className="text-2xl text-black">FOOD COURT</span>
          </h2>
        </div>
        <div className='flex flex-col items-center p-8 bg-white border rounded-xl shadow-lg w-80'>
        <h1 className="p-5 text-2xl">Hello!</h1>
        <div className="p-5">
            <FaUser size={90} />
        </div>
        <div >
            <form className='flex flex-col items-center'>
                <input type="text" placeholder='Username' className='m-2 p-2 border' required/>
                <input type='password' placeholder='Password' className='m-2 p-2 border' required/>
                <button type='submit' className='m-2 p-2 border bg-orange-500 text-white rounded'>Login as Waiter</button>
                <button type='submit' className='m-2 p-2 border bg-orange-500 text-white rounded'>Login as Chef</button>
                <button type='submit' className='m-2 p-2 border bg-orange-500 text-white rounded'>Login as Manager</button>
            </form>
        </div>
        </div>
    </div>
  )
}

export default Login