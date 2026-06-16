/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Dark mode is driven by `@custom-variant dark` in app/globals.css.
    "@tailwindcss/postcss": {},
  },
};

export default config;
