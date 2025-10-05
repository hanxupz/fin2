import React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

const AnimatedBackground = () => {
  const theme = useTheme();

  // Heuristic for lower-performance devices: low device memory or few CPU cores
  const isLowPerf = typeof navigator !== 'undefined' && (
    (navigator.deviceMemory && navigator.deviceMemory < 2) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)
  );

  // Adjust animation speeds based on performance
  const baseSpeed = isLowPerf ? 1.5 : 1; // Slower animations for low perf devices

  return (
    <>
      {/* Background color layer */}
      <Box
        aria-hidden
        sx={(t) => {
          const isLight = t.palette.mode === 'light';
          
          return {
            position: 'fixed',
            inset: 0,
            zIndex: -2,
            backgroundColor: isLight 
              ? t.palette.background.default 
              : t.palette.background.default,
            transition: 'background-color 0.3s ease',
          };
        }}
      />

      {/* SVG Blob Animation */}
      <Box
        component="svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="10 10 80 80"
        aria-hidden
        sx={(t) => {
          const isLight = t.palette.mode === 'light';
          
          return {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            zIndex: -1,
            opacity: isLight ? 0.7 : 0.5,
            transition: 'opacity 0.3s ease',
            
            // Keyframe animations
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            },
            
            // Blob animation classes
            '& .out-top': {
              animation: `rotate ${20 * baseSpeed}s linear infinite`,
              transformOrigin: '13px 25px',
            },
            '& .in-top': {
              animation: `rotate ${10 * baseSpeed}s linear infinite`,
              transformOrigin: '13px 25px',
            },
            '& .out-bottom': {
              animation: `rotate ${25 * baseSpeed}s linear infinite`,
              transformOrigin: '84px 93px',
            },
            '& .in-bottom': {
              animation: `rotate ${15 * baseSpeed}s linear infinite`,
              transformOrigin: '84px 93px',
            },
          };
        }}
      >
        <defs>
          {/* Gradients for light mode - Custom colors */}
          <linearGradient id="gradient1-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#540D6E" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#540D6E" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="gradient2-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EE4266" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#EE4266" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="gradient3-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD23F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFD23F" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="gradient4-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3BCEAC" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0EAD69" stopOpacity="0.3" />
          </linearGradient>

          {/* Gradients for dark mode */}
          <linearGradient id="gradient1-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#638475" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#638475" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient2-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDF093" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#DDF093" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="gradient3-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6D0B1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F6D0B1" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="gradient4-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CE4760" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#CE4760" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Blob shapes */}
        <path 
          fill={`url(#gradient1-${theme.palette.mode})`}
          className="out-top" 
          d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"
        />
        <path 
          fill={`url(#gradient2-${theme.palette.mode})`}
          className="in-top" 
          d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"
        />
        <path 
          fill={`url(#gradient3-${theme.palette.mode})`}
          className="out-bottom" 
          d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"
        />
        <path 
          fill={`url(#gradient4-${theme.palette.mode})`}
          className="in-bottom" 
          d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"
        />
      </Box>
    </>
  );
};

export default AnimatedBackground;
