import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { getArtistbyQuery, getSearchData, getSongbyQuery, getSuggestionSong } from "../../fetch";
import MusicContext from "../context/MusicContext";
import he from "he";
import Theme from "../../theme";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { MdLibraryMusic, MdExplore } from "react-icons/md";

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
      const [song, artist, searchData] = await Promise.allSettled([
        getSongbyQuery(query, 5),
        getArtistbyQuery(query, 5),
        getSearchData(query),
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
    <nav className="navbar flex items-center justify-between fixed top-0 z-20 w-full h-[4.5rem] bg-white dark:bg-black pl-4 pr-4 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://raw.githubusercontent.com/tvtelugu/swara/refs/heads/main/public/swara.png"
            alt="Swara Logo"
            className="h-10 w-auto"
          />
          <span className="Musi text-zinc-600 dark:text-white font-extrabold text-2xl">Sɯαɾα</span>
          <span className="fy text-zinc-300 font-extrabold text-2xl">™</span>
        </Link>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden lg:flex items-center gap-8">
        <Link to="/Browse" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
          <MdExplore className="text-xl" />
          <span className="text-lg font-medium">Browse</span>
        </Link>

        <Link to="/Music" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
          <MdLibraryMusic className="text-xl" />
          <span className="text-lg font-medium">My Music</span>
        </Link>
      </div>

      {/* Right Controls: Search Icon + Theme */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSearchActive(!isSearchActive)}
          className="text-2xl flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          {isSearchActive ? <IoCloseOutline /> : <IoSearchOutline />}
        </button>
        <div className="ml-2">
          <Theme />
        </div>
      </div>

      {/* Search bar */}
      {isSearchActive && (
        <div className="absolute top-[4.5rem] left-0 w-full bg-white dark:bg-zinc-900 px-4 py-2 z-10 shadow-md">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <input
              type="text"
              name="search"
              id="search"
              value={query}
              onChange={handleSearchInputChange}
              placeholder="Search for Songs, Artists, and Playlists"
              className="w-full p-3 pl-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 focus:outline-none"
              autoComplete="off"
              autoCorrect="off"
            />
          </form>

          {/* Suggestions */}
          <div
            className={`suggestionSection grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 max-h-[20rem] overflow-auto scroll-hide`}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-800"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <img
                  src={suggestion.image}
                  alt=""
                  className="h-[3rem] w-[3rem] rounded object-cover"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm truncate">{he.decode(suggestion.name)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{suggestion.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
