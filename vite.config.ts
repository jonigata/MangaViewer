import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: {
    include: ['paper']  // paperを事前バンドルに含める
  },
  build: {
    commonjsOptions: {
      include: [/paper/]  // paperモジュールをCommonJSとして処理
    }
  },
  server: {
    port: 5174
  }
})
