import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('https://vedio-back.onrender.com'); // Replace with your backend URL

const SynchronizedVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekSetterNew, setSeekSetterNew] = useState(0);
  const [seekSetterOld, setSeekSetterOld] = useState(0);

  useEffect(() => {
    // Listen for control commands from the server
    socket.on('control', (command: any) => {
      const video = videoRef.current;
      if (!video) return;

      switch (command.type) {
        case 'play':
          video.play();
          setPlaying(true);
          break;
        case 'pause':
          video.pause();
          setPlaying(false);
          break;
        case 'seek':
          setSeekSetterNew(command.seekSetter);
          video.currentTime = command.time;
          setCurrentTime(command.time);
          break;
        default:
          console.error('Unknown command:', command);
      }
    });

    // Clean up the event listener
    return () => {
      socket.off('control');
    };
  }, []);

  const sendControl = (type: string, time?: number) => {
    socket.emit('control', { type, time, seekSetter: Date.now() });
  };

  const handlePlay = () => {
    videoRef.current?.play();
    sendControl('play');
    setPlaying(true);
  };

  const handlePause = () => {
    videoRef.current?.pause();
    sendControl('pause');
    setPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    sendControl('seek', time);
    setCurrentTime(time);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };
  const [videoFile, setVideoFile] = useState<string | null>(null); // Store the video URL

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Safely access the first file
    if (file) {
      setVideoFile(URL.createObjectURL(file)); // Create a temporary URL for the video file
    }
  };

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
        <h1 className='text-2xl font-bold mb-4'>Simple Video Player</h1>

        {/* File Input */}
        <input type='file' onChange={handleFileChange} className='mb-4' />

        {/* Video Player */}
        {videoFile ? (
          <video
            ref={videoRef}
            src={videoFile}
            controls
            width='800'
            className='rounded shadow-lg'
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={(e) => {
              setCurrentTime(videoRef.current?.currentTime || 0);
            }}
            onPause={handlePause}
            onPlay={handlePlay}
            onSeeked={(e) => {
              if (seekSetterNew !== seekSetterOld)
                if (videoRef.current) {
                  const time = videoRef.current.currentTime;
                  sendControl('seek', time);
                  setCurrentTime(time);
                  setSeekSetterOld(seekSetterNew);
                }
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Select a video file to play</p>
        )}
      </div>
      {/* <video
        src='/We.Live.in.Time.2024.1080p.10bit.WEBRip.6CH.x265.HEVC-PSA.mkv' // Replace with your video URL
        className='w-full shadow-lg'
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        controls={false} // Disable native controls for a custom experience
      ></video> */}

      <div className='flex items-center space-x-4'>
        <button
          onClick={playing ? handlePause : handlePlay}
          className='px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600'
        >
          {playing ? 'Pause' : 'Play'}
        </button>

        <input
          type='range'
          min='0'
          max={duration.toString()}
          value={currentTime}
          onChange={handleSeek}
          className='w-64'
        />
        <span className='text-sm text-gray-600'>
          {Math.floor(currentTime)} / {Math.floor(duration)} seconds
        </span>
      </div>
    </div>
  );
};

export default SynchronizedVideoPlayer;
