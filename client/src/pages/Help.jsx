import React, { useState } from "react";
import Navbar from "../components/Navbar";
import useAuth from "../context/Auth";
import { useMessage } from "../context/MessageContext";
import { useTitle } from "../context/DynamicTitle";

const Help = () => {
  useTitle("Help ");
  const { user } = useAuth();
  const { showMessage } = useMessage();

  const [activeTab, setActiveTab] = useState("problem");

  // Problem report state
  const [problemName, setProblemName] = useState("");
  const [problemText, setProblemText] = useState("");
  const [problemLoading, setProblemLoading] = useState(false);

  // Feedback state
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [animateStar, setAnimateStar] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // API call wrapper
  const sendRequest = async (url, body, successMessage, errorMessage, resetFields) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 200) {
        showMessage(successMessage, "#00b300");
        resetFields();
      } else {
        throw new Error();
      }
    } catch {
      showMessage(errorMessage, "#ff0000");
    }
  };

  // Submit handlers
  const handleProblemSubmit = async () => {
    setProblemLoading(true);
    await sendRequest(
      `${import.meta.env.VITE_BASE_URL}/api/auth/email/problem`,
      { email: user?.email, name: problemName, text: problemText },
      "Problem reported successfully",
      "Failed to report problem",
      () => {
        setProblemName("");
        setProblemText("");
      }
    );
    setProblemLoading(false);
  };

  const handleFeedbackSubmit = async () => {
    setFeedbackLoading(true);
    await sendRequest(
      `${import.meta.env.VITE_BASE_URL}/api/auth/email/feedback`,
      { email: user?.email, name: feedbackName, text: feedbackText, rating },
      "Feedback sent successfully",
      "Failed to send feedback",
      () => {
        setFeedbackName("");
        setFeedbackText("");
        setRating(0);
      }
    );
    setFeedbackLoading(false);
  };

  // Star rating animation
  const handleStarClick = (value) => {
    setRating(value);
    setAnimateStar(value);
    setTimeout(() => setAnimateStar(null), 500);
  };

  // Reusable styles
  const inputClass =
    "border border-black dark:border-white bg-transparent px-3 py-2 rounded w-full";

  const buttonClass = (loading) =>
    `border border-black dark:border-white px-4 py-2 rounded transition flex justify-center items-center w-full sm:w-auto ${
      loading
        ? "opacity-60 cursor-not-allowed"
        : "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
    }`;

  return (
    <div className="min-h-screen pt-[70px] bg-white text-black dark:bg-black dark:text-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex justify-center items-center px-4 py-8">
        <div className="w-full max-w-xl bg-transparent p-6 rounded-lg shadow-none">
          {/* Tabs */}
          <div className="flex mb-6 justify-center gap-4">
            {["problem", "feedback"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm sm:text-base ${
                  activeTab === tab
                    ? "border-b-2 border-black dark:border-white"
                    : "opacity-70"
                }`}
              >
                {tab === "problem" ? "Report a Problem" : "Give Feedback"}
              </button>
            ))}
          </div>

          {/* Problem Form */}
          {activeTab === "problem" && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={problemName}
                onChange={(e) => setProblemName(e.target.value)}
                className={inputClass}
              />
              <textarea
                placeholder="Describe your problem..."
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                className={`${inputClass} h-28`}
              />
              <div className="flex justify-center">
                <button
                  onClick={handleProblemSubmit}
                  disabled={problemLoading}
                  className={buttonClass(problemLoading)}
                >
                  {problemLoading ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          {activeTab === "feedback" && (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                className={inputClass}
              />
              <textarea
                placeholder="Your feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className={`${inputClass} h-28`}
              />

              {/* Star Rating */}
              <div className="flex gap-2 justify-center">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <svg
                      key={starValue}
                      onClick={() => handleStarClick(starValue)}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-8 h-8 cursor-pointer ${
                        animateStar === starValue ? "animate-bounce" : ""
                      }`}
                      fill={starValue <= rating ? "yellow" : "none"}
                      viewBox="0 0 24 24"
                      stroke="yellow"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.357 4.175a1 1 0 00.95.69h4.388c.969 0 1.371 1.24.588 1.81l-3.557 2.584a1 1 0 00-.364 1.118l1.357 4.175c.3.921-.755 1.688-1.54 1.118l-3.557-2.584a1 1 0 00-1.176 0l-3.557 2.584c-.784.57-1.838-.197-1.539-1.118l1.357-4.175a1 1 0 00-.364-1.118L2.716 9.602c-.783-.57-.38-1.81.588-1.81h4.388a1 1 0 00.95-.69l1.357-4.175z"
                      />
                    </svg>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackLoading}
                  className={buttonClass(feedbackLoading)}
                >
                  {feedbackLoading ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;
