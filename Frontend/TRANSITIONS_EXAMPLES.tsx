// PAGE TRANSITIONS - USAGE EXAMPLES
// File: Frontend/src/components/shared/PageTransition.tsx

// ==========================================
// EXAMPLE 1: Default Usage (Current Setup)
// ==========================================
// In App.tsx - uses slideInOut variant
/*
<AnimatePresence mode="wait">
  <PageTransition pageKey={state.currentView}>
    {renderView()}
  </PageTransition>
</AnimatePresence>
*/

// ==========================================
// EXAMPLE 2: Change to Fade Animation
// ==========================================
// In App.tsx - subtle and minimalist
/*
<AnimatePresence mode="wait">
  <PageTransition pageKey={state.currentView} variant="fadeInOut">
    {renderView()}
  </PageTransition>
</AnimatePresence>
*/

// ==========================================
// EXAMPLE 3: Zoom Animation (Modern Look)
// ==========================================
// In App.tsx - energetic and modern
/*
<AnimatePresence mode="wait">
  <PageTransition pageKey={state.currentView} variant="zoomInOut">
    {renderView()}
  </PageTransition>
</AnimatePresence>
*/

// ==========================================
// EXAMPLE 4: Per-View Custom Animations
// ==========================================
// Untuk animasi berbeda tergantung view
/*
const getAnimationVariant = (view: string): 'slideInOut' | 'fadeInOut' | 'zoomInOut' => {
  if (view === 'login' || view === 'register') return 'fadeInOut';
  if (view === 'admin-dashboard') return 'zoomInOut';
  return 'slideInOut';
};

return (
  <AnimatePresence mode="wait">
    <PageTransition 
      pageKey={state.currentView} 
      variant={getAnimationVariant(state.currentView)}
    >
      {renderView()}
    </PageTransition>
  </AnimatePresence>
);
*/

// ==========================================
// EXAMPLE 5: Faster Animation (0.2s)
// ==========================================
// Edit PageTransition.tsx:
/*
const defaultTransition = {
  type: 'tween',
  duration: 0.2,  // Changed from 0.4
  ease: 'easeInOut',
};
*/

// ==========================================
// EXAMPLE 6: Slower Animation (0.6s)
// ==========================================
// Edit PageTransition.tsx for more dramatic effect:
/*
const defaultTransition = {
  type: 'tween',
  duration: 0.6,  // More dramatic
  ease: 'easeInOut',
};
*/

// ==========================================
// EXAMPLE 7: Custom Animation Variant
// ==========================================
// Add to variantAnimations in PageTransition.tsx:
/*
const variantAnimations = {
  // ... existing variants ...
  slideUpDown: {
    initial: { opacity: 0, y: 50 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -50 },
  },
  blurInOut: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    in: { opacity: 1, filter: 'blur(0px)' },
    out: { opacity: 0, filter: 'blur(10px)' },
  },
};

// Update interface
interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  variant?: 'slideInOut' | 'fadeInOut' | 'zoomInOut' | 'rotateInOut' | 'scaleInOut' | 'slideUpDown' | 'blurInOut';
}

// Use in App.tsx:
<PageTransition pageKey={state.currentView} variant="slideUpDown">
  {renderView()}
</PageTransition>
*/

// ==========================================
// EXAMPLE 8: Responsive Animations
// ==========================================
// Different animations based on device size
/*
const getDeviceVariant = () => {
  if (window.innerWidth < 768) {
    return 'fadeInOut';  // Simpler for mobile
  }
  return 'slideInOut';   // More elaborate for desktop
};

<PageTransition 
  pageKey={state.currentView} 
  variant={getDeviceVariant()}
>
  {renderView()}
</PageTransition>
*/

// ==========================================
// EXAMPLE 9: Using Stagger Animation
// ==========================================
// For animating multiple child elements
/*
import { PageTransitionWithStagger } from './components/shared/PageTransition';

<AnimatePresence mode="wait">
  <PageTransitionWithStagger 
    pageKey={state.currentView}
    variant="slideInOut"
    staggerDelay={0.05}  // 50ms between each child
  >
    {renderView()}
  </PageTransitionWithStagger>
</AnimatePresence>
*/

// ==========================================
// EXAMPLE 10: Animation with Delay
// ==========================================
// Delay the animation start
/*
// Add to PageTransition.tsx:
interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  variant?: 'slideInOut' | 'fadeInOut' | 'zoomInOut' | 'rotateInOut' | 'scaleInOut';
  delay?: number;  // NEW
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  pageKey, 
  variant = 'slideInOut',
  delay = 0
}) => {
  const variants = variantAnimations[variant];

  return (
    <motion.div
      key={pageKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={{
        ...defaultTransition,
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};

// Usage:
<PageTransition pageKey={state.currentView} delay={0.1}>
  {renderView()}
</PageTransition>
*/

// ==========================================
// ANIMATION TIMING COMPARISON
// ==========================================
// 0.1s  - Lightning fast (jarring)
// 0.2s  - Very fast (snappy)
// 0.3s  - Fast (responsive)
// 0.4s  - Balanced (current) ⭐
// 0.5s  - Smooth
// 0.6s  - Deliberate
// 0.8s  - Dramatic
// 1.0s+ - Too slow (feels sluggish)

// ==========================================
// EASING FUNCTIONS
// ==========================================
// - linear: constant speed
// - easeIn: slow start, fast end
// - easeOut: fast start, slow end
// - easeInOut: slow start and end, fast middle (recommended)
// - circIn: circular easing in
// - circOut: circular easing out
// - backIn: exaggerated easing in
// - backOut: exaggerated easing out

// ==========================================
// COMBINING WITH MOTION.DIV
// ==========================================
// For individual page animations:
/*
<motion.div
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -50 }}
  transition={{ duration: 0.4 }}
>
  <YourPageContent />
</motion.div>
*/

// ==========================================
// PERFORMANCE TIPS
// ==========================================
// 1. Use transform properties only (x, y, rotate, scale)
// 2. Avoid animating width/height (use scale instead)
// 3. Keep duration between 0.2-0.6 seconds
// 4. Use AnimatePresence mode="wait" for sequential animations
// 5. Hardware acceleration is automatic with motion/react

// ==========================================
// TESTING THE ANIMATIONS
// ==========================================
// 1. Start dev server: npm run dev
// 2. Navigate between pages and observe transitions
// 3. Try different variants to see which feels best
// 4. Adjust duration based on your preference
// 5. Test on mobile devices for performance

// ==========================================
// TROUBLESHOOTING
// ==========================================
// Animation not working?
// - Ensure AnimatePresence is wrapping the component
// - Check that pageKey changes when view changes
// - Verify motion/react is installed (npm install motion/react)

// Animation too fast/slow?
// - Adjust duration in defaultTransition object
// - Try different easing functions

// Page content jumps?
// - Check that page content height is consistent
// - Use min-h-screen to ensure full viewport height
// - Test with different screen sizes
