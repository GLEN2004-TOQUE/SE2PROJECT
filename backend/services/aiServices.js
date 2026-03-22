const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateQuestions = async (text, type, count) => {
  const prompt = `
  Based on the following lecture text:

  "${text}"

  Generate ${count} ${type} questions.
  Format as JSON:
  [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A"
    }
  ]
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(response.choices[0].message.content);
};