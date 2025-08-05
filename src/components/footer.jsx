import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
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

  return (
    <footer className="bg-gray-900 text-gray-400 py-8 px-4 lg:px-24">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Top Artists section */}
        <div className="mb-8 md:mb-0 w-full md:w-auto">
          <h4 className="text-white text-lg font-bold mb-4 text-center md:text-left">TOP ARTISTS</h4>
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
        <div className="w-full text-center md:text-right md:w-auto">
          <p className="text-sm">
            © 𝟐𝟎𝟐𝟒 || Sɯαɾα™ Made with ❤️ by{' '}
            <a
              href="https://t.me/tvtelugu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-bold"
            >
              𝐌𝐚𝐝𝐡𝐮
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
