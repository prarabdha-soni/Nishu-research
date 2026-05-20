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

  const sentences = text.match(/[^.!?\n]+[.!?]?/g) || []

  const patterns = [
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(billion|million|trillion|crore|lakh|thousand)\b/gi,
    /(\d+(?:\.\d+)?)\s*(?:percent|%)/gi,
    /(?:[\$₹]|Rs\.?\s*)?(\d+(?:,\d+)*(?:\.\d+)?)\s*([BMKTx])\b/g,
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
export function findPullQuote(text, exclude = null) {
  const candidates = (text.match(/[A-Z][^.!?\n]{44,168}[.!?]/g) || [])
    .map(s => s.trim())
    .filter(s => !exclude || !s.startsWith(exclude.slice(0, 35)))

  if (candidates.length === 0) return null

  const boostPhrases = [
    'not pricing', 'market is', 'investors are', 'the real', 'the key',
    'not a trade', 'not just', 'the opportunity', 'decade', 'structural',
    'proved', 'playbook', 'running', 'most investors', 'the thesis',
    'rare', 'inevitable', 'arithmetic', 'destiny', 'catalyst',
    'what makes', 'the case for', 'rests on', 'compound'
  ]

  const scored = candidates.map(s => {
    let score = 0
    const lower = s.toLowerCase()
    const len   = s.length

    if (len >= 60 && len <= 130) score += 8
    else if (len >= 45 && len <= 160) score += 4

    boostPhrases.forEach(p => { if (lower.includes(p)) score += 5 })

    score -= (s.match(/\d/g) || []).length * 1.5
    if (s.includes('(')) score -= 3
    if (s.startsWith('The ')) score += 2

    return { s: s.replace(/[.!?]$/, ''), score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].score > 3 ? scored[0].s : null
}

// ── Annotation detection ──────────────────────────────────────
function looksLikeAnnotation(para, afterSection) {
  const lower = para.toLowerCase()
  const signals = [
    'why this matters', 'what this means', 'the key reason',
    'matters for', 'the metric', 'this metric', 'the rarest',
    'what makes this', 'the significance', 'note:', 'context:',
    'important context', 'in practice, this', 'what investors'
  ]
  if (signals.some(s => lower.includes(s))) return true

  // Short analytical paragraph immediately after a section heading
  if (afterSection && para.length < 380) {
    const analyticalWords = [
      'arpu', 'revenue', 'metric', 'multiple', 'ratio', 'rate',
      'driver', 'dynamic', 'catalyst', 'margin', 'valuation',
      'ebitda', 'cash flow', 'price-to', 'pe ratio', 'book value'
    ]
    if (analyticalWords.some(w => lower.includes(w)) && /[—–]/.test(para)) return true
  }
  return false
}

function annotationTitle(para) {
  const line1 = para.split('\n')[0].trim()
  // First line is a short heading (e.g. "Why This Matters For Investors")
  if (line1.length < 72 && /^(Why |The key |Note:|Context:|Key insight)/i.test(line1)) {
    return line1.replace(/[.!?,]$/, '')
  }
  // "Why X matters [for Y]" anywhere on same line
  const whyM = line1.match(/[Ww]hy\s+[^\n.]{2,40}?\s+matters(?:\s+for\s+[^\n.]{0,25})?/i)
  if (whyM) return whyM[0].replace(/[.!?,]$/, '').slice(0, 70)
  // "TERM — definition" em-dash style
  const defM = para.match(/^([A-Z][A-Za-z0-9\s\/\-]{2,28})\s*[—–]/)
  if (defM) return defM[1].trim()
  // "Context:" / "Note:" prefixed
  const labelM = para.match(/^((?:Note|Context|Key insight)[^:]{0,30}):/i)
  if (labelM) return labelM[1].trim()
  return 'Key insight'
}

// ── Timeline detection ────────────────────────────────────────
function tryTimeline(para) {
  const sentences = para.match(/[^.!?\n]+[.!?]/g) || []
  const items = []
  const usedYears = new Set()

  for (const s of sentences) {
    const ym = s.match(/\b((?:19|20)\d{2})\b/)
    if (ym && !usedYears.has(ym[0])) {
      usedYears.add(ym[0])
      let text = s
        .replace(/^\s*(?:in|by|since|from|after|during)\s+\d{4}[,\s]*/i, '')
        .replace(/^\s*(1[89]\d{2}|20\d{2})[:\-–—\s]+/, '')
        .replace(/\s*(1[89]\d{2}|20\d{2})\s*[,.]?\s*/g, ' ')
        .replace(/\s+/g, ' ').trim()
        .replace(/^[,.\s]+/, '')
        .replace(/[.!?]$/, '')
      if (text.length > 12) items.push({ year: ym[0], text })
    }
  }
  return items.length >= 3 ? items : null
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
  const first = (para.match(/^[^.!?]+[.!?]/) || [para])[0].trim()
  return first.length <= 90 ? first.replace(/[.!?]$/, '') : first.slice(0, 87) + '…'
}

// ── Main parser ───────────────────────────────────────────────
export function smartParse(rawText) {
  const blocks = []

  const paragraphs = rawText
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 15)

  if (paragraphs.length === 0) return blocks

  const stats     = extractStats(rawText)
  const pullQuote = findPullQuote(rawText)

  let sectionCount     = 0
  let contentCount     = 0
  let statsInserted    = false
  let pullInserted     = false
  let pullInserted2    = false
  let timelineInserted = false
  let lastType         = null

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i]

    // ── Heading ──────────────────────────────────────────────
    if (isHeading(para)) {
      if (!statsInserted && stats.length >= 1 && contentCount >= 2) {
        blocks.push({ type: 'stats', cells: stats })
        statsInserted = true
      }
      blocks.push({
        type:    'section',
        num:     PART_LABELS[sectionCount] || `Part ${sectionCount + 1}`,
        heading: cleanHeading(para)
      })
      sectionCount++
      lastType = 'section'
      continue
    }

    // ── Timeline ─────────────────────────────────────────────
    if (!timelineInserted) {
      const tl = tryTimeline(para)
      if (tl) {
        blocks.push({ type: 'timeline', items: tl })
        timelineInserted = true
        lastType = 'timeline'
        continue
      }
    }

    // ── First paragraph: drop cap ─────────────────────────────
    if (contentCount === 0) {
      blocks.push({ type: 'paragraph', dropCap: true, text: para })
      contentCount++
      lastType = 'paragraph'
      continue
    }

    // ── After 2nd paragraph: stats (if no sections yet) ──────
    if (contentCount === 2 && !statsInserted && stats.length >= 1 && sectionCount === 0) {
      blocks.push({ type: 'stats', cells: stats })
      statsInserted = true
    }

    // ── After 3rd paragraph: pull quote ──────────────────────
    if (contentCount === 3 && pullQuote && !pullInserted) {
      blocks.push({ type: 'pullquote', text: pullQuote })
      pullInserted = true
    }

    // ── 2nd pull quote for longer articles ───────────────────
    if (contentCount === 7 && !pullInserted2 && paragraphs.length >= 9) {
      const pq2 = findPullQuote(rawText, pullQuote)
      if (pq2) {
        blocks.push({ type: 'pullquote', text: pq2 })
        pullInserted2 = true
      }
    }

    // ── Last paragraph: verdict if conclusory ─────────────────
    if (i === paragraphs.length - 1 && isConclusion(para)) {
      blocks.push({
        type:   'verdict',
        label:  'The bottom line',
        title:  extractVerdictTitle(para),
        body:   para,
        prompt: 'What are the key risks to this thesis?'
      })
      contentCount++
      lastType = 'verdict'
      continue
    }

    // ── Annotation ────────────────────────────────────────────
    if (looksLikeAnnotation(para, lastType === 'section')) {
      const aTitle = annotationTitle(para)
      const firstLine = para.split('\n')[0].trim()
      // Strip heading-style first line from body to avoid duplication
      const aBody = firstLine.length < 80 && firstLine === aTitle
        ? para.slice(firstLine.length).replace(/^\s*\n*/, '')
        : para
      blocks.push({
        type:  'annotation',
        title: aTitle,
        text:  aBody.length > 20 ? aBody : para
      })
      contentCount++
      lastType = 'annotation'
      continue
    }

    // ── Regular paragraph ─────────────────────────────────────
    blocks.push({ type: 'paragraph', text: para })
    contentCount++
    lastType = 'paragraph'
  }

  // Fallback: insert stats after block 1 if still not placed
  if (!statsInserted && stats.length >= 1 && blocks.length > 1) {
    blocks.splice(1, 0, { type: 'stats', cells: stats })
  }
  // Fallback: insert pull quote after block 2 if still not placed
  if (!pullInserted && pullQuote && blocks.length > 2) {
    blocks.splice(3, 0, { type: 'pullquote', text: pullQuote })
  }

  return blocks
}
