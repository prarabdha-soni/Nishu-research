import mongoose from 'mongoose'

let conn = null

export async function connectDB() {
  if (conn) return conn
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set')
  conn = await mongoose.connect(process.env.MONGODB_URI)
  return conn
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

export const Article = mongoose.models?.Article ?? mongoose.model('Article', articleSchema)
