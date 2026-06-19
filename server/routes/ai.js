const router = require('express').Router()
const auth   = require('../middleware/auth')
const Groq   = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const chat = async (prompt) => {
  const res = await groq.chat.completions.create({
    model:    'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
  })
  return res.choices[0].message.content
}

// ─── Cover letter ─────────────────────────────────────────────────────────────
router.post('/cover-letter', auth, async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body
    if (!jobDescription || !resumeText) return res.status(400).json({ msg: 'Both fields required' })

    const prompt = `Write a professional, concise cover letter for this job posting. 
Use the applicant's background to personalise it. Do not use generic filler phrases.

Job Description:
${jobDescription}

Applicant Background:
${resumeText}

Write only the cover letter body (no subject line, no "Dear Hiring Manager" unless you know the name).`

    const letter = await chat(prompt)
    res.json({ letter })
  } catch (err) { res.status(500).json({ msg: err.message }) }
})

// ─── Resume score ─────────────────────────────────────────────────────────────
router.post('/score-resume', auth, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body
    if (!resumeText || !jobDescription) return res.status(400).json({ msg: 'Both fields required' })

    const prompt = `You are a hiring manager. Score how well this resume matches the job description.

Job Description:
${jobDescription}

Resume:
${resumeText}

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{"score": <number 0-100>, "feedback": "<2-3 sentences of specific, actionable feedback>"}`

    const raw = await chat(prompt)
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    res.json(result)
  } catch (err) {
    if (err instanceof SyntaxError) return res.status(500).json({ msg: 'AI returned invalid format. Try again.' })
    res.status(500).json({ msg: err.message })
  }
})

module.exports = router