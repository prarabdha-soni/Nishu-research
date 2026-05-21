'use client'
import { useEffect, useState } from 'react'

export default function ArticleInteractive() {
  const [modalText, setModalText] = useState(null)
  const [copied, setCopied]       = useState(false)
  const [bttVisible, setBtt]      = useState(false)

  useEffect(() => {
    // Reading progress
    const bar = document.getElementById('reading-progress')
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (bar) bar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%'
      setBtt(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Wire up verdict prompt buttons (rendered via dangerouslySetInnerHTML)
    const onClick = (e) => {
      const btn = e.target.closest('[data-prompt]')
      if (btn) setModalText(btn.dataset.prompt)
    }
    document.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('click', onClick)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = modalText ? 'hidden' : ''
  }, [modalText])

  async function copyPrompt() {
    await navigator.clipboard.writeText(modalText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <div className="reading-progress" id="reading-progress" />

      <button
        className={`back-to-top${bttVisible ? ' btt--visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >↑</button>

      {modalText && (
        <div className="modal open" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={() => setModalText(null)} />
          <div className="modal-card">
            <div className="modal-header">
              <span className="modal-label">Explore further</span>
              <button className="modal-close" onClick={() => setModalText(null)}>&times;</button>
            </div>
            <p className="modal-prompt">{modalText}</p>
            <div className="modal-actions">
              <button className="modal-copy-btn" onClick={copyPrompt}>
                {copied ? 'Copied!' : 'Copy prompt'}
              </button>
              <a className="modal-claude-link" href="https://claude.ai" target="_blank" rel="noopener">
                Open in Claude →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
