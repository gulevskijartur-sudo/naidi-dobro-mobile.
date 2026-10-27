/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#34231B',
    tint: '#E97932',

    // Core surfaces
    background: '#FFF9F4',
    foreground: '#34231B',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#34231B',

    // Primary action color (buttons, links, active states)
    primary: '#E97932',
    primaryDeep: '#C85B28',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#FCE9DB',
    secondaryForeground: '#9A4D26',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#F6EEE8',
    mutedForeground: '#897970',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FFF0E4',
    accentForeground: '#A85027',

    // Destructive actions (delete, error states)
    destructive: '#C8473D',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#F0E2D8',
    input: '#E9D8CC',
    success: '#397B5A',
    mapLand: '#F1F0E4',
    mapPark: '#DCE7CF',
    mapRoad: '#FFFFFF',
    mapWater: '#D5E8E5',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 22,
};

export default colors;
