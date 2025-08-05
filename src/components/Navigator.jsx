import { GoHome, GoHomeFill } from "react-icons/go";
import { IoCompass, IoCompassOutline, IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Navigator = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for the 'dark' class on the body element when the component mounts
    const checkTheme = () => {
      setIsDarkMode(document.body.classList.contains('dark'));
    };

    checkTheme();

    // Create a MutationObserver to listen for changes to the body's class list
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Clean up the observer when the component unmounts
    return () => observer.disconnect();
  }, []);

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
    <div className={`fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center h-14 shadow-lg lg:hidden 
                     ${isDarkMode ? 'bg-[#283e51]' : 'bg-white'}`}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center w-full h-full text-sm transition-colors duration-200 
                      ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'}`}
        >
          {location.pathname === item.path ? (
            <span className={isDarkMode ? 'text-blue-400' : 'text-blue-500'}>{item.activeIcon}</span>
          ) : (
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{item.icon}</span>
          )}
          <span className={`text-xs font-medium mt-1 
                           ${location.pathname === item.path ? 
                             (isDarkMode ? 'text-blue-400' : 'text-blue-500') : 
                             (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default Navigator;
