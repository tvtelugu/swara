import { createContext, useState, useEffect, useRef } from "react";
import { getSongById } from "../../fetch";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none"); // "none", "one", "all"
  const [song, setSong] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playMusic = async (songId) => {
    try {
      const response = await getSongById(songId);
      const songData = response.data[0];

      if (!songData || !songData.downloadUrl) {
        console.error("Song data or download URL is missing.");
        return;
      }
      
      const qualities = songData.downloadUrl.map(item
