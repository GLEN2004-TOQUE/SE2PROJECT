const aiService = require('./aiService'); 

exports.generateQuestions = async (
  text,
  type = "multiple-choice",
  count = 5,
  difficulty = "medium"
) => {
  return await aiService.generateQuestions(text, type, count, difficulty);
};