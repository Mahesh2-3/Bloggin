import axios from "axios";

const fetchPost = async (postId, showMessage) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.status !== 200) {
      showMessage("Failed to fetch post data.", "#e3101e");
      return null;
    }

    return res;
  } catch (err) {
    showMessage("Failed to fetch post data.", "#e3101e");
    return null;
  }
};
const fetchUser = async (userId) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/users/${userId}`
    );
    return res;
  } catch (err) {
    console.error("Failed to fetch user data", err);
  }
};
const predefinedTags = [
  "AI",
  "Art",
  "Blockchain",
  "Books",
  "Business",
  "Career",
  "Coding",
  "Culture",
  "Cryptocurrency",
  "Data Science",
  "Design",
  "DevOps",
  "Education",
  "Entertainment",
  "Environment",
  "Events",
  "Fashion",
  "Finance",
  "Food",
  "Freelancing",
  "Gaming",
  "Health",
  "History",
  "Lifestyle",
  "Life",
  "Machine Learning",
  "Marketing",
  "Mental Health",
  "Mobile Development",
  "Motivation",
  "Movies",
  "Music",
  "News",
  "Parenting",
  "Pets",
  "Philosophy",
  "Photography",
  "Politics",
  "Productivity",
  "Product Reviews",
  "Programming",
  "Relationships",
  "Remote Work",
  "Science",
  "Self Improvement",
  "Spirituality",
  "Sports",
  "Startup",
  "Sustainability",
  "Technology",
  "Travel",
  "UX/UI",
  "Web Development",
  "Writing"
];



  const getAllUsers = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/users`
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch users", error);
  }
};

const handleLike = async (postId) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/likes/${postId}`,
      {}, // no need for userId in body if backend reads from token
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    // You can also update your local UI state here:
    return response; // true = liked, false = unliked
  } catch (error) {
    console.error(
      "Error toggling like:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};

const handleFollow = async (toId) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/users/${toId}/follow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res;
  } catch (error) {
    console.error(
      "Error Following user",
      error.response?.data?.message || error.message
    );
    return null;
  }
};

const handleUnFollow = async (toId) => {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_BASE_URL}/api/users/${toId}/unfollow`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return res;
  } catch (error) {
    console.error(
      "Error unFollowing User:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};
const handleAddComment = async (commentInput, postId) => {
  if (!commentInput.trim()) return false;

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/comments/${postId}`,
      { content: commentInput },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return true;
  } catch (err) {
    console.error("Error adding comment:", err);
    return false;
  }
};

const editComment = async (commentId, newContent) => {
  try {
    const res = await axios.put(
      `${import.meta.env.VITE_BASE_URL}/api/comments/${commentId}`,
      { content: newContent },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res;
  } catch (error) {
    throw error.response?.data?.message || "Failed to edit comment";
  }
};

const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now - past) / 1000); // in seconds

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w`;
  return `${Math.floor(diff / 2592000)}mo`;
};

const handleDeleteComment = async (commentId) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_BASE_URL}/api/comments/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    // You can also update your local UI state here:
    return response;
  } catch (error) {
    console.error(
      "Error toggling like:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};

const handleGetComments = async (postId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/comments/${postId}`,
      {}, // no need for userId in body if backend reads from token
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    // You can also update your local UI state here:
    return response;
  } catch (error) {
    return null;
  }
};

const getLikeStatus = async (postId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/likes/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    return false;
  }
};

const handleImageUpload = async (file, showMessage) => {
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    if (res.status !== 200) {
      showMessage("Failed to fetch post data.", "#e3101e");
      return null;
    }
    return res;
  } catch (err) {
    showMessage("Image upload failed.", "#e3101e");
    return null;
  }
};

const handleRemoveImage = async (coverImageId, showMessage) => {
  try {
    // 1. Delete from cloud storage
    const res = await axios.delete(
      `${import.meta.env.VITE_BASE_URL}/api/upload`,
      {
        data: { public_id: coverImageId },
      }
    );
    if (res.status !== 200) {
      showMessage("Failed to fetch post data.", "#e3101e");
      return null;
    }
    return res;
  } catch (err) {
    showMessage("Failed to delete image.", "#e3101e");
    return null;
  }
};

export default {
  handleLike,
  handleFollow,
  handleUnFollow,
  getLikeStatus,
  handleDeleteComment,
  handleAddComment,
  getTimeAgo,
  editComment,
  handleGetComments,
  fetchPost,
  fetchUser,
  handleImageUpload,
  handleRemoveImage,
  predefinedTags,
  getAllUsers
};
