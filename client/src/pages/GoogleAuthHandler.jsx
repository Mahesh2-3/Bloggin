import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../context/Auth";
import {useMessage} from "../context/MessageContext"

const GoogleAuthHandler = () => {
  const {showMessage} = useMessage();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const message = searchParams.get("message");


    // Exit early if missing params
    if (!token || !userId) {
      navigate("/login");
      return;
    }
    if(message == "newAccount"){
      showMessage("Password Send to your email, Make sure to change it in profile Settings","#00b300")
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
