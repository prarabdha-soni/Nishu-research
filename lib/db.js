import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) throw new Error('MONGODB_URI is not set')

// Cache connection across hot-reloads in dev
let cached = global._mongoose
if (!cached) cached = global._mongoose = { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cached.conn = await cached.promise
  return cached.conn
}

const articleSchema = new mongoose.Schema({
  id:         { type: String, unique: true, index: true },
  issue:      String,
  category:   String,
  tags:       [String],
  title:      String,
  subtitle:   String,
  author:     String,
  date:       String,
  readTime:   String,
  coverImage: String,
  status:     { type: String, default: 'published', index: true },
  blocks:     { type: Array, default: [] },
}, { timestamps: true })

export const Article = mongoose.models.Article ?? mongoose.model('Article', articleSchema)
