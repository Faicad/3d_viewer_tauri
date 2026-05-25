window.env = {
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  E2E: import.meta.env.VITE_E2E === 'true',
}
