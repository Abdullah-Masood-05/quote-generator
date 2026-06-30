'use client';

import { useState } from 'react';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TONES = [
  'uplifting',
  'motivational',
  'calm',
  'romantic',
  'reflective',
  'grateful',
  'funny',
];

// Card gradients. Index is reused by the downloadable story image so the
// saved picture matches the card on screen.
const GRADIENTS = [
  ['#7c3aed', '#db2777'],
  ['#2563eb', '#06b6d4'],
  ['#f59e0b', '#ef4444'],
  ['#10b981', '#059669'],
  ['#6366f1', '#8b5cf6'],
];

function shareableText(quote, platform) {
  const tags =
    platform === 'instagram' && quote.hashtags?.length
      ? `\n\n${quote.hashtags.join(' ')}`
      : '';
  return `${quote.text}${tags}`;
}

// Renders a 1080x1920 (story-sized) PNG of a quote on its gradient.
function renderStoryCanvas(text, hashtags, gradient) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background gradient.
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, gradient[0]);
  grad.addColorStop(1, gradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle darkening toward the bottom for legibility.
  const vg = ctx.createLinearGradient(0, H * 0.55, 0, H);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // Decorative opening quote mark.
  ctx.font = '700 220px Georgia, serif';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillText('“', W / 2, 360);

  // Fit and wrap the quote text.
  const padding = 110;
  const maxWidth = W - padding * 2;
  const maxTextHeight = H * 0.58;
  const fontFor = (s) =>
    `700 ${s}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

  let size = text.length < 80 ? 76 : text.length < 140 ? 64 : 54;
  let lines = [];
  let lineHeight = size * 1.32;
  while (true) {
    ctx.font = fontFor(size);
    lines = wrapText(ctx, text, maxWidth);
    lineHeight = size * 1.32;
    if (lines.length * lineHeight <= maxTextHeight || size <= 34) break;
    size -= 4;
  }

  const totalH = lines.length * lineHeight;
  let y = (H - totalH) / 2 + size;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 18;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }
  ctx.shadowBlur = 0;

  // Hashtags (Instagram).
  if (hashtags?.length) {
    ctx.font = '600 40px system-ui, -apple-system, Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(hashtags.join('  '), W / 2, H - 190);
  }

  // Watermark.
  ctx.font = '600 30px system-ui, -apple-system, Roboto, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('made with Feelings Quote', W / 2, H - 100);

  return canvas;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export default function Home() {
  const [feeling, setFeeling] = useState('');
  const [tone, setTone] = useState('uplifting');
  const [platform, setPlatform] = useState('whatsapp');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!feeling.trim() || loading) return;

    setLoading(true);
    setError('');
    setNotice('');
    setQuotes([]);

    try {
      const res = await fetch(`${API_URL}/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeling, tone, platform, count: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.');
      setQuotes(data.quotes || []);
      if (data.source === 'fallback' && data.notice) setNotice(data.notice);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? `Could not reach the backend at ${API_URL}. Is it running?`
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyQuote(quote, i) {
    const text = shareableText(quote, platform);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without async clipboard access.
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex((cur) => (cur === i ? null : cur)), 1500);
  }

  function shareWhatsApp(quote) {
    const url = `https://wa.me/?text=${encodeURIComponent(shareableText(quote, platform))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function saveImage(quote, i) {
    const gradient = GRADIENTS[i % GRADIENTS.length];
    const tags = platform === 'instagram' ? quote.hashtags : [];
    const canvas = renderStoryCanvas(quote.text, tags, gradient);
    const blob = await canvasToBlob(canvas);
    if (!blob) return;

    const file = new File([blob], 'quote-story.png', { type: 'image/png' });

    // On mobile/supported browsers, share the image straight to IG/WhatsApp.
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: shareableText(quote, platform) });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user dismissed the sheet
      }
    }

    // Otherwise download the PNG to upload manually.
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quote-story.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.badge}>WhatsApp Status • Instagram Stories</span>
        <h1 className={styles.title}>Turn your feelings into quotes</h1>
        <p className={styles.subtitle}>
          Describe your mood and get share-ready lines for your status and stories.
        </p>
      </header>

      <form className={styles.panel} onSubmit={handleGenerate}>
        <label className={styles.label} htmlFor="feeling">
          How are you feeling right now?
        </label>
        <textarea
          id="feeling"
          className={styles.textarea}
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerate(e);
          }}
          placeholder="e.g. exhausted but proud of how far I've come this year…"
          maxLength={500}
        />

        <div className={styles.fieldRow}>
          <span className={styles.label}>Tone</span>
          <div className={styles.chips}>
            {TONES.map((t) => (
              <button
                type="button"
                key={t}
                className={`${styles.chip} ${tone === t ? styles.chipActive : ''}`}
                onClick={() => setTone(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <span className={styles.label}>Share to</span>
          <div className={styles.segment}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${styles.segWhatsapp} ${
                platform === 'whatsapp' ? styles.segmentBtnActive : ''
              }`}
              onClick={() => setPlatform('whatsapp')}
            >
              WhatsApp
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${styles.segInstagram} ${
                platform === 'instagram' ? styles.segmentBtnActive : ''
              }`}
              onClick={() => setPlatform('instagram')}
            >
              Instagram
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.generateBtn}
          disabled={loading || !feeling.trim()}
        >
          {loading ? 'Generating…' : '✨ Generate quotes'}
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </form>

      {notice && <p className={styles.notice}>{notice}</p>}

      {loading && (
        <div className={styles.skeletonWrap}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      )}

      {!loading && quotes.length > 0 && (
        <section className={styles.results}>
          {quotes.map((quote, i) => {
            const gradient = GRADIENTS[i % GRADIENTS.length];
            return (
              <article
                key={i}
                className={styles.card}
                style={{
                  background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                }}
              >
                <p className={styles.quoteText}>{quote.text}</p>
                {platform === 'instagram' && quote.hashtags?.length > 0 && (
                  <p className={styles.hashtags}>{quote.hashtags.join(' ')}</p>
                )}
                <div className={styles.actions}>
                  <button className={styles.action} onClick={() => copyQuote(quote, i)}>
                    {copiedIndex === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <button className={styles.action} onClick={() => saveImage(quote, i)}>
                    🖼️ Story image
                  </button>
                  <button className={styles.action} onClick={() => shareWhatsApp(quote)}>
                    💬 WhatsApp
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <footer className={styles.footer}>
        Built with Next.js + Bun · Quotes by Groq
      </footer>
    </main>
  );
}
