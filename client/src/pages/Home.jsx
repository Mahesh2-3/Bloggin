import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GoNorthStar } from "react-icons/go";
import { PiArrowBendRightDownBold } from "react-icons/pi";
import useAuth from "../context/Auth";
import Blogcard from "../components/Blogcard";
import Functions from "../components/Functions";
import { useTitle } from "../context/DynamicTitle";

const Home = () => {
  useTitle("Home ");

  const { user, login, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [presentKey, setPresentKey] = useState("All");
  const [allUsers, setallUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(user?.following || []);
  // Add this above return:
  const keywordRefs = useRef({});

  const handleKeywordClick = (keyword) => {
    setPresentKey(keyword);
    keywordRefs.current[keyword]?.scrollIntoView({
      behavior: "smooth",
      inline: "center", // centers horizontally
      block: "nearest",
    });
  };

  // Filter posts based on tag or show all
  const filteredPosts =
    presentKey === "All"
      ? posts
      : posts.filter((post) => post.tags.includes(presentKey));

  const unlikedPosts = filteredPosts.filter(
    (post) => !post.likes.includes(user?._id)
  );
  const likedPosts = filteredPosts.filter((post) =>
    post.likes.includes(user?._id)
  );

  const finalPosts = [...unlikedPosts, ...likedPosts];

  const tryNew = posts
    .filter((post)=> post.author._id !== user?._id)
    .sort((a, b) => {
      const getLowestLikedTagValue = (tags) => {
        if (!tags || !Array.isArray(tags)) return 0;
        return Math.min(...tags.map((tag) => user?.likedTags?.[tag] ?? 0));
      };
      return getLowestLikedTagValue(a.tags) - getLowestLikedTagValue(b.tags);
    })
    .slice(0, 3);

  const userTopTags = Object.entries(user?.likedTags || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  let whoToFollow = (allUsers || [])
    .filter((u) => u._id !== user?._id) // exclude current user
    .filter((u) => !(user?.following || []).includes(u._id)) // exclude already following
    .map((u) => {
      const sharedInterestCount = userTopTags.filter(
        (tag) => (u.likedTags?.[tag] || 0) > 0
      ).length;
      return { ...u, interestScore: sharedInterestCount };
    })
    .sort((a, b) => b.interestScore - a.interestScore)
    .slice(0, 5);

  // Fallback: if empty, suggest top-followed users
  if (whoToFollow.length === 0) {
    whoToFollow = (allUsers || [])
      .filter((u) => u._id !== user?._id) // exclude current user
      .filter((u) => !(user?.following || []).includes(u._id)) // exclude already following
      .sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0)) // sort by followers count
      .slice(0, 5);
  }

  // Tags for filtering
  const keywords = ["All", ...Functions.predefinedTags];

  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollByAmount = 150;

  // Update arrow visibility based on scroll position
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: scrollByAmount, behavior: "smooth" });
  };

  // Fetch posts and setup scroll event on mount
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/posts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to fetch posts");
      if (user) {
        const response1 = await Functions.fetchUser(user?._id);
        login(response1.data);
        const response2 = await Functions.getAllUsers();
        setallUsers(response2.data);
      }

      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();

    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", handleScroll);

    handleScroll(); // Initial check

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const FollowUser = async (toId) => {
    try {
      let res;
      if (followingIds.includes(toId)) {
        // Unfollow
        res = await Functions.handleUnFollow(toId);
        if (res.statusText === "OK") {
          setFollowingIds((prev) => prev.filter((id) => id !== toId));
        }
      } else {
        // Follow
        res = await Functions.handleFollow(toId);
        if (res.statusText === "OK") {
          setFollowingIds((prev) => [...prev, toId]);
        }
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-auto pt-[70px] bg-white dark:bg-black text-black dark:text-white">
      <Navbar />

      <div className="lg:w-[60%] w-full flex mx-auto px-4 h-[1000px] ">
        <div className="sm:w-[65%] w-full overflow-y-scroll hide-scrollbar sm:border-r-1  border-gray-500/30 dark:border-gray-50/50 relative ">
          <div className="sticky w-full pt-10 top-0 bg-white dark:bg-black z-10">
            {showLeftArrow && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 z-10 h-fit top-8 px-2 bg-white/80 py-2 dark:bg-black backdrop-blur-md rounded-r-md flex items-center"
              >
                <FaChevronLeft className="text-xl text-gray-400" />
              </button>
            )}

            <div
              className="flex gap-5 text-sm border-b-1 pb-2 border-gray-500/30 dark:border-gray-50/50 overflow-x-scroll hide-scrollbar scroll-smooth px-6"
              ref={scrollRef}
            >
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  ref={(el) => (keywordRefs.current[keyword] = el)}
                  onClick={() => handleKeywordClick(keyword)}
                  className={`whitespace-nowrap cursor-pointer ${
                    presentKey === keyword
                      ? "font-bold text-black dark:text-white"
                      : "font-normal text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {keyword}
                </span>
              ))}
            </div>

            {showRightArrow && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-8 z-10 h-fit px-2 bg-white/80 py-2 dark:bg-black backdrop-blur-md rounded-l-md flex items-center"
              >
                <FaChevronRight className="text-xl text-gray-400" />
              </button>
            )}
          </div>
          <div>
            {finalPosts.length > 0 ? (
              finalPosts
                // Sort posts based on highest likedTags value in user's data
                .sort((a, b) => {
                  const getHighestLikedTagValue = (tags) => {
                    if (!tags || !Array.isArray(tags)) return 0;
                    return Math.max(
                      ...tags.map((tag) => user?.likedTags?.[tag] || 0)
                    );
                  };

                  return (
                    getHighestLikedTagValue(b.tags) -
                    getHighestLikedTagValue(a.tags)
                  );
                })
                .map((post) => <Blogcard key={post._id} blog={post} />)
            ) : (
              <div className="mt-10 mx-auto w-fit text-gray-700 dark:text-gray-300">
                No Posts Found
              </div>
            )}
          </div>
        </div>

        <div className="w-[35%] sm:block hidden">
          <div className="flex p-6 flex-col gap-6">
            <h1 className="font-semibold flex items-center gap-2">
              Try New{" "}
              <PiArrowBendRightDownBold size={16} className="relative top-1" />
            </h1>
            {tryNew.map((post, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 object-contain rounded-full"
                    src={post.author.profilePic}
                    alt="Profile"
                  />
                  <Link to={`/${post.author.username}`}>
                    <div className="text-gray-500 cursor-pointer hover:underline dark:text-gray-400 text-sm">
                      {post.author.name}
                    </div>
                  </Link>
                </div>
                <Link to={`/post/${post._id}`}>
                  <div className="hover:underline text-semibold text-xl break-all text-ellipsis line-clamp-1">
                    {post.title}
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <GoNorthStar size={15} fill="#ffc017" />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {post.createdAt.split("T")[0]}
                  </span>
                </div>
              </div>
            ))}
            {tryNew.length == 0 && (
              <div className="p-5 text-gray-600 dark:text-gray-400">
                No Posts Found
              </div>
            )}
          </div>
          <div className="p-6 border-t border-gray-500/10 dark:border-gray-50/50 pt-4">
            <h1 className="font-semibold mb-5 flex items-center gap-2">
              Recommended Topics{" "}
              <PiArrowBendRightDownBold size={16} className="relative top-1" />
            </h1>
            <div className="flex flex-wrap gap-x-3 gap-y-5 items-center">
              {Object.entries(user?.likedTags || {})
                .sort(([, a], [, b]) => b - a) // sort descending
                .slice(0, 10)
                .map(([tag], index) => (
                  <div
                    key={index}
                    onClick={() => handleKeywordClick(tag)}
                    className="py-1 px-4 text-sm bg-gray-200 dark:bg-gray-800 rounded-2xl w-fit cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
                  >
                    {tag}
                  </div>
                ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-500/10 dark:border-gray-50/50">
            <h1 className="font-semibold mb-5">
              Who to Follow
              {whoToFollow.map((user, index) => (
                <div key={index} className="flex items-center gap-2 my-4">
                  <Link to={`/${user.username}`}>
                    <img
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full"
                      src={user.profilePic}
                      alt="Profile"
                    />
                  </Link>
                  <div className="text-sm w-[50%]">
                    <div className="break-all text-ellipsis line-clamp-1">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all text-ellipsis line-clamp-1">
                      {user.username}
                    </div>
                  </div>
                  <div
                    onClick={() => FollowUser(user._id)}
                    className={`px-3 py-1 text-sm rounded-2xl border-1 cursor-pointer border-gray-800 dark:border-gray-300`}
                  >
                    {followingIds.includes(user._id) ? "Unfollow" : "Follow"}
                  </div>
                </div>
              ))}
              {whoToFollow.length == 0 && (
                <div className="p-5 text-gray-600 dark:text-gray-400">
                  No users to Follow
                </div>
              )}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
