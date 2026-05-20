// ── Smart article parser ──────────────────────────────────────
// Takes raw prose text, returns structured blocks array

const PART_LABELS = ['Part I', 'Part II', 'Part III', 'Part IV', 'Part V', 'Part VI']

// ── Heading detection ─────────────────────────────────────────
function isHeading(line) {
  const t = line.trim()
  if (t.length < 3 || t.length > 90) return false
  if (/^#+\s/.test(t)) return true                          // Markdown ## heading
  if (/^(Part|Section|Chapter)\s+[IVXivx\d]/i.test(t)) return true
  if (/[.!?,;]$/.test(t)) return false                     // Ends with sentence punctuation
  if (t === t.toUpperCase() && /[A-Z]/.test(t)) return true // ALL CAPS
  // Title Case: most words capitalised, short line
  const words = t.split(/\s+/).filter(w => w.length > 2)
  if (words.length >= 2 && words.length <= 10) {
    const capped = words.filter(w => /^[A-Z]/.test(w)).length
    if (capped / words.length >= 0.65) return true
  }
  return false
}

function cleanHeading(line) {
  return line.trim().replace(/^#+\s*/, '').replace(/^(Part|Section)\s+[IVXivx\d]+[:\-–—]?\s*/i, '').trim()
}

// ── Statistics extraction ─────────────────────────────────────
function normalizeUnit(raw) {
  if (!raw) return ''
  const u = raw.trim().toLowerCase()
  if (u === 'billion' || u === 'bn' || u === 'b') return 'B'
  if (u === 'million' || u === 'mn' || u === 'm') return 'M'
  if (u === 'trillion' || u === 'tn' || u === 't') return 'T'
  if (u === 'crore' || u === 'cr') return 'Cr'
  if (u === 'lakh') return 'L'
  if (u === 'thousand' || u === 'k') return 'K'
  if (u === 'percent' || u === '%') return '%'
  if (u === 'times' || u === 'x') return 'x'
  return raw.trim()
}

function extractContextLabel(sentence, matchStr) {
  // Get words around the matched stat to form a label
  const idx = sentence.indexOf(matchStr)
  if (idx === -1) return sentence.slice(0, 55).trim()
  const before = sentence.slice(Math.max(0, idx - 40), idx).trim()
  const after  = sentence.slice(idx + matchStr.length, idx + matchStr.length + 50).trim()
  const context = (before + ' ' + after).replace(/[,;].*/, '').trim()
  return context.length > 10 ? context.slice(0, 60) : sentence.slice(0, 60)
}

export function extractStats(text) {
  const stats = []
  const seen  = new Set()

  // Split into sentences
  const sentences = text.match(/[^.!?\n]+[.!?]?/g) || []

  const patterns = [
    // 646 million / 1.1 billion / 40 trillion
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(billion|million|trillion|crore|lakh|thousand)\b/gi,
    // 21% or 21 percent
    /(\d+(?:\.\d+)?)\s*(?:percent|%)/gi,
    // $1.2B / Rs 4,000 Cr / ₹500M — short forms
    /(?:[\$₹]|Rs\.?\s*)?(\d+(?:,\d+)*(?:\.\d+)?)\s*([BMKTx])\b/g,
    // 3x or 3 times
    /(\d+(?:\.\d+)?)\s*(?:times|x)\b/gi,
  ]

  for (const sentence of sentences) {
    for (const pat of patterns) {
      pat.lastIndex = 0
      let m
      while ((m = pat.exec(sentence)) !== null) {
        const raw  = m[1].replace(/,/g, '')
        const unit = normalizeUnit(m[2] || (m[0].includes('%') ? '%' : m[0].includes('x') || m[0].toLowerCase().includes('times') ? 'x' : ''))
        const key  = raw + unit
        if (!seen.has(key) && unit) {
          seen.add(key)
          stats.push({
            num:   m[1],
            unit,
            label: extractContextLabel(sentence, m[0])
          })
        }
        if (stats.length >= 3) break
      }
      if (stats.length >= 3) break
    }
    if (stats.length >= 3) break
  }

  return stats.slice(0, 3)
}

// ── Pull quote finder ─────────────────────────────────────────
export function findPullQuote(text) {
  // Extract all complete sentences 45–170 chars
  const candidates = (text.match(/[A-Z][^.!?]{44,168}[.!?]/g) || [])
    .map(s => s.trim())

  if (candidates.length === 0) return null

  const boostPhrases = [
    'not pricing', 'market is', 'investors are', 'the real', 'the key',
    'not a trade', 'not just', 'the opportunity', 'decade', 'structural',
    'proved', 'playbook', 'running', 'most investors', 'the thesis',
    'rare', 'inevitable', 'arithmetic', 'destiny', 'catalyst'
  ]

  const scored = candidates.map(s => {
    let score = 0
    const lower = s.toLowerCase()
    const len   = s.length

    // Ideal length bonus
    if (len >= 60 && len <= 130) score += 8
    else if (len >= 45 && len <= 160) score += 4

    // Boost phrases
    boostPhrases.forEach(p => { if (lower.includes(p)) score += 5 })

    // Penalty for too many numbers
    score -= (s.match(/\d/g) || []).length * 1.5

    // Penalty for parentheses (too technical)
    if (s.includes('(')) score -= 3

    // Bonus for starting with "The"
    if (s.startsWith('The ')) score += 2

    return { s: s.replace(/[.!?]$/, ''), score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].score > 3 ? scored[0].s : null
}

// ── Conclusion detection ──────────────────────────────────────
function isConclusion(para) {
  const lower = para.toLowerCase()
  return [
    'bottom line', 'in conclusion', 'to summarize', 'ultimately',
    'the thesis', 'the investment case', 'the bull case', 'at its core',
    'for investors who', 'in summary', 'the opportunity', 'taken together',
    'the case for', 'rests on', 'compound that'
  ].some(p => lower.includes(p))
}

function extractVerdictTitle(para) {
  // First sentence as title, max 90 chars
  const first = (para.match(/^[^.!?]+[.!?]/) || [para])[0].trim()
  return first.length <= 90 ? first.replace(/[.!?]$/, '') : first.slice(0, 87) + '…'
}

// ── Main parser ───────────────────────────────────────────────
export function smartParse(rawText) {
  const blocks = []

  // Normalize line breaks and split into paragraphs
  const paragraphs = rawText
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 15)

  if (paragraphs.length === 0) return blocks

  // Pre-compute stats and pull quote from full text
  const stats     = extractStats(rawText)
  const pullQuote = findPullQuote(rawText)

  let sectionCount  = 0
  let contentCount  = 0
  let statsInserted = false
  let pullInserted  = false

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i]

    // ── Heading ──────────────────────────────────────────────
    if (isHeading(para)) {
      // Before first section heading, insert stats if available
      if (!statsInserted && stats.length >= 2 && contentCount >= 2) {
        blocks.push({ type: 'stats', cells: stats })
        statsInserted = true
      }
      blocks.push({
        type:    'section',
        num:     PART_LABELS[sectionCount] || `Part ${sectionCount + 1}`,
        heading: cleanHeading(para)
      })
      sectionCount++
      continue
    }

    // ── First paragraph: drop cap ─────────────────────────────
    if (contentCount === 0) {
      blocks.push({ type: 'paragraph', dropCap: true, text: para })
      contentCount++
      continue
    }

    // ── After 2nd paragraph: stats (if no sections yet) ──────
    if (contentCount === 2 && !statsInserted && stats.length >= 2 && sectionCount === 0) {
      blocks.push({ type: 'stats', cells: stats })
      statsInserted = true
    }

    // ── After 3rd paragraph: pull quote ──────────────────────
    if (contentCount === 3 && pullQuote && !pullInserted) {
      blocks.push({ type: 'pullquote', text: pullQuote })
      pullInserted = true
    }

    // ── Last paragraph: verdict if conclusory ─────────────────
    if (i === paragraphs.length - 1 && isConclusion(para)) {
      blocks.push({
        type:  'verdict',
        label: 'The bottom line',
        title: extractVerdictTitle(para),
        body:  para,
        prompt: ''
      })
      contentCount++
      continue
    }

    blocks.push({ type: 'paragraph', text: para })
    contentCount++
  }

  // Fallback: insert stats after block 1 if still not placed
  if (!statsInserted && stats.length >= 2 && blocks.length > 1) {
    blocks.splice(1, 0, { type: 'stats', cells: stats })
  }
  // Fallback: insert pull quote after block 2 if still not placed
  if (!pullInserted && pullQuote && blocks.length > 2) {
    blocks.splice(3, 0, { type: 'pullquote', text: pullQuote })
  }

  return blocks
}
