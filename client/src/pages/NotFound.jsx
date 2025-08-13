import { Link } from "react-router-dom";
import { useTitle } from "../context/DynamicTitle";

const NotFound = () => {
  useTitle("404 Not Found ")
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
      <div className="text-center p-8">
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
          Oops! Page not found.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black rounded hover:scale-105 transition-transform duration-200"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
