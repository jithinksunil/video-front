import logo from './logo.svg';
import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

export const Player = () => {
  return (
    <ReactPlayer
      url='https://video.gumlet.io/5f462c1561cf8a766464ffc4/61b8ac77b7e0439691e7c2af/1.m3u8'
      autoPlay={true}
      controls={true}
      width='1200'
      height='auto'
    />
  );
};
