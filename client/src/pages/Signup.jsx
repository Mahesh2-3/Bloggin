import React, { useState } from "react";
import SplitText from "../animations/Splittext";
import { useNavigate } from "react-router-dom";
import UseAuth from "../context/Auth";
import { MdOutlineEmail, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { TbArrowBarToLeft } from "react-icons/tb";
import { useTitle } from "../context/DynamicTitle";

const Signup = () => {
  useTitle("SignUp ")
  const { login, logout } = UseAuth();
  const navigate = useNavigate();

  // State
  const [toast, setToast] = useState({ show: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("null"); // "email" | "otp" | "null"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Helpers
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // API Calls
  const sendOtp = async () => {
    if (!name.trim() || !/^[a-zA-Z0-9\s]+$/.test(name)) {
      showToast("Please enter a valid name (letters only)");
      return;
    }
    if (!username.trim() || !/^[a-z0-9_-]+$/.test(username)) {
      showToast("Username must be lowercase and can include - or _");
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showToast("Please enter a valid email");
      return;
    }
    if (!password.trim()) {
      showToast("Password is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username }),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        showToast(result.message || "Failed to send OTP");
        return;
      }
      showToast("OTP sent to email");
      setStep("otp");
    } catch {
      showToast("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      showToast("Enter the OTP sent to your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, password, name, username }),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        showToast(result.message || "OTP verification failed");
        return;
      }
      logout();
      localStorage.setItem("token", result.token);
      login(result.user);
      showToast("Login successful");
      navigate("/home");
    } catch {
      showToast("Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URL}/api/auth/google/signup`;
  };

  // Render Step UI
  const renderStep = () => {
    if (step === "email") {
      return (
        <>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Enter a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10"
            />
            <div
              className="absolute right-3 top-[22px] translate-y-[-50%] cursor-pointer text-gray-400"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
            </div>
          </div>
          <button
            onClick={sendOtp}
            className="primary-btn bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP to Email"}
          </button>
        </>
      );
    }
    if (step === "otp") {
      return (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input-field"
          />
          <button
            onClick={verifyOtp}
            className="primary-btn bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center pb-30 gap-10 relative px-4">
      <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

      <SplitText
        text={`Bloggin'`}
        className="sm:text-[126px] text-[90px] select-none font-semibold font-main text-white"
        delay={100}
        duration={0.6}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: -40 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
      />

      {toast.show && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in-out">
          {toast.message}
        </div>
      )}

      <div className="glass-box w-full max-w-md py-6 px-8 rounded-xl shadow-lg text-white z-10">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>

        {step === "null" && (
          <>
            <button
              onClick={googleLogin}
              className="w-full bg-white flex items-center justify-center gap-2 text-black py-2 h-[50px] rounded-md font-medium mb-4 hover:bg-gray-200 transition"
            >
              <img src="/google.png" className="scale-90" alt="google" />
              Continue with Google
            </button>
            <div className="flex items-center gap-2 text-gray-300 my-4">
              <hr className="flex-1 border-gray-500" />
              <span className="text-sm">or</span>
              <hr className="flex-1 border-gray-500" />
            </div>
          </>
        )}

        <TbArrowBarToLeft
          onClick={() => setStep("null")}
          size={20}
          className={`absolute top-4 left-4 cursor-pointer ${step === "null" && "hidden"}`}
        />

        {step === "email" || step === "otp" ? (
          renderStep()
        ) : (
          <button
            onClick={() => {
              setStep("email");
              setEmail("");
              setPassword("");
              setShowPassword("");
              setName("");
              setUsername("");
              setOtp("");
            }}
            className="w-full bg-white flex items-center justify-center gap-2 text-black py-2 h-[50px] rounded-md font-medium mb-4 hover:bg-gray-200 transition"
          >
            <MdOutlineEmail size={30} />
            Continue with Your Email
          </button>
        )}

        <div className="mt-6 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-400 underline hover:text-green-300 cursor-pointer"
          >
            Login
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-20px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out forwards;
        }
        .input-field {
          width: 100%;
          margin-bottom: 1rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid #888;
          border-radius: 0.5rem;
          color: white;
          placeholder-color: #aaa;
          outline: none;
        }
        .primary-btn {
          width: 100%;
          padding: 0.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
};

export default Signup;
