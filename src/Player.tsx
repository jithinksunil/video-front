import React from 'react';
import VideoJS from './VideoJs';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
// This imports the functional component from the previous sample.

export const Player = ({ src }: { src: string }) => {
  const playerRef = React.useRef<any>(null);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src,
        type: 'video/mp4',
      },
    ],
  };

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

  return <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />;
};
