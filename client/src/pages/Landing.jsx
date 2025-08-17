import { Link } from "react-router-dom";
import RippleGrid from "../animations/Ripplegrid"
import { FaExternalLinkAlt } from "react-icons/fa";


const Landing = () => {
  const words = ["Voice", "Thoughts", "Stories", "Perspective"];

  return (
    <div className="relative w-[100vw] h-[100vh] overflow-auto dark:text-white dark:bg-black font-normal">
      {/* Ripple Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <RippleGrid
          enableRainbow={true}
          gridColor="#00ffff"
          rippleIntensity={0.01}
          gridSize={15}
          gridThickness={10}
          mouseInteraction={true}
          mouseInteractionRadius={1.2}
          opacity={0.5}
        />
      </div>


      {/* Foreground Content */}
      <div className="relative z-10 xl:w-[60%] md:w-[75%] mx-auto w-full h-full p-4">
        <div className="w-full py-5 flex items-center justify-between">
          <div className="main-font text-5xl">Bloggin'</div>
          <div className="flex gap-3">
            <Link to="/signup">
              <button className="bg-black dark:bg-white hover:scale-110 transition-all ease-in-out duration-200 sm:w-[125px] w-[75px] flex items-center justify-center py-2 sm:font-bold font-semibold sm:text-base text-sm rounded-4xl text-white border-1 border-gray-400 dark:text-black">
                SignUp
              </button>
            </Link>
            <Link to="/login">
              <button className="bg-white dark:bg-black sm:w-[125px] w-[75px] hover:scale-110 transition-all ease-in-out duration-200 flex items-center justify-center py-2 sm:font-bold font-semibold sm:text-base text-sm rounded-4xl text-black border-1 border-gray-600 dark:text-white">
                Login
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-24 w-full font-semibold xl:text-6xl md:text-5xl sm:text-4xl text-2xl">
          Your{" "}
          <span className="slide mx-2">
            <span className="wrapper">
              {words.map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </span>
          </span>{" "}
          matters. Start blogging today and share your world with those who
          need to hear it.
        </div>

        <div className="mt-40 flex gap-5 w-full justify-center items-center">
          <Link to="/home">
            <button className="bg-black dark:bg-white hover:scale-110 transition-all ease-in-out duration-200 w-[175px] flex items-center justify-center py-3 font-bold rounded-4xl text-white border-1 gap-3 border-gray-400 dark:text-black">
              Try it Now <FaExternalLinkAlt size={20} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};


export default Landing;
