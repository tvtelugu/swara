import { Link, useLocation } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";

// Import a new, more visually distinct icon set (e.g., from 'react-icons/ai')
import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { AiOutlineCompass, AiFillCompass } from "react-icons/ai";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

const navItems = [
  {
    path: "/",
    label: "Home",
    icon: <AiOutlineHome className="text-2xl" />,
    activeIcon: <AiFillHome className="text-2xl" />,
  },
  {
    path: "/Browse",
    label: "Browse",
    icon: <AiOutlineCompass className="text-2xl" />,
    activeIcon: <AiFillCompass className="text-2xl" />,
  },
  {
    path: "/Music",
    label: "My Music",
    icon: <AiOutlineHeart className="text-2xl" />,
    activeIcon: <AiFillHeart className="text-2xl" />,
  },
];

const Navigator = () => {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center h-16 shadow-lg lg:hidden 
                     ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full text-center transition-colors duration-300
                        ${
                          isActive
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                        }
                        hover:text-blue-500 hover:scale-110 dark:hover:text-blue-400`}
          >
            <div className="mb-1 transform transition-transform duration-300">
              {isActive ? item.activeIcon : item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default Navigator;
