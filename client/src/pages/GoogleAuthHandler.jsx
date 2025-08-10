import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../context/Auth";

const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");


    // Exit early if missing params
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);

    fetch(`${import.meta.env.VITE_BASE_URL}/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data && data._id) {
          login(data)
          navigate("/home");
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .catch((err) => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      Logging you in with Google...
    </div>
  );
};

export default GoogleAuthHandler;
