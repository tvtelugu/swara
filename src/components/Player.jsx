import { useContext, useRef, useState, useEffect } from "react";
import { IoIosClose, IoMdSkipBackward, IoMdSkipForward } from "react-icons/io";
import { IoShareSocial } from "react-icons/io5";
import { PiShuffleBold } from "react-icons/pi";
import { LuRepeat, LuRepeat1 } from "react-icons/lu";
import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";
import {
  MdDownload,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineArrowDropDown, // Import the dropdown icon
} from "react-icons/md";
import { CiMaximize1 } from "react-icons/ci";
import { PiSpeakerLowFill } from "react-icons/pi";
import MusicContext from "../context/MusicContext";
import ArtistItems from "./Items/ArtistItems";
import he from "he";
import { getSongById, getSuggestionSong } from "../../fetch";
import SongGrid from "./SongGrid";
import { Link } from "react-router-dom"; // Use react-router-dom for Link

const Player = () => {
  const {
    currentSong,
    song,
    playMusic,
    isPlaying,
    shuffle,
    nextSong,
    prevSong,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode,
    downloadSong,
  } = useContext(MusicContext);

  const [volume, setVolume] = useState(() => {
    return Number(localStorage.getItem("volume")) || 100;
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isMaximized, setisMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [detail, setDetails] = useState({});
  const [list, setList] = useState({});
  const [suggetions, setSuggetion] = useState([]);
  const [likedSongs, setLikedSongs] = useState(() => {
    return JSON.parse(localStorage.getItem("likedSongs")) || [];
  });

  // 👇 New state for download quality
  const [selectedQuality, setSelectedQuality] = useState(null);

  const inputRef = useRef();

  // Your existing useEffect and other functions...
  // ...

  useEffect(() => {
    if (!currentSong) return;
    const audio = currentSong?.audio;
    setCurrentTime(audio.currentTime);

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      const progress = (audio.currentTime / Number(currentSong?.duration)) * 100;
      inputRef.current.style.setProperty("--progress", `${progress}%`);
    };

    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [currentSong, isPlaying]);

  const scrollRef = useRef(null);
  const scrollLeft = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 1000;
    }
  };

  const scrollRight = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 1000;
    }
  };

  useEffect(() => {
    setIsVisible(!!(currentSong || isPlaying));
  }, [currentSong, isPlaying]);

  const artistNames = currentSong?.artists?.primary
    ? currentSong.artists.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  useEffect(() => {
    const albumDetail = async () => {
      const result = await getSongById(currentSong.id);
      setDetails(result.data[0]);
    };
    if (currentSong?.id) {
      albumDetail();
    }
  }, [currentSong]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentSong?.id) return;
      const suggestions = await getSuggestionSong(currentSong.id);
      setList(suggestions.data);
      setSuggetion(suggestions.data);
    };

    fetchSuggestions();

    if (currentSong) {
      const audioElement = currentSong.audio;
      audioElement.volume = volume / 100;

      const handleTimeUpdate = () => {
        setCurrentTime(audioElement.currentTime);
        const duration = Number(currentSong.duration);
        const newTiming = (audioElement.currentTime / duration) * 100;
        if (inputRef.current) {
          inputRef.current.value = newTiming;
        }
      };

      const handleEndSong = () => {
        if (!currentSong || !currentSong.id) return;
        nextSong();
      };

      audioElement.addEventListener("timeupdate", handleTimeUpdate);
      audioElement.addEventListener("ended", handleEndSong);

      return () => {
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);
        audioElement.removeEventListener("ended", handleEndSong);
      };
    }
  }, [currentSong, volume, nextSong]);

  const handleProgressChange = (event) => {
    const newPercentage = parseFloat(event.target.value);
    const newTime = (newPercentage / 100) * Number(currentSong.duration);
    currentSong.audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value) / 100;
    setVolume(newVolume * 100);
    localStorage.setItem("volume", newVolume * 100);
    if (currentSong?.audio) {
      currentSong.audio.volume = newVolume;
    }
  };

  const handleMaximized = () => {
    setisMaximized(!isMaximized);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const toggleLikeSong = () => {
    if (!currentSong) return;

    const songData = {
      id: currentSong.id,
      name: currentSong.name,
      audio: currentSong.audio.currentSrc,
      duration: currentSong.duration,
      image: currentSong.image,
      artists: currentSong.artists,
    };

    const updatedLikedSongs = likedSongs.some(
      (song) => song.id === currentSong.id
    )
      ? likedSongs.filter((song) => song.id !== currentSong.id)
      : [...likedSongs, songData];

    setLikedSongs(updatedLikedSongs);
    localStorage.setItem("likedSongs", JSON.stringify(updatedLikedSongs));
  };
  const name = currentSong?.name || "Unknown Title";

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: he.decode(name),
        artist: he.decode(artistNames),
        album: "Musify",
        artwork: [
          {
            src: currentSong?.image || "/Unknown.png",
            sizes: "500x500",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        playMusic(
          currentSong?.audio.currentSrc,
          currentSong?.name,
          currentSong?.duration,
          currentSong?.image,
          currentSong?.id,
          song
        );
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        playMusic(
          currentSong?.audio.currentSrc,
          currentSong?.name,
          currentSong?.duration,
          currentSong?.image,
          currentSong?.id,
          song
        );
      });

      navigator.mediaSession.setActionHandler("previoustrack", prevSong);
      navigator.mediaSession.setActionHandler("nexttrack", nextSong);
    }
  }, [currentSong, artistNames, playMusic, prevSong, nextSong, song, name]);

  const theme = document.documentElement.getAttribute("data-theme");

  if (currentSong) {
    if (repeatMode === "one") {
      currentSong.audio.loop = true;
    } else {
      currentSong.audio.loop = false;
    }
  }

  // New function to handle quality selection
  const handleQualitySelect = (quality) => {
    setSelectedQuality(quality);
  };

  // Modified downloadSong function to use selectedQuality
  const downloadSelectedSong = async () => {
    if (currentSong?.downloadUrl) {
      try {
        // Use the selected quality or default to the highest available
        const qualityUrl = currentSong.downloadUrl.find(
          (url) => url.quality === selectedQuality
        )?.url || currentSong.downloadUrl[currentSong.downloadUrl.length - 1].url;

        const response = await fetch(qualityUrl);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${he.decode(currentSong.name)}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error downloading the song:", error);
        alert("Failed to download the song!");
      }
    } else {
      alert("Download URL is not available!");
    }
  };

  return (
    <div
      className={` ${isVisible ? "lg:flex " : "hidden"}
      fixed bottom-14 lg:bottom-0 left-0 w-screen z-20 flex justify-center items-center`}
    >
      <div
        className={`flex flex-col h-auto w-screen bg-auto rounded-tl-xl rounded-tr-xl relative transition-all ease-in-out duration-500 ${
          isMaximized
            ? "pt-[26rem] backdrop-brightness-[0.4]"
            : "lg:h-[6rem] h-auto p-4 Player"
        }`}
      >
        <div className="flex flex-col w-full">
          {!isMaximized && (
            <>
              {/* Your existing player UI (progress bar, etc.) */}
            </>
          )}

          {isMaximized && (
            <>
              {/* Maximized player UI */}
              <div className="flex w-full bottom-0 flex-col p-2 pt-2 lg:h-[40rem] h-[45rem] gap-4 scroll-hide overflow-y-scroll rounded-tl-2xl rounded-tr-2xl Player scroll-smooth">
                {/* Close button and other info */}
                <div className=" flex w-[97%] justify-end ">
                  <IoIosClose
                    className="icon text-[3rem] cursor-pointer"
                    onClick={handleMaximized}
                  />
                </div>
                <div className=" ">
                  <div className="flex lg:flex-row flex-col">
                    <div className=" flex justify-center items-center lg:pl-[2.5rem]">
                      <img
                        src={currentSong?.image || " "}
                        className=" h-[22rem] lg:h-[17rem] rounded-lg object-cover shadow-2xl profile"
                      />
                    </div>
                    <div className="flex flex-col justify-center lg:w-[70%] lg:pl-5 p-1 gap-4">
                      <div className="flex flex-col gap-[0.5rem] mt-5 lg:ml-1 ml-[1.5rem]">
                        <span className=" text-2xl font-semibold h-auto justify-between flex overflow-clip ">
                          {currentSong?.name
                            ? he.decode(currentSong.name)
                            : "Empty"}
                        </span>
                        <span className="overflow-hidden flex w-[98%] mb-1 text-base font-medium justify-between h-[1.84rem] ">
                          {he.decode(artistNames)}
                          <span className="flex gap-3 justify-center place-items-center ">
                            <button
                              onClick={toggleLikeSong}
                              title="Like Song"
                              className=" "
                            >
                              {likedSongs.some(
                                (song) => song.id === currentSong?.id
                              ) ? (
                                <FaHeart className="text-red-500 text-2xl" />
                              ) : (
                                <FaRegHeart className="icon text-2xl hover:text-red-500" />
                              )}
                            </button>
                            {/* --- Start of New Quality Switch and Download Button --- */}
                            {currentSong?.downloadUrl && (
                                <div className="relative group">
                                <button className="flex items-center gap-1 text-lg rounded-lg p-1.5 icon lg:hover:text-[#fd3a4e] active:text-[#fd3a4e]" title="Download Quality">
                                    <span>{selectedQuality || "Download"}</span>
                                    <MdOutlineArrowDropDown className="text-2xl" />
                                </button>
                                <div className="absolute top-full -left-2 mt-2 hidden group-hover:flex flex-col bg-gray-800 rounded-lg shadow-lg z-50">
                                    {currentSong.downloadUrl.map((urlObj) => (
                                    <button
                                        key={urlObj.quality}
                                        className="text-left p-2 hover:bg-gray-700 w-full"
                                        onClick={() => handleQualitySelect(urlObj.quality)}
                                    >
                                        {urlObj.quality}kbps
                                    </button>
                                    ))}
                                </div>
                                </div>
                            )}
                            <MdDownload
                                className="lg:hover:text-[#fd3a4e] active:text-[#fd3a4e] flex self-center text-[1.8rem] cursor-pointer icon"
                                onClick={downloadSelectedSong}
                                title={`Download Song${selectedQuality ? ` (${selectedQuality}kbps)` : ""}`}
                            />
                            {/* --- End of New Quality Switch and Download Button --- */}
                          </span>
                        </span>
                      </div>
                      <form className="flex items-center w-full gap-3 h-[0px]">
                        {/* Progress bar and time */}
                      </form>
                      <div className="flex flex-col items-center ">
                        <div className="flex items-center justify-end lg:w-full lg:gap-[20rem] gap-[0.5rem] ">
                          <div className="flex items-center gap-5 p-8 w-full lg:w-[36%] justify-end ">
                            {/* Player controls */}
                          </div>
                          <IoShareSocial
                            className="icon text-3xl hidden lg:block cursor-pointer lg:hover:scale-105 mr-4 "
                            onClick={() =>
                              navigator.share({
                                title: currentSong.name,
                                text: `Listen to ${currentSong.name} on Musify`,
                                url: `${window.location.origin}/albums/${detail.album.id}`,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ... other parts of the maximized player UI ... */}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
