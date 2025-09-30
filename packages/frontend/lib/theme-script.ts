/**
 * Theme Script - Alpine Tech Design System
 * Script d'initialisation de thème pour éviter le FOUC (Flash of Unstyled Content)
 */

export const themeScript = `
(function() {
  try {
    var storageKey = 'summitstride-theme';
    var theme = localStorage.getItem(storageKey) || 'system';
    var resolved = theme;

    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
  } catch (e) {
    // Fallback to light theme if any error
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.add('light');
  }
})();
`;
