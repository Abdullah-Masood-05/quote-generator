'use client'

import { useState } from 'react'
import { quotes } from '@/data/quotes'

export default function Home() {
  const [topic, setTopic] = useState('')
  const [matchedQuotes, setMatchedQuotes] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    const filtered = quotes
      .filter(q => q.topic.toLowerCase() === topic.toLowerCase())
      .slice(0, 3)
    setMatchedQuotes(filtered)
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>Quote Generator</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic (e.g. life)"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Get Quotes</button>
      </form>

      <div style={styles.results}>
        {matchedQuotes.length === 0 && topic && (
          <p style={styles.noResult}>No quotes found for "{topic}".</p>
        )}
        {matchedQuotes.map((q, i) => (
          <div key={i} style={styles.quoteBox}>
            {q.text}
          </div>
        ))}
      </div>
    </main>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    textAlign: 'center',
    fontFamily: 'sans-serif',
    backgroundColor: '#f0f0f0',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  form: {
    marginBottom: '2rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    width: '200px',
    marginRight: '0.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  results: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'left',
  },
  quoteBox: {
    background: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  noResult: {
    fontStyle: 'italic',
    color: 'gray',
  },
}
