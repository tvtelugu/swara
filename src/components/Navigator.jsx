import { GoHome, GoHomeFill } from "react-icons/go";
import { IoCompass, IoCompassOutline, IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";

const Navigator = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: <GoHome className="text-2xl" />,
      activeIcon: <GoHomeFill className="text-2xl" />,
    },
    {
      path: "/Browse",
      label: "Browse",
      icon: <IoCompassOutline className="text-2xl" />,
      activeIcon: <IoCompass className="text-2xl" />,
    },
    {
      path: "/Music",
      label: "My Music",
      icon: <IoHeartOutline className="text-2xl" />,
      activeIcon: <IoHeartSharp className="text-2xl" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center h-14 bg-white shadow-lg dark:bg-gray-800 lg:hidden">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="flex flex-col items-center justify-center w-full h-full text-sm text-gray-500 transition-colors duration-200 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
        >
          {location.pathname === item.path ? (
            <span className="text-blue-500 dark:text-blue-400">{item.activeIcon}</span>
          ) : (
            <span>{item.icon}</span>
          )}
          <span className={`text-xs font-medium mt-1 ${location.pathname === item.path ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default Navigator;
