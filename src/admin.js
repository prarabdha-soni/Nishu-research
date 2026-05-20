import { renderBlocks, formatDate } from './renderer.js'
import { smartParse } from './parser.js'

const ADMIN_PW = 'bharatpulse'

// ── State ─────────────────────────────────────────────────────
let editingId = null   // null = new article, string = editing existing
let blocks    = []

// ── Auth ──────────────────────────────────────────────────────
const authGate = document.getElementById('auth-gate')
const adminApp = document.getElementById('admin-app')
const authInput = document.getElementById('auth-input')
const authBtn   = document.getElementById('auth-btn')
const authError = document.getElementById('auth-error')

function unlock() {
  authGate.style.display = 'none'
  adminApp.style.display = 'block'
  sessionStorage.setItem('bp_auth', '1')
  initAdmin()
}

if (sessionStorage.getItem('bp_auth') === '1') unlock()

authBtn.addEventListener('click', () => {
  if (authInput.value === ADMIN_PW) { unlock() }
  else { authError.textContent = 'Incorrect password.'; authInput.value = '' }
})
authInput.addEventListener('keydown', e => { if (e.key === 'Enter') authBtn.click() })
document.getElementById('admin-logout').addEventListener('click', () => {
  sessionStorage.removeItem('bp_auth')
  location.reload()
})

function getPublished() { return JSON.parse(localStorage.getItem('bp_published') || '[]') }
function getDrafts()    { return JSON.parse(localStorage.getItem('bp_drafts')    || '[]') }
function savePublished(arr) { localStorage.setItem('bp_published', JSON.stringify(arr)) }
function saveDrafts(arr)    { localStorage.setItem('bp_drafts',    JSON.stringify(arr)) }

// ── Block templates ───────────────────────────────────────────
const defaultBlock = {
  paragraph:  () => ({ type: 'paragraph', dropCap: false, text: '' }),
  pullquote:  () => ({ type: 'pullquote', text: '' }),
  stats:      () => ({ type: 'stats', cells: [
    { num: '', unit: '', label: '' },
    { num: '', unit: '', label: '' },
    { num: '', unit: '', label: '' }
  ]}),
  section:    () => ({ type: 'section', num: 'Part I', heading: '' }),
  annotation: () => ({ type: 'annotation', title: '', text: '' }),
  timeline:   () => ({ type: 'timeline', items: [{ year: '', text: '' }] }),
  verdict:    () => ({ type: 'verdict', label: 'The bottom line', title: '', body: '', prompt: '' }),
}

// ── Block form renderers ──────────────────────────────────────
function blockForm(b, idx) {
  const wrap = (content) => `
    <div class="block-item" data-idx="${idx}">
      <div class="block-item-header">
        <span class="block-type-badge">${b.type}</span>
        <div class="block-item-actions">
          <button class="blk-btn blk-up" data-idx="${idx}" title="Move up">↑</button>
          <button class="blk-btn blk-down" data-idx="${idx}" title="Move down">↓</button>
          <button class="blk-btn blk-del" data-idx="${idx}" title="Delete">×</button>
        </div>
      </div>
      <div class="block-item-body">${content}</div>
    </div>`

  switch (b.type) {
    case 'paragraph':
      return wrap(`
        <label class="field-label field-label--inline">
          <input type="checkbox" class="blk-field" data-idx="${idx}" data-field="dropCap" ${b.dropCap ? 'checked' : ''}>
          Drop cap (first letter large)
        </label>
        <textarea class="blk-field blk-textarea" data-idx="${idx}" data-field="text" rows="5" placeholder="Paragraph text...">${b.text}</textarea>`)

    case 'pullquote':
      return wrap(`<textarea class="blk-field blk-textarea" data-idx="${idx}" data-field="text" rows="3" placeholder="Quote text (no quotation marks needed)...">${b.text}</textarea>`)

    case 'stats':
      return wrap(b.cells.map((c, ci) => `
        <div class="stats-row">
          <span class="stats-row-label">Stat ${ci+1}</span>
          <input type="text" class="blk-field field-input field-input--sm" data-idx="${idx}" data-field="cells.${ci}.num" value="${c.num}" placeholder="646">
          <input type="text" class="blk-field field-input field-input--sm" data-idx="${idx}" data-field="cells.${ci}.unit" value="${c.unit}" placeholder="M">
          <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="cells.${ci}.label" value="${c.label}" placeholder="Label description">
        </div>`).join(''))

    case 'section':
      return wrap(`
        <div class="meta-row meta-row--2">
          <div class="field-group">
            <label class="field-label">Part label</label>
            <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="num" value="${b.num}" placeholder="Part I">
          </div>
          <div class="field-group">
            <label class="field-label">Section heading</label>
            <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="heading" value="${b.heading}" placeholder="Section heading">
          </div>
        </div>`)

    case 'annotation':
      return wrap(`
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="title" value="${b.title}" placeholder="Box title (e.g. Why this matters)">
        <textarea class="blk-field blk-textarea" data-idx="${idx}" data-field="text" rows="4" placeholder="Annotation body...">${b.text}</textarea>`)

    case 'timeline':
      return wrap(`
        <div class="timeline-items" id="tl-${idx}">
          ${b.items.map((it, ii) => `
            <div class="tl-row" data-tl-idx="${ii}">
              <input type="text" class="blk-field field-input field-input--sm" data-idx="${idx}" data-field="items.${ii}.year" value="${it.year}" placeholder="2025">
              <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="items.${ii}.text" value="${it.text}" placeholder="Event description">
              <button class="blk-btn blk-del-tl" data-idx="${idx}" data-ti="${ii}">×</button>
            </div>`).join('')}
        </div>
        <button class="btn-ghost btn-sm blk-add-tl" data-idx="${idx}">+ Add event</button>`)

    case 'verdict':
      return wrap(`
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="label" value="${b.label}" placeholder="Label (e.g. The bottom line)">
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="title" value="${b.title}" placeholder="Verdict title">
        <textarea class="blk-field blk-textarea" data-idx="${idx}" data-field="body" rows="4" placeholder="Conclusion body...">${b.body}</textarea>
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="prompt" value="${b.prompt}" placeholder="Discussion prompt (optional)">`)

    default: return wrap('')
  }
}

// ── Render blocks list ────────────────────────────────────────
function renderBlocksList() {
  const list = document.getElementById('blocks-list')
  list.innerHTML = blocks.length === 0
    ? `<div class="blocks-empty">No blocks yet. Click &ldquo;+ Add Block&rdquo; to start building.</div>`
    : blocks.map((b, i) => blockForm(b, i)).join('')
  attachBlockEvents()
  updatePreview()
}

function attachBlockEvents() {
  // Field changes
  document.querySelectorAll('.blk-field').forEach(el => {
    el.addEventListener(el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'number' ? 'input' : 'change', () => {
      const idx   = +el.dataset.idx
      const field = el.dataset.field
      if (!field) return
      const val = el.type === 'checkbox' ? el.checked : el.value
      // nested path like "cells.0.num"
      const parts = field.split('.')
      let obj = blocks[idx]
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[isNaN(parts[i]) ? parts[i] : +parts[i]]
      }
      obj[isNaN(parts.at(-1)) ? parts.at(-1) : +parts.at(-1)] = val
      updatePreview()
    })
  })

  // Delete block
  document.querySelectorAll('.blk-del').forEach(btn => {
    btn.addEventListener('click', () => {
      blocks.splice(+btn.dataset.idx, 1)
      renderBlocksList()
    })
  })

  // Move up/down
  document.querySelectorAll('.blk-up').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.idx
      if (i === 0) return
      ;[blocks[i-1], blocks[i]] = [blocks[i], blocks[i-1]]
      renderBlocksList()
    })
  })
  document.querySelectorAll('.blk-down').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.idx
      if (i === blocks.length - 1) return
      ;[blocks[i], blocks[i+1]] = [blocks[i+1], blocks[i]]
      renderBlocksList()
    })
  })

  // Timeline: add/delete event
  document.querySelectorAll('.blk-add-tl').forEach(btn => {
    btn.addEventListener('click', () => {
      blocks[+btn.dataset.idx].items.push({ year: '', text: '' })
      renderBlocksList()
    })
  })
  document.querySelectorAll('.blk-del-tl').forEach(btn => {
    btn.addEventListener('click', () => {
      const b = blocks[+btn.dataset.idx]
      b.items.splice(+btn.dataset.ti, 1)
      renderBlocksList()
    })
  })
}

// ── Live preview ──────────────────────────────────────────────
function getMeta() {
  return {
    title:    document.getElementById('f-title').value,
    subtitle: document.getElementById('f-subtitle').value,
    category: document.getElementById('f-category').value,
    issue:    document.getElementById('f-issue').value || '00',
    author:   document.getElementById('f-author').value,
    date:     document.getElementById('f-date').value || new Date().toISOString().slice(0,10),
    readTime: document.getElementById('f-readtime').value || '5',
  }
}

function updatePreview() {
  const m = getMeta()
  const frame = document.getElementById('preview-frame')
  if (!m.title && blocks.length === 0) {
    frame.innerHTML = `<div class="preview-empty">Start filling in the form to see a preview</div>`
    return
  }
  frame.innerHTML = `
    <div class="preview-scaler">
      <div class="masthead masthead--preview">
        <div class="issue-line">
          <div class="issue-dot"></div>
          <span class="issue-text">${m.category || 'Category'} &mdash; Issue No. ${String(m.issue).padStart(2,'0')}</span>
          <div class="issue-rule"></div>
        </div>
        <h1 class="cover-title">${m.title || 'Article Title'}</h1>
        <p class="cover-sub">${m.subtitle || 'Subtitle / thesis statement'}</p>
        <div class="byline">
          <div class="avatar">${(m.author||'A')[0]}</div>
          <div>
            <div class="byline-name">${m.author || 'Author'}</div>
            <div class="byline-role">Independent Research</div>
          </div>
          <div class="byline-meta">
            <span class="meta-chip">${formatDate(m.date)}</span>
            <span class="meta-chip">${m.readTime} min read</span>
          </div>
        </div>
      </div>
      <div class="article-body article-body--preview">
        ${renderBlocks(blocks)}
      </div>
    </div>`
}

// Live preview on metadata change
['f-title','f-subtitle','f-category','f-issue','f-author','f-date','f-readtime'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updatePreview)
  document.getElementById(id)?.addEventListener('change', updatePreview)
})

// ── Add block menu ────────────────────────────────────────────
const addBtn   = document.getElementById('btn-add-block')
const blockMenu = document.getElementById('block-menu')

addBtn.addEventListener('click', e => {
  e.stopPropagation()
  blockMenu.style.display = blockMenu.style.display === 'none' ? 'block' : 'none'
})
document.addEventListener('click', () => { blockMenu.style.display = 'none' })

document.querySelectorAll('.block-menu-item').forEach(item => {
  item.addEventListener('click', () => {
    blocks.push(defaultBlock[item.dataset.type]())
    renderBlocksList()
    blockMenu.style.display = 'none'
  })
})

// ── Build article object ──────────────────────────────────────
function buildArticle(id) {
  const m = getMeta()
  return {
    id,
    issue:    m.issue,
    category: m.category,
    title:    m.title,
    subtitle: m.subtitle,
    author:   m.author,
    date:     m.date,
    readTime: m.readTime,
    blocks:   JSON.parse(JSON.stringify(blocks)),
  }
}

function generateId() {
  return 'article-' + Date.now()
}

// ── Save draft ────────────────────────────────────────────────
document.getElementById('btn-save-draft').addEventListener('click', () => {
  if (!document.getElementById('f-title').value.trim()) {
    alert('Please add a title before saving.')
    return
  }
  const id  = editingId || generateId()
  const art = buildArticle(id)
  const drafts = getDrafts().filter(d => d.id !== id)
  drafts.unshift(art)
  saveDrafts(drafts)
  editingId = id
  showToast('Draft saved')
})

// ── Publish ───────────────────────────────────────────────────
document.getElementById('btn-publish').addEventListener('click', () => {
  const title = document.getElementById('f-title').value.trim()
  if (!title) { alert('Please add a title before publishing.'); return }
  if (!confirm(`Publish "${title}" to the site?`)) return

  const id  = editingId || generateId()
  const art = buildArticle(id)

  // Move from drafts to published
  const drafts    = getDrafts().filter(d => d.id !== id)
  const published = getPublished().filter(p => p.id !== id)
  published.unshift(art)
  saveDrafts(drafts)
  savePublished(published)
  editingId = id

  document.getElementById('preview-open-link').href   = `article.html?id=${id}`
  document.getElementById('preview-open-link').style.display = 'inline'
  showToast('Published! Visible on homepage.')
})

// ── Clear form ────────────────────────────────────────────────
document.getElementById('btn-clear').addEventListener('click', () => {
  if (!confirm('Clear the form and start fresh?')) return
  clearForm()
})

function clearForm() {
  editingId = null
  blocks    = []
  ;['f-title','f-subtitle','f-category','f-issue','f-readtime'].forEach(id => {
    document.getElementById(id).value = ''
  })
  document.getElementById('f-author').value = 'Prarabdha Soni'
  document.getElementById('f-date').value = new Date().toISOString().slice(0,10)
  document.getElementById('editor-title-label').textContent = 'New Research'
  document.getElementById('preview-open-link').style.display = 'none'
  renderBlocksList()
}

// ── Load article into editor ──────────────────────────────────
function loadArticle(art) {
  editingId = art.id
  document.getElementById('f-title').value    = art.title || ''
  document.getElementById('f-subtitle').value = art.subtitle || ''
  document.getElementById('f-category').value = art.category || ''
  document.getElementById('f-issue').value    = art.issue || ''
  document.getElementById('f-author').value   = art.author || 'Prarabdha Soni'
  document.getElementById('f-date').value     = art.date || new Date().toISOString().slice(0,10)
  document.getElementById('f-readtime').value = art.readTime || ''
  document.getElementById('editor-title-label').textContent = `Editing: ${art.title}`
  blocks = JSON.parse(JSON.stringify(art.blocks || []))
  renderBlocksList()
  closeDraftsModal()
  document.getElementById('preview-open-link').href   = `article.html?id=${art.id}`
  document.getElementById('preview-open-link').style.display = 'inline'
}

// ── Drafts modal ──────────────────────────────────────────────
const draftsModal  = document.getElementById('drafts-modal')
const draftsClose  = document.getElementById('drafts-close')
const draftsList   = document.getElementById('drafts-list-content')

function openDraftsModal() {
  const drafts    = getDrafts()
  const published = getPublished()

  function row(art, status) {
    return `<div class="draft-row">
      <div class="draft-row-info">
        <span class="draft-status draft-status--${status}">${status}</span>
        <span class="draft-title">${art.title || '(untitled)'}</span>
        <span class="draft-date">${formatDate(art.date)}</span>
      </div>
      <div class="draft-row-actions">
        <button class="btn-ghost btn-sm" data-load="${art.id}">Edit</button>
        <button class="btn-ghost btn-sm btn-danger" data-delete="${art.id}" data-from="${status}">Delete</button>
      </div>
    </div>`
  }

  const rows = [
    ...published.map(a => row(a, 'published')),
    ...drafts.map(a => row(a, 'draft')),
  ]
  draftsList.innerHTML = rows.length ? rows.join('') : '<p class="drafts-empty">No saved drafts or published articles yet.</p>'

  draftsList.querySelectorAll('[data-load]').forEach(btn => {
    const all = [...published, ...drafts]
    btn.addEventListener('click', () => loadArticle(all.find(a => a.id === btn.dataset.load)))
  })
  draftsList.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this article?')) return
      if (btn.dataset.from === 'published') savePublished(getPublished().filter(a => a.id !== btn.dataset.delete))
      else saveDrafts(getDrafts().filter(a => a.id !== btn.dataset.delete))
      openDraftsModal()
    })
  })

  draftsModal.style.display = 'flex'
}
function closeDraftsModal() { draftsModal.style.display = 'none' }

document.getElementById('btn-drafts-list').addEventListener('click', openDraftsModal)
draftsClose.addEventListener('click', closeDraftsModal)
draftsModal.querySelector('.adm-modal-backdrop').addEventListener('click', closeDraftsModal)

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div')
  t.className = 'admin-toast'
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.classList.add('admin-toast--show'), 10)
  setTimeout(() => { t.classList.remove('admin-toast--show'); setTimeout(() => t.remove(), 300) }, 2500)
}

// ── Smart Import ──────────────────────────────────────────────
const smartToggle = document.getElementById('smart-import-toggle')
const smartBody   = document.getElementById('smart-import-body')
const smartChevron = document.getElementById('smart-chevron')

smartToggle.addEventListener('click', () => {
  const open = smartBody.style.display !== 'none'
  smartBody.style.display = open ? 'none' : 'block'
  smartChevron.textContent = open ? '▾' : '▴'
})

document.getElementById('smart-parse-btn').addEventListener('click', () => {
  const text = document.getElementById('smart-textarea').value.trim()
  if (!text) { showToast('Paste some text first'); return }

  const parsed = smartParse(text)
  if (parsed.length === 0) { showToast('Could not detect structure — try adding more text'); return }

  blocks = parsed
  renderBlocksList()

  // Collapse smart import panel
  smartBody.style.display = 'none'
  smartChevron.textContent = '▾'

  showToast(`Parsed ${parsed.length} blocks — review and edit below`)
  document.getElementById('blocks-list').scrollIntoView({ behavior: 'smooth', block: 'start' })
})

document.getElementById('smart-clear-btn').addEventListener('click', () => {
  document.getElementById('smart-textarea').value = ''
})

// ── Init ──────────────────────────────────────────────────────
function initAdmin() {
  document.getElementById('f-date').value = new Date().toISOString().slice(0, 10)
  renderBlocksList()
}
