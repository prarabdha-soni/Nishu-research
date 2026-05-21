'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { renderBlocks, formatDate } from '@/lib/renderer'
import { smartParse } from '@/lib/parser'

// ── Helpers ───────────────────────────────────────────────────
const ADMIN_PW = 'bharatpulse'
const today = () => new Date().toISOString().slice(0, 10)

function generateId(title) {
  const slug = (title || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)
  const suffix = Date.now().toString(36).slice(-4)
  return slug ? `${slug}-${suffix}` : `article-${suffix}`
}

function calcReadTime(blocks) {
  const words = (blocks || []).reduce((acc, b) => {
    const texts = [b.text, b.body, b.heading, b.title].filter(Boolean)
    if (b.items) b.items.forEach(i => texts.push(i.text))
    if (b.cells) b.cells.forEach(c => texts.push(c.label))
    return acc + texts.join(' ').split(/\s+/).filter(Boolean).length
  }, 0)
  return String(Math.max(1, Math.ceil(words / 200)))
}

function getDrafts()     { return JSON.parse(localStorage.getItem('bp_drafts')    || '[]') }
function saveDrafts(arr) { localStorage.setItem('bp_drafts', JSON.stringify(arr)) }
function getApiKey()     { return localStorage.getItem('bp_api_key') || '' }
function setApiKey(k)    { k ? localStorage.setItem('bp_api_key', k) : localStorage.removeItem('bp_api_key') }

const defaultBlock = {
  paragraph:  () => ({ type: 'paragraph', dropCap: false, text: '' }),
  pullquote:  () => ({ type: 'pullquote', text: '' }),
  stats:      () => ({ type: 'stats', cells: [{ num:'',unit:'',label:'' },{ num:'',unit:'',label:'' },{ num:'',unit:'',label:'' }] }),
  section:    () => ({ type: 'section', num: 'Part I', heading: '' }),
  annotation: () => ({ type: 'annotation', title: '', text: '' }),
  timeline:   () => ({ type: 'timeline', items: [{ year:'', text:'' }] }),
  verdict:    () => ({ type: 'verdict', label:'The bottom line', title:'', body:'', prompt:'' }),
  image:      () => ({ type: 'image', src:'', alt:'', caption:'' }),
  footnote:   () => ({ type: 'footnote', items: [''] }),
}

function setDeep(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[isNaN(parts[i]) ? parts[i] : +parts[i]]
  }
  const last = parts.at(-1)
  cur[isNaN(last) ? last : +last] = value
}

// ── Auth Gate ─────────────────────────────────────────────────
function AuthGate({ onAuth }) {
  const [pw, setPw]       = useState('')
  const [error, setError] = useState('')
  const submit = () => {
    if (pw === ADMIN_PW) { sessionStorage.setItem('bp_auth','1'); onAuth() }
    else { setError('Incorrect password.'); setPw('') }
  }
  return (
    <div className="auth-gate">
      <div className="auth-card">
        <div className="auth-brand">Bharat<span>.</span>Pulse</div>
        <p className="auth-label">Admin Access</p>
        <input className="auth-input" type="password" placeholder="Enter password" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==='Enter' && submit()} autoFocus />
        <button className="auth-btn" onClick={submit}>Enter</button>
        <p className="auth-error">{error}</p>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null)
  const show = useCallback((m) => {
    setMsg(m)
    setTimeout(() => setMsg(null), 2600)
  }, [])
  const Toast = msg ? (
    <div className="admin-toast admin-toast--show">{msg}</div>
  ) : null
  return [show, Toast]
}

// ── Block form ────────────────────────────────────────────────
function BlockItem({ block: b, idx, onUpdate, onDelete, onMoveUp, onMoveDown, onAddTlItem, onDelTlItem, onAddFnItem, onDelFnItem }) {
  const field = (path) => ({
    value: (() => {
      const parts = path.split('.')
      let cur = b
      for (const p of parts) cur = cur[isNaN(p) ? p : +p]
      return cur ?? ''
    })(),
    onChange: (e) => onUpdate(idx, path, e.type === 'checkbox' ? e.target.checked : e.target.value),
  })

  const wrap = (content) => (
    <div className="block-item" key={idx}>
      <div className="block-item-header">
        <span className="block-type-badge">{b.type}</span>
        <div className="block-item-actions">
          <button className="blk-btn blk-up" onClick={() => onMoveUp(idx)} title="Move up">↑</button>
          <button className="blk-btn blk-down" onClick={() => onMoveDown(idx)} title="Move down">↓</button>
          <button className="blk-btn blk-del" onClick={() => onDelete(idx)} title="Delete">×</button>
        </div>
      </div>
      <div className="block-item-body">{content}</div>
    </div>
  )

  switch (b.type) {
    case 'paragraph': return wrap(<>
      <label className="field-label field-label--inline">
        <input type="checkbox" {...field('dropCap')} checked={b.dropCap} /> Drop cap
      </label>
      <textarea className="blk-field blk-textarea" rows={5} placeholder="Paragraph text…" {...field('text')} />
    </>)

    case 'pullquote': return wrap(
      <textarea className="blk-field blk-textarea" rows={3} placeholder="Quote text…" {...field('text')} />
    )

    case 'stats': return wrap(b.cells.map((c, ci) => (
      <div key={ci} className="stats-row">
        <span className="stats-row-label">Stat {ci+1}</span>
        <input type="text" className="blk-field field-input field-input--sm" placeholder="646" {...field(`cells.${ci}.num`)} />
        <input type="text" className="blk-field field-input field-input--sm" placeholder="M" {...field(`cells.${ci}.unit`)} />
        <input type="text" className="blk-field field-input" placeholder="Label" {...field(`cells.${ci}.label`)} />
      </div>
    )))

    case 'section': return wrap(
      <div className="meta-row meta-row--2">
        <div className="field-group">
          <label className="field-label">Part label</label>
          <input type="text" className="blk-field field-input" placeholder="Part I" {...field('num')} />
        </div>
        <div className="field-group">
          <label className="field-label">Section heading</label>
          <input type="text" className="blk-field field-input" placeholder="Heading" {...field('heading')} />
        </div>
      </div>
    )

    case 'annotation': return wrap(<>
      <input type="text" className="blk-field field-input" placeholder="Box title" {...field('title')} />
      <textarea className="blk-field blk-textarea" rows={4} placeholder="Annotation body…" {...field('text')} />
    </>)

    case 'timeline': return wrap(<>
      <div className="timeline-items">
        {b.items.map((it, ii) => (
          <div key={ii} className="tl-row">
            <input type="text" className="blk-field field-input field-input--sm" placeholder="2025" {...field(`items.${ii}.year`)} />
            <input type="text" className="blk-field field-input" placeholder="Event description" {...field(`items.${ii}.text`)} />
            <button className="blk-btn blk-del" onClick={() => onDelTlItem(idx, ii)}>×</button>
          </div>
        ))}
      </div>
      <button className="btn-ghost btn-sm" onClick={() => onAddTlItem(idx)}>+ Add event</button>
    </>)

    case 'verdict': return wrap(<>
      <input type="text" className="blk-field field-input" placeholder="Label" {...field('label')} />
      <input type="text" className="blk-field field-input" placeholder="Verdict title" {...field('title')} />
      <textarea className="blk-field blk-textarea" rows={4} placeholder="Conclusion body…" {...field('body')} />
      <input type="text" className="blk-field field-input" placeholder="Discussion prompt (optional)" {...field('prompt')} />
    </>)

    case 'image': return wrap(<>
      <input type="url" className="blk-field field-input" placeholder="Image URL (https://…)" {...field('src')} />
      <input type="text" className="blk-field field-input" placeholder="Alt text" {...field('alt')} />
      <input type="text" className="blk-field field-input" placeholder="Caption (optional)" {...field('caption')} />
    </>)

    case 'footnote': return wrap(<>
      <p style={{ fontSize:11.5, color:'var(--color-text-tertiary)', marginBottom:10, lineHeight:1.6 }}>
        Use <code style={{ fontFamily:'monospace', background:'var(--color-background-tertiary)', padding:'1px 4px', borderRadius:3 }}>[^1]</code>, <code style={{ fontFamily:'monospace', background:'var(--color-background-tertiary)', padding:'1px 4px', borderRadius:3 }}>[^2]</code> etc. inside paragraph text to cite these sources.
      </p>
      {b.items.map((item, ii) => (
        <div key={ii} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:6 }}>
          <span style={{ color:'var(--accent)', fontSize:12, minWidth:24, flexShrink:0, fontFamily:'monospace' }}>[^{ii+1}]</span>
          <input type="text" className="blk-field field-input" placeholder="Source text or URL…"
            value={item} onChange={e => onUpdate(idx, `items.${ii}`, e.target.value)} />
          <button className="blk-btn blk-del" onClick={() => onDelFnItem(idx, ii)}>×</button>
        </div>
      ))}
      <button className="btn-ghost btn-sm" style={{ marginTop:4 }} onClick={() => onAddFnItem(idx)}>+ Add source</button>
    </>)

    default: return wrap(null)
  }
}

// ── Drafts Modal ──────────────────────────────────────────────
function DraftsModal({ onClose, onLoad }) {
  const [rows, setRows]       = useState(null)
  const [allItems, setAllItems] = useState([])

  useEffect(() => {
    async function load() {
      const drafts = getDrafts()
      let published = []
      try {
        const r = await fetch('/api/articles?limit=100')
        if (r.ok) { const d = await r.json(); published = d.articles || [] }
      } catch {}
      setAllItems([...published, ...drafts])
      setRows([
        ...published.map(a => ({ art: a, status: 'published', source: 'db' })),
        ...drafts.map(a => ({ art: a, status: 'draft', source: 'local' })),
      ])
    }
    load()
  }, [])

  async function handleDelete(art, status) {
    if (!confirm('Delete this article?')) return
    if (status === 'published') {
      await fetch(`/api/articles/${art.id}`, { method: 'DELETE', headers: { 'x-api-key': getApiKey() } })
    } else {
      saveDrafts(getDrafts().filter(d => d.id !== art.id))
    }
    setRows(prev => prev.filter(r => r.art.id !== art.id))
    setAllItems(prev => prev.filter(a => a.id !== art.id))
  }

  return (
    <div className="adm-modal" style={{ display: 'flex' }}>
      <div className="adm-modal-backdrop" onClick={onClose} />
      <div className="adm-modal-card">
        <div className="adm-modal-header">
          <span>Saved Drafts &amp; Published</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {!rows
          ? <p className="drafts-empty">Loading…</p>
          : rows.length === 0
          ? <p className="drafts-empty">No saved articles yet.</p>
          : rows.map(({ art, status, source }) => (
            <div key={art.id} className="draft-row">
              <div className="draft-row-info">
                <span className={`draft-status draft-status--${status}`}>
                  {source === 'db' ? 'published' : status}
                </span>
                <span className="draft-title">{art.title || '(untitled)'}</span>
                <span className="draft-date">{formatDate(art.date)}</span>
              </div>
              <div className="draft-row-actions">
                <button className="btn-ghost btn-sm"
                  onClick={() => { onLoad(allItems.find(a => a.id === art.id)); onClose() }}>
                  Edit
                </button>
                <button className="btn-ghost btn-sm btn-danger"
                  onClick={() => handleDelete(art, status)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Main Admin App ────────────────────────────────────────────
function AdminApp() {
  const [editingId, setEditingId] = useState(null)
  const [blocks, setBlocks]       = useState([])
  const [meta, setMeta]           = useState({
    title: '', subtitle: '', category: '', issue: '', author: 'Prarabdha Soni',
    date: today(), readTime: '', coverImage: '',
  })
  const [draftsOpen, setDraftsOpen]       = useState(false)
  const [blockMenuOpen, setBlockMenu]     = useState(false)
  const [smartOpen, setSmartOpen]         = useState(false)
  const [smartText, setSmartText]         = useState('')
  const [settingsOpen, setSettingsOpen]   = useState(false)
  const [apiKeyInput, setApiKeyInput]     = useState('')
  const [apiKeyStatus, setApiKeyStatus]   = useState('')
  const [publishedLink, setPublishedLink] = useState(null)
  const [showToast, Toast]                = useToast()

  // Auto-calc read time when blocks change and field is empty
  useEffect(() => {
    if (!meta.readTime && blocks.length > 0) {
      setMeta(m => ({ ...m, readTime: calcReadTime(blocks) }))
    }
  }, [blocks])

  useEffect(() => {
    const k = getApiKey()
    setApiKeyStatus(k ? '✓ API key saved' : 'No key — articles save locally only')
  }, [])

  // ── Block operations ─────────────────────────────────────────
  function updateBlock(idx, path, value) {
    setBlocks(prev => {
      const arr = JSON.parse(JSON.stringify(prev))
      setDeep(arr[idx], path, value)
      return arr
    })
  }

  function deleteBlock(idx) { setBlocks(prev => prev.filter((_, i) => i !== idx)) }

  function moveUp(idx) {
    if (idx === 0) return
    setBlocks(prev => { const a = [...prev]; [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; return a })
  }

  function moveDown(idx) {
    setBlocks(prev => {
      if (idx === prev.length - 1) return prev
      const a = [...prev]; [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; return a
    })
  }

  function addTlItem(idx) {
    setBlocks(prev => {
      const a = JSON.parse(JSON.stringify(prev))
      a[idx].items.push({ year: '', text: '' })
      return a
    })
  }

  function delTlItem(idx, ii) {
    setBlocks(prev => {
      const a = JSON.parse(JSON.stringify(prev))
      a[idx].items.splice(ii, 1)
      return a
    })
  }

  function addFnItem(idx) {
    setBlocks(prev => {
      const a = JSON.parse(JSON.stringify(prev))
      a[idx].items.push('')
      return a
    })
  }

  function delFnItem(idx, ii) {
    setBlocks(prev => {
      const a = JSON.parse(JSON.stringify(prev))
      a[idx].items.splice(ii, 1)
      return a
    })
  }

  function addBlock(type) {
    setBlocks(prev => [...prev, defaultBlock[type]()])
    setBlockMenu(false)
  }

  // ── Build article object ─────────────────────────────────────
  function buildArticle(id) {
    return { id, ...meta, blocks: JSON.parse(JSON.stringify(blocks)) }
  }

  // ── Save draft ───────────────────────────────────────────────
  function saveDraft() {
    if (!meta.title.trim()) { alert('Add a title first.'); return }
    const id = editingId || generateId(meta.title)
    if (!editingId) setEditingId(id)
    const art = buildArticle(id)
    const drafts = getDrafts().filter(d => d.id !== id)
    drafts.unshift(art)
    saveDrafts(drafts)
    showToast('Draft saved')
  }

  // ── Publish ──────────────────────────────────────────────────
  async function publish() {
    if (!meta.title.trim()) { alert('Add a title first.'); return }
    if (!confirm(`Publish "${meta.title}" to the site?`)) return
    const id = editingId || generateId(meta.title)
    if (!editingId) setEditingId(id)
    const art = buildArticle(id)
    saveDrafts(getDrafts().filter(d => d.id !== id))

    showToast('Publishing…')
    try {
      const r = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': getApiKey() },
        body: JSON.stringify(art),
      })
      if (r.ok) {
        setPublishedLink(`/article/${id}`)
        showToast('Published ✓')
      } else {
        showToast(getApiKey() ? 'API error — check key' : 'No API key in Settings')
      }
    } catch {
      showToast('Network error — check connection')
    }
  }

  // ── Clear form ───────────────────────────────────────────────
  function clearForm() {
    if (!confirm('Clear and start fresh?')) return
    setEditingId(null)
    setBlocks([])
    setMeta({ title:'', subtitle:'', category:'', issue:'', author:'Prarabdha Soni', date: today(), readTime:'', coverImage:'' })
    setPublishedLink(null)
  }

  // ── Load article into editor ─────────────────────────────────
  function loadArticle(art) {
    setEditingId(art.id)
    setMeta({
      title:      art.title      || '',
      subtitle:   art.subtitle   || '',
      category:   art.category   || '',
      issue:      art.issue      || '',
      author:     art.author     || 'Prarabdha Soni',
      date:       art.date       || today(),
      readTime:   art.readTime   || '',
      coverImage: art.coverImage || '',
    })
    setBlocks(JSON.parse(JSON.stringify(art.blocks || [])))
    setPublishedLink(`/article/${art.id}`)
  }

  // ── Smart parse ──────────────────────────────────────────────
  function runSmartParse() {
    if (!smartText.trim()) { showToast('Paste some text first'); return }
    const parsed = smartParse(smartText)
    if (!parsed.length) { showToast('Could not detect structure'); return }
    setBlocks(parsed)
    setSmartOpen(false)
    showToast(`Parsed ${parsed.length} blocks`)
  }

  // ── API key ──────────────────────────────────────────────────
  function saveApiKey() {
    if (!apiKeyInput || apiKeyInput.startsWith('•')) { showToast('Paste a new key first'); return }
    setApiKey(apiKeyInput)
    setApiKeyInput('')
    setApiKeyStatus('✓ API key saved')
    showToast('API key saved')
  }

  function clearApiKey() {
    if (!confirm('Remove the API key?')) return
    setApiKey('')
    setApiKeyStatus('No key — articles save locally only')
    showToast('Key removed')
  }

  // ── Preview HTML ─────────────────────────────────────────────
  const previewHtml = renderBlocks(blocks)
  const hasPreview  = meta.title || blocks.length > 0

  return (
    <div className="admin-app">
      {Toast}

      {/* Nav */}
      <div className="admin-nav">
        <Link href="/" className="admin-brand">Bharat<span>.</span>Pulse</Link>
        <div className="admin-nav-right">
          <Link href="/" className="admin-nav-link">View Site →</Link>
          <button className="admin-logout" onClick={() => { sessionStorage.removeItem('bp_auth'); location.reload() }}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-layout">
        {/* ── Left: Editor ── */}
        <div className="editor-panel">
          <div className="editor-header">
            <h2 className="editor-title">
              {editingId ? `Editing: ${meta.title || '(untitled)'}` : 'New Research'}
            </h2>
            <div className="editor-header-actions">
              <button className="btn-ghost" onClick={clearForm}>Clear</button>
              <button className="btn-ghost" onClick={() => setDraftsOpen(true)}>All Drafts</button>
            </div>
          </div>

          {/* Smart Import */}
          <div className="smart-import">
            <button className="smart-import-toggle" onClick={() => setSmartOpen(o => !o)}>
              Smart Import — paste text, auto-generate blocks
              <span className="smart-import-chevron">{smartOpen ? '▴' : '▾'}</span>
            </button>
            {smartOpen && (
              <div className="smart-import-body">
                <p className="smart-hint-text">Paste your full research as plain paragraphs. The parser will detect stats, pull quotes, section headings, and the conclusion.</p>
                <textarea className="smart-textarea" rows={12} value={smartText}
                  onChange={e => setSmartText(e.target.value)}
                  placeholder="Paste your research text here…" />
                <div className="smart-import-actions">
                  <button className="btn-primary" onClick={runSmartParse}>Parse &amp; Structure →</button>
                  <button className="btn-ghost" onClick={() => setSmartText('')}>Clear</button>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="meta-section">
            {[
              ['Title',            'title',    'text',   'The Research Title'],
              ['Subtitle / Thesis','subtitle', 'text',   'The one-line investment thesis'],
            ].map(([label, key, type, ph]) => (
              <div className="meta-row" key={key}>
                <div className="field-group">
                  <label className="field-label">{label}</label>
                  <input type={type} className="field-input" placeholder={ph}
                    value={meta[key]} onChange={e => setMeta(m => ({ ...m, [key]: e.target.value }))} />
                </div>
              </div>
            ))}
            <div className="meta-row meta-row--3">
              {[['Category','category','text','e.g. Emerging Markets'],['Issue No.','issue','text','02']].map(([label, key, type, ph]) => (
                <div className="field-group" key={key}>
                  <label className="field-label">{label}</label>
                  <input type={type} className="field-input" placeholder={ph}
                    value={meta[key]} onChange={e => setMeta(m => ({ ...m, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="field-group">
                <label className="field-label">Read Time (min)</label>
                <input type="number" className="field-input field-input--sm" placeholder="8" min="1"
                  value={meta.readTime} onChange={e => setMeta(m => ({ ...m, readTime: e.target.value }))} />
              </div>
            </div>
            <div className="meta-row meta-row--2">
              <div className="field-group">
                <label className="field-label">Author</label>
                <input type="text" className="field-input" value={meta.author}
                  onChange={e => setMeta(m => ({ ...m, author: e.target.value }))} />
              </div>
              <div className="field-group">
                <label className="field-label">Date</label>
                <input type="date" className="field-input" value={meta.date}
                  onChange={e => setMeta(m => ({ ...m, date: e.target.value }))} />
              </div>
            </div>
            <div className="meta-row">
              <div className="field-group">
                <label className="field-label">Cover Image URL</label>
                <input type="url" className="field-input" placeholder="https://..." value={meta.coverImage}
                  onChange={e => setMeta(m => ({ ...m, coverImage: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Content blocks */}
          <div className="blocks-section">
            <div className="blocks-header">
              <span className="blocks-title">Content</span>
              <div className="add-block-wrap" style={{ position:'relative' }}>
                <button className="btn-add-block" onClick={() => setBlockMenu(o => !o)}>+ Add Block</button>
                {blockMenuOpen && (
                  <div className="block-menu">
                    {Object.keys(defaultBlock).map(type => (
                      <button key={type} className="block-menu-item" onClick={() => addBlock(type)}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="blocks-list">
              {blocks.length === 0
                ? <div className="blocks-empty">No blocks yet. Click "+ Add Block" to start building.</div>
                : blocks.map((b, i) => (
                  <BlockItem key={i} block={b} idx={i}
                    onUpdate={updateBlock} onDelete={deleteBlock}
                    onMoveUp={moveUp} onMoveDown={moveDown}
                    onAddTlItem={addTlItem} onDelTlItem={delTlItem}
                    onAddFnItem={addFnItem} onDelFnItem={delFnItem} />
                ))
              }
            </div>
          </div>

          {/* API Settings */}
          <div className="smart-import" style={{ marginTop: 20 }}>
            <button className="smart-import-toggle" onClick={() => setSettingsOpen(o => !o)}>
              API Settings — connect to MongoDB
              <span id="gh-chevron">{settingsOpen ? '▴' : '▾'}</span>
            </button>
            {settingsOpen && (
              <div className="smart-import-body">
                <p className="smart-hint-text">
                  Add your <code>ADMIN_API_KEY</code> (set in Vercel env) so articles publish to MongoDB.
                </p>
                <div className="field-group" style={{ marginBottom: 10 }}>
                  <label className="field-label">Admin API Key</label>
                  <input type="password" className="field-input" placeholder="your-admin-api-key"
                    value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} autoComplete="off" />
                </div>
                <div className="smart-import-actions" style={{ alignItems:'center', gap:8 }}>
                  <button className="btn-primary btn-sm" onClick={saveApiKey}>Save Key</button>
                  <button className="btn-ghost btn-sm" onClick={clearApiKey}>Remove</button>
                  <span style={{ fontSize:12, color:'var(--color-text-tertiary)' }}>{apiKeyStatus}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="editor-actions">
            <button className="btn-secondary" onClick={saveDraft}>Save Draft</button>
            <button className="btn-primary" onClick={publish}>Publish to Site</button>
            {publishedLink && (
              <a href={publishedLink} target="_blank" rel="noopener" className="preview-open" style={{ marginLeft:'auto' }}>
                Open article →
              </a>
            )}
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className="preview-panel">
          <div className="preview-header">
            <span className="preview-label">Live Preview</span>
          </div>
          <div className="preview-frame">
            {!hasPreview
              ? <div className="preview-empty">Start filling in the form to see a preview</div>
              : (
                <div className="preview-scaler">
                  <div className="masthead masthead--preview">
                    <div className="issue-line">
                      <div className="issue-dot" />
                      <span className="issue-text">
                        {meta.category || 'Category'} — Issue No. {String(meta.issue || '00').padStart(2,'0')}
                      </span>
                      <div className="issue-rule" />
                    </div>
                    <h1 className="cover-title">{meta.title || 'Article Title'}</h1>
                    <p className="cover-sub">{meta.subtitle || 'Subtitle / thesis statement'}</p>
                    <div className="byline">
                      <div className="avatar">{(meta.author||'A')[0]}</div>
                      <div>
                        <div className="byline-name">{meta.author}</div>
                        <div className="byline-role">Independent Research</div>
                      </div>
                      <div className="byline-meta">
                        <span className="meta-chip">{meta.date}</span>
                        <span className="meta-chip">{meta.readTime || '—'} min read</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="article-body article-body--preview"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              )
            }
          </div>
        </div>
      </div>

      {draftsOpen && (
        <DraftsModal onClose={() => setDraftsOpen(false)} onLoad={loadArticle} />
      )}
    </div>
  )
}

// ── Page entry ────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('bp_auth') === '1') setAuthed(true)
    setChecked(true)
  }, [])

  if (!checked) return null
  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />
  return <AdminApp />
}
