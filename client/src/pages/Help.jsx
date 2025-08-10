import React, { useState } from "react";
import Navbar from "../components/Navbar";
import useAuth from "../context/Auth";
import { useMessage } from "../context/MessageContext";

const Help = () => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const [activeTab, setActiveTab] = useState("problem");

  // States for problem report
  const [problemName, setProblemName] = useState("");
  const [problemText, setProblemText] = useState("");
  const [problemLoading, setProblemLoading] = useState(false);

  // States for feedback
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [animateStar, setAnimateStar] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Submit handlers
  const handleProblemSubmit = async () => {
    setProblemLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/problem`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user?.email,
            name: problemName,
            text: problemText,
          }),
        }
      );
      if (response.status === 200) {
        showMessage("Problem reported successfully", "#00b300");
        setProblemName("");
        setProblemText("");
      }
    } catch (err) {
      showMessage("Failed to report problem", "#ff0000");
    } finally {
      setProblemLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    setFeedbackLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/auth/email/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user?.email,
            name: feedbackName,
            text: feedbackText,
            rating: rating,
          }),
        }
      );
      if (response.status === 200) {
        showMessage("Feedback sent successfully", "#00b300");
        setFeedbackName("");
        setFeedbackText("");
        setRating(0);
      }
    } catch (err) {
      showMessage("Failed to send feedback", "#ff0000");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Star click animation trigger
  const handleStarClick = (value) => {
    setRating(value);
    setAnimateStar(value);
    setTimeout(() => setAnimateStar(null), 500);
  };

  return (
    <div className="min-h-screen pt-[70px] bg-white text-black dark:bg-black dark:text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("problem")}
            className={`px-4 py-2 font-medium ${
              activeTab === "problem"
                ? "border-b-2 border-black dark:border-white"
                : "opacity-70"
            }`}
          >
            Report a Problem
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 font-medium ${
              activeTab === "feedback"
                ? "border-b-2 border-black dark:border-white"
                : "opacity-70"
            }`}
          >
            Give Feedback
          </button>
        </div>

        {/* Problem Form */}
        {activeTab === "problem" && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={problemName}
              onChange={(e) => setProblemName(e.target.value)}
              className="border border-black dark:border-white bg-transparent px-3 py-2 rounded"
            />
            <textarea
              placeholder="Describe your problem..."
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              className="border border-black dark:border-white bg-transparent px-3 py-2 rounded h-28"
            ></textarea>
            <button
              onClick={handleProblemSubmit}
              disabled={problemLoading}
              className={`border border-black dark:border-white px-4 py-2 rounded transition flex justify-center items-center ${
                problemLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-blue-500 hover:text-white"
              }`}
            >
              {problemLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
              ) : (
                "Submit"
              )}
            </button>
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
              className="border border-black dark:border-white bg-transparent px-3 py-2 rounded"
            />
            <textarea
              placeholder="Your feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="border border-black dark:border-white bg-transparent px-3 py-2 rounded h-28"
            ></textarea>

            {/* Star Rating */}
            <div className="flex gap-2">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                const isActive = starValue <= rating;
                return (
                  <svg
                    key={starValue}
                    onClick={() => handleStarClick(starValue)}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-8 h-8 cursor-pointer star ${
                      animateStar === starValue ? "sparkle" : ""
                    }`}
                    fill={isActive ? "yellow" : "none"}
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

            <button
              onClick={handleFeedbackSubmit}
              disabled={feedbackLoading}
              className={`border border-black dark:border-white px-4 py-2 rounded transition flex justify-center items-center ${
                feedbackLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-blue-500 hover:text-white"
              }`}
            >
              {feedbackLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help;
