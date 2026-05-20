import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

const PUBLISHED_PATH = path.resolve('./src/data/published.json')

function articlesApiPlugin() {
  return {
    name: 'articles-api',
    configureServer(server) {
      server.middlewares.use('/api/articles', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }

        if (req.method === 'GET') {
          const data = fs.existsSync(PUBLISHED_PATH) ? fs.readFileSync(PUBLISHED_PATH, 'utf8') : '[]'
          res.end(data)
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const articles = JSON.parse(fs.existsSync(PUBLISHED_PATH) ? fs.readFileSync(PUBLISHED_PATH, 'utf8') : '[]')

            if (req.method === 'POST') {
              const article = JSON.parse(body)
              const idx = articles.findIndex(a => a.id === article.id)
              if (idx >= 0) articles[idx] = article
              else articles.unshift(article)
              fs.writeFileSync(PUBLISHED_PATH, JSON.stringify(articles, null, 2))
              res.end(JSON.stringify({ ok: true }))
            } else if (req.method === 'DELETE') {
              const { id } = JSON.parse(body)
              const filtered = articles.filter(a => a.id !== id)
              fs.writeFileSync(PUBLISHED_PATH, JSON.stringify(filtered, null, 2))
              res.end(JSON.stringify({ ok: true }))
            } else {
              res.statusCode = 405; res.end('Method not allowed')
            }
          } catch (e) {
            res.statusCode = 500; res.end(JSON.stringify({ error: e.message }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [articlesApiPlugin()],
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
