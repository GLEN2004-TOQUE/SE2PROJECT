const aiService = require('./aiService');
require('dotenv').config();

async function testAutoSwitch() {
  console.log("🧪 Testing Auto Model Switching\n");
  
  const testText = `
    JavaScript is a programming language that is one of the core technologies of the World Wide Web, 
    alongside HTML and CSS. It is used to create interactive effects within web browsers.
  `;
  
  // Try to generate multiple sets of questions
  for (let i = 1; i <= 5; i++) {
    console.log(`\n📝 Test ${i}/5`);
    console.log("=".repeat(50));
    
    try {
      const questions = await aiService.generateQuestions(testText, "multiple-choice", 2);
      console.log(`✅ Generated ${questions.length} questions`);
      console.log("Sample question:", questions[0].question.substring(0, 100) + "...");
      
      // Show current model status
      const status = aiService.getStatus();
      console.log("\n📊 Current model usage:");
      for (const [model, data] of Object.entries(status)) {
        console.log(`  ${model}: ${data.used}/${data.limit} (${data.remaining} remaining)`);
      }
      
    } catch (error) {
      console.error("❌ Test failed:", error.message);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Run the test
testAutoSwitch().catch(console.error);