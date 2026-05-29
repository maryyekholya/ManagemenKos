import React from 'react';
import { motion } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  variant?: 'slideInOut' | 'fadeInOut' | 'zoomInOut' | 'rotateInOut' | 'scaleInOut';
}

// Different animation variations
const variantAnimations = {
  slideInOut: {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  },
  fadeInOut: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  },
  zoomInOut: {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.95 },
  },
  rotateInOut: {
    initial: { opacity: 0, rotate: -5 },
    in: { opacity: 1, rotate: 0 },
    out: { opacity: 0, rotate: 5 },
  },
  scaleInOut: {
    initial: { opacity: 0, scale: 0.9 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.1 },
  },
};

const defaultTransition = {
  type: 'tween',
  duration: 0.7,
  ease: 'easeInOut',
};

/**
 * PageTransition Component with Multiple Animation Variants
 * 
 * Usage:
 * <PageTransition pageKey={currentView} variant="slideInOut">
 *   {children}
 * </PageTransition>
 * 
 * Available variants:
 * - slideInOut: Slide from right to left (default)
 * - fadeInOut: Simple fade in/out
 * - zoomInOut: Scale animation
 * - rotateInOut: Slight rotation during transition
 * - scaleInOut: Scale from smaller to normal size
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  pageKey, 
  variant = 'slideInOut' 
}) => {
  const variants = variantAnimations[variant];

  return (
    <motion.div
      key={pageKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={defaultTransition}
    >
      {children}
    </motion.div>
  );
};

/**
 * Advanced PageTransition with custom stagger animation for child elements
 */
export const PageTransitionWithStagger: React.FC<PageTransitionProps & { staggerDelay?: number }> = ({ 
  children, 
  pageKey, 
  variant = 'slideInOut',
  staggerDelay = 0.1
}) => {
  const variants = variantAnimations[variant];

  const containerVariants = {
    initial: variants.initial,
    in: variants.in,
    out: variants.out,
  };

  return (
    <motion.div
      key={pageKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={containerVariants}
      transition={defaultTransition}
    >
      {children}
    </motion.div>
  );
};
