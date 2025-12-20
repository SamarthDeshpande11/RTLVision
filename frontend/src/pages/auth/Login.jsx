import { useState } from "react";
import { loginUser } from "../../services/auth";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login Failed");
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] to-[#0b0f1a]">
        <div className="bg-[#020617] border border-gray-800 rounded-2xl p-10 w-[420px] shadow-xl">
          <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
            <form
              onSubmit={handleSubmit}
              className="bg-[#020617] p-8 rounded-xl w-96 border border-gray-800"
            >
              <h2 className="text-2xl font-bold mb-6 text-white">Login</h2>
              {error && <p className="text-red-500 mb-3">{error}</p>}
              <input
                className="w-full p-2 mb-3 rounded bg-black text-white border border-gray-700"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="w-full p-2 mb-4 rounded bg-black text-white border border-gray-700"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="w-full bg-indigo-600 py-2 rounded hover:bg-indigo-700">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
