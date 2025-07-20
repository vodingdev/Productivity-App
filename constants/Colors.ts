export const Colors = {
  light: {
    // Base colors - clean, bold approach
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    surfaceDark: '#EEEEEE',
    
    // Action colors - bold and confident
    primary: '#FF6B35',
    primaryHover: '#E55A2B',
    primaryLight: '#FF6B3520',
    secondary: '#2E86AB',
    success: '#06D6A0',
    warning: '#FFD23F',
    error: '#F18F01',
    
    // Text hierarchy - strong contrast
    text: '#1A1A1A',
    textSecondary: '#2D2D2D',
    textTertiary: '#4A4A4A',
    textMuted: '#6B6B6B',
    textDisabled: '#9E9E9E',
    
    // Borders and dividers
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    borderStrong: '#CCCCCC',
    
    // Interactive states
    hover: '#F8F8F8',
    pressed: '#F0F0F0',
    focus: '#FF6B3530',
    
    // Shadows and overlays
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowStrong: 'rgba(0, 0, 0, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Tab bar
    tabBar: '#FFFFFF',
    tabBarBorder: '#E0E0E0',
    tabBarShadow: 'rgba(0, 0, 0, 0.05)',
    
    // Status bar
    statusBar: 'dark',
    
    // Grain overlay
    grain: 'rgba(0, 0, 0, 0.02)',
  },
  dark: {
    // Base colors - faded dark aesthetic
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceSecondary: '#252525',
    surfaceElevated: '#1F1F1F',
    surfaceDark: '#0A0A0A',
    
    // Action colors - vibrant against dark
    primary: '#FF7A4D',
    primaryHover: '#FF8A5D',
    primaryLight: '#FF7A4D30',
    secondary: '#4A9BC7',
    success: '#26E5B8',
    warning: '#FFE066',
    error: '#FF9F1A',
    
    // Text hierarchy - faded but readable
    text: '#E8E8E8',
    textSecondary: '#D0D0D0',
    textTertiary: '#B8B8B8',
    textMuted: '#8A8A8A',
    textDisabled: '#5A5A5A',
    
    // Borders and dividers - subtle
    border: '#2A2A2A',
    borderLight: '#222222',
    borderStrong: '#3A3A3A',
    
    // Interactive states
    hover: '#252525',
    pressed: '#2F2F2F',
    focus: '#FF7A4D40',
    
    // Shadows and overlays
    shadow: 'rgba(0, 0, 0, 0.4)',
    shadowStrong: 'rgba(0, 0, 0, 0.6)',
    overlay: 'rgba(0, 0, 0, 0.8)',
    
    // Tab bar
    tabBar: '#1A1A1A',
    tabBarBorder: '#2A2A2A',
    tabBarShadow: 'rgba(0, 0, 0, 0.4)',
    
    // Status bar
    statusBar: 'light',
    
    // Grain overlay
    grain: 'rgba(255, 255, 255, 0.02)',
  },
};

export const Typography = {
  // Font sizes - bold scale
  xs: 11,
  sm: 13,
  base: 16,
  lg: 19,
  xl: 24,
  '2xl': 32,
  '3xl': 42,
  '4xl': 56,
  '5xl': 72,
  '6xl': 96,
  
  // Line heights
  lineHeight: {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5,
  },
  
  // Font weights
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  
  // Font families - bold hierarchy
  family: {
    display: 'Inter-Heavy',
    displayBold: 'Inter-Bold',
    displayMedium: 'Inter-Semibold',
    displayLight: 'Inter-Medium',
    body: 'Inter-Regular',
    bodyMedium: 'Inter-Medium',
    bodySemibold: 'Inter-Semibold',
    bodyBold: 'Inter-Bold',
  },
};

export const Spacing = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 104,
  '8xl': 128,
};

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  '3xl': 36,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 12,
  },
};