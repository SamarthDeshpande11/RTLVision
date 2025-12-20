import {useState} from "react";
import { registerUser } from "../../services/auth";
import { useNavigate } from "react-router-dom";

export default function Register(){
    const[form,setForm]=useState({});
    const navigate=useNavigate();

    const handleChange=(e)=>
        setForm({...form,[e.target.name]:e.target.value});

    const handleSubmit=async(e)=>{
        e.preventDefault();
        await registerUser(form);
        navigate("/login");
    };
    return(
        <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
            <form 
            onSubmit={handleSubmit}
            className="bg-[#020617] p-8 rounded-xl w-96 border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-white">Register</h2>
                <input name="name"
                placeholder="Name"
                onChange={handleChange}
                className="w-full p-2 mb-3 bg-black text-white border border-gray-700" />

                <input 
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full p-2 mb-3 bg-black text-white border border-gray-700" />

                <input type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full p-2 mb-4 bg-black text-white border border-gray-700" />

                <button className="w-full bg-indigo-600 py-2 rounded">Register</button>
            </form>
        </div>
    )
}