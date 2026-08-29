import { useState } from 'react'
import { HelpCircle, MessageSquare, Link, Plus, X, Copy, Check } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useApp } from '../context/AppContext'

const RETENTION_DATA = [
  { day: 0, pct: 100 }, { day: 1, pct: 42 }, { day: 2, pct: 28 }, { day: 3, pct: 20 },
  { day: 4, pct: 15 }, { day: 5, pct: 12 }, { day: 6, pct: 10 }, { day: 7, pct: 8 },
  { day: 14, pct: 4 }, { day: 21, pct: 3 }, { day: 30, pct: 2 }
]

const ALL_FOLLOWUPS = [
  { icon: '\uD83D\uDCCA', text: 'Show change in retention over time.' },
  { icon: '\uD83D\uDCA1', text: 'What are some key takeaways from this chart?' },
  { icon: '\uD83D\uDCA1', text: 'Can you put this data in a table?' },
  { icon: '\uD83D\uDCCA', text: 'Show me the daily active users trend.' },
  { icon: '\uD83D\uDD0D', text: 'What events drive the most conversions?' },
  { icon: '\uD83D\uDCCA', text: 'Compare mobile vs desktop user behavior.' },
  { icon: '\uD83D\uDCA1', text: 'What is our signup conversion rate?' },
  { icon: '\uD83D\uDCCA', text: 'Show a funnel from page view to purchase.' },
  { icon: '\uD83D\uDD0D', text: 'Which countries have the highest engagement?' },
]

function generateAIResponse(question, state) {
  const q = question.toLowerCase()

  if (q.includes('retention')) {
    return { text: "Here's the retention analysis for your site.", chart: 'retention' }
  }
  if (q.includes('daily active') || q.includes('dau')) {
    const series = state.homeMetrics?.webEngagementSeries || []
    if (series.length) {
      const avg = Math.round(series.reduce((s, d) => s + d.value, 0) / series.length)
      return { text: `Your average daily active users over the last 30 days is ${avg}. The trend is generally increasing.`, chart: 'dau', data: series }
    }
    return { text: 'Your daily active users are trending upward over the last 30 days.' }
  }
  if (q.includes('conversion') || q.includes('signup') || q.includes('funnel')) {
    const funnel = state.charts?.find(c => c.type === 'funnel')
    if (funnel) {
      return { text: `Your signup funnel shows an overall conversion rate of ${funnel.data?.overallConversion || 5.6}%. The biggest dropoff occurs between Page View and Button Click.` }
    }
    return { text: 'Based on the data, your overall signup conversion rate is approximately 5.6%.' }
  }
  if (q.includes('country') || q.includes('countries') || q.includes('geography')) {
    const countries = state.homeMetrics?.usersByCountry || []
    const top = countries[0]
    return { text: `Your top country by users is ${top?.country || 'United States'} with ${top?.users || 312} users. The US accounts for about 37% of total traffic.` }
  }
  if (q.includes('table')) {
    return { text: "Here's the retention data in table format.", chart: 'retention_table' }
  }
  if (q.includes('mobile') || q.includes('desktop') || q.includes('platform')) {
    const web = state.users?.filter(u => u.platform === 'Web').length || 0
    const mobile = state.users?.filter(u => u.platform !== 'Web').length || 0
    return { text: `You have ${web} web users and ${mobile} mobile users. Web users tend to have longer sessions on average.` }
  }
  if (q.includes('event') || q.includes('most')) {
    return { text: 'Page View is your most common event, followed by Button Click and Start Session. Purchase events make up about 4% of total events.' }
  }
  return { text: `I've analyzed your data for "${question}". Based on current metrics, your product shows healthy engagement patterns with growing daily active users and stable retention rates.` }
}

export default function AskAmplitude() {
  const { state, dispatch } = useApp()
  const [message, setMessage] = useState('')
  const [threads, setThreads] = useState([
    { id: 't1', title: 'What is retention looking like on our current site?', messages: [
      { role: 'user', text: 'What is retention looking like on our current site?' },
      { role: 'assistant', text: "Here's the chart you requested.", chart: 'retention' }
    ]}
  ])
  const [activeThreadId, setActiveThreadId] = useState('t1')
  const [showFaq, setShowFaq] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [followupSeed, setFollowupSeed] = useState(0)

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0]
  const messages = activeThread?.messages || []

  const followups = ALL_FOLLOWUPS.slice(followupSeed % ALL_FOLLOWUPS.length, (followupSeed % ALL_FOLLOWUPS.length) + 3)
    .concat(ALL_FOLLOWUPS.slice(0, Math.max(0, 3 - (ALL_FOLLOWUPS.length - followupSeed % ALL_FOLLOWUPS.length))))
    .slice(0, 3)

  function handleSend() {
    if (!message.trim()) return
    const userMsg = { role: 'user', text: message }
    const aiResponse = generateAIResponse(message, state)
    const assistantMsg = { role: 'assistant', ...aiResponse }

    const updatedThreads = threads.map(t =>
      t.id === activeThreadId ? { ...t, messages: [...t.messages, userMsg, assistantMsg] } : t
    )
    setThreads(updatedThreads)

    dispatch({ type: 'ADD_ASK_THREAD', payload: { id: activeThreadId, question: message, answer: aiResponse.text, timestamp: new Date().toISOString() } })

    setMessage('')
    setFollowupSeed(prev => prev + 1)
  }

  function createNewThread() {
    const newThread = { id: `t_${Date.now()}`, title: 'New conversation', messages: [] }
    setThreads(prev => [...prev, newThread])
    setActiveThreadId(newThread.id)
  }

  function handleCopyLink() {
    const url = window.location.href
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', background: 'white' }}>
      {/* Left sidebar */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Ask Xmplitude</div>
        <button className="btn-outline" style={{ justifyContent: 'flex-start', gap: 6, height: 36, width: '100%' }} onClick={createNewThread}>
          <Plus size={15} /> New thread
        </button>
        {threads.map(t => (
          <button
            key={t.id}
            style={{
              textAlign: 'left', padding: '6px 8px', borderRadius: 6, fontSize: 13,
              color: t.id === activeThreadId ? 'var(--primary)' : 'var(--text-primary)',
              background: t.id === activeThreadId ? 'var(--primary-light)' : 'transparent',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              width: '100%', cursor: 'pointer', fontWeight: t.id === activeThreadId ? 600 : 400
            }}
            onClick={() => setActiveThreadId(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>default</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowFaq(!showFaq)}><HelpCircle size={14} /> FAQ</button>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowFeedback(true)}><MessageSquare size={14} /> Send feedback</button>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={handleCopyLink}>
              {copiedLink ? <><Check size={14} /> Copied</> : <><Link size={14} /> Link</>}
            </button>
          </div>
        </div>

        {showFaq && (
          <div style={{ padding: '16px 80px', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Frequently Asked Questions</span>
              <button className="icon-btn" onClick={() => setShowFaq(false)}><X size={14} /></button>
            </div>
            {[
              { q: 'What can I ask?', a: 'You can ask about retention, user behavior, funnels, events, and any analytics question about your product data.' },
              { q: 'How accurate are the answers?', a: 'Answers are generated based on your actual Xmplitude data. Always verify charts before making decisions.' },
              { q: 'Can I save conversations?', a: 'Yes, all threads are saved automatically and accessible from the left sidebar.' }
            ].map((faq, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{faq.q}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{faq.a}</div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 80px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>Ask Xmplitude</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Ask questions about your product data and get AI-powered answers with charts.</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['What is our retention rate?', 'Show me daily active users', 'What is our signup conversion rate?'].map(q => (
                  <button key={q} style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 20, fontSize: 13, cursor: 'pointer', background: 'white' }}
                    onClick={() => setMessage(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              {msg.role === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '16px 16px 4px 16px', padding: '10px 16px', fontSize: 14, maxWidth: 400 }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>ASSISTANT</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>{msg.text}</div>
                  {msg.chart === 'retention' && (
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>Retention Curve</span>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={RETENTION_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E4E5E8" />
                          <XAxis dataKey="day" tickFormatter={d => `Day ${d}`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip formatter={v => [`${v}%`]} />
                          <Line type="monotone" dataKey="pct" stroke="#7C3AED" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {msg.chart === 'dau' && msg.data && (
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Daily Active Users</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={msg.data.map(d => ({ ...d, label: d.date }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E4E5E8" />
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Bar dataKey="value" fill="#7C3AED" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {msg.chart === 'retention_table' && (
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Day</th>
                            <th style={{ padding: '6px 12px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Retention %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {RETENTION_DATA.map(r => (
                            <tr key={r.day}>
                              <td style={{ padding: '6px 12px' }}>Day {r.day}</td>
                              <td style={{ padding: '6px 12px', textAlign: 'right' }}>{r.pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    Analyzing <span className="badge badge-blue">your product data</span> for <span className="badge badge-blue">All Users</span> over the <span className="badge badge-blue">Last 30 days</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Follow ups */}
          {messages.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                FOLLOW UPS
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setFollowupSeed(prev => prev + 3)}>Re-roll</button>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {followups.map((f, i) => (
                  <button key={i} style={{ flex: 1, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'left', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8, background: 'white', color: 'var(--text-primary)', transition: 'background 0.1s' }}
                    onClick={() => { setMessage(f.text) }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <span>{f.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 80px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, border: '2px solid var(--primary)', borderRadius: 8, padding: '8px 12px', background: 'white' }}>
            <input
              style={{ flex: 1, border: 'none', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }}
              placeholder="Ask follow-up"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            />
            <button onClick={handleSend} style={{ width: 32, height: 32, borderRadius: '50%', background: message.trim() ? 'var(--primary)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', fontSize: 16 }}>
              ↑
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, textAlign: 'center' }}>
            Language models can make mistakes. Double check your charts before making decisions.
          </div>
        </div>
      </div>

      {/* Feedback modal */}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackText('') }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Send Feedback</span>
              <button className="icon-btn" onClick={() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackText('') }}><X size={16} /></button>
            </div>
            <div style={{ padding: 20 }}>
              {feedbackSent ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>Thank you!</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Your feedback has been submitted.</div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Tell us how we can improve Ask Xmplitude.</p>
                  <textarea
                    className="input"
                    style={{ height: 100, resize: 'vertical', padding: 12 }}
                    placeholder="Your feedback..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                </>
              )}
            </div>
            {!feedbackSent && (
              <div className="modal-footer">
                <button className="btn-outline" onClick={() => { setShowFeedback(false); setFeedbackText('') }}>Cancel</button>
                <button className="btn-primary" onClick={() => setFeedbackSent(true)} disabled={!feedbackText.trim()}>Submit</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
