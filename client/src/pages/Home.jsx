import React, { useRef, useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import { useSearchParam } from '../context/Searchcontext';
import { FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import { GoNorthStar } from "react-icons/go";
import { PiArrowBendRightDownBold } from "react-icons/pi";
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../context/Auth';
import Blogcard from '../components/Blogcard';
import Functions from '../components/Functions';


const Home = () => {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const { searchParam } = useSearchParam();
  const [posts, setposts] = useState([])
  const [Presenykey, setPresenykey] = useState("All")
  const FilteredTasks = Presenykey == "All" ? posts : posts.filter((post) => post.tags.includes(Presenykey))
  const keywords = [
    "All", ...Functions.predefinedTags
  ];

  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollByAmount = 150;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -scrollByAmount, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: scrollByAmount, behavior: 'smooth' });
  };

  useEffect(() => {

  const fetchPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/posts`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await res.json();
        setposts(data);
        console.log(data)
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();

    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);

    handleScroll(); // Initial check

    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };

  }, []);


  return (
    <div className='w-full pt-[70px] bg-white dark:bg-black text-black dark:text-white'>
      <Navbar />

      <div className='lg:w-[60%] w-full flex mx-auto px-4'>
        <div className='sm:w-[65%] w-full border-r-1 pt-10  border-gray-500/30 dark:border-gray-50/50 relative'>
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 z-10 h-fit top-8 px-2 bg-white/80 py-2 dark:bg-black backdrop-blur-md rounded-r-md flex items-center"
            >
              <FaChevronLeft className="text-xl text-gray-400" />
            </button>
          )}

          <div
            className='flex gap-5 text-sm border-b-1 pb-2 border-gray-500/30 dark:border-gray-50/50 overflow-x-scroll hide-scrollbar scroll-smooth px-6'
            ref={scrollRef}
          >
            {keywords.map((keyword, index) => (
              <span key={index} onClick={() => setPresenykey(keyword)} className={`whitespace-nowrap cursor-pointer  ${Presenykey == keyword ? "font-bold text-black dark:text-white" : "font-normal text-gray-700 dark:text-gray-300"}`}>
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
          <div>
            {FilteredTasks.map((post) => (
             <Blogcard key={post._id} blog={post}/>
            ))}
            {FilteredTasks.length == 0 && <div className='mt-10 mx-auto w-fit text-gray-700 dark:text-gray-300'>
              No Posts Found
            </div>}
          </div>
        </div>
        <div className='w-[35%] sm:block hidden'>
          <div className='flex p-6 flex-col gap-6'>
            <h1 className='font-semibold flex items-center gap-2'>Best Picks <PiArrowBendRightDownBold size={16} className='relative top-1' />
            </h1>
            {posts.slice(0, 3).map((post, index) => (
              <div key={index} className='flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <img referrerPolicy="no-referrer" className='h-8 w-8 rounded-full' src={post.author.profilePic} alt="Profile" />
                  <Link to={`/${post.author.username}`}><div className=' text-gray-500 cursor-pointer hover:underline dark:text-gray-400 text-sm'>{post.author.name}</div></Link>
                </div>
                   <Link to={`/post/${post._id}`}><div className='hover:underline text-semibold text-xl break-all text-ellipsis line-clamp-1'>{post.title}</div></Link>
                <div className='flex items-center gap-4'>
                  <GoNorthStar size={15} fill='#ffc017' />
                  <span className='text-gray-500 dark:text-gray-400 text-sm'>{post.createdAt.split("T")[0]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className='p-6 border-t border-gray-500/10 dark:border-gray-50/50 pt-4 '>
            <h1 className='font-semibold mb-5 flex items-center gap-2'>Recommended Topics <PiArrowBendRightDownBold size={16} className='relative top-1' />
            </h1>
            <div className='flex flex-wrap gap-x-3 gap-y-5 items-center'>
              {keywords.slice(1,10).map((keyword, index) => (
                <div className='py-1 px-4 text-sm bg-gray-200 dark:bg-gray-800 rounded-2xl w-fit' key={index}>{keyword}</div>
              ))}
            </div>
          </div>
          <div className='p-6 border-t border-gray-500/10 dark:border-gray-50/50'>
            <h1 className='font-semibold mb-5'>Who to Follow
              {posts.slice(0, 3).map((post, index) => (
                <div key={index} className='flex items-center gap-2 my-4'>
                  
                  <Link to={`/${post.author.username}`}><img referrerPolicy="no-referrer" className='h-8 w-8 rounded-full' src={post.author.profilePic} alt="Profile" /></Link>
                  <div className='text-sm w-[50%]'>
                    <div className='break-all text-ellipsis line-clamp-1'>{post.author.name}</div>
                    <div className='text-xs text-gray-500 dark:text-gray-400 break-all text-ellipsis line-clamp-1'>{post.title}</div>
                  </div>
                  <div className='px-3 py-1 text-sm rounded-2xl border-1 border-gray-800 dark:border-gray-300'>Follow</div>
                </div>
              ))}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
