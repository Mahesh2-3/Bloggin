import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import useAuth from "../../context/Auth";
import { GoNorthStar } from "react-icons/go";
import { TiHeartFullOutline, TiHeartOutline } from "react-icons/ti";
import { FaRegComment } from "react-icons/fa";
import Functions from "../../components/Functions";
import { FiEdit3 } from "react-icons/fi";
import Blogcard from "../../components/Blogcard";

const UserPage = () => {
  const { username } = useParams();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("Posts");
  const [userData, setUserData] = useState(null);
  const token = localStorage.getItem("token"); // or however you store it
  const [Posts, setPosts] = useState([]);
  const [IsFollowing, setIsFollowing] = useState(false);
  const [Followers, setFollowers] = useState([]);
  const [Following, setFollowing] = useState([]);
  const [NotFound, setNotFound] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData(res.data);

      const [postsRes, followersRes, followingRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_BASE_URL}/api/posts/user/${res.data._id}`
        ),
        fetch(
          `${import.meta.env.VITE_BASE_URL}/api/users/${res.data._id}/followers`
        ),
        fetch(
          `${import.meta.env.VITE_BASE_URL}/api/users/${res.data._id}/following`
        ),
      ]);

      const [posts, followers, following] = await Promise.all([
        postsRes.json(),
        followersRes.json(),
        followingRes.json(),
      ]);

      setPosts(posts);
      setFollowers(followers);
      setFollowing(following);
      setUserData((prev) => ({
        ...prev,
        followers,
        following,
      }));
      if (res.data.followers.includes(user._id)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
      setNotFound(false);
    } catch (err) {
      if (err.status == 404) {
        setNotFound(true);
      }
      console.error("Failed to fetch user data", err.status);
    }
  };

  const FollowUser = async (toId) => {
    if (IsFollowing) {
      const res = await Functions.handleUnFollow(toId);
      if (res.statusText == "OK") {
        setIsFollowing(false);
      }
    } else {
      const res = await Functions.handleFollow(toId);
      if (res.statusText == "OK") {
        setIsFollowing(true);
      }
    }
    fetchUser();
  };

  useEffect(() => {
    if (!loading && user) {
      fetchUser();
    }
  }, [username, loading, user]);

  if (NotFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300">
        <div className="text-center p-8">
          <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
            Oops! User not found.
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
  }
  if (!userData && !NotFound) {
    return (
      <div className="text-center pt-20 text-gray-500 dark:text-gray-300">
        Loading user...
      </div>
    );
  }

  console.log(Posts);

  return (
    <div className="w-full font-normal pt-[70px] bg-white dark:bg-black text-black dark:text-white min-h-screen">
      <Navbar />

      <div className="max-w-5xl w-full mx-auto px-4 pt-16">
        {/* Header */}
        <div className="flex flex-col relative sm:flex-row gap-6 sm:gap-4 items-start mb-10 w-full">
          <img
            referrerPolicy="no-referrer"
            src={userData?.profilePic || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 sm:w-20 sm:h-20 object-cover"
          />
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-0">
                <span className="text-2xl font-bold">{userData?.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {userData?.username}
                </span>
              </div>
              {userData?._id != user?._id && (
                <button
                  onClick={() => FollowUser(userData?._id)}
                  className="mt-2 sm:mt-0 px-4 py-1 bg-black dark:bg-white text-white dark:text-black rounded-full border border-gray-800 dark:border-gray-300 hover:opacity-80 transition"
                >
                  {IsFollowing ? "Un Follow" : "Follow"}
                </button>
              )}
            </div>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span>{userData?.posts.length} posts</span>
              <span>{userData?.followers.length} followers</span>
              <span>{userData?.following.length} following</span>
            </div>
          </div>
          {userData?._id == user?._id && (
            <button className="group flex items-center absolute right-0 bg-white text-black px-3 py-2 rounded-full transition-all gap-2 duration-300 md:hover:px-5">
              <Link className="flex gap-2" to={`/profile/edit`}>
                {" "}
                <span
                  className="ml-2 whitespace-nowrap transition-all duration-300 
                  max-w-xs overflow-hidden 
                  md:max-w-0 md:group-hover:max-w-xs"
                >
                  Edit Profile
                </span>
                <FiEdit3 className="text-xl transition-transform duration-300" />
              </Link>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-6 border-b px-2 sm:px-5 py-3 items-center justify-start mb-5">
          {["Posts", "About", "Followers", "Following"].map((item) => (
            <span
              key={item}
              onClick={() => setActiveTab(item)}
              className={`cursor-pointer transition hover:underline ${
                activeTab === item
                  ? "font-semibold text-base text-black dark:text-white"
                  : ""
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-2 sm:px-5">
          {activeTab === "Posts" && (
            <div className="flex flex-col gap-4">
              {[...Posts]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((post) => (
                  <Blogcard key={post._id} blog={post} />
                ))}

              {Posts.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                  No posts yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "About" && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: userData?.bio }}
              />
            </div>
          )}

          {activeTab === "Followers" && (
            <div className="space-y-3">
              {Followers.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center gap-3 text-sm"
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={follower.profilePic || "/default-avatar.png"}
                    alt={follower.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{follower.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      @{follower.username}
                    </p>
                  </div>
                </div>
              ))}
              {userData?.followers.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                  No followers yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "Following" && (
            <div className="space-y-3">
              {Following.map((followed) => (
                <div
                  key={followed._id}
                  className="flex items-center gap-3 text-sm"
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={followed.profilePic || "/default-avatar.png"}
                    alt={followed.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{followed.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      @{followed.username}
                    </p>
                  </div>
                </div>
              ))}
              {Following.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">
                  Not following anyone yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
