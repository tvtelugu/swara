import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { getArtistbyQuery, getSearchData, getSongbyQuery, getSuggestionSong } from "../../fetch";
import MusicContext from "../context/MusicContext";
import he from "he";
import Theme from "../../theme";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { FaHome, FaMusic } from "react-icons/fa";
import { MdOutlineLibraryMusic } from "react-icons/md";

const Navbar = () => {
  const { playMusic } = useContext(MusicContext);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();

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
    <nav className="navbar flex flex-col lg:gap-10 lg:flex-row lg:items-center top-0 z-20 fixed w-full pl-1 pr-1 lg:px-2 lg:h-[4.5rem]">
      {/* Mobile & Desktop: Logo and Mobile Search Button */}
      <div
        className={`flex items-center justify-between lg:w-auto h-[61px] w-screen gap-5 ${
          isSearchActive ? "hidden" : "flex"
        } lg:flex lg:basis-1/4`}
      >
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
        <div className="flex gap-4 items-center lg:hidden">
          <Theme />
          <button
            onClick={() => setIsSearchActive(true)}
            className="lg:hidden text-2xl flex items-center justify-center p-2 rounded-full search-btn"
          >
            <IoSearchOutline className="search" />
          </button>
        </div>
      </div>
      
      {/* Desktop: Search bar */}
      <div
        className={`flex-grow ${
          isSearchActive ? "flex" : "hidden"
        } lg:flex items-center lg:basis-1/2 justify-center`}
      >
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex flex-grow items-center w-full"
        >
          <div className="flex w-full items-center">
            <button
              type="button"
              onClick={() => setIsSearchActive(false)}
              className="lg:hidden text-2xl w-11 h-11 flex items-center justify-center p-2 rounded-full search-btn"
            >
              <IoCloseOutline className="search" />
            </button>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search for Songs, Artists, and Playlists"
              className="flex-grow h-11 p-1 pl-5 bg-transparent focus:outline-none rounded-l-full search-input"
              value={query}
              onChange={handleSearchInputChange}
              autoComplete="off"
              autoCorrect="off"
            />
            <button
              type="submit"
              className="search-btn h-11 w-11 rounded-r-full flex items-center justify-center"
            >
              <IoSearchOutline className="text-2xl search" />
            </button>
          </div>

          <div
            className={`suggestionSection lg:shadow-xl absolute scroll-hide top-[2.74rem] lg:top-[4.5rem] left-0 p-3 grid grid-cols-2 lg:grid-cols-3 gap-3 rounded-lg w-full max-h-[20rem] overflow-auto transition-transform duration-200 ${
              suggestions.length > 0
                ? "visible opacity-100"
                : "invisible opacity-0"
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
                  className="h-[3rem] w-[3rem] rounded"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm truncate">
                    {he.decode(suggestion.name)}
                  </span>
                  <span className="text-xs">{suggestion.type}</span>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* Desktop: Browse, My Music, and Theme Switch */}
      <div className="hidden lg:flex items-center justify-end lg:basis-1/4 gap-5">
        <Link to="/Browse">
          <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
            <FaMusic className="text-xl" />
            <span className="font-semibold text-lg">Browse</span>
          </button>
        </Link>
        <Link to="/Music">
          <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
            <MdOutlineLibraryMusic className="text-xl" />
            <span className="font-semibold text-lg">My Music</span>
          </button>
        </Link>
        <Theme />
      </div>
    </nav>
  );
};

export default Navbar;
