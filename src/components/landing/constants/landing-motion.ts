/** Staggered intro on first paint (ms). Order: logo → nav links → letters → dashboard → sides. */

export const HEADER_LOGO_DELAY_MS = 90

const LINK_START = 175
const LINK_STAGGER = 72

export const HEADER_NAV_LINK_DELAYS_MS = [0, 1, 2].map(
  (i) => LINK_START + i * LINK_STAGGER,
) as readonly number[]

/** After last nav link has started + brief pause */
const LETTERS_START = LINK_START + 2 * LINK_STAGGER + 140

const LETTER_STAGGER = 48

export const letterDelayMs = (index: number) =>
  LETTERS_START + index * LETTER_STAGGER

export const DASHBOARD_DELAY_MS =
  LETTERS_START + 12 * LETTER_STAGGER + 200

const SIDES_DELAY = DASHBOARD_DELAY_MS + 520

export const SIDE_LEFT_DELAY_MS = SIDES_DELAY
export const SIDE_RIGHT_DELAY_MS = SIDES_DELAY + 80

export const BOTTOM_LABELS_DELAY_MS = SIDES_DELAY + 400
