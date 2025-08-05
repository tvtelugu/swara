import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import {
  getArtistbyQuery,
  getSearchData,
  getSongbyQuery,
  getSuggestionSong,
} from "../../fetch";
import MusicContext from "../context/MusicContext";
import he from "he";
import Theme from "../../theme";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";

const Navbar = () => {
  const { playMusic } = useContext(MusicContext);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();
  const searchBarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsSearchActive(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  let List = [];

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const songPromise = getSongbyQuery(query, 5);
      const artistPromise = getArtistbyQuery(query, 5);
      const searchDataPromise = getSearchData(query);

      const [song, artist, searchData] = await Promise.allSettled([
        songPromise,
        artistPromise,
        searchDataPromise,
      ]);

      const allSuggestions = [];

      if (song.status === "fulfilled" && song.value?.data?.results) {
        allSuggestions.push(
          ...song.value.data.results.map((item) => ({
            type: "Song",
            name: item.name,
            id: item.id,
            duration: item.duration,
            artist: item.artists,
            image: item.image?.[2]?.url,
            downloadUrl: item.downloadUrl?.[4]?.url,
          }))
        );
      }
      if (
        searchData.status === "fulfilled" &&
        searchData.value?.data?.albums?.results
      ) {
        allSuggestions.push(
          ...searchData.value.data.albums.results.map((item) => ({
            type: "Album",
            name: item.title,
            id: item.id,
            artist: item.artist,
            image: item.image?.[2]?.url,
          }))
        );
      }
      if (
        searchData.status === "fulfilled" &&
        searchData.value?.data?.playlists?.results
      ) {
        allSuggestions.push(
          ...searchData.value.data.playlists.results.map((item) => ({
            type: "Playlist",
            name: item.title,
            id: item.id,
            image: item.image?.[2]?.url,
          }))
        );
      }
      if (artist.status === "fulfilled" && artist.value?.data?.results) {
        allSuggestions.push(
          ...artist.value.data.results.map((item) => ({
            type: item.type,
            name: item.name,
            id: item.id,
            image: item.image?.[2]?.url,
          }))
        );
      }

      setSuggestions(allSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSearchInputChange = (event) => {
    const searchTerm = event.target.value;
    setQuery(searchTerm);
    fetchSuggestions(searchTerm);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/search/${query}`);
      setSuggestions([]);
      setIsSearchActive(false);
    }
  };

  const GetData = async (suggestion) => {
    const response = await getSuggestionSong(suggestion.id);
    const suggestedSongs = response.data || [];
    return [suggestion, ...suggestedSongs];
  };

  const handleSuggestionClick = async (suggestion) => {
    if (suggestion.type === "Song") {
      List = await GetData(suggestion);
    }

    switch (suggestion.type) {
      case "Song":
        playMusic(
          suggestion.downloadUrl,
          suggestion.name,
          suggestion.duration,
          suggestion.image,
          suggestion.id,
          suggestion.artist,
          List
        );
        break;
      case "Album":
        navigate(`/albums/${suggestion.id}`);
        break;
      case "artist":
        navigate(`/artists/${suggestion.id}`);
        break;
      case "Playlist":
        navigate(`/playlists/${suggestion.id}`);
        break;
      default:
        console.warn("Unknown suggestion type:", suggestion.type);
    }

    setQuery("");
    setSuggestions([]);
    setIsSearchActive(false);
  };

  return (
    <nav className="navbar flex items-center top-0 z-20 fixed w-full pl-1 pr-1 lg:px-6 h-[4.5rem]">
      {/* Mobile-specific search bar (hidden on desktop) */}
      <div
        className={`flex-grow absolute top-0 left-0 w-full h-[4.5rem] bg-gray-900 transition-transform duration-300 ease-in-out ${
          isSearchActive
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        } lg:hidden flex items-center px-4`}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex flex-grow items-center gap-2 w-full"
        >
          <button
            type="button"
            onClick={() => setIsSearchActive(false)}
            className="text-2xl text-white w-11 h-11 flex items-center justify-center p-2 rounded-full hover:bg-gray-700 transition"
          >
            <IoCloseOutline />
          </button>
          <input
            type="text"
            name="search"
            id="search-mobile"
            placeholder="Search for Songs, Artists, and Playlists"
            className="flex-grow h-11 p-1 pl-5 bg-gray-800 text-white rounded-full focus:outline-none placeholder-gray-400"
            value={query}
            onChange={handleSearchInputChange}
            autoComplete="off"
            autoCorrect="off"
          />
          <button
            type="submit"
            className="bg-blue-600 h-11 w-11 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition"
          >
            <IoSearchOutline className="text-2xl" />
          </button>
          <div
            className={`suggestionSection bg-gray-800 shadow-xl absolute top-[4.5rem] left-0 right-0 p-3 rounded-lg w-full max-h-[calc(100vh-10rem)] overflow-y-auto transition-transform duration-200 ${
              suggestions.length > 0
                ? "visible opacity-100"
                : "invisible opacity-0"
            }`}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-700 transition"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <img
                  src={suggestion.image}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex flex-col overflow-hidden text-white">
                  <span className="text-sm font-semibold truncate">
                    {he.decode(suggestion.name)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {suggestion.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* Main Navbar content */}
      <div className="flex items-center justify-between w-full h-full lg:h-auto">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="https://raw.githubusercontent.com/tvtelugu/swara/refs/heads/main/public/swara.png"
            alt="Swara Logo"
            className="h-10 w-auto"
          />
          <span className="text-zinc-200 font-extrabold text-2xl lg:text-3xl">
            Sɯαɾα™
          </span>
        </Link>
        {/* Desktop links and search */}
        <div className="hidden lg:flex items-center gap-6 flex-grow justify-center">
          <div className="flex items-center space-x-6">
            <Link to="/Browse" className="p-2">
              <h2 className="text-xl text-zinc-400 font-semibold hover:text-zinc-100 transition-colors">
                Browse
              </h2>
            </Link>
            <Link to="/Music" className="p-2">
              <h2 className="text-xl text-zinc-400 font-semibold hover:text-zinc-100 transition-colors">
                My Music
              </h2>
            </Link>
          </div>
          <div className="relative flex-grow max-w-lg" ref={searchBarRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                name="search"
                id="search-desktop"
                placeholder="Search for Songs, Artists, and Playlists"
                className="w-full h-11 p-1 pl-5 pr-12 bg-gray-800 text-white rounded-full focus:outline-none placeholder-gray-400"
                value={query}
                onChange={handleSearchInputChange}
                onFocus={() => setIsSearchActive(true)}
                autoComplete="off"
                autoCorrect="off"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-white"
              >
                <IoSearchOutline className="text-2xl" />
              </button>
            </form>
            <div
              className={`suggestionSection bg-gray-800 shadow-xl absolute top-[3.5rem] left-0 p-3 grid grid-cols-2 lg:grid-cols-3 gap-3 rounded-lg w-full max-h-[20rem] overflow-y-auto transition-transform duration-200 ${
                suggestions.length > 0 && isSearchActive
                  ? "visible opacity-100"
                  : "invisible opacity-0"
              }`}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-700 transition"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <img
                    src={suggestion.image}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex flex-col overflow-hidden text-white">
                    <span className="text-sm font-semibold truncate">
                      {he.decode(suggestion.name)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {suggestion.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Theme Switch and mobile Search button */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden lg:block">
            <Theme />
          </div>
          <button
            onClick={() => setIsSearchActive(true)}
            className="lg:hidden text-2xl text-white flex items-center justify-center p-2 rounded-full hover:bg-gray-700 transition"
          >
            <IoSearchOutline />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
