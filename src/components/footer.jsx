import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // New list of top artists as requested.
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
    <footer className="bg-gray-900 text-gray-400 py-12 px-6 lg:px-24">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Top Artists section */}
        <div className="mb-8 md:mb-0">
          <h4 className="text-white text-lg font-bold mb-4">TOP ARTISTS</h4>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-2">
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
        <div className="text-center md:text-right">
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
