import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../context/Auth";
import { useSearchParam } from "../context/Searchcontext";
import ThemeSwitch from "./ThemeSwitch";
import { useState, useRef, useEffect } from "react";
import {
  AiOutlinePlus,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineQuestionCircle,
  AiOutlineGithub,
  AiOutlineHome,
  AiOutlineSetting,
} from "react-icons/ai";
import { CiDark, CiLight, CiSearch } from "react-icons/ci";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { theme } = useTheme();
  const searchInputRef = useRef();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dashBoard, setDashBoard] = useState(false);
  const { searchParam, setSearchParam } = useSearchParam();

  function maskEmail(email) {
    const [name, domain] = email.split("@");
    if (name.length <= 2) return "*".repeat(name.length) + "@" + domain;
    return `${name.slice(0, 2)}${"*".repeat(name.length - 2)}@${domain}`;
  }

  const isHome = pathname.includes("/home");
  const isEdit = pathname.includes("/edit");
  const isSearch = pathname.includes("/search");

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-sm dark:bg-black/40 border-b border-gray-400/30 dark:border-white/10 m-0 p-0 flex items-center justify-center">
      {isSearch && (
        <div className="flex bg-white/50 dark:bg-black border border-[#5f5f5f] px-4 z-10 py-2 rounded-3xl items-center absolute sm:top-2 top-16">
          <CiSearch size={20} strokeWidth={0.5} />
          <input
            ref={searchInputRef}
            className="w-[250px] rounded-xl ml-2 outline-none placeholder-gray-600 dark:placeholder-gray-400"
            placeholder="Search..."
            type="search"
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
          />
        </div>
      )}
      <div className="flex justify-between items-center w-full px-4 md:px-6 py-3 border-b border-gray-400/30 dark:border-white/10 text-black dark:text-white relative">
        <Link to="/home" className="font-bold main-font text-2xl sm:text-3xl">
          Bloggin'
        </Link>

        {/* Show search bar on home or search pages */}

        {!isSearch && (
          <div
            onClick={() => navigate("/search")}
            className="hidden sm:flex bg-gray-400/10 cursor-pointer px-4 py-2 rounded-3xl items-center"
          >
            <CiSearch size={20} strokeWidth={0.5} />
            <div className="md:w-[250px] w-[150px] select-none ml-2 text-[#4e4e4e]">
              Search...
            </div>
          </div>
        )}

        <div className="flex gap-4 sm:gap-6 items-center">
          {/* Hide Write button on edit page */}
          {!isEdit && (
            <div
              onClick={() => navigate("/edit")}
              className="flex items-center gap-1 cursor-pointer text-sm hover:underline"
            >
              <AiOutlinePlus className="relative top-[1px]" />
              <span>Write</span>
            </div>
          )}
          {!isSearch && (
            <CiSearch
              onClick={() => navigate("/search")}
              className="flex sm:hidden cursor-pointer"
              size={20}
              strokeWidth={0.5}
            />
          )}

          {/* Avatar and Dropdown */}
          <div className="relative">
            <img
              referrerPolicy="no-referrer"
              src={
                user?.profilePic ||
                "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg"
              }
              onClick={() => setDashBoard((prev) => !prev)}
              alt={user?.username || "Avatar"}
              className="w-9 h-9 rounded-full cursor-pointer object-cover border border-white/20"
            />
            {dashBoard && (
              <div className="absolute right-0 top-12 text-white dark:text-black mt-2 sm:w-64 w-54 bg-black  dark:bg-white  border border-black/10 dark:border-white/10 rounded-xl px-4 py-5 z-50">
                <ul className="flex flex-col gap-3">
                  {/* Profile, Theme, Help, Settings, Admin GitHub */}
                  <Link
                    to={`/${user?.username}`}
                    onClick={() => setDashBoard(false)}
                  >
                    <li className="flex items-center gap-2 cursor-pointer hover:underline">
                      <AiOutlineUser />
                      <span>Profile</span>
                    </li>
                  </Link>
                     <li className="flex items-center gap-2 cursor-pointer hover:underline">
                    <AiOutlineHome />
                    <Link to={`/home`}>
                      <span>Home</span>
                    </Link>
                  </li>
                  <li className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      {theme === "dark" ? <CiDark /> : <CiLight strokeWidth={1} />}
                      <span>Theme</span>
                    </div>
                    <ThemeSwitch />
                  </li>
                  <li className="flex items-center gap-2 cursor-pointer hover:underline">
                    <AiOutlineSetting />
                    <Link to={`/settings`}>
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li className="flex items-center gap-2 cursor-pointer hover:underline">
                    <AiOutlineQuestionCircle />
                    <Link to={`/help`}>
                      <span>Help</span>
                    </Link>
                  </li>
                  <li className="flex items-center gap-2 cursor-pointer">
                    <AiOutlineGithub />
                    <Link
                      target="_blank"
                      className="hover:underline flex items-center"
                      to="https://github.com/Mahesh2-3"
                    >
                      Admin GitHub
                    </Link>
                  </li>
                </ul>
                <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4">
                  <div
                    onClick={() => {
                      navigate("/");
                      logout();
                    }}
                    className="flex items-center gap-2 text-red-600 cursor-pointer hover:underline"
                  >
                    <AiOutlineLogout />
                    <span>Logout</span>
                  </div>
                  <div className="text-xs break-all">
                    {maskEmail(user?.email)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
