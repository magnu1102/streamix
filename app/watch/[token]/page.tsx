"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Hls from "hls.js";

interface StreamData {
  id: string;
  name: string;
  playback: {
    url: string;
    type: 'hls' | 'native';
  };
}

export default function PlayerPage() {
  const params = useParams();
  const token = params?.token as string;
  
  const [stream, setStream] = useState<StreamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI State for controls visibility
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle Mouse Move to toggle controls
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Hide controls after 3 seconds of inactivity
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    // Initial fetch
    fetch("/api/streams/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load stream");
        }
        return res.json();
      })
      .then((data) => setStream(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Cleanup timeout on unmount
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [token]);

  // Initialize Player
  useEffect(() => {
    if (stream && videoRef.current) {
      const video = videoRef.current;
      const { url, type } = stream.playback;

      if (Hls.isSupported() && type === 'hls') {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => console.log("Autoplay blocked"));
        });
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => console.log("Autoplay blocked"));
        });
      }
    }
  }, [stream]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">Error: {error}</div>;

  return (
    <div 
      className="min-h-screen bg-black flex flex-col relative group cursor-none hover:cursor-default"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove} // For mobile tap to show
    >
      {/* Floating Back Button */}
      <Link 
        href="/watch"
        className={`absolute top-6 left-6 z-50 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-opacity duration-300 backdrop-blur-sm ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
      </Link>

      <div className="flex-1 flex items-center justify-center">
        {stream && (
          <video
            ref={videoRef}
            controls
            className="w-full h-full max-h-screen bg-black object-contain"
            poster="/window.svg"
          />
        )}
      </div>

      {/* Optional: Also hide the bottom metadata text when inactive */}
      <div className={`p-4 bg-gradient-to-t from-black/90 to-transparent text-white absolute bottom-0 left-0 w-full transition-opacity duration-300 pointer-events-none ${
        showControls ? "opacity-100" : "opacity-0"
      }`}>
        <h2 className="text-xl font-bold">{stream?.name}</h2>
        <p className="text-gray-300 text-sm">Stream ID: {stream?.id}</p>
      </div>
    </div>
  );
}