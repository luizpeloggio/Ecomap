/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#059669'; // Emerald Green
const tintColorDark = '#34d399';  // Light Emerald

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f9fafb', // soft off-white background
    tint: tintColorLight,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
    cardBackground: '#ffffff',
    cardBorder: '#e5e7eb',
    inputBackground: '#f3f4f6',
    inputText: '#11181C',
    placeholder: '#9ca3af',
    subitemHeader: '#f3f4f6',
    subitemContent: '#ffffff',
    divider: '#f3f4f6',
  },
  dark: {
    text: '#f9fafb',
    background: '#0f172a', // deep blue-slate dark background
    tint: tintColorDark,
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
    cardBackground: '#1e293b', // darker blue-slate card
    cardBorder: '#334155',
    inputBackground: '#0f172a',
    inputText: '#f9fafb',
    placeholder: '#6b7280',
    subitemHeader: '#1e293b',
    subitemContent: '#0f172a',
    divider: '#334155',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
