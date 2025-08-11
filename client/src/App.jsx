// src/routes/Routes.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import Home from "./pages/Home";
import UserPage from './pages/[username]';
import GoogleAuthHandler from './pages/GoogleAuthHandler';
import Profile from './pages/Profile';

// Context
import { useEffect } from 'react';
import { useTheme } from './context/ThemeContext';

// Auth
import ProtectedRoute from "./routes/ProtectedRoutes";
import CreatePost from './pages/Editor';
import PostPage from './pages/[post]';
import Search from './pages/Search';
import Help from './pages/Help';
import ForgotPassword from './pages/ForgotPassword';

const AppRoutes = () => {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/google-auth" element={<GoogleAuthHandler />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={<ProtectedRoute><Home /></ProtectedRoute>}
        />
        <Route
          path="/search"
          element={<ProtectedRoute><Search /></ProtectedRoute>}
        />
          <Route path="/edit" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/edit/:postId" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/:username" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
          <Route path="/post/:postId" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
