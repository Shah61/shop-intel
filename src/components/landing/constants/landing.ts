/** Placeholder avatars for future sections (e.g. social proof). */
export const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
] as const

export const NAV_LINKS = [
  'Our Features',
  'Why Pulse',
  'Pricing',
] as const

export const HERO_FEATURE_LABELS = [
  'Content Improver',
  'Analytics Engine',
  'Task Automation',
] as const

/** Hero imagery under `/public/images`. */
export const LANDING_IMAGES = {
  backgroundAvif: '/images/bg1.avif',
  dashboard: '/images/dashboard.png',
  leftSide: '/images/leftside.png',
  rightSide: '/images/rightside2.png',
} as const

/**
 * Responsive background (Framer-style srcSet + sizes). Uses one AVIF; swap URLs
 * if you add 512/1024/1440 exports later.
 */
export const BG_IMAGE_SRCSET = [
  `${LANDING_IMAGES.backgroundAvif} 512w`,
  `${LANDING_IMAGES.backgroundAvif} 1024w`,
  `${LANDING_IMAGES.backgroundAvif} 1440w`,
].join(', ')
