export const Colors = {
  primary:       '#7C3AED',
  primaryDark:   '#4C1D95',
  primaryMid:    '#6D28D9',
  primaryLight:  '#8B5CF6',
  primarySoft:   '#EDE9FE',
  primaryBorder: '#C4B5FD',

  gradientStart: '#4C1D95',
  gradientEnd:   '#7C3AED',

  background:  '#F5F3FF',
  surface:     '#FFFFFF',
  surfaceAlt:  '#FAF9FF',

  textPrimary:   '#1A1033',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',
  textInverse:   '#FFFFFF',
  textLink:      '#7C3AED',

  success:     '#10B981',
  successSoft: '#D1FAE5',
  warning:     '#F59E0B',
  warningSoft: '#FEF3C7',
  error:       '#EF4444',
  errorSoft:   '#FEE2E2',
  info:        '#3B82F6',
  infoSoft:    '#DBEAFE',

  border:      '#E5E7EB',
  borderFocus: '#7C3AED',
  divider:     '#F3F4F6',

  tabActive:     '#7C3AED',
  tabInactive:   '#9CA3AF',
  tabBackground: '#FFFFFF',
} as const;

export const Gradients = {
  primary: [Colors.gradientStart, Colors.gradientEnd] as const,
  soft:    ['#EDE9FE', '#FFFFFF'] as const,
  card:    ['#FFFFFF', '#FAF9FF'] as const,
} as const;

export const Typography = {
  fontFamily: {
    regular:   'Nunito_400Regular',
    medium:    'Nunito_500Medium',
    semiBold:  'Nunito_600SemiBold',
    bold:      'Nunito_700Bold',
    extraBold: 'Nunito_800ExtraBold',
    mono:      'JetBrainsMono_400Regular',
    monoBold:  'JetBrainsMono_700Bold',
  },
  size: {
    xs:    11,
    sm:    13,
    base:  15,
    md:    16,
    lg:    18,
    xl:    20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  '0':  0,
  '1':  4,
  '2':  8,
  '3':  12,
  '4':  16,
  '5':  20,
  '6':  24,
  '8':  32,
  '10': 40,
  '12': 48,
  '16': 64,
  screenH: 20,
  screenV: 24,
} as const;

export const Radius = {
  sm:    6,
  md:    12,
  lg:    16,
  xl:    20,
  '2xl': 24,
  full:  9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
