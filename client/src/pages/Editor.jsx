import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Navbar from "../components/Navbar";
import { UploadCloud, X } from "lucide-react";
import { useMessage } from "../context/MessageContext";
import useAuth from "../context/Auth";
import { useNavigate, useParams } from "react-router-dom";
import Functions from "../components/Functions";

const CreatePost = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const { postId } = useParams();
  const { user } = useAuth();

  const [postData, setPostData] = useState({
    title: "",
    description: "",
    content: "",
    coverImage: "",
    coverImageId: "",
  });

  const [preview, setPreview] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState({ uploading: false, deleting: false });

  
  const handleChange = (field, value) => {
    setPostData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length === 1) {
        showMessage("You must select at least one tag.", "#2d2e2e");
        return;
      }
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 4) {
        showMessage("Maximum 4 tags allowed.", "#2d2e2e");
        return;
      }
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading((l) => ({ ...l, uploading: true }));

    try {
      const res = await Functions.handleImageUpload(file, showMessage);

      setPostData((prev) => ({
        ...prev,
        coverImage: res.data.secure_url,
        coverImageId: res.data.public_id,
      }));
      setPreview(res.data.secure_url);
      showMessage("Image uploaded successfully!", "#00d300");
    } catch (err) {
      showMessage("Image upload failed.", "#e3101e");
    } finally {
      setLoading((l) => ({ ...l, uploading: false }));
    }
  };

  const handleRemoveImage = async () => {
    if (!postData.coverImageId) return;

    setLoading((l) => ({ ...l, deleting: true }));

    try {
      const res = await Functions.handleRemoveImage(
        postData.coverImageId,
        showMessage
      );
      setPostData((prev) => ({
        ...prev,
        coverImage: "",
        coverImageId: "",
      }));
      setPreview(null);
      showMessage("Image removed.", "#00d300");

      // 3. Update the post on the server
      if (postId) {
        await fetch(`${import.meta.env.VITE_BASE_URL}/api/posts/${postId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            coverImage: "",
            coverImageId: "",
          }),
        });
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
      showMessage("Failed to delete image.", "#e3101e");
    } finally {
      setLoading((l) => ({ ...l, deleting: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, content, coverImage, coverImageId } = postData;

    if (!title || !description || !content || !coverImage || !coverImageId) {
      showMessage("Please fill in all fields.", "#e3101e");
      return;
    }

    if (selectedTags.length === 0) {
      showMessage("Please select at least one tag.", "#2d2e2e");
      return;
    }

    const post = {
      author: user._id,
      title,
      description,
      content,
      tags: selectedTags,
      coverImage,
      coverImageId,
      userProfile: user.profilePic,
    };

    try {
      const url = postId
        ? `${import.meta.env.VITE_BASE_URL}/api/posts/${postId}`
        : `${import.meta.env.VITE_BASE_URL}/api/posts`;

      const method = postId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(post),
      });

      const result = await res.json();

      if (res.ok) {
        showMessage(
          postId ? "Post updated successfully!" : "Post created successfully!",
          "#00d300"
        );
        if (!postId) {
          setPostData({
            title: "",
            description: "",
            content: "",
            coverImage: "",
            coverImageId: "",
          });
          setPreview(null);
          setSelectedTags([]);
        }
        navigate("/home");
      } else {
        showMessage(result.message, "#e3101e");
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      showMessage("Failed to save post.", "#e3101e");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (postId) {
        const res = await Functions.fetchPost(postId, showMessage);
        setPostData({
          title: res.data.title,
          description: res.data.description,
          content: res.data.content,
          coverImage: res.data.coverImage,
          coverImageId: res.data.coverImageId, // Since it's already uploaded
        });
        setPreview(res.data.coverImage);
        setSelectedTags(res.data.tags || []);
      }
    };
    fetchData();
  }, [postId]);

  const modules = {
    toolbar: [
      ["bold", "italic", "blockquote", "link"],
      [{ header: [1, 2, false] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  return (
    <div className="min-h-screen pt-[70px] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-4 py-8 space-y-6"
      >
        <input
          type="text"
          value={postData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Title"
          className="w-full text-4xl font-bold bg-transparent border-b outline-none"
        />

        <textarea
          value={postData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Short description..."
          className="w-full text-lg p-3 rounded-md border"
        />

        {/* Cover Image Upload */}
        <div className="mb-4">
          <label className="block font-medium mb-2">Cover Image</label>
          <div className="flex items-center gap-4">
            {preview && (
              <div className="relative w-16 h-16">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={loading.deleting}
                  className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1 shadow hover:bg-red-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <label
              className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md text-sm transition
              ${
                postData.coverImage
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <UploadCloud size={18} />
              <span>Choose Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading.uploading || postData.coverImage}
              />
            </label>
          </div>
          {loading.uploading && (
            <p className="text-sm text-gray-400">Uploading Image...</p>
          )}
          {loading.deleting && (
            <p className="text-sm text-red-400">deleting Image...</p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-2">Content</label>
          <div className="bg-white h-[300px] overflow-y-auto text-black dark:text-white dark:bg-[#1e1e1e] rounded-md p-2">
            <div className="min-w-full">
              <ReactQuill
                theme="snow"
                value={postData.content}
                onChange={(value) => handleChange("content", value)}
                placeholder="Write your story here..."
                modules={modules}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-medium mb-2">Select Tags (1–4)</label>
          <div className="flex flex-wrap gap-2">
            {Functions.predefinedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full border text-sm transition
                  ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                  }`}
                disabled={
                  !selectedTags.includes(tag) && selectedTags.length >= 4
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-black dark:bg-white px-6 py-2 rounded text-white dark:text-black transition"
        >
          {postId ? "Update Post" : "Publish Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
