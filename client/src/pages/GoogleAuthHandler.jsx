import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../context/Auth";
import {useMessage} from "../context/MessageContext"
import { AiOutlineLoading } from "react-icons/ai";


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
    <div style={{ textAlign: "center", marginTop: "3rem" }} className="bg-black min-w-screen min-h-screen h-full w-full flex items-center gap-4 justify-center text-white">
      Logging you in with Google
        <AiOutlineLoading size={30} strokeWidth={3} className="animate-spin" />{" "}
    </div>
  );
};

export default GoogleAuthHandler;
