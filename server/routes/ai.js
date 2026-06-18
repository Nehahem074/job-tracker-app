const router = require('express').Router();
const auth = require('../middleware/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/cover-letter', auth, async (req, res) => {
  const { jobDescription, resumeText } = req.body;
 const completion = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: `Write a professional cover letter for this job:\n\nJob: ${jobDescription}\n\nMy background: ${resumeText}` }],
  });
  res.json({ letter: completion.choices[0].message.content });
});

router.post('/score-resume', auth, async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  const completion = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: `Score this resume (0-100) for this job and explain why:\n\nResume: ${resumeText}\n\nJob: ${jobDescription}\n\nReturn JSON: {score: number, feedback: string}` }],
  });
  res.json(JSON.parse(completion.choices[0].message.content));
});

module.exports = router;