function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function block(b) {
  switch (b.type) {

    case 'paragraph':
      return `<p class="prose${b.dropCap ? ' drop-cap' : ''}">${esc(b.text)}</p>`

    case 'pullquote':
      return `<div class="pull-quote"><p>&ldquo;${esc(b.text)}&rdquo;</p></div>`

    case 'stats': {
      const cols = Math.min(b.cells.length || 3, 3)
      return `<div class="data-callout" style="grid-template-columns:repeat(${cols},1fr)">${b.cells.map(c => `
        <div class="data-cell">
          <div class="data-num">${esc(c.num)}<span>${esc(c.unit)}</span></div>
          <div class="data-label">${esc(c.label)}</div>
        </div>`).join('')}</div>`
    }

    case 'section':
      return `<div class="section-break">
        <span class="section-num">${esc(b.num)}</span>
        <div class="section-rule"></div>
      </div>
      <h2 class="section-heading">${esc(b.heading)}</h2>`

    case 'annotation':
      return `<div class="annotation">
        <div class="annotation-title">${esc(b.title)}</div>
        <p>${esc(b.text)}</p>
      </div>`

    case 'timeline':
      return `<div class="timeline">${b.items.map(i => `
        <div class="timeline-item">
          <div class="timeline-year">${esc(i.year)}</div>
          <div class="timeline-text">${esc(i.text)}</div>
        </div>`).join('')}</div>`

    case 'verdict':
      return `<div class="verdict-box">
        <div class="verdict-label">${esc(b.label)}</div>
        <div class="verdict-title">${esc(b.title)}</div>
        <p class="verdict-body">${esc(b.body)}</p>
        ${b.prompt ? `<button class="verdict-btn" data-prompt="${esc(b.prompt)}">Discuss the risks &rarr;</button>` : ''}
      </div>`

    default:
      return ''
  }
}

export function renderBlocks(blocks) {
  return blocks.map(block).join('\n')
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
}
