import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useRef, useEffect } from "react";
import { getArtistbyQuery, getSearchData, getSongbyQuery, getSuggestionSong } from "../../fetch";
import MusicContext from "../context/MusicContext";
import he from "he";
import Theme from "../../theme";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { LuMusic4, LuRadio } from "react-icons/lu";

const Navbar = () => {
  const { playMusic } = useContext(MusicContext);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isDesktopSearchVisible, setIsDesktopSearchVisible] = useState(false);
  const navigate = useNavigate();
  const searchBarRef = useRef(null);

  // Close search suggestions and desktop search bar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsSearchActive(false);
        setSuggestions([]);
        // This line is for the desktop search bar
        setIsDesktopSearchVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      if (searchData.status === "fulfilled" && searchData.value?.data?.albums?.results) {
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
      if (searchData.status === "fulfilled" && searchData.value?.data?.playlists?.results) {
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
      setIsDesktopSearchVisible(false);
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
    setIsDesktopSearchVisible(false);
  };

  return (
    <nav className="navbar flex items-center justify-between top-0 z-20 fixed w-full pl-1 pr-1 lg:px-6 h-[4.5rem] transition-all duration-300">
      {/* Left side: Logo and Navigation Links */}
      <div className={`flex items-center gap-6 ${isSearchActive ? "hidden" : "flex"} lg:flex`}>
        <Link to="/" className="flex items-center">
          <div className="flex items-center">
            <img
              src="https://raw.githubusercontent.com/tvtelugu/swara/refs/heads/main/public/swara.png"
              alt="Swara Logo"
              className="h-10 w-auto mr-2"
            />
            <span className="Musi text-zinc-600 font-extrabold text-2xl lg:text-3xl">
              Sɯαɾα
            </span>
            <span className="fy text-zinc-200 font-extrabold text-2xl lg:text-3xl">
              ™
            </span>
          </div>
        </Link>
        <div className="hidden lg:flex gap-[2rem] grey font-semibold items-center">
          <Link to="/Browse" className="flex items-center gap-2">
            <LuRadio className="text-xl" />
            <span className="lg:text-xl text-lg">Browse</span>
          </Link>
          <Link to="/Music" className="flex items-center gap-2">
            <LuMusic4 className="text-xl" />
            <span className="lg:text-xl text-lg">My Music</span>
          </Link>
        </div>
      </div>

      {/* Middle: Search bar and suggestions */}
      <div
        ref={searchBarRef}
        className={`flex-grow flex items-center transition-all duration-300 ${
          isDesktopSearchVisible
            ? "lg:w-1/2 lg:flex"
            : "lg:w-[4rem] lg:justify-center lg:items-center"
        } ${isSearchActive ? "flex" : "hidden"} lg:flex relative`}
      >
        <form
          onSubmit={handleSearchSubmit}
          className={`flex-grow items-center transition-all duration-300 ${
            isDesktopSearchVisible ? "flex" : "hidden"
          } lg:flex relative`}
        >
          {/* Mobile search close button */}
          <button
            type="button"
            onClick={() => {
              setIsSearchActive(false);
              setSuggestions([]);
              setQuery("");
            }}
            className="lg:hidden text-2xl w-11 h-11 flex items-center justify-center p-2 rounded-full search-btn"
          >
            <IoCloseOutline className="search" />
          </button>
          
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search for Songs, Artists, and Playlists"
            className="flex-grow h-11 p-1 pl-5 bg-transparent focus:outline-none rounded-l-lg search-input"
            value={query}
            onChange={handleSearchInputChange}
            autoComplete="off"
            autoCorrect="off"
          />
          <button
            type="submit"
            className="search-btn h-11 w-11 rounded-r-lg flex items-center justify-center"
          >
            <IoSearchOutline className="text-2xl search" />
          </button>
          <div
            className={`suggestionSection lg:shadow-xl absolute scroll-hide top-full left-0 p-3 grid grid-cols-2 lg:grid-cols-3 gap-3 rounded-lg w-full max-h-[20rem] overflow-auto transition-opacity duration-200 ${
              suggestions.length > 0 ? "visible opacity-100" : "invisible opacity-0"
            }`}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded cursor-pointer hoover"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <img
                  src={suggestion.image}
                  alt=""
                  className="h-[3rem] w-[3rem] rounded object-cover"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm truncate">
                    {he.decode(suggestion.name)}
                  </span>
                  <span className="text-xs text-zinc-400">{suggestion.type}</span>
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Desktop search button to toggle search bar visibility */}
        <button
          onClick={() => {
            setIsDesktopSearchVisible(!isDesktopSearchVisible);
            setIsSearchActive(true);
          }}
          className={`lg:flex hidden h-11 w-11 items-center justify-center p-2 rounded-full search-btn ${
            isDesktopSearchVisible ? "hidden" : "flex"
          }`}
        >
          <IoSearchOutline className="text-2xl search" />
        </button>
      </div>

      {/* Right side: Theme switch and mobile search icon */}
      <div className={`flex gap-4 items-center ${isSearchActive ? "hidden" : "flex"} lg:flex`}>
        {/* Mobile search button */}
        <button
          onClick={() => setIsSearchActive(true)}
          className="lg:hidden text-2xl flex items-center justify-center p-2 rounded-full search-btn"
        >
          <IoSearchOutline className="search" />
        </button>
        {/* Theme button */}
        <Theme />
      </div>
    </nav>
  );
};

export default Navbar;
