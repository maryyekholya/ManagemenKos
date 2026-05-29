/**
 * COMPONENT — PageTransition
 *
 * Animasi transisi halaman premium dengan spring physics.
 * Mendukung arah slide yang dapat dikonfigurasi per-halaman.
 *
 * Variants:
 *  - slideRight  : masuk dari kiri, keluar ke kanan (untuk login → landing)
 *  - slideLeft   : masuk dari kanan, keluar ke kiri (untuk landing → login)
 *  - fadeInOut   : fade murni (untuk halaman utama)
 *  - zoomInOut   : zoom scale (untuk dashboard)
 *  - scaleUp     : masuk lebih kecil, keluar biasa (untuk auth pages)
 */

import React from 'react';
import { motion } from 'motion/react';

// ──────────────────────────────────────
// TYPES
// ──────────────────────────────────────

export type TransitionVariant =
  | 'slideLeft'
  | 'slideRight'
  | 'fadeInOut'
  | 'zoomInOut'
  | 'scaleUp'
  | 'slideInOut'; // backwards compat

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  variant?: TransitionVariant;
}

// ──────────────────────────────────────
// ANIMATION DEFINITIONS
// ──────────────────────────────────────

const variantAnimations: Record<
  TransitionVariant,
  { initial: object; in: object; out: object }
> = {
  slideLeft: {
    initial: { opacity: 0, x: 60 },
    in:      { opacity: 1, x: 0 },
    out:     { opacity: 0, x: -60 },
  },
  slideRight: {
    initial: { opacity: 0, x: -60 },
    in:      { opacity: 1, x: 0 },
    out:     { opacity: 0, x: 60 },
  },
  fadeInOut: {
    initial: { opacity: 0 },
    in:      { opacity: 1 },
    out:     { opacity: 0 },
  },
  zoomInOut: {
    initial: { opacity: 0, scale: 0.97, y: 12 },
    in:      { opacity: 1, scale: 1,    y: 0 },
    out:     { opacity: 0, scale: 0.97, y: -12 },
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.93 },
    in:      { opacity: 1, scale: 1 },
    out:     { opacity: 0, scale: 1.03 },
  },
  // backwards compatibility
  slideInOut: {
    initial: { opacity: 0, x: 50 },
    in:      { opacity: 1, x: 0 },
    out:     { opacity: 0, x: -50 },
  },
};

// ──────────────────────────────────────
// TRANSITION CONFIGS
// ──────────────────────────────────────

/** Transisi spring untuk halaman auth (lebih responsif & hidup) */
const authTransition = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 28,
  mass: 0.8,
};

/** Transisi tween untuk halaman dashboard (lebih smooth) */
const dashboardTransition = {
  type: 'tween' as const,
  duration: 0.45,
  ease: [0.4, 0, 0.2, 1], // Material Design easing
};

/** Transisi fade ringan */
const fadeTransition = {
  type: 'tween' as const,
  duration: 0.3,
  ease: 'easeInOut',
};

// ──────────────────────────────────────
// PER-PAGE TRANSITION CONFIG
// ──────────────────────────────────────

interface PageConfig {
  variant: TransitionVariant;
  transition: object;
}

const PAGE_TRANSITION_MAP: Record<string, PageConfig> = {
  login:               { variant: 'slideLeft',  transition: authTransition },
  register:            { variant: 'slideRight', transition: authTransition },
  'verify-email':      { variant: 'scaleUp',    transition: authTransition },
  landing:             { variant: 'fadeInOut',  transition: fadeTransition },
  'landing-rooms':     { variant: 'fadeInOut',  transition: fadeTransition },
  'booking-flow':      { variant: 'slideLeft',  transition: authTransition },
  'user-dashboard':    { variant: 'zoomInOut',  transition: dashboardTransition },
  'admin-dashboard':   { variant: 'zoomInOut',  transition: dashboardTransition },
  'manager-dashboard': { variant: 'zoomInOut',  transition: dashboardTransition },
  'organizer-dashboard': { variant: 'zoomInOut', transition: dashboardTransition },
  'status-checker':    { variant: 'slideLeft',  transition: authTransition },
};

const DEFAULT_CONFIG: PageConfig = {
  variant: 'fadeInOut',
  transition: fadeTransition,
};

// ──────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────

/**
 * PageTransition — animasi transisi halaman premium
 *
 * Secara otomatis memilih variant & transition yang tepat
 * berdasarkan pageKey. Dapat di-override dengan prop `variant`.
 *
 * Usage:
 * ```tsx
 * <AnimatePresence mode="wait">
 *   <PageTransition pageKey={currentView}>
 *     {renderView()}
 *   </PageTransition>
 * </AnimatePresence>
 * ```
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  variant,
}) => {
  const config = PAGE_TRANSITION_MAP[pageKey] ?? DEFAULT_CONFIG;
  const activeVariant = variant ?? config.variant;
  const animations = variantAnimations[activeVariant];

  return (
    <motion.div
      key={pageKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={animations}
      transition={config.transition}
    >
      {children}
    </motion.div>
  );
};

// ──────────────────────────────────────
// STAGGER VARIANT (untuk child elements)
// ──────────────────────────────────────

export const PageTransitionWithStagger: React.FC<
  PageTransitionProps & { staggerDelay?: number }
> = ({ children, pageKey, variant, staggerDelay = 0.08 }) => {
  const config = PAGE_TRANSITION_MAP[pageKey] ?? DEFAULT_CONFIG;
  const activeVariant = variant ?? config.variant;
  const animations = variantAnimations[activeVariant];

  return (
    <motion.div
      key={pageKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={animations}
      transition={config.transition}
    >
      {children}
    </motion.div>
  );
};
