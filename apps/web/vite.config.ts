import { defineConfig } from 'vite-plus'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  lint: {
    ignorePatterns: ['dist/**', 'src/routeTree.gen.ts'],
  },
  fmt: {
    semi: false,
    singleQuote: true,
  },
})
