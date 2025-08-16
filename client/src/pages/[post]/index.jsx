import React, { useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { TiHeartFullOutline, TiHeartOutline } from "react-icons/ti";
import { FaRegComment } from "react-icons/fa";
import Functions from "../../components/Functions";
import useAuth from "../../context/Auth";
import { IoCloseOutline } from "react-icons/io5";
import { VscSend } from "react-icons/vsc";
import { BsThreeDots } from "react-icons/bs";
import { LiaEditSolid } from "react-icons/lia";
import { MdOutlineDelete } from "react-icons/md";
import { useMessage } from "../../context/MessageContext";
import { FiEdit3 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../../context/DynamicTitle";

const PostPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { user } = useAuth();
  const [PostData, setPostData] = useState(null);
  const [liked, setLiked] = useState(false);
  const [Following, setFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(null);
  const [comments, setComments] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentMenu, setCommentMenu] = useState(null);
  const { showMessage } = useMessage();
  const [editMode, setEditMode] = useState({ istrue: false, id: null });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useTitle(`${PostData?.title} `)

  const toggleCommentMenu = (id) => {
    setCommentMenu((prev) => (prev === id ? null : id));
  };

  const fetchPost = async () => {
    const res = await Functions.fetchPost(postId);
    setPostData(res.data);
  };

  const fetchComments = async () => {
    const res = await Functions.handleGetComments(postId);
    if (res.status != 200) {
      showMessage("Error fetching data!", "#ff0000");
      return;
    }
    setComments(res.data);
  };

  const addComment = async () => {
    if (commentInput.trim() == "") {
      showMessage("Write a Comment 😑..", "#383838");
      return;
    }
    let res;
    if (editMode.istrue) {
      res = await Functions.editComment(editMode?.id, commentInput);
      setEditMode({ istrue: false, id: null });
    } else {
      res = await Functions.handleAddComment(commentInput, postId);
    }
    if (res) {
      showMessage("Successfully added Comment", "#00b300");
      setCommentInput("");
      fetchComments();
    } else {
      showMessage("Error adding Comment", "#ff0000");
    }
  };

  const deleteComment = async (comment_id) => {
    setCommentMenu(false);
    const res = await Functions.handleDeleteComment(comment_id);
    fetchComments();
    if (res.status == 200) {
      showMessage("Successfully Deleted Comment", "#00b300");
    } else {
      showMessage("Error deleting Comment", "#ff0000");
    }
  };

  const editComment = (comment) => {
    setCommentMenu(false);
    setEditMode({ istrue: true, id: comment._id });
    setCommentInput(comment.content);
  };

  const DeletePost = async (postId) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      showMessage("Post deleted successfully", "#00b300");
      navigate("/home"); // Redirect to homepage
    } catch (error) {
      showMessage("Failed to delete post", "#ff0000");
      console.error(error);
    }
  };

  const FollowUser = async (toId) => {
    if (Following) {
      const res = await Functions.handleUnFollow(toId);
      if (res.status == 200) {
        setFollowing(false);
      }
    } else {
      const res = await Functions.handleFollow(toId);
      if (res.status == 200) {
        setFollowing(true);
      }
    }
    fetchPost();
  };

  const onLikeClick = async () => {
    const result = await Functions.handleLike(postId); // Await result
    console.log(result)
    if (result.status == 200) {
      setLiked(result.data.liked); // Set correct like state from response
      setLikeCount(result.data.likeCount);
    }else{
      showMessage("error adding likes","#ff0000")
    }
  };
  useEffect(() => {
    if (PostData?.author?.followers.includes(user?._id)) {
      setFollowing(true);
    }
  }, [PostData]);

  useEffect(() => {
    fetchPost();
    fetchComments();
    const likeStatus = async () => {
      const result = await Functions.getLikeStatus(postId);
      if (result.status == 200) {
        setLiked(result.data.liked); // Set correct like state from response
        setLikeCount(result.data.likeCount);
      }
    };
    likeStatus();
  }, [postId]);

  return (
    <div className="w-full pt-[40px] font-normal bg-white dark:bg-black text-black dark:text-white min-h-screen">
      <Navbar />
      <div className="flex justify-center relative">
        <div className="max-w-4xl w-full  xl:mx-0 mx-auto px-4 pt-16">
          <div className="flex flex-col gap-6 sm:gap-4 items-start mb-10 w-full">
            <div className="flex w-full justify-between items-start">
              <div className="flex gap-4">
                <Link to={`/${PostData?.author?.username}`}>
                  <img
                    referrerPolicy="no-referrer"
                    src={PostData?.author?.profilePic}
                    alt="Profile"
                    className="w-20 h-20 cursor-pointer object-cover"
                  />
                </Link>
                <div className="flex flex-col gap-0">
                  <span className="text-2xl font-bold">
                    {PostData?.author?.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {PostData?.author?.username}
                  </span>
                </div>
              </div>
              <button
                onClick={() => FollowUser(PostData?.author?._id)}
                className="mt-2 sm:mt-0 px-4 py-1 text-sm sm:text-md bg-black dark:bg-white text-white dark:text-black rounded-full border border-gray-800 dark:border-gray-300 hover:opacity-80 transition"
              >
                {Following ? "Un Follow" : "Follow"}
              </button>
            </div>

            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{PostData?.author?.followers.length} Followers</span>
              <span>{PostData?.author?.following.length} Following</span>
            </div>
          </div>
          {PostData?.author._id == user?._id && (
            <div className="flex gap-2 items-center justify-end">
              <Link to={`/edit/${PostData?._id}`}>
                <button className="group flex items-center bg-white text-black px-3 py-2 rounded-full transition-all gap-2 duration-300 lg:hover:px-5">
                  <FiEdit3 className="text-lg transition-transform duration-500" />
                  <span
                    className="ml-2 text-sm whitespace-nowrap transition-all duration-500 
                              max-w-xs overflow-hidden 
                              md:max-w-0 md:group-hover:max-w-xs"
                  >
                    Edit Post
                  </span>
                </button>
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="group flex items-center bg-white text-black px-3 py-2 rounded-full transition-all gap-2 duration-300 lg:hover:px-5"
              >
                <MdOutlineDelete className="text-xl transition-transform duration-500" />
                <span
                  className="ml-2 text-sm whitespace-nowrap transition-all duration-500 
                                          max-w-xs overflow-hidden 
                                           md:max-w-0 md:group-hover:max-w-xs"
                >
                  Delete Post
                </span>
              </button>
            </div>
          )}
          <div className="flex flex-col gap-3 mt-14">
            <h1 className="text-2xl sm:text-4xl font-bold">
              {PostData?.title}
            </h1>
            <p className="text-md sm:text-lg">{PostData?.description}</p>
          </div>

          <div className="flex gap-5 flex-col">
            <img
              className="w-auto h-auto mx-auto mt-8"
              src={PostData?.coverImage}
              alt={PostData?.title}
            />
            <div className="flex items-center justify-between gap-4 text-md text-gray-500 dark:text-gray-400">
              <div className="flex gap-6 text-lg ">
                <span
                  onClick={() => onLikeClick()}
                  className="select-none cursor-pointer flex gap-1 items-center"
                >
                  {liked ? (
                    <TiHeartFullOutline size={22} fill="#ff0000" />
                  ) : (
                    <TiHeartOutline size={22} />
                  )}
                  {likeCount ?? 0}
                </span>
                <span
                  onClick={() => {
                    setCommentsOpen(!commentsOpen);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="cursor-pointer flex gap-1 items-center"
                >
                  <FaRegComment size={20} className="z-0 scale-x-[-1]" />
                  {comments?.length}
                </span>
              </div>
              <span>Posted: {PostData?.updatedAt.split("T")[0]}</span>
            </div>
            <div className="flex gap-3 items-center  mb-5">
            {PostData?.tags.map((tag,index)=> <span key={index} className="text-sm text-blue-600">
              #{tag}
            </span>)}</div>
            {PostData && (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: PostData?.content }}
              />
            )}
          </div>
        </div>
        {commentsOpen && (
          <div className="rounded-md text-black xl:relative absolute w-full sm:w-[400px] bg-white min-h-screen  top-42 xl:top-0 right-0 p-4 px-6">
            <IoCloseOutline
              onClick={() => {
                setCommentsOpen(false);
                setCommentInput("");
                setEditMode({ istrue: false, id: null });
              }}
              size={30}
              className="absolute right-4 text-black  cursor-pointer"
            />
            <br />
            <div className="mt-12 w-full flex flex-col gap-6 items-end">
              {/* Comment Input Box */}
              <div className="w-full flex flex-col gap-2 items-end">
                <textarea
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="bg-[#fffdd0cb] w-full p-3 h-[80px] rounded-md resize-none"
                />
                <div
                  onClick={addComment}
                  className="bg-black text-white cursor-pointer py-2 px-4 rounded-md flex items-center gap-2"
                >
                  Post <VscSend />
                </div>
              </div>

              {/* Comment List */}
              <div className="w-full h-[70vh] hide-scrollbar overflow-y-auto flex flex-col gap-5 pr-2 mt-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex  items-start gap-4 border-b pb-4"
                    >
                      <img
                        referrerPolicy="no-referrer"
                        src={comment.user.profilePic || "/default-avatar.png"}
                        alt={comment.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col gap-1 pt-2 w-full">
                        <div className="flex items-center justify-between">
                          <div className="text-sm flex gap-2 items-center mb-2 font-medium">
                            <span>@{comment.user.username}</span>
                            <span className="text-xs text-gray-400">
                              • {Functions.getTimeAgo(comment?.createdAt)}
                            </span>
                          </div>

                          {comment.user._id === user._id && (
                            <span className="relative">
                              <BsThreeDots
                                onClick={() => toggleCommentMenu(comment._id)}
                                className="cursor-pointer"
                              />
                              {commentMenu === comment._id && (
                                <span className="flex gap-3 absolute right-2 top-6 bg-[#fff9e7] rounded-md z-10 p-2">
                                  <LiaEditSolid
                                    onClick={() => editComment(comment)}
                                    className="cursor-pointer"
                                  />
                                  <MdOutlineDelete
                                    onClick={() => deleteComment(comment._id)}
                                    className="cursor-pointer"
                                  />
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-sm dark:text-gray-700 text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 mt-4 text-center w-full">
                    No comments yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
          <div className="bg-white text-black dark:bg-[#1e1e1e] dark:text-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">
              Are you sure you want to delete this post?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              This action{" "}
              <span className="text-red-600 font-semibold">
                cannot be undone.
              </span>
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  DeletePost(postId);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPage;
