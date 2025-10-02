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
          const colors = palette.mode === 'light'
            ? [palette.primary.light, palette.secondary.light, palette.primary.main]
            : [palette.primary.dark, (palette.secondary && palette.secondary.dark) || palette.secondary?.main || palette.primary.main, palette.background.default];
          const gradient = `linear-gradient(120deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
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
              backgroundSize: bgSize,
              animation: prefersReducedMotion ? 'none' : `bgShift ${animDuration} ease-in-out infinite`,
              filter: palette.mode === 'dark' ? 'brightness(.85) saturate(.9)' : 'brightness(1) saturate(1.05)',
              transition: 'filter .6s ease'
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: palette.mode === 'dark'
                ? 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.08), transparent 60%)'
                : 'radial-gradient(circle at 70% 60%, rgba(255,255,255,0.35), transparent 65%)',
              mixBlendMode: palette.mode === 'dark' ? 'overlay' : 'soft-light',
              pointerEvents: 'none'
            },
            '@keyframes bgShift': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            }
          };
        }}
      />
    </>
  );
};

export default AnimatedBackground;
