/**
 * MOIF Back Office Theme
 * Central theme constants for colors, shadows, radius and typography
 */

export const colors = {

  // Primary (Maroon)
  primary: {
    DEFAULT: "#790728",
    main: "#790728",
    gradient: 'linear-gradient(180deg, #C44972 0%, #923A53 23%, #85203E 52%, #790728 95%)',
    50: "#F2E6EA",
    100: "#E4CDD3",
    200: "#D5B4BF",
    300: "#C89DA7",
    400: "#BB8295",
    500: "#AD6A7C",
    600: "#A0526A",
    700: "#85203E",
    800: "#85203E",
    900: "#790728",
    // 950: "#400000",

  },

  // Accent Blue
  accent: {
    DEFAULT: "#0000C0",
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#0000C0",
  },

  // Input fields
  input: {
    background: "#F5F5F5",
    backgroundAlt: "#FFFAF0",
  },

  // Semantic colors
  success: "#00C000",
  error: "#C00000",
  warning: "#C04000",
  link: "#0000C0",
  info: "#3A6EA5",

  // Secondary text
  sienna: "#804040",

  // Neutral colors
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },

  // Surfaces
  background: "#ffffff",
  surface: "#ffffff",
  surfaceElevated: "#ffffff",
};

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
};

export const borderRadius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
};

/**
 * Single source of truth for all UI-level font sizes.
 * Change here → every component that imports uiFontSizes updates automatically.
 */
export const uiFontSizes = {
  label:        '12px',   // labels above inputs / form field captions
  input:        '12px',   // text typed inside inputs & selects
  button:       '11px',   // toolbar & action button labels
  tableHeader:  '11px',   // table column header text
  tableBody:    '11px',   // table body cell text
  pageTitle:    '20px',   // main page heading (WORKSHOP MONITOR, etc.)
  sectionTitle: '13px',   // section / panel headings
  sidebar:      '12px',   // sidebar item labels
  badge:        '10px',   // badges, status pills, row-count tags
  caption:      '10px',   // pagination info, helper text
};

/** Input field with short description label above. Use for labeled form inputs. */
export const inputField = {
  /** Label/description above the input box */
  label: {
    fontSize: uiFontSizes.label,
    color: "#000000",
    lineHeight: "18px",
  },
  /** The input box itself — DateInputField uses dateBox for width; parent gap controls spacing */
  box: {
    width: "180px",
    height: "26px",
    borderRadius: "4px",
  },
  /** Dropdown — same footprint as box */
  dropdown: {
    width: "180px",
    height: "26px",
    borderRadius: "4px",
  },
  /** Sub input field — half-width of box, same height */
  subBox: {
    width: "90px",
    height: "26px",
    borderRadius: "4px",
  },
  /** Date field — same height as box, narrower width for DD/MM/YYYY */
  dateBox: {
    width: "120px",
    height: "26px",
    borderRadius: "4px",
  },
};

/** Common table UI style tokens */
export const tableUi = {
  border: '1px solid #e2e8f0',
  header: {
    backgroundColor: '#F2E6EA',
    fontSize: '11px',
    fontWeight: 700,
    color: '#000000',
    borderRadius: '6.98px',
  },
  body: {
    fontSize: '11px',
    fontWeight: 400,
    color: '#000000',
  },
};

/**
 * CommonTable defaults for Item Details / Home-style inventory grids (pink header, compact body).
 */
export const itemDetailsTablePreset = {
  fitParentWidth: true,
  allowHorizontalScroll: true,
  truncateHeader: true,
  truncateBody: true,
  hideVerticalCellBorders: true,
  cellAlign: 'center',
  headerBackgroundColor: tableUi.header.backgroundColor,
  headerTextColor: tableUi.header.color,
  headerFontSize: 'clamp(7px, 0.75vw, 9px)',
  bodyFontSize: 'clamp(8px, 0.85vw, 10px)',
  cellPaddingClass: 'px-1 py-1 sm:px-1.5 sm:py-1.5',
};

export const typography = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: '"Times New Roman", Georgia, serif',
  },

  fontSize: {
    xs: "0.875rem",    // 14px
    sm: "1rem",        // 16px
    base: "1.125rem",  // 18px
    lg: "1.25rem",     // 20px
    xl: "1.5rem",      // 24px
    "2xl": "1.75rem",  // 28px
    "3xl": "2rem",     // 32px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
};

const theme = {
  colors,
  borderRadius,
  shadows,
  typography,
  inputField,
  tableUi,
};

/** Compact list-table row checkbox (use with style={{ accentColor: primary }}) */
export const listTableCheckboxClass =
  'h-2.5 w-2.5 min-h-2.5 min-w-2.5 shrink-0 cursor-pointer sm:h-3 sm:w-3';

export default theme;
