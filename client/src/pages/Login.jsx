import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import SplitText from "../animations/Splittext";
import UseAuth from "../context/Auth";
import { useEffect } from "react";
import { useMessage } from "../context/MessageContext";
import { useTitle } from "../context/DynamicTitle";

const Login = () => {
  useTitle("Login ")
  const location = useLocation();
  const { showMessage } = useMessage();
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout } = UseAuth();
  const [loading, setloading] = useState(false)
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();



  /** Handle form submission */
  const onSubmit = async (data) => {
    setloading(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: data.identifier,
            password: data.password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        showMessage(result.message,"#ff0000")
        return;
      }

      logout();
      localStorage.setItem("token", result.token);
      login(result.user);
      navigate("/home");
      showMessage("Login successful","#00b300");
      reset();
    } catch {
      showMessage("Server error","#ff0000");
    }finally{
      setloading(false)
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get("error");
    if (errorMsg) {
      showMessage(errorMsg, "#ff0000");
    }
  }, [location.search]);

  /** Handle form validation errors */
  const onError = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    if (firstError?.message) showMessage(firstError.message,"#ff0000");
  };

  /** Trigger Google OAuth login */
  const googleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_BASE_URL
    }/api/auth/google/login`;
  };

  return (
    <div className="min-h-screen bg-black flex xl:gap-30 gap-10 xl:flex-row flex-col items-center justify-center relative px-4">
      {/* Background */}
      <div className="absolute inset-0 h-full w-full px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

      {/* Heading Animation */}
      <SplitText
        text="Welcome Back!"
        className="md:absolute relative sm:top-20 top-5 md:text-[126px] sm:text-[100px] text-[60px] select-none font-semibold font-main text-white text-start"
        delay={100}
        duration={0.6}
        ease="power3.out"
        splitType="words"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: -40 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
      />

      {/* Login Card */}
      <div className="glass-box w-full max-w-md px-8 py-8 rounded-xl shadow-lg backdrop-blur-sm bg-white/10 border border-white/20 z-10">
        <h2 className="text-3xl font-semibold text-center text-white mb-8">
          Login
        </h2>

        {/* Google Login */}
        <button
          onClick={googleLogin}
          className="w-full bg-white flex items-center justify-center gap-2 text-black py-2 h-[50px] rounded-md font-medium mb-6 hover:bg-gray-200 transition"
        >
          <img src="/google.png" className="scale-90" alt="google" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="border-t border-gray-400 flex-grow mr-2"></div>
          <span className="text-white text-sm">or</span>
          <div className="border-t border-gray-400 flex-grow ml-2"></div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="space-y-6 text-white"
        >
          {/* Identifier Field */}
          <div>
            <label className="block mb-1 text-sm">Username or Email</label>
            <input
              type="text"
              {...register("identifier", {
                required: "Username or Email is required",
              })}
              className="w-full px-4 py-2 bg-transparent border border-gray-400 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username or email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-1 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-2 pr-10 bg-transparent border border-gray-400 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-300 hover:text-blue-400 underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all py-2 rounded-md font-medium"
          >
            Login
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="w-full mt-6 text-white text-center text-sm">
          Don't have an account?
          <Link
            to="/signup"
            className="ml-2 text-green-400 underline hover:text-green-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
