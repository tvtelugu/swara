import { GoHome, GoHomeFill } from "react-icons/go";
import { IoCompass, IoCompassOutline, IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";

const Navigator = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center h-16 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] lg:hidden dark:bg-gray-800 dark:shadow-[0_-4px_10px_rgba(255,255,255,0.05)]">
      
      <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-center transition-colors duration-200">
        <div className={`flex flex-col items-center text-xs font-medium ${location.pathname === "/" ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {location.pathname === "/" ? (
            <GoHomeFill className="text-2xl mb-1" />
          ) : (
            <GoHome className="text-2xl mb-1" />
          )}
          Home
        </div>
      </Link>

      <Link to="/Browse" className="flex flex-col items-center justify-center w-full h-full text-center transition-colors duration-200">
        <div className={`flex flex-col items-center text-xs font-medium ${location.pathname === "/Browse" ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {location.pathname === "/Browse" ? (
            <IoCompass className="text-2xl mb-1" />
          ) : (
            <IoCompassOutline className="text-2xl mb-1" />
          )}
          Browse
        </div>
      </Link>
      
      <Link to="/Music" className="flex flex-col items-center justify-center w-full h-full text-center transition-colors duration-200">
        <div className={`flex flex-col items-center text-xs font-medium ${location.pathname === "/Music" ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {location.pathname === "/Music" ? (
            <IoHeartSharp className="text-2xl mb-1" />
          ) : (
            <IoHeartOutline className="text-2xl mb-1" />
          )}
          My Music
        </div>
      </Link>
      
    </div>
  );
};

export default Navigator;
