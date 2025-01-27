import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('https://vedio-back.onrender.com'); // Replace with your backend URL

const SynchronizedVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekSetterNew, setSeekSetterNew] = useState(0);

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
          console.log(Date.now());
          setSeekSetterNew(Date.now());
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
    <>
      <div className='w-screen min-h-screen flex  flex-col items-center justify-center'>
        {/* File Input */}
        {!videoFile ? (
          <>
            <h1 className='text-2xl font-bold my-4'>Me & Bu</h1>
            <input type='file' onChange={handleFileChange} className='mb-4' />
          </>
        ) : null}

        {videoFile ? (
          <div className='bg-black w-full flex flex-col items-center'>
            <video
              ref={videoRef}
              src={videoFile}
              controls
              className='shadow-lg w-full'
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={(e) => {
                setCurrentTime(videoRef.current?.currentTime || 0);
              }}
              onSeeked={() => {
                console.log(Date.now());

                if (seekSetterNew + 1000 < Date.now() && videoRef.current) {
                  const time = videoRef.current.currentTime;
                  sendControl('seek', time);
                  setCurrentTime(time);
                }
              }}
            >
              Your browser does not support the video tag.
            </video>

            <button
              onClick={playing ? handlePause : handlePlay}
              className='px-4 py-2 text-white bg-blue-800 hover:bg-blue-600 w-[200px] rounded-full my-10'
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
        ) : (
          <p>Select a video file to play</p>
        )}
      </div>
    </>
  );
};

export default SynchronizedVideoPlayer;
