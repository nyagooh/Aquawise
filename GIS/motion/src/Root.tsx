import React from 'react';
import {Composition} from 'remotion';
import {AquaWiseTrailer} from './Trailer';
import './styles.css';

export const MotionRoot: React.FC = () => (
  <>
    <Composition
      id="AquaWiseTrailer"
      component={AquaWiseTrailer}
      durationInFrames={2250}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{withAudio: true}}
    />
    <Composition
      id="AquaWiseTrailerSilent"
      component={AquaWiseTrailer}
      durationInFrames={2250}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{withAudio: false}}
    />
  </>
);
