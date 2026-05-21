function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Parse [^N] inline citation markers into superscript links
function withCitations(text) {
  return esc(text).replace(/\[\^(\d+)\]/g, (_, n) =>
    `<sup class="fn-ref"><a href="#fn-${n}" id="fnref-${n}" title="See source ${n}">${n}</a></sup>`
  )
}

function block(b) {
  switch (b.type) {
    case 'paragraph':
      return `<p class="prose${b.dropCap ? ' drop-cap' : ''}">${withCitations(b.text)}</p>`

    case 'pullquote':
      return `<div class="pull-quote"><p>&ldquo;${withCitations(b.text)}&rdquo;</p></div>`

    case 'stats': {
      const cols = Math.min(b.cells.length || 3, 3)
      return `<div class="data-callout" style="grid-template-columns:repeat(${cols},1fr)">${b.cells.map(c => `
        <div class="data-cell">
          <div class="data-num">${esc(c.num)}<span>${esc(c.unit)}</span></div>
          <div class="data-label">${esc(c.label)}</div>
        </div>`).join('')}</div>`
    }

    case 'section': {
      const id = (b.heading || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return `<div class="section-break">
        <span class="section-num">${esc(b.num)}</span>
        <div class="section-rule"></div>
      </div>
      <h2 class="section-heading" id="${id}">${esc(b.heading)}</h2>`
    }

    case 'annotation':
      return `<div class="annotation">
        <div class="annotation-title">${esc(b.title)}</div>
        <p>${withCitations(b.text)}</p>
      </div>`

    case 'timeline':
      return `<div class="timeline">${b.items.map(i => `
        <div class="timeline-item">
          <div class="timeline-year">${esc(i.year)}</div>
          <div class="timeline-text">${esc(i.text)}</div>
        </div>`).join('')}</div>`

    case 'verdict':
      // <a> with data-prompt: JS modal intercepts click; mailto is the no-JS fallback
      return `<div class="verdict-box">
        <div class="verdict-label">${esc(b.label)}</div>
        <div class="verdict-title">${esc(b.title)}</div>
        <p class="verdict-body">${withCitations(b.body)}</p>
        ${b.prompt ? `<a class="verdict-btn" href="mailto:research@bharatpulse.in?subject=Research+Discussion" data-prompt="${esc(b.prompt)}">Discuss the risks &rarr;</a>` : ''}
      </div>`

    case 'image':
      return `<figure class="article-figure">
        <img src="${esc(b.src)}" alt="${esc(b.alt || '')}" loading="lazy">
        ${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}
      </figure>`

    // task 10: footnote/sources block
    case 'footnote':
      if (!b.items?.length) return ''
      return `<div class="sources-section">
        <div class="sources-heading">Sources &amp; References</div>
        <ol class="sources-list">
          ${b.items.map((item, i) => `<li id="fn-${i+1}" class="sources-item"><a href="#fnref-${i+1}" class="fn-back" title="Jump back">&#8617;</a> ${esc(item)}</li>`).join('')}
        </ol>
      </div>`

    default:
      return ''
  }
}

export function renderBlocks(blocks) {
  return (blocks || []).map(block).join('\n')
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
}

export function buildTOC(blocks) {
  const sections = (blocks || []).filter(b => b.type === 'section' && b.heading)
  if (sections.length < 2) return ''
  const items = sections.map(b => {
    const id = b.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `<li><a href="#${id}">${b.num ? `<span class="toc-num">${esc(b.num)}</span> ` : ''}${esc(b.heading)}</a></li>`
  }).join('')
  return `<nav class="toc"><div class="toc-title">Contents</div><ol class="toc-list">${items}</ol></nav>`
}

// Extract first 2 sentences from the first paragraph block (for RSS / meta)
export function extractExcerpt(blocks) {
  for (const b of (blocks || [])) {
    if (b.type === 'paragraph' && b.text?.trim()) {
      const sents = b.text.match(/[^.!?]+[.!?]+/g) || [b.text]
      return sents.slice(0, 2).join(' ').trim()
    }
  }
  return ''
}
