import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useRef, useEffect } from "react";
import { getArtistbyQuery, getSearchData, getSongbyQuery, getSuggestionSong } from "../../fetch";
import MusicContext from "../context/MusicContext";
import he from "he";
import Theme from "../../theme";
import { IoSearchOutline, IoCloseOutline, IoMusicalNotesOutline, IoBrowsersOutline } from "react-icons/io5";

const Navbar = () => {
  const { playMusic } = useContext(MusicContext);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [isDesktopSearchVisible, setIsDesktopSearchVisible] = useState(false);

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

  const toggleDesktopSearch = () => {
    setIsDesktopSearchVisible(!isDesktopSearchVisible);
    if (!isDesktopSearchVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    } else {
      setQuery("");
      setSuggestions([]);
    }
  };
  
  const closeDesktopSearch = () => {
    setIsDesktopSearchVisible(false);
    setQuery("");
    setSuggestions([]);
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isDesktopSearchVisible &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !event.target.closest(".search-btn-desktop") &&
        !event.target.closest(".search-btn")
      ) {
        closeDesktopSearch();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDesktopSearchVisible]);

  return (
    <nav className="navbar fixed top-0 z-20 w-full px-4 py-2 lg:px-6 lg:py-3 flex items-center justify-between transition-all duration-300 ease-in-out">
      <div
        className={`flex items-center gap-4 transition-all duration-300 ease-in-out ${
          isSearchActive || isDesktopSearchVisible ? "opacity-0 invisible" : "opacity-100 visible"
        } lg:opacity-100 lg:visible`}
      >
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://raw.githubusercontent.com/tvtelugu/swara/refs/heads/main/public/swara.png"
            alt="Swara Logo"
            className="h-8 w-auto"
          />
          <span className="text-yellow-500 font-extrabold text-xl lg:text-2xl">
            Sɯαɾα
          </span>
          <span className="text-yellow-500 font-extrabold text-xl lg:text-2xl">
            ™
          </span>
        </Link>
      </div>
      
      {/* Desktop Navigation Links and Theme Toggle */}
      <div className={`hidden lg:flex items-center gap-4 grey font-semibold ml-auto transition-all duration-300 ease-in-out ${
        isDesktopSearchVisible ? "opacity-0 invisible" : "opacity-100 visible"
      }`}>
        <button
          onClick={toggleDesktopSearch}
          className="search-btn p-2 rounded-full transition-colors duration-200"
        >
          <IoSearchOutline className="text-2xl search" />
        </button>
        <Link to="/Browse" className="flex items-center gap-2 hoover p-2 rounded-full transition-colors duration-200">
          <IoBrowsersOutline className="text-xl" />
          <h2 className="text-base">Browse</h2>
        </Link>
        <Link to="/Music" className="flex items-center gap-2 hoover p-2 rounded-full transition-colors duration-200">
          <IoMusicalNotesOutline className="text-xl" />
          <h2 className="text-base">My Music</h2>
        </Link>
        <div className="p-1 rounded-full">
          <Theme />
        </div>
      </div>

      {/* Mobile Search Button */}
      <div className="flex items-center gap-4 lg:hidden">
        <Theme />
        <button
          onClick={() => setIsSearchActive(true)}
          className="search-btn p-2 rounded-full transition-colors duration-200"
        >
          <IoSearchOutline className="text-2xl search" />
        </button>
      </div>

      {/* Mobile Search Bar */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-transparent backdrop-blur-md z-30 transition-opacity duration-300 ease-in-out ${
          isSearchActive ? "opacity-100 visible" : "opacity-0 invisible"
        } lg:hidden`}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center p-4"
        >
          <button
            type="button"
            onClick={() => {
              setIsSearchActive(false);
              setSuggestions([]);
            }}
            className="search-btn p-2 rounded-full"
          >
            <IoCloseOutline className="text-2xl search" />
          </button>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search for Songs, Artists, and Playlists"
            className="flex-grow h-10 p-1 pl-4 bg-transparent focus:outline-none text-base"
            value={query}
            onChange={handleSearchInputChange}
            autoComplete="off"
            autoCorrect="off"
            ref={searchInputRef}
          />
          <button
            type="submit"
            className="search-btn h-10 w-10 rounded-full flex items-center justify-center ml-2"
          >
            <IoSearchOutline className="text-xl search" />
          </button>

          <div
            className={`suggestionSection absolute top-[3.5rem] left-4 right-4 p-3 grid grid-cols-2 gap-3 rounded-lg max-h-[calc(100vh-10rem)] overflow-y-auto transition-all duration-200 ${
              suggestions.length > 0 ? "opacity-100 visible" : "opacity-0 invisible"
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
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm truncate">
                    {he.decode(suggestion.name)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {suggestion.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* Desktop Search Bar */}
      <div
        className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out z-50 ${
          isDesktopSearchVisible
            ? "left-1/2 -translate-x-1/2 opacity-100 visible w-2/5"
            : "left-full opacity-0 invisible w-0"
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex-grow flex items-center">
          <input
            type="text"
            name="search"
            id="search-desktop"
            placeholder="Search for Songs, Artists, and Playlists"
            className="flex-grow h-10 p-1 pl-6 pr-10 rounded-full focus:outline-none search-input text-base text-zinc-400"
            value={query}
            onChange={handleSearchInputChange}
            autoComplete="off"
            autoCorrect="off"
            ref={searchInputRef}
          />
          {isDesktopSearchVisible && (
            <button
              type="button"
              onClick={closeDesktopSearch}
              className="search-btn-desktop absolute right-10 h-full w-10 flex items-center justify-center"
            >
              <IoCloseOutline className="text-xl search" />
            </button>
          )}
          <button
            type="submit"
            className="search-btn absolute right-0 h-full w-10 rounded-r-full flex items-center justify-center"
          >
            <IoSearchOutline className="text-xl search" />
          </button>
          <div
            className={`suggestionSection lg:shadow-xl absolute top-[3rem] left-0 right-0 p-3 grid grid-cols-3 gap-3 rounded-xl max-h-[20rem] overflow-y-auto transition-transform duration-200 z-50 ${
              suggestions.length > 0 ? "visible opacity-100" : "invisible opacity-0"
            }`}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hoover"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <img
                  src={suggestion.image}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm truncate">
                    {he.decode(suggestion.name)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {suggestion.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
