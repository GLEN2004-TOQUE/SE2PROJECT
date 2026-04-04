const aiService = require('./aiService'); 

exports.generateQuestions = async (text, type = "multiple-choice", count = 5) => {
  return await aiService.generateQuestions(text, type, count);
};