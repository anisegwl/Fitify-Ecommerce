import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const navigate = useNavigate();

  const [credential, setCredential] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setCredential((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = credential.name.trim();
    const email = credential.email.trim();
    const password = credential.password;

    if (!name || !email || !password) {
      toast.error(" All fields are required");
      return;
    }
    if (password.length < 5) {
      toast.error(" Password must be at least 5 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/createuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.authToken) {
        toast.error(data.message || "Signup failed");
        return;
      }
      localStorage.setItem("token", data.authToken);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-600 mt-1">Sign up to start your journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Full name</label>
              <div className="relative mt-2">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Person Name"
                  value={credential.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative mt-2">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={credential.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative mt-2">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 5 characters"
                  value={credential.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 text-white py-3 font-semibold hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>

        <div className="text-center mt-5 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;