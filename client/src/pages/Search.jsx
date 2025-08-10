import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useSearchParam } from "../context/Searchcontext";
import Blogcard from "../components/Blogcard";
import Functions from "../components/Functions";

const Search = () => {
  const { searchParam } = useSearchParam();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchPostsAndUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/posts`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data);

        const response = await Functions.getAllUsers();
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    fetchPostsAndUsers();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchParam.toLowerCase())
  );
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchParam.toLowerCase()) ||
      u.name.toLowerCase().includes(searchParam.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-[70px] bg-white dark:bg-black text-black dark:text-white">
      <Navbar />

      <div className="md:w-[700px] w-full flex flex-col mx-auto px-4">
        {searchParam.trim() !== "" && (
          <div className="flex gap-4 border-b border-gray-500/30 dark:border-gray-50/50 pt-6 mb-6">
            <button
              className={`pb-2 border-b-2 ${
                activeTab === "posts"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              className={`pb-2 border-b-2 ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>
          </div>
        )}

        <div className="w-full relative">
          {activeTab === "posts" && (
            <>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Blogcard key={post._id} blog={post} />
                ))
              ) : (
                <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No posts found.
                </p>
              )}
            </>
          )}

          {activeTab === "users" && (
            <>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-4 p-3 border-b border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={u.profilePic || "/default-avatar.png"}
                      alt={u.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-gray-500">@{u.username}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No users found.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
