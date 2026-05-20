import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:    'index.html',
        article: 'article.html',
        admin:   'admin.html',
      }
    }
  }
})
