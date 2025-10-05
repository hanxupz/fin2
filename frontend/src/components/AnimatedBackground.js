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

  const animDuration = isLowPerf ? '80s' : '38s';
  const particleCount = isLowPerf ? 8 : 12;

  return (
    <>
      {/* Base gradient background */}
      <Box
        aria-hidden
        sx={(t) => {
          const palette = t.palette;
          const isLight = palette.mode === 'light';

          // Define colors for light and dark
          const colors = isLight
            ? [
                palette.background.default,
                palette.background.paper,
                palette.primary.light,
                palette.background.default,
              ]
            : [
                palette.background.default,
                palette.background.paper,
                palette.primary.dark,
                palette.background.default,
              ];

          // Multi-color gradient
          const gradient = `linear-gradient(120deg, ${colors[0]} 0%, ${colors[1]} 40%, ${colors[2]} 70%, ${colors[3]} 100%)`;

          return {
            position: 'fixed',
            inset: 0,
            zIndex: -2,
            overflow: 'hidden',
            background: gradient,
            backgroundSize: '300% 300%',
            animation: 'bgShift 12s ease-in-out infinite',
            filter: isLight
              ? 'brightness(1) saturate(1.1)'
              : 'brightness(0.75) saturate(0.9)',
            transition: 'filter .6s ease',
            '@keyframes bgShift': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            },
          };
        }}
      />
      
      {/* Floating particles layer */}
      <Box
        aria-hidden
        sx={(t) => {
          const isLight = t.palette.mode === 'light';
          
          return {
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            overflow: 'hidden',
            pointerEvents: 'none',
            // Keyframe animations
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' }
            },
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 0.8 }
            },
            '@keyframes drift': {
              '0%': { transform: 'translateX(0px)' },
              '33%': { transform: 'translateX(30px)' },
              '66%': { transform: 'translateX(-20px)' },
              '100%': { transform: 'translateX(0px)' }
            }
          };
        }}
      >
        {/* Generate floating particles */}
        {Array.from({ length: particleCount }).map((_, i) => {
          const size = Math.random() * 100 + 20; // 20-120px
          const left = Math.random() * 100; // 0-100%
          const top = Math.random() * 100; // 0-100%
          const animDelay = Math.random() * 20; // 0-20s
          const rotateSpeed = 15 + Math.random() * 25; // 15-40s
          const floatSpeed = 8 + Math.random() * 12; // 8-20s
          const driftSpeed = 25 + Math.random() * 35; // 25-60s
          
          return (
            <Box
              key={i}
              sx={(t) => {
                const isLight = t.palette.mode === 'light';
                const baseColor = isLight 
                  ? t.palette.primary.light 
                  : t.palette.primary.dark;
                
                return {
                  position: 'absolute',
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  background: isLight
                    ? `radial-gradient(circle, ${baseColor}40, ${baseColor}20, transparent)`
                    : `radial-gradient(circle, ${baseColor}60, ${baseColor}30, transparent)`,
                  border: isLight 
                    ? `1px solid ${baseColor}30`
                    : `1px solid ${baseColor}50`,
                  backdropFilter: 'blur(1px)',
                  animation: `
                    rotate ${rotateSpeed}s linear infinite,
                    float ${floatSpeed}s ease-in-out infinite,
                    pulse ${floatSpeed * 1.5}s ease-in-out infinite,
                    drift ${driftSpeed}s ease-in-out infinite
                  `,
                  animationDelay: `${animDelay}s, ${animDelay * 0.5}s, ${animDelay * 0.3}s, ${animDelay * 0.7}s`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '20%',
                    borderRadius: '50%',
                    background: isLight
                      ? `radial-gradient(circle, ${baseColor}60, transparent)`
                      : `radial-gradient(circle, ${baseColor}80, transparent)`,
                    animation: `pulse ${floatSpeed * 0.8}s ease-in-out infinite reverse`,
                    animationDelay: `${animDelay * 0.2}s`,
                  }
                };
              }}
            />
          );
        })}
        
        {/* Additional decorative elements */}
        {Array.from({ length: Math.floor(particleCount / 2) }).map((_, i) => {
          const size = Math.random() * 60 + 40; // 40-100px
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const animDelay = Math.random() * 30;
          const rotateSpeed = 30 + Math.random() * 50; // Slower rotation
          
          return (
            <Box
              key={`deco-${i}`}
              sx={(t) => {
                const isLight = t.palette.mode === 'light';
                const secondaryColor = isLight 
                  ? t.palette.secondary.light 
                  : t.palette.secondary.dark;
                
                return {
                  position: 'absolute',
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  border: isLight 
                    ? `2px solid ${secondaryColor}20`
                    : `2px solid ${secondaryColor}40`,
                  borderRadius: '50%',
                  animation: `
                    rotate ${rotateSpeed}s linear infinite reverse,
                    pulse ${rotateSpeed * 0.6}s ease-in-out infinite
                  `,
                  animationDelay: `${animDelay}s, ${animDelay * 0.4}s`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '30%',
                    borderRadius: '50%',
                    border: isLight 
                      ? `1px solid ${secondaryColor}30`
                      : `1px solid ${secondaryColor}50`,
                    animation: `rotate ${rotateSpeed * 0.7}s linear infinite`,
                    animationDelay: `${animDelay * 0.6}s`,
                  }
                };
              }}
            />
          );
        })}
      </Box>
      
      {/* Overlay for additional depth */}
      <Box
        aria-hidden
        sx={(t) => {
          const isLight = t.palette.mode === 'light';
          
          return {
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            background: isLight
              ? 'radial-gradient(circle at 70% 60%, rgba(133, 188, 255, 0.1), rgba(255,255,255,0.3) 80%)'
              : 'radial-gradient(circle at 30% 40%, rgba(73, 110, 155, 0.15), rgba(0,0,0,0.5) 80%)',
            mixBlendMode: isLight ? 'soft-light' : 'overlay',
            pointerEvents: 'none'
          };
        }}
      />
    </>
  );
};

export default AnimatedBackground;
