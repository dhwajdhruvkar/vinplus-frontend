import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Development only: lets the local app reach the Lumenore workflows without a browser CORS block.
    // It adds no credentials, and there is no equivalent for `vite build` or `vite preview`.
    proxy: {
      '/lumenore-workflow': {
        target: 'https://apphub.lumenore.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lumenore-workflow/, '/appsapi/appbuilder/workflow'),
      },
    },
  },
})
