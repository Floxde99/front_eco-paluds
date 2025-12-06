import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize output - use default esbuild minifier (faster and built-in)
    target: 'es2020',
    // Enable CSS code splitting for parallel loading
    cssCodeSplit: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Improved manual chunks for better caching and parallel loading
        manualChunks: {
          // Core React ecosystem - rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching layer
          'vendor-query': ['@tanstack/react-query'],
          // Map components - heavy but only needed on specific pages
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // Icons - frequently used but can be deferred
          'vendor-icons': ['lucide-react'],
          // Validation
          'vendor-zod': ['zod'],
        },
        // Asset file naming for better caching
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').at(1) || ''
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Enable source maps for debugging in production (optional)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Preview server configuration
  preview: {
    port: 4173,
  },
  // Development server
  server: {
    port: 5173,
  },
})
