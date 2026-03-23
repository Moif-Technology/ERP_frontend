/**
 * MOIF Back Office Theme
 * Central theme constants for colors, shadows, radius and typography
 */

export const colors = {

  // Primary (Maroon)
  primary: {
    DEFAULT: "#790728",
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

/** Input field with short description label above. Use for labeled form inputs. */
export const inputField = {
  /** Label/description above the input box */
  label: {
    fontSize: "11px",
    color: "#000000",
    lineHeight: "15px",
  },
  /** The input box itself */
  box: {
    width: "200.13px",
    height: "28px",
    borderRadius: "4px",
  },
  /** Dropdown - same as box but with arrow on the right. Use with dropdown.svg icon. */
  dropdown: {
    width: "165.13px",
    height: "28px",
    borderRadius: "4px",
  },
  /** Sub input field - smaller size */
  subBox: {
    width: "82.57px",
    height: "28px",
    borderRadius: "4px",
  },
};

/** Common table UI style tokens */
export const tableUi = {
  border: '1px solid #e2e8f0',
  header: {
    backgroundColor: '#F2E6EA',
    fontSize: '7.98px',
    fontWeight: 700,
    color: '#000000',
    borderRadius: '6.98px',
  },
  body: {
    fontSize: '7.98px',
    fontWeight: 400,
    color: '#000000',
  },
};

export const typography = {
  fontFamily: {
    sans: '"Open Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: '"Times New Roman", Georgia, serif',
  },

  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
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

export default theme;
