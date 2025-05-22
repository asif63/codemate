// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/codechef': {
        target: 'https://www.codechef.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/codechef/, '/api/list/contests/all')
      },
      '/api/leetcode': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/leetcode/, '/graphql')
      }
    }
  }
})
