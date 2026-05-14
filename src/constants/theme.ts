export const Colors = {
  primary: "#22C55E",
  primaryDark: "#16A34A",
  primaryLight: "#86EFAC",
  primarySoft: "#DCFCE7",
  accent: "#F97316",
  accentSoft: "#FFEDD5",

  background: "#FFFFFF",
  surface: "#F8FAFC",
  card: "#FFFFFF",

  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  inputBg: "#F1F5F9",
  inputFocusBg: "#FFFFFF",
  inputBorder: "#E2E8F0",
  inputFocusBorder: "#22C55E",

  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
  success: "#10B981",
  warning: "#F59E0B",

  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(15, 23, 42, 0.4)",

  gradientStart: "#16A34A",
  gradientMid: "#22C55E",
  gradientEnd: "#84CC16",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 30,
  hero: 36,
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  primary: {
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;
