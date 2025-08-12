import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import useAuth from "../context/Auth";
import { useMessage } from "../context/MessageContext";
import axios from "axios";
import Functions from "../components/Functions";

// Icons
import { FiEdit3 } from "react-icons/fi";
import { FaLock, FaEye, FaEyeSlash, FaInfoCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";

// Editor
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Profile = () => {
  const { user } = useAuth();
  const { showMessage } = useMessage();

  // Profile states
  const [UserData, setUserData] = useState({});
  const [aboutMe, setAboutMe] = useState("");

  // Password states
  const [passwordTab, setPasswordTab] = useState(false);
  const [passwordView, setPasswordView] = useState([false, false]);
  const [Verified, setVerified] = useState(false);

  // Delete account states
  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // OTP states
  const [showForgot, setshowForgot] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, settimer] = useState(0);
  const timerRef = useRef(null);

  // Loading
  const [loading, setLoading] = useState({ status: false, message: "" });

  /* ===========================
        OTP FUNCTIONS
  ============================ */
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

  const closeForgot = () => {
    setshowForgot(false);
    setOtp(Array(6).fill(""));
    settimer(0);
  };

  const handlesettimer = () => {
    let time = 60;
    if (timerRef.current) clearInterval(timerRef.current);
    settimer(time);
    timerRef.current = setInterval(() => {
      time -= 1;
      settimer(time);
      if (time < 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);
  };

  const handleForgotPassword = async () => {
    setshowForgot(true);
    setLoading({ status: true, message: "sendindotp" });
    handlesettimer();
    try {
      await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/forgotPassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user?.email }),
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading({ status: false, message: "" });
    }
  };

  const verifyOtp = async () => {
    setLoading({ status: false, message: "" });
    const code = otp.join("");
    if (timerRef.current) clearInterval(timerRef.current);
    settimer(0);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/verifyforgot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user?.email, otp: code }),
        }
      );
      const data = await res.json();
      if (data.message == "OTP Verified successfully") {
        showMessage("OTP Verified successfully", "#00b300");
        setVerified(true);
        closeForgot();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading({ status: false, message: "" });
    }
  };

  /* ===========================
        USER DATA FUNCTIONS
  ============================ */
  const fetchingUser = async () => {
    const res = await Functions.fetchUser(user._id);
    if (res.statusText === "OK") {
      setUserData(res.data);
      setAboutMe(res.data.bio || "");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading({ status: true, message: "imageupload" });
    try {
      const data = await Functions.handleImageUpload(file);
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users`,
        { ...UserData, profilePic: data.secure_url },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      showMessage("Profile picture updated successfully", "#00b300");
      setUserData((prev) => ({ ...prev, profilePic: data.secure_url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      showMessage("Image upload failed.", "#e3101e");
    } finally {
      setLoading({ status: false, message: "" });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users`,
        {
          name: UserData.name,
          username: UserData.username,
          email: UserData.email,
          profilePic: UserData.profilePic,
          bio: aboutMe,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      showMessage("Profile updated successfully", "#00b300");
      fetchingUser();
    } catch (error) {
      console.error(error);
      showMessage("Failed to update profile", "#e3101e");
    }
  };

  /* ===========================
        PASSWORD FUNCTIONS
  ============================ */
  const handleUpdatePassword = async () => {
    const oldPassword = Verified
      ? "isVerified"
      : document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/change-password`,
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      showMessage("Password updated successfully", "#00b300");
      if (!Verified) document.getElementById("oldPassword").value = "";
      setVerified(false);
      document.getElementById("newPassword").value = "";
    } catch (error) {
      console.log(error);
      showMessage(
        error.response?.data?.message || "Failed to update password",
        "#ff0000"
      );
    }
  };

  /* ===========================
        DELETE ACCOUNT
  ============================ */
  const confirmDeleteAccount = async () => {
    if (deleteText !== "delete my account") {
      showMessage('Please type "delete my account" correctly.', "#ff0000");
      return;
    }
    if (!deletePassword.trim()) {
      showMessage("Please enter your password.", "#ff0000");
      return;
    }
    setLoading({ status: true, message: "deleteaccount" });
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/users/${UserData._id}`,
        {
          data: { password: deletePassword },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      showMessage("Account deleted successfully", "#00b300");
    } catch (error) {
      console.error(error);
      showMessage(
        error.response?.data?.message || "Failed to delete account",
        "#ff0000"
      );
    } finally {
      setLoading({ status: false, message: "" });
      setShowDeleteBox(false);
      setDeleteText("");
      setDeletePassword("");
    }
  };

  /* ===========================
        EFFECTS
  ============================ */
  useEffect(() => {
    if (user) fetchingUser();
  }, [user]);

  const modules = {
    toolbar: [
      ["bold", "italic", "blockquote", "link"],
      [{ header: [1, 2, false] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  return (
    <div className="w-full py-[50px] font-normal bg-white dark:bg-black text-black dark:text-white min-h-screen">
      <Navbar />

      {/* Delete Confirmation Box */}
      {showDeleteBox && (
        <div className="fixed inset-0 bg-white/10 dark:bg-black/60 flex items-center backdrop-blur-lg justify-center z-50">
          <div className="bg-white/30 dark:bg-black/10 border p-6 rounded-xl sm:w-[450px] w-[375px] flex flex-col gap-3">
            <h2 className="text-xl font-bold mb-2 text-red-500">
              Confirm Account Deletion
            </h2>
            <p className="text-xs mb-3">
              To confirm, type <b>delete my account</b> and enter your password.
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder='Type "delete my account"'
              className="w-full p-2 mb-3 px-3 border border-gray-600 dark:border-gray-400 rounded outline-none dark:bg-[#222222]"
            />
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-2 mb-4 px-3 border border-gray-600 dark:border-gray-400 rounded outline-none dark:bg-[#222222]"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteBox(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-[#1d1d1d] rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={loading.message == "deleteaccount"}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
              >
                {loading.message == "deleteaccount" && (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showForgot && (
        <div className="fixed inset-0 bg-white/10 dark:bg-black/60 flex items-center backdrop-blur-lg justify-center z-50">
          <div className="bg-white/30 dark:bg-black/10 border relative p-6 rounded-xl sm:w-[450px] w-[375px] flex flex-col gap-3">
            <button
              onClick={() => {
                closeForgot();
              }}
              className="px-4 py-2 absolute top-2 right-2 cursor-pointer "
            >
              <RxCross1 strokeWidth={1} />
            </button>
            <h2 className="text-xl font-bold mb-2">
              OTP Sent to Your Email 📩
            </h2>
            <p className="text-xs mb-3">
              Please enter the 6-digit OTP we sent to your registered email
              address to continue.
            </p>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`} // ✅ needed for focus
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  className="w-10 h-12 text-center text-xl font-bold border border-gray-600 dark:border-gray-400 rounded outline-none dark:bg-[#222222] focus:border-blue-500"
                />
              ))}
            </div>

            <span></span>

            {/* Resend and Timer */}
            <div className="flex justify-between items-center text-xs mb-4">
              {!(timer > 0) ? (
                <button
                  onClick={handleForgotPassword}
                  disabled={timer > 0 || loading.message == "sendingotp"}
                  className="text-blue-500 hover:underline disabled:opacity-50"
                >
                  {loading.message == "sendingotp"
                    ? "Resending..."
                    : "Resend OTP"}
                </button>
              ) : (
                <span className="text-gray-500">Resend otp in {timer} sec</span>
              )}
              <button
                onClick={verifyOtp}
                disabled={loading.message == "verifyingotp"}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
              >
                {loading.message == "verifyingotp" && (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                )}
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switch */}
      <div className="flex justify-center my-10 gap-4">
        <button
          className={`px-4 py-2  ${!passwordTab ? "border-b" : "border-none"}`}
          onClick={() => setPasswordTab(false)}
        >
          Edit Profile
        </button>
        <button
          className={`px-4 py-2  ${passwordTab ? "border-b" : "border-none"}`}
          onClick={() => setPasswordTab(true)}
        >
          Change Password
        </button>
      </div>

      {/* Profile Edit Section */}
      {!passwordTab && (
        <div className="flex flex-col items-center justify-center mt-10 px-4">
          <div className="relative">
            <img
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-contain"
              referrerPolicy="no-referrer"
              src={UserData?.profilePic}
              alt={UserData?.username}
            />
            {loading.message == "imageupload" ? (
              <AiOutlineLoading3Quarters className="absolute -bottom-2 -right-6 sm:-right-8 cursor-pointer animate-spin text-xl" />
            ) : (
              <label htmlFor="profileImageUpload">
                <FiEdit3
                  size={24}
                  fill="#ffffff"
                  className="absolute -bottom-2 -right-6 sm:-right-8 cursor-pointer"
                  title="Edit Profile Pic"
                />
              </label>
            )}
            <input
              type="file"
              id="profileImageUpload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex flex-col gap-4 my-10 w-full max-w-xl">
            {/* Name */}
            <div className="flex flex-row gap-3 items-center">
              <label
                className="sm:w-[140px] sm:block hidden font-semibold text-lg"
                htmlFor="name"
              >
                Name:
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={UserData?.name || ""}
                onChange={handleInputChange}
                className="w-full sm:w-[350px] p-3 text-gray-700 dark:text-gray-300 border-b outline-none"
                placeholder="Enter your name..."
              />
            </div>

            {/* Username */}
            <div className="flex  flex-row gap-3 items-center">
              <label
                className="sm:w-[140px] sm:block hidden font-semibold text-lg"
                htmlFor="username"
              >
                Username:
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={UserData?.username || ""}
                onChange={handleInputChange}
                className="w-full sm:w-[350px] p-3 text-gray-700 dark:text-gray-300 border-b outline-none"
                placeholder="Enter your username..."
              />
            </div>

            {/* Email */}
            <div className="flex  flex-row gap-3 items-center">
              <label
                className="sm:w-[140px] sm:block hidden font-semibold text-lg"
                htmlFor="email"
              >
                Email:
              </label>
              <input
                type="text"
                name="email"
                id="email"
                value={UserData?.email || ""}
                onChange={handleInputChange}
                className="w-full sm:w-[350px] p-3 text-gray-700 dark:text-gray-300 border-b outline-none"
                placeholder="Enter your email..."
              />
            </div>

            {/* About Me */}
            <div>
              <label className="flex pr-2 justify-between font-medium text-lg mb-2">
                <span>Bio:</span>
                <FaInfoCircle
                  className="cursor-pointer"
                  onClick={() =>
                    showMessage("Edit Your Bio Using that ToolBar", "#00b300")
                  }
                />
              </label>
              <div className="bg-white h-[300px] overflow-y-auto hide-scrollbar text-black dark:text-white dark:bg-[#181818] rounded-md p-2">
                <div className="min-w-full">
                  <ReactQuill
                    theme="snow"
                    value={aboutMe}
                    onChange={setAboutMe}
                    placeholder="Write your Bio..."
                    modules={modules}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between w-full max-w-xl gap-3 mt-4">
            <button
              onClick={() => setShowDeleteBox(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-md hover:border-b border-red-500 text-red-500 font-semibold"
            >
              Delete Account
            </button>
            <button
              onClick={handleUpdateProfile}
              className="w-full sm:w-auto px-6 py-3 rounded-md hover:border-b border-green-500 text-green-500 font-semibold"
            >
              Update Changes
            </button>
          </div>
        </div>
      )}

      {/* Password Change Section */}
      {passwordTab && (
        <div className="flex flex-col items-center justify-center mt-30">
          <FaLock size={120} />
          {/* Old Password */}
          <div className="flex flex-col gap-4 my-10">
            {!Verified && (
              <div className="flex gap-3 items-center relative">
                <label
                  className="w-[140px] sm:block hidden font-semibold text-lg"
                  htmlFor="oldPassword"
                >
                  Old Password:
                </label>
                <input
                  type={passwordView[0] ? "text" : "password"}
                  name="oldPassword"
                  id="oldPassword"
                  className="w-[350px] p-3 text-gray-700 dark:text-gray-300 border-b outline-none"
                  placeholder="Enter your old password..."
                />
                {passwordView[0] ? (
                  <FaEyeSlash
                    onClick={() =>
                      setPasswordView([!passwordView[0], passwordView[1]])
                    }
                    className="absolute right-4 cursor-pointer"
                  />
                ) : (
                  <FaEye
                    onClick={() =>
                      setPasswordView([!passwordView[0], passwordView[1]])
                    }
                    className="absolute right-4 cursor-pointer"
                  />
                )}
              </div>
            )}

            {/* New Password */}
            <div className="flex gap-3 relative items-center">
              <label
                className="w-[140px] sm:block hidden font-semibold text-lg"
                htmlFor="newPassword"
              >
                New Password:
              </label>
              <input
                type={passwordView[1] ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                className="w-[350px] p-3 text-gray-700 dark:text-gray-300 border-b outline-none"
                placeholder="Enter your new password..."
              />
              {passwordView[1] ? (
                <FaEyeSlash
                  onClick={() =>
                    setPasswordView([passwordView[0], !passwordView[1]])
                  }
                  className="absolute right-4 cursor-pointer"
                />
              ) : (
                <FaEye
                  onClick={() =>
                    setPasswordView([passwordView[0], !passwordView[1]])
                  }
                  className="absolute right-4 cursor-pointer"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between w-full max-w-xl gap-3 mt-4">
            {!Verified && (
              <button
                className="px-6 py-3 mt-5 rounded-md hover:border-b border-red-300 text-red-300 font-semibold"
                type="button"
                onClick={handleForgotPassword}
              >
                forgot password?
              </button>
            )}
            <button
              className="px-6 py-3 mt-5 rounded-md hover:border-b border-blue-500 text-blue-500 font-semibold"
              type="button"
              onClick={handleUpdatePassword}
            >
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
