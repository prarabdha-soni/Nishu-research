'use client'
import { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail]     = useState('')
  const [success, setSuccess] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    // Open mailto — no backend required
    window.open(
      `mailto:research@bharatpulse.in?subject=Subscribe%20me&body=Please%20add%20me%20to%20the%20newsletter%3A%20${encodeURIComponent(email)}`,
      '_blank'
    )
    setSuccess(true)
    setEmail('')
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-inner">
        <p className="newsletter-label">Free Newsletter</p>
        <h2 className="newsletter-title">Long-horizon research, delivered.</h2>
        <p className="newsletter-desc">
          Deep-dive analysis on India &amp; emerging markets — straight to your inbox, once a week.
        </p>
        {success ? (
          <p className="newsletter-success">Thanks! Check your email to confirm your subscription.</p>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              className="newsletter-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button className="newsletter-btn" type="submit">Subscribe</button>
          </form>
        )}
        <p className="newsletter-note">No spam. Unsubscribe any time.</p>
      </div>
    </section>
  )
}
