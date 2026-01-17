import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable modulepreload completely - chunks will load on demand
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core vendor chunks - always needed
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }

          // Supabase - needed for auth
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }

          // UI components - commonly used
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-ui';
          }

          // PDF libraries - only load when exporting PDFs (do NOT include in common chunks)
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas') ||
              id.includes('node_modules/canvg')) {
            return 'vendor-pdf';
          }

          // Charts - only needed on analytics pages
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }

          // Forms - loaded when forms are used
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform/') ||
              id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }

          // Utils - commonly used small libs
          if (id.includes('node_modules/date-fns') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/class-variance-authority')) {
            return 'vendor-utils';
          }
        },
      },
    },
    // Increase chunk size warning limit since we've manually chunked
    chunkSizeWarningLimit: 600,
  },
}));
