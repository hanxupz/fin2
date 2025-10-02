import React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const AnimatedBackground = ({ className = '' }) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Heuristic for lower-performance devices: low device memory or few CPU cores
  const isLowPerf = typeof navigator !== 'undefined' && (
    (navigator.deviceMemory && navigator.deviceMemory < 2) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)
  );

  const animDuration = isLowPerf ? '80s' : '38s';
  const bgSize = isLowPerf ? '200% 200%' : '320% 320%';

  return (
    <>
      {/* Programmatic animated layer (theme-aware) */}
      <Box
        aria-hidden
        sx={(t) => {
          const palette = t.palette;
          const isLight = palette.mode === 'light';

          // Define colors for light and dark
          const colors = isLight
            ? [
                palette.primary.light,
                palette.secondary.light,
                palette.info.light,
                palette.background.default,
              ]
            : [
                palette.primary.dark,
                palette.secondary?.dark || palette.secondary?.main || palette.primary.main,
                palette.info.dark,
                palette.background.default,
              ];

          // Multi-color gradient
          const gradient = `linear-gradient(120deg, ${colors[0]} 0%, ${colors[1]} 40%, ${colors[2]} 70%, ${colors[3]} 100%)`;

          return {
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: gradient,
              backgroundSize: '300% 300%',
              animation: 'bgShift 12s ease-in-out infinite, hueRotate 30s linear infinite',
              filter: isLight
                ? 'brightness(1) saturate(1.1)'
                : 'brightness(0.75) saturate(0.9)',
              transition: 'filter .6s ease'
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: isLight
                ? 'radial-gradient(circle at 70% 60%, rgba(133, 188, 255, 0.4), rgba(255,255,255,0.8) 80%)'
                : 'radial-gradient(circle at 30% 40%, rgba(73, 110, 155, 0.25), rgba(0,0,0,0.9) 80%)',
              mixBlendMode: isLight ? 'soft-light' : 'overlay',
              pointerEvents: 'none'
            },
            '@keyframes bgShift': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            },
            '@keyframes hueRotateSoft': {
              '0%': { filter: 'hue-rotate(-20deg)' },
              '50%': { filter: 'hue-rotate(20deg)' },
              '100%': { filter: 'hue-rotate(-20deg)' }
            }
          };
        }}
      />
    </>
  );
};

export default AnimatedBackground;
