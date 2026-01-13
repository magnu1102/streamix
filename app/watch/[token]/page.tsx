"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fetch stream info
    fetch("/api/streams/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // <--- added for error:unauthorized
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
        // Native HLS (Safari)
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
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {stream && (
          <video
            ref={videoRef}
            controls
            className="w-full max-w-5xl aspect-video bg-gray-900"
            poster="/window.svg" // Placeholder or from stream metadata
          />
        )}
      </div>
      <div className="p-4 bg-gray-900 text-white">
        <h2 className="text-xl font-bold">{stream?.name}</h2>
        <p className="text-gray-400 text-sm">Stream ID: {stream?.id}</p>
      </div>
    </div>
  );
}