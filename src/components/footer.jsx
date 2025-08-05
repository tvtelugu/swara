import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Use state to manage the theme. Defaults to false (day theme).
  const [isNightTheme, setIsNightTheme] = useState(false);

  // Function to toggle the theme state.
  const toggleTheme = () => {
    setIsNightTheme(!isNightTheme);
  };

  // List of top artists.
  const topArtists = [
    { name: 'S.P. Balasubrahmanyam', id: '741999' },
    { name: 'Ilaiyaraaja', id: '457536' },
    { name: 'Mano', id: '455270' },
    { name: 'Devi Sri Prasad', id: '455170' },
    { name: 'A.R. Rahman', id: '456269' },
    { name: 'Chakri', id: '455307' },
    { name: 'Shankar Mahadevan', id: '455275' },
    { name: 'Thaman S', id: '544471' },
  ];

  // Conditional classes for the footer based on the theme state
  const footerClasses = isNightTheme
    ? "bg-gray-900 text-gray-400 pb-[3.6rem] md:py-8 md:px-4 lg:pb-0 lg:px-24"
    : "bg-white text-gray-700 pb-[3.6rem] md:bg-gray-900 md:py-8 md:px-4 lg:pb-0 lg:px-24";
  
  // Conditional classes for the artist text
  const artistTextClasses = isNightTheme ? "text-white" : "text-gray-900";

  // Conditional classes for the "𝐌𝐚𝐝𝐡𝐮" text
  const madhuTextClasses = isNightTheme ? "text-pink-500" : "text-black";

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Top Artists section - hidden on small screens */}
        <div className="hidden md:block md:mb-0 w-full md:w-auto">
          <h4 className={`text-lg font-bold mb-4 text-center md:text-left ${artistTextClasses}`}>TOP ARTISTS</h4>
          {/* Using flexbox for a dynamic, wrapping layout on all screen sizes */}
          <ul className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
            {topArtists.map((artist) => (
              <li key={artist.id}>
                <Link
                  to={`/artists/${artist.id}`}
                  className="text-sm hover:text-white transition-colors duration-300"
                >
                  {artist.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer info section */}
        <div className="mt-8 md:mt-0 w-full text-center">
          <p className="text-sm">
            © 𝟐𝟎𝟐𝟒 || Sɯαɾα™ Made with ❤️ by{' '}
            <a
              href="https://t.me/tvtelugu"
              target="_blank"
              rel="noopener noreferrer"
              // The color of "𝐌�𝐝𝐡𝐮" changes based on the theme state.
              className={`${madhuTextClasses} hover:underline font-bold transition-colors duration-300`}
            >
              𝐌𝐚𝐝𝐡𝐮
            </a>
          </p>
          {/* Theme switch button for mobile devices */}
          <button
            onClick={toggleTheme}
            className="md:hidden mt-4 px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-800"
          >
            Switch to {isNightTheme ? "Day" : "Night"} Theme
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
