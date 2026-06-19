import { useState } from 'react'
import { generateCoverLetter, scoreResume } from '../api'
import toast from 'react-hot-toast'

export default function AIFeatures() {
  const [tab, setTab] = useState('cover')

  // Cover letter state
  const [jd, setJd]           = useState('')
  const [resumeText, setRT]   = useState('')
  const [letter, setLetter]   = useState('')
  const [genLoading, setGL]   = useState(false)

  // Score state
  const [scoreJd, setScoreJd]         = useState('')
  const [scoreResText, setScoreRT]    = useState('')
  const [scoreResult, setScoreResult] = useState(null)
  const [scoreLoading, setSL]         = useState(false)

  const handleGenerate = async () => {
    if (!jd || !resumeText) { toast.error('Please fill in both fields'); return }
    setGL(true); setLetter('')
    try {
      const res = await generateCoverLetter({ jobDescription: jd, resumeText })
      setLetter(res.data.letter)
    } catch (err) {
      toast.error(err.response?.data?.msg || 'AI request failed')
    } finally {
      setGL(false) }
  }

  const handleScore = async () => {
    if (!scoreJd || !scoreResText) { toast.error('Please fill in both fields'); return }
    setSL(true); setScoreResult(null)
    try {
      const res = await scoreResume({ jobDescription: scoreJd, resumeText: scoreResText })
      setScoreResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.msg || 'AI request failed')
    } finally {
      setSL(false)
    }
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">AI tools</h1>
        <p className="text-gray-500 text-sm mt-1">Powered by Groq (Llama 3) — completely free</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {[['cover', 'Cover letter'], ['score', 'Resume score']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'cover' && (
        <div className="space-y-4">
          <div>
            <label className="label">Job description</label>
            <textarea
              className="input"
              rows={5}
              placeholder="Paste the full job description here..."
              value={jd}
              onChange={e => setJd(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Your background / resume summary</label>
            <textarea
              className="input"
              rows={5}
              placeholder="Paste your resume text or write a summary of your experience..."
              value={resumeText}
              onChange={e => setRT(e.target.value)}
            />
          </div>
          <button onClick={handleGenerate} disabled={genLoading} className="btn-primary">
            {genLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : '✨ Generate cover letter'}
          </button>

          {letter && (
            <div className="card p-5 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Generated cover letter</h3>
                <button onClick={() => copy(letter)} className="btn-secondary text-xs">Copy</button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{letter}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'score' && (
        <div className="space-y-4">
          <div>
            <label className="label">Job description</label>
            <textarea
              className="input"
              rows={5}
              placeholder="Paste the job description..."
              value={scoreJd}
              onChange={e => setScoreJd(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Your resume text</label>
            <textarea
              className="input"
              rows={5}
              placeholder="Paste your full resume text..."
              value={scoreResText}
              onChange={e => setScoreRT(e.target.value)}
            />
          </div>
          <button onClick={handleScore} disabled={scoreLoading} className="btn-primary">
            {scoreLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : '📊 Score my resume'}
          </button>

          {scoreResult && (
            <div className="card p-5 mt-4">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  scoreResult.score >= 70 ? 'bg-green-50 text-green-600' :
                  scoreResult.score >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                }`}>
                  {scoreResult.score}
                </div>
                <div>
                  <p className="font-medium">Match score</p>
                  <p className="text-xs text-gray-500">out of 100</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all ${
                    scoreResult.score >= 70 ? 'bg-green-500' :
                    scoreResult.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${scoreResult.score}%` }}
                />
              </div>
              <h3 className="font-medium text-sm mb-2">Feedback</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{scoreResult.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}