// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://constructcalc.com',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
