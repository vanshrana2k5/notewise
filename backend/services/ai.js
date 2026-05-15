const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateNoteInsights(title, content) {
  if (!content || content.trim().length < 20) {
    throw new Error('Note content is too short to analyze.');
  }

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
const prompt = `You are an intelligent note assistant. Analyze the following note and respond ONLY with a valid JSON object. No explanation, no markdown, just raw JSON.

Note Title: ${title}
Note Content: ${content}

Respond with exactly this structure:
{
  "summary": "2-3 sentence summary of the note",
  "action_items": ["action 1", "action 2", "action 3"],
  "suggested_title": "A better title if applicable, or the current one"
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { generateNoteInsights };