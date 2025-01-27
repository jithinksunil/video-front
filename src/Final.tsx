import React, { useState } from "react";

const VideoPlayer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<string | null>(null); // Store the video URL

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Safely access the first file
    if (file) {
      setVideoFile(URL.createObjectURL(file)); // Create a temporary URL for the video file
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Simple Video Player</h1>

      {/* File Input */}
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Video Player */}
      {videoFile ? (
        <video
          src={videoFile}
          controls
          width="800"
          className="rounded shadow-lg"
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Select a video file to play</p>
      )}
    </div>
  );
};

export default VideoPlayer;
