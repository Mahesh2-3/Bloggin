import { useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { FaRegComment } from "react-icons/fa";
import { GoNorthStar } from "react-icons/go";
import { TiHeartFullOutline, TiHeartOutline } from "react-icons/ti";
import { Link } from "react-router-dom";
import Functions from "./Functions";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/Auth";

const Blogcard = ({ blog }) => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const isMobile = useMediaQuery("(max-width:640px)");
  const [likeStatus, setlikeStatus] = useState(false);
  const [likeCount, setlikeCount] = useState(blog?.likes.length || 0);

  const onLikeClick = async () => {
    const result = await Functions.handleLike(blog?._id); // Await result
    if (result.statusText == "OK") {
      setlikeStatus(result.data.liked); // Set correct like state from response
      setlikeCount(result.data.likeCount); // Update like count
    }
  };

  useEffect(() => {
    const LikeStatus = async () => {
      const res = await Functions.getLikeStatus(blog?._id);
      setlikeStatus(res.data.liked);
    };
    LikeStatus();
  }, [blog]);

  if (isMobile) {
    return (
      <div
        key={blog._id}
        className="border-b flex flex-col items-start px-2 gap-2 py-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <img
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover"
            src={blog.author.profilePic}
            alt="Profile"
          />
          <Link to={`/${blog.author.username}`}>
            <span className="text-sm hover:underline cursor-pointer">
              {blog.author.name}
            </span>
          </Link>
        </div>
        <Link to={`/post/${blog._id}`}>
          <h3 className="text-2xl hover:underline font-semibold break-all line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <img
          className="w-full max-h-[400px] h-fit object-cover rounded-md"
          src={blog.coverImage}
          alt={blog.title}
        />

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {blog.description}{" "}
          <Link
            to={`/post/${blog._id}`}
            className="underline text-black dark:text-[#bebebe]"
          >
            see more...
          </Link>
        </p>

        <div className="flex items-center gap-4 text-xs my-2 text-gray-500 dark:text-gray-400">
          <GoNorthStar size={20} fill="#ffc017" />
          <span>{blog.updatedAt.split("T")[0]}</span>
          <span
            onClick={() => onLikeClick()}
            className="flex cursor-pointer gap-1 items-center"
          >
            {likeStatus ? (
              <TiHeartFullOutline size={15} fill="#ff0000" />
            ) : (
              <TiHeartOutline size={15} />
            )}
            {likeCount}
          </span>
          <span
            onClick={() => navigate(`/post/${blog._id}`)}
            className="flex cursor-pointer gap-1 items-center"
          >
            <FaRegComment size={15} className="scale-x-[-1]" />
            {blog.comments.length}
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div
        key={blog._id}
        className="border-b flex flex-col-reverse sm:flex-row items-center px-2 gap-2 border-gray-500/10 dark:border-gray-50/50 py-4"
      >
        <div className="sm:w-[75%] w-full">
          <div className="flex items-center gap-3 mb-2">
            <img
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover"
              src={blog.author.profilePic}
              alt="Profile"
            />
            <Link to={`/${blog.author.username}`}>
              <span className="text-sm hover:underline cursor-pointer">
                {blog.author.name}
              </span>
            </Link>
          </div>

          <Link to={`/post/${blog._id}`}>
            <h3 className="text-2xl hover:underline font-semibold line-clamp-2">
              {blog.title}
            </h3>
          </Link>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {blog.description}
          </p>

          <div className="flex items-center gap-4 text-xs my-2 text-gray-500 dark:text-gray-400">
            <GoNorthStar size={20} fill="#ffc017" />
            <span>{blog.updatedAt.split("T")[0]}</span>
            <span
              onClick={() => onLikeClick()}
              className="flex gap-1 cursor-pointer items-center"
            >
              {likeStatus ? (
                <TiHeartFullOutline size={15} fill="#ff0000" />
              ) : (
                <TiHeartOutline size={15} />
              )}
              {likeCount}
            </span>
            <span
              onClick={() => navigate(`/post/${blog._id}`)}
              className="cursor-pointer flex gap-1 items-center"
            >
              <FaRegComment size={15} className="scale-x-[-1]" />
              {blog.comments.length}
            </span>
          </div>
        </div>

        <div className="sm:w-[25%] w-full h-full ">
          <img
            className="sm:w-[150px] w-[200px] sm:h-[150px] h-[200px] mx-auto object-contain"
            src={blog.coverImage}
            alt={blog.title}
          />
        </div>
      </div>
    );
  }
};

export default Blogcard;
