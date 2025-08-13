import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useMessage } from "../context/MessageContext";
import axios from "axios";
import { useTitle } from "../context/DynamicTitle";

const ForgotPassword = () => {
  useTitle("Forgot Password ")
  const { showMessage } = useMessage();
  const navigate = useNavigate();

  // States
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState({ status: false, message: "" });
  const [newPassword, setNewPassword] = useState("");

  const timerRef = useRef(null);

  /* -------------------------
        OTP Functions
  ------------------------- */
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const startTimer = () => {
    let time = 60;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(time);
    timerRef.current = setInterval(() => {
      time -= 1;
      setTimer(time);
      if (time < 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);
  };

  /* -------------------------
        API Calls
  ------------------------- */
  const sendOtp = async () => {
    if (!email.trim()) return showMessage("Please enter your email.","#ff0000");
    setLoading({ status: true, message: "sendotp" });
    try {
      await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/forgotPassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      startTimer();
      setStep(2);
    } catch (error) {
      console.error(error);
      showMessage("Failed to send OTP.","#ff0000");
    } finally {
      setLoading({ status: false, message: "" });
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return showMessage("Please enter the complete OTP.","#ff0000");
    setLoading({ status: true, message: "verifyotp" });
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/verifyforgot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: code }),
        }
      );
      const data = await res.json();
      if (data.message === "OTP Verified successfully") {
          showMessage("OTP Verified successfully.","#00b300");
        setStep(3);
      } else {
        showMessage("Invalid OTP.","#ff0000");
      }
    } catch (error) {
      console.error(error);
      showMessage("Failed to verify OTP.","#ff0000");
    } finally {
      setLoading({ status: false, message: "" });
    }
  };

  const updatePassword = async () => {
    if (!newPassword.trim()) return showMessage("Please enter a new password.","#ff0000");
    setLoading({ status: true, message: "updatepassword" });
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/reset-password`,
        { email, newPassword },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      showMessage("Password updated successfully.", "#00b300");
      navigate("/login");
    } catch (error) {
      console.error(error);
      showMessage("Failed to update password.","#ff0000");
    } finally {
      setLoading({ status: false, message: "" });
    }
  };

  /* -------------------------
        JSX UI
  ------------------------- */
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="absolute inset-0 h-full w-full px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] z-[-1]"></div>
      <div className="p-6 rounded-xl shadow-lg w-full max-w-md border border-white">
        <h2 className="text-xl font-semibold text-center mb-4 text-black dark:text-white">
          Forgot Password
        </h2>

        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-400 rounded-lg bg-transparent text-black dark:text-white dark:border-gray-600"
            />
            <button
              onClick={sendOtp}
              className="w-full  text-black py-2 rounded-lg flex items-center justify-center bg-white "
              disabled={loading.status}
            >
              {loading.status && loading.message === "sendotp" ? (
                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
              ) : (
                "Send OTP"
              )}
            </button>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <>
            <div className="flex justify-between mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="w-10 h-12 text-center border border-gray-400 rounded-lg bg-transparent text-black dark:text-white dark:border-gray-600"
                />
              ))}
            </div>
            {timer > 0 ? (
              <p className="text-center mb-4 text-sm text-gray-600 dark:text-gray-300">
                Resend OTP in {timer}s
              </p>
            ) : (
              <button
                onClick={sendOtp}
                disabled={loading.message == "sendotp"}
                className="text-sm text-center w-full underline mb-4 text-black dark:text-white"
              >
                Resend OTP
              </button>
            )}
            <button
              onClick={verifyOtp}
              className="w-full bg-black text-white py-2 rounded-lg flex items-center justify-center dark:bg-white dark:text-black"
              disabled={loading.status}
            >
              {loading.status && loading.message === "verifyotp" ? (
                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
              ) : null}
              Verify OTP
            </button>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-400 rounded-lg bg-transparent text-black dark:text-white dark:border-gray-600"
            />
            <button
              onClick={updatePassword}
              className="w-full bg-black text-white py-2 rounded-lg flex items-center justify-center dark:bg-white dark:text-black"
              disabled={loading.status}
            >
              {loading.status && loading.message === "updatepassword" ? (
                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
              ) : null}
              Update Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
