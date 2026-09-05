export const resolveInitialAdminTheme = ({
  storedTheme,
  viewportIsMobile = false,
  prefersLight = false,
} = {}) => {
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;

  return viewportIsMobile ? 'dark' : prefersLight ? 'light' : 'dark';
};
