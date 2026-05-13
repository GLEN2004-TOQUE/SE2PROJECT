const aiService = require('../services/aiService'); 

async function generateQuestionsHandler(req, res) {
  try {
    const { text, type = "multiple-choice", count = 5, difficulty = "medium" } = req.body;
    
    const questions = await aiService.generateQuestions(text, type, count, difficulty);
    
    const status = aiService.getStatus();
    console.log('Current model status:', status);
    
    res.json({
      success: true,
      questions: questions,
      modelStatus: status
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Export para magamit sa routes
module.exports = { generateQuestionsHandler };